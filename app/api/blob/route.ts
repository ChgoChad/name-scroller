import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Add timestamp to trigger updates on presentation page
    const configWithTimestamp = {
      ...body,
      timestamp: Date.now()
    }
    
    // Save to local filesystem
    await ensureDataDir()
    const configPath = path.join(process.cwd(), 'data', 'config.json')
    await fs.writeFile(configPath, JSON.stringify(configWithTimestamp, null, 2), 'utf-8')
    
    console.log('Config saved to local filesystem:', configPath)
    
    return NextResponse.json({ success: true, path: configPath }, {
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
    console.error('Failed to save to local filesystem:', error)
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
