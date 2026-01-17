import { NextRequest, NextResponse } from 'next/server';
import { getKeysByMap } from '@/lib/pins';

// GET /api/keys/[mapId] - Get all keys for a specific map (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params;
    const keys = getKeysByMap(mapId);
    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
