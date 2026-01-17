import { NextRequest, NextResponse } from 'next/server';
import { createPin, deletePin, getAllPins, updatePin } from '@/lib/storage';
import { validateAdminAuth, unauthorizedResponse } from '@/lib/auth';

// GET all pins (admin only)
export async function GET(request: NextRequest) {
  if (!validateAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const pins = await getAllPins();
    return NextResponse.json({ pins });
  } catch (error) {
    console.error('Error fetching all pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      { status: 500 }
    );
  }
}

// POST create new pin (admin only)
export async function POST(request: NextRequest) {
  if (!validateAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    const missingFields = [];
    if (!body.id) missingFields.push('id');
    if (!body.map_id) missingFields.push('map_id');
    if (!body.type) missingFields.push('type');
    if (!body.name) missingFields.push('name');
    if (body.x === undefined) missingFields.push('x');
    if (body.y === undefined) missingFields.push('y');

    // Type-specific validation
    if (body.type === 'loot' && !body.quality) missingFields.push('quality');
    if (body.type === 'boss') {
      if (!body.boss_name) missingFields.push('boss_name');
      if (body.spawn_chance === undefined) missingFields.push('spawn_chance');
    }
    if (body.type === 'extract') {
      if (body.always_available === undefined) missingFields.push('always_available');
      if (body.pmc === undefined) missingFields.push('pmc');
      if (body.scav_only === undefined) missingFields.push('scav_only');
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const pinId = await createPin(body);
    
    return NextResponse.json({ 
      success: true, 
      pinId 
    });
  } catch (error) {
    console.error('Error creating pin:', error);
    return NextResponse.json(
      { error: `Failed to create pin: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// PATCH update pin (admin only)
export async function PATCH(request: NextRequest) {
  if (!validateAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const pinId = searchParams.get('id');

    if (!pinId) {
      return NextResponse.json(
        { error: 'Pin ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    await updatePin(pinId, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pin:', error);
    return NextResponse.json(
      { error: 'Failed to update pin' },
      { status: 500 }
    );
  }
}

// DELETE pin (admin only)
export async function DELETE(request: NextRequest) {
  if (!validateAdminAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const pinId = searchParams.get('id');

    if (!pinId) {
      return NextResponse.json(
        { error: 'Pin ID is required' },
        { status: 400 }
      );
    }

    await deletePin(pinId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pin:', error);
    return NextResponse.json(
      { error: 'Failed to delete pin' },
      { status: 500 }
    );
  }
}
