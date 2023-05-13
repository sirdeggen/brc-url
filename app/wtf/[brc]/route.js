import { redirect } from 'next/navigation'
import {kv} from '@vercel/kv'

export async function GET(req, { params: { brc } }) {
    const p = await kv.get(brc)
    const path = 'https://bsv.brc.dev' + p || ''
    redirect(path)
}
