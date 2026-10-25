import assert from 'node:assert/strict'
import test from 'node:test'
import { isReadmeHeaderRow, parseReadmeTable } from '../lib/parse-readme-table.js'

const BRC_87_ROW =
    '87   | [Standardized Naming Conventions for BRC-22 Topic Managers and BRC-24 Lookup Services](./overlays/0087.md)'

test('only the real BRC | Standard row is the table header', () => {
    assert.equal(isReadmeHeaderRow('BRC | Standard'), true)
    assert.equal(isReadmeHeaderRow('| BRC | Standard |'), true)
    assert.equal(isReadmeHeaderRow('BRC | Standard | Notes'), true)
    assert.equal(isReadmeHeaderRow(BRC_87_ROW), false)
    assert.equal(isReadmeHeaderRow('## Standards'), false)
    assert.equal(isReadmeHeaderRow('BRC | Standardized Naming Conventions'), false)
})

test('the BRC-87 row maps to /overlays/0087', () => {
    const markdown = [
        'BRC | Standard',
        '----|------------------',
        '86   | [Bidirectionally Authenticated Derivation of Privacy Restricted Type 42 Keys](./key-derivation/0086.md)',
        BRC_87_ROW,
        '88   | [Overlay Services Synchronization Architecture](./overlays/0088.md)',
        '12   | (unused)',
    ].join('\n')

    assert.deepEqual(parseReadmeTable(markdown), [
        { brc: 86, path: '/key-derivation/0086' },
        { brc: 87, path: '/overlays/0087' },
        { brc: 88, path: '/overlays/0088' },
    ])
})

// Numbered rows after the exact header, without the parser's header heuristic.
function numberedRows(markdown) {
    const rows = []
    let inTable = false
    for (const raw of markdown.split('\n')) {
        const line = raw.trim()
        if (!line) continue
        if (/^BRC\s*\|\s*Standard\s*(\||$)/.test(line)) {
            inTable = true
            continue
        }
        if (!inTable) continue
        if (line.startsWith('#')) break
        const match = line.match(/^(\d+)\s*\|/)
        if (match) rows.push(Number(match[1]))
    }
    return rows
}

test('the current BRCs README maps BRC-87 to /overlays/0087', { timeout: 20_000 }, async () => {
    const urls = [
        'https://raw.githubusercontent.com/bsv-blockchain/BRCs/refs/heads/master/README.md',
        'https://raw.githubusercontent.com/bitcoin-sv/BRCs/refs/heads/master/README.md',
    ]

    for (const url of urls) {
        const response = await fetch(url)
        assert.equal(response.status, 200, url)
        const markdown = await response.text()
        const mappings = parseReadmeTable(markdown)
        const byBrc = new Map(mappings.map(mapping => [mapping.brc, mapping.path]))

        assert.equal(byBrc.get(87), '/overlays/0087', url)
        assert.equal(byBrc.get(0), '/EXAMPLE', url)
        assert.equal(byBrc.get(86), '/key-derivation/0086', url)
        assert.equal(byBrc.get(88), '/overlays/0088', url)
        assert.equal(byBrc.has(212), false, url)
        assert.deepEqual(
            mappings.map(mapping => mapping.brc),
            numberedRows(markdown),
            url
        )
        for (const mapping of mappings) {
            assert.equal(mapping.path.startsWith('/'), true, `${url} ${mapping.brc}`)
            assert.equal(mapping.path.endsWith('.md'), false, `${url} ${mapping.brc}`)
        }
    }
})
