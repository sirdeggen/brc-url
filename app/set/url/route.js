import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        // get a reader from the request body
        const reader = await req.body.getReader()
        // read until all is read
        const { value } = await reader.read()
        const { brc, path, key } = JSON.parse(Buffer.from(value).toString())
        console.log({ brc, path, key })
        if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'key is invalid' })
        await kv.set(brc, path)
        return NextResponse.json({ brc, path })
    } catch (error) {
        console.log({ error })
        return NextResponse.end()
    }
}
