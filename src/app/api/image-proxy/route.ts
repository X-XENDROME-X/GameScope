import { NextResponse } from 'next/server'

const ALLOWED_HOSTS = new Set([
  'media.rawg.io',
  'images.igdb.com',
  'steamcdn-a.akamaihd.net',
  'cdn.akamai.steamstatic.com',
  'i.ytimg.com',
])

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }
    let target: URL
    try {
      target = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    }
    if (!['http:', 'https:'].includes(target.protocol)) {
      return NextResponse.json({ error: 'Protocol not allowed' }, { status: 400 })
    }
    if (!ALLOWED_HOSTS.has(target.hostname)) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
    }

    const upstream = await fetch(target.toString(), { cache: 'force-cache' })
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: upstream.status })
    }
    const arrayBuffer = await upstream.arrayBuffer()
    const contentType = upstream.headers.get('content-type') || 'image/jpeg'
    const res = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}
