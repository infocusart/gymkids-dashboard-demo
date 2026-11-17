const SITE_ORIGIN = 'https://changelog.invalid'

const hasUnsafeCharacters = value => (
  /\s|\\/u.test(value)
  || [...value].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
)

// Shared by the browser and the changelog generator. Preserve valid URLs verbatim.
export const normalizeChangelogUrl = (value, allowExternal = false) => {
  if (typeof value !== 'string' || !value || value.length > 2048 || hasUnsafeCharacters(value))
    return null

  try {
    const decoded = decodeURI(value)
    if ([...decoded].some(character => character === '\\' || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127))
      return null

    const internal = value.startsWith('/') && !value.startsWith('//')
    if (!internal && (!allowExternal || !/^https:\/\//iu.test(value)))
      return null

    const url = new URL(value, SITE_ORIGIN)
    if (url.username || url.password)
      return null
    if (internal ? url.origin !== SITE_ORIGIN : url.protocol !== 'https:')
      return null

    if (internal) {
      let pathname = url.pathname
      for (let depth = 0; depth < 4; depth++) {
        if (pathname.startsWith('//') || hasUnsafeCharacters(pathname))
          return null
        const next = decodeURIComponent(pathname)
        if (next === pathname)
          return value
        pathname = next
      }

      return null
    }

    return value
  }
  catch {
    return null
  }
}
