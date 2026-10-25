import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { redirectUrl } from '../../lib/redirect-url.js'

export async function GET(_req, { params }) {
    const { brc } = await params
    const target = redirectUrl(await kv.get(brc))
    if (!target) {
        return new NextResponse('Not found', { status: 404 })
    }
    redirect(target)
}
