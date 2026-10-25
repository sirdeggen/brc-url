import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { parseReadmeTable } from '../../../lib/parse-readme-table.js'

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
