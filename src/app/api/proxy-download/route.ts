import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'document.pdf'

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 })
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch file')
    
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
