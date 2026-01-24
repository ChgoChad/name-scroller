import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { put } from "@vercel/blob";

const CONFIG_URL = 'https://lrwfayd80qrpo4fb.public.blob.vercel-storage.com'
const CONFIG_FILE = path.join(CONFIG_URL, 'config.json')

const defaultConfig = {
  names: ['John Doe', 'Jane Smith', 'Bob Johnson'],
  gradient: {
    from: '#1e293b',
    to: '#334155'
  },
  font: {
    size: 120,
    family: 'Arial',
    color: '#ffffff'
  },
  animation: {
    speed: 10,
    pauseBetween: 0
  },
  timestamp: Date.now()
}

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

async function loadConfig() {
  try {
   // await ensureDataDir()
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // If file doesn't exist or is invalid, return default config
    return { ...defaultConfig }
  }
}

async function saveConfig(config: typeof defaultConfig) {
  try {
   // await ensureDataDir()
   //await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
   const { url } = await put('config.json', JSON.stringify(config, null, 2), { access: 'public', allowOverwrite: true });
   console.log('Config saved to blob URL:', url);
  } catch (error) {
    console.error('[v0] Failed to save config:', error)
  }
}

export async function GET() {
  const config = await loadConfig()
  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const config = await loadConfig()
    
    // Update config with new values
    if (body.names !== undefined) {
      config.names = body.names
    }
    if (body.gradient !== undefined) {
      config.gradient = body.gradient
    }
    if (body.font !== undefined) {
      config.font = body.font
    }
    if (body.animation !== undefined) {
      config.animation = body.animation
    }
    
    // Update timestamp to trigger client updates
    config.timestamp = Date.now()
    
    // Save to file
    await saveConfig(config)
    
    return NextResponse.json({ success: true, config }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { 
        status: 400,
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
