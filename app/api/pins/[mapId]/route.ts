import { NextRequest, NextResponse } from 'next/server';
import { getPinsByMap } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params;
    const pins = await getPinsByMap(mapId);
    
    return NextResponse.json({ pins });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      { status: 500 }
    );
  }
}
