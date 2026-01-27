import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Add timestamp to trigger updates on presentation page
    const configWithTimestamp = {
      ...body,
      timestamp: Date.now()
    }
    
    // Save to Vercel Blob
    const { url } = await put('config.json', JSON.stringify(configWithTimestamp, null, 2), { 
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0
    })
    
    console.log('Config saved to Vercel Blob:', url)
    
    return NextResponse.json({ success: true, url }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Failed to save to Vercel Blob:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
