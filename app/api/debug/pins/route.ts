import { NextRequest, NextResponse } from 'next/server';
import { getAllPins } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const pins = await getAllPins();
    
    // Group by map_id
    const grouped: Record<string, any[]> = {};
    pins.forEach((pin) => {
      if (!grouped[pin.map_id]) {
        grouped[pin.map_id] = [];
      }
      grouped[pin.map_id].push({
        id: pin.id,
        name: pin.name,
        type: pin.type,
        map_id: pin.map_id,
        x: pin.x,
        y: pin.y
      });
    });
    
    return NextResponse.json({ 
      total: pins.length,
      byMap: grouped,
      allPins: pins
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching debug pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug pins' },
      { status: 500 }
    );
  }
}
