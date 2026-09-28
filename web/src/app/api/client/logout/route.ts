import { NextResponse } from 'next/server'
import { destroyClientSession } from '@/lib/auth/client'
import { corsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

export async function POST(request: Request) {
  await destroyClientSession(request)
  return withCors(request, NextResponse.json({ ok: true }))
}
