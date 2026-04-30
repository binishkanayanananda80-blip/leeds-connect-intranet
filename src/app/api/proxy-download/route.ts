import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'document.pdf'

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 })
  }

  try {
    let targetUrl = url
    if (url.startsWith('/')) {
      const protocol = req.headers.get('x-forwarded-proto') || 'https'
      const host = req.headers.get('host')
      targetUrl = `${protocol}://${host}${url}`
    }

    const response = await fetch(targetUrl)
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`)
    
    const blob = await response.blob()
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFilename)}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any) {
    console.error('Proxy download error:', error)
    return new NextResponse(`Download failed: ${error.message}`, { status: 500 })
  }
}
