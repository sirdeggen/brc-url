// Real standards-table header, for example "BRC | Standard".
// A title that merely contains both words is a data row. BRC-87 is
// "Standardized Naming Conventions for BRC-22…", and treating that line
// as a header drops /87.
export function isReadmeHeaderRow(line) {
    const cells = line
        .split('|')
        .map(cell => cell.trim())
        .filter(Boolean)
    return cells[0] === 'BRC' && cells[1] === 'Standard'
}

// Parse markdown table and extract BRC mappings
export function parseReadmeTable(markdown) {
    const lines = markdown.split('\n')
    const mappings = []
    let inTable = false
    let headerSeen = false

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Skip empty lines
        if (!line) continue

        if (isReadmeHeaderRow(line)) {
            inTable = true
            headerSeen = true
            continue
        }

        // Skip separator line
        if (inTable && line.match(/^-+\s*\|\s*-+/)) {
            continue
        }

        // Parse table rows
        if (inTable && headerSeen && line.includes('|')) {
            const parts = line.split('|').map(part => part.trim())
            if (parts.length >= 2) {
                const brcNum = parseInt(parts[0], 10)
                const standardCell = parts[1]

                // Skip header row and invalid entries
                if (!isNaN(brcNum) && standardCell && standardCell !== 'Standard') {
                    // Extract the path from the markdown link [title](path)
                    const linkMatch = standardCell.match(/\[([^\]]+)\]\(([^)]+)\)/)
                    if (linkMatch) {
                        const githubPath = linkMatch[2]
                        const convertedPath = convertPath(githubPath)
                        if (convertedPath) {
                            mappings.push({ brc: brcNum, path: convertedPath })
                        }
                    } else if (standardCell === '(unused)') {
                        // Skip unused entries
                        continue
                    }
                }
            }
        }
    }

    return mappings
}

// Convert GitHub path to URL path
function convertPath(githubPath) {
    if (!githubPath || githubPath === '—' || githubPath === '-') {
        return null
    }

    // Remove leading ./ and .md suffix, convert to /path format
    return '/' + githubPath.replace(/^\.\//, '').replace(/\.md$/, '')
}
