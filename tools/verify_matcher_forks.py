"""Verify the private matcher archives against npm sources plus the reviewed patches."""

import argparse
import base64
import gzip
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile
import tempfile
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
# SHA-512 integrity of the original published npm archives, from the pre-fork lockfile.
UPSTREAM = {
    "2.3.2": "V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==",
    "4.0.7": "qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
}
# Digests of lib/parse.js from the independently reviewed, installed backports in PR 3.
REVIEWED_PARSERS = {
    "2.3.2": "19494afb15e421844095a3034356df86d5b60d748698232d199ed33bbba83730",
    "4.0.7": "7b5304edb6402ff01d2930112a3a92d43e216d137b60c976076a1042e4cf0de9",
}


def patched_files(version, digest):
    url = f"https://registry.npmjs.org/picomatch/-/picomatch-{version}.tgz"
    with urlopen(url, timeout=30) as response:
        original = response.read()
    if hashlib.sha512(original).digest() != base64.b64decode(digest):
        raise ValueError(f"Upstream integrity mismatch for {version}")
    with tarfile.open(fileobj=io.BytesIO(original), mode="r:gz") as archive:
        files = {m.name: archive.extractfile(m).read() for m in archive if m.isfile()}

    with tempfile.TemporaryDirectory() as temp:
        subprocess.run(["git", "init", "--quiet"], cwd=temp, check=True)
        parser = Path(temp, "lib", "parse.js")
        parser.parent.mkdir()
        parser.write_bytes(files["package/lib/parse.js"])
        patch = (ROOT / "patches" / f"picomatch@{version}.patch").read_bytes().replace(b"\r\n", b"\n")
        subprocess.run(["git", "-c", "core.autocrlf=false", "apply", "--no-index", "-"], cwd=temp, input=patch, check=True)
        files["package/lib/parse.js"] = parser.read_bytes()
        if hashlib.sha256(files["package/lib/parse.js"]).hexdigest() != REVIEWED_PARSERS[version]:
            raise ValueError(f"Generated parser differs from the reviewed backport for {version}")

    manifest = json.loads(files["package/package.json"])
    if (manifest["name"], manifest["version"]) != ("picomatch", version):
        raise ValueError(f"Unexpected upstream manifest for {version}")
    manifest.update(name="@gymkids-dashboard/picomatch", version=f"{version}-gymkids.1", private=True,
                    repository="github:infocusart/gymkids-dashboard-demo", upstream=url)
    files["package/package.json"] = (json.dumps(manifest, indent=2) + "\n").encode()
    return files


def verify(archive_path, files):
    with tarfile.open(archive_path, mode="r:gz") as archive:
        members = archive.getmembers()
        if sorted(m.name for m in members) != sorted(files):
            raise ValueError(f"Unexpected archive contents in {archive_path}")
        for member in members:
            if not member.isfile() or member.mode != 0o644 or archive.extractfile(member).read() != files[member.name]:
                raise ValueError(f"Unexpected file in {archive_path}: {member.name}")


def check_upstream_advisories():
    """Keep the original identities visible even when scanners see the private fork."""
    queries = [{"package": {"ecosystem": "npm", "name": "picomatch"}, "version": v} for v in UPSTREAM]
    request = Request("https://api.osv.dev/v1/querybatch", data=json.dumps({"queries": queries}).encode(),
                      headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=30) as response:
        results = json.load(response)["results"]
    if len(results) != len(queries) or any("next_page_token" in result for result in results):
        raise ValueError("Incomplete upstream OSV response")
    snapshot = {v: sorted(row.get("vulns", []), key=lambda advisory: advisory["id"])
                for v, row in zip(UPSTREAM, results)}
    print("Upstream OSV advisories:", json.dumps(snapshot, sort_keys=True))
    reviewed = json.loads((ROOT / "vendor" / "picomatch-upstream-advisories.json").read_bytes())
    if snapshot != reviewed:
        raise ValueError("Upstream advisory data changed. Review the fork against the current findings.")


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--build", action="store_true", help="regenerate the archives before verifying")
    args = cli.parse_args()
    for version, digest in UPSTREAM.items():
        files = patched_files(version, digest)
        target = ROOT / "vendor" / f"picomatch-{version}-gymkids.1.tgz"
        if args.build:
            target.parent.mkdir(exist_ok=True)
            with target.open("wb") as dest, gzip.GzipFile(filename="", fileobj=dest, mode="wb", mtime=0) as zipped:
                with tarfile.open(fileobj=zipped, mode="w", format=tarfile.USTAR_FORMAT) as archive:
                    for name, data in sorted(files.items()):
                        member = tarfile.TarInfo(name)
                        member.size = len(data)
                        archive.addfile(member, io.BytesIO(data))
        verify(target, files)
        print(f"Verified {target.name} against upstream plus patch ({len(files)} files)")
    check_upstream_advisories()


if __name__ == "__main__":
    main()
