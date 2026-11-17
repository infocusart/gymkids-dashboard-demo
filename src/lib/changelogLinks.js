// Shared by the browser and the changelog writer; never infer trust from a label.
const externalOrigins = new Set([
  'https://github.com',
  'https://gymkids-fr.infocuslab.ru',
  'https://mcp.gymkids-fr.infocuslab.ru',
])

const siteOrigin = 'https://dashboard.invalid'

const hasUnsafeCharacters = value => [...value].some(character => {
  const code = character.charCodeAt(0)

  return code <= 32 || code === 127 || character === '\\'
})

/** @param {unknown} value @returns {string | null} */
export const safeChangelogRoute = value => {
  if (typeof value !== 'string' || !value || value.length > 2048 || hasUnsafeCharacters(value))
    return null
  if (!value.startsWith('/') || value.startsWith('//'))
    return null

  try {
    const url = new URL(value, siteOrigin)
    let decoded = url.pathname

    // Reject encoded network paths and backslashes as well as their literal forms.
    for (let depth = 0; depth < 4; depth++) {
      if (decoded.startsWith('//') || hasUnsafeCharacters(decoded))
        return null
      const next = decodeURIComponent(decoded)
      if (next === decoded)
        return url.origin === siteOrigin ? value : null
      decoded = next
    }
  }
  catch {
    return null
  }

  return null
}

/** @param {unknown} value @returns {string | null} */
export const safeChangelogHref = value => {
  const route = safeChangelogRoute(value)
  if (route)
    return route
  if (typeof value !== 'string' || value.length > 2048 || hasUnsafeCharacters(value))
    return null

  try {
    const url = new URL(value)

    return externalOrigins.has(url.origin) && !url.username && !url.password ? url.href : null
  }
  catch {
    return null
  }
}
