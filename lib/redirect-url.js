const BSV_ORIGIN = 'https://bsv.brc.dev'

// Missing keys must not be string-concatenated onto the origin.
// `'https://bsv.brc.dev' + null` is the URL `https://bsv.brc.devnull`.
export function redirectUrl(stored) {
    if (typeof stored !== 'string' || !stored.startsWith('/')) {
        return null
    }
    return BSV_ORIGIN + stored
}
