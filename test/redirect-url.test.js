import assert from 'node:assert/strict'
import test from 'node:test'
import { redirectUrl } from '../lib/redirect-url.js'

test('a missing value is not redirected to https://bsv.brc.devnull', () => {
    assert.equal(redirectUrl(null), null)
    assert.equal(redirectUrl(undefined), null)
    assert.equal('https://bsv.brc.dev' + null, 'https://bsv.brc.devnull')
})

test('a stored value that is not a path starting with / is not redirected', () => {
    assert.equal(redirectUrl(''), null)
    assert.equal(redirectUrl('null'), null)
    assert.equal(redirectUrl('overlays/0087'), null)
    assert.equal(redirectUrl('https://bsv.brc.dev/overlays/0087'), null)
    assert.equal(redirectUrl(87), null)
})

test('a stored path redirects under https://bsv.brc.dev', () => {
    assert.equal(redirectUrl('/overlays/0087'), 'https://bsv.brc.dev/overlays/0087')
    assert.equal(redirectUrl('/EXAMPLE'), 'https://bsv.brc.dev/EXAMPLE')
    assert.equal(redirectUrl('/key-derivation/0086'), 'https://bsv.brc.dev/key-derivation/0086')
})
