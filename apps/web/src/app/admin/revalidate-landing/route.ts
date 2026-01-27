import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
  revalidateTag('landing-data', "max")
  
  return NextResponse.json({ 
    revalidated: true, 
    timestamp: Date.now(),
    message: 'Landing data cache invalidated'
  })
}
