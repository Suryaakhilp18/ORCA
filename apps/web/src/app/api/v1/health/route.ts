import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.PYTHON_BACKEND_URL;
  if (backendUrl) {
    try {
      const resp = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (resp.ok) {
        return NextResponse.json(await resp.json());
      }
    } catch (e) {}
  }

  return NextResponse.json({
    status: 'healthy',
    system: 'ORCA',
    version: '2.0.0',
    deployment: 'Vercel Serverless / Cloud-Ready'
  });
}
