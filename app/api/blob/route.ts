import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Save to Vercel Blob
    const { url } = await put('config.json', JSON.stringify(body, null, 2), { 
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    })
    
    console.log('Config saved to Vercel Blob:', url)
    
    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('Failed to save to Vercel Blob:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
