import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// Parse markdown table and extract BRC mappings
function parseReadmeTable(markdown) {
  const lines = markdown.split('\n')
  const mappings = []
  let inTable = false
  let headerSeen = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) continue

    // Check if we found the table header
    if (line.includes('BRC') && line.includes('Standard')) {
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
      const parts = line.split('|').map(p => p.trim())
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

    // Stop if we've passed the table (empty line after content)
    if (inTable && headerSeen && !line && i > 0) {
      const prevLine = lines[i - 1].trim()
      if (prevLine && !prevLine.includes('|')) {
        break
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

  // Remove leading ./ and convert to /path format
  return '/' + githubPath.replace(/^\.\//, '')
}

export async function POST(req) {
  try {
    // Parse request body
    const reader = await req.body.getReader()
    const { value } = await reader.read()
    const { key } = JSON.parse(Buffer.from(value).toString())

    // Validate admin key
    if (key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'key is invalid' }, { status: 401 })
    }

    // Fetch the BRCs README from GitHub
    const response = await fetch(
      'https://raw.githubusercontent.com/bitcoin-sv/BRCs/refs/heads/master/README.md'
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch BRCs README' },
        { status: 500 }
      )
    }

    const markdown = await response.text()

    // Parse the markdown table
    const mappings = parseReadmeTable(markdown)

    // Register all mappings in KV
    const registered = []
    const failed = []

    for (const mapping of mappings) {
      try {
        await kv.set(mapping.brc, mapping.path)
        registered.push(mapping)
      } catch (error) {
        failed.push({ ...mapping, error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      registered: registered.length,
      failed: failed.length,
      mappings: registered,
      errors: failed
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    )
  }
}
