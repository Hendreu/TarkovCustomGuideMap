import { NextRequest, NextResponse } from 'next/server';
import { getAllKeys, createKey, deleteKey, updateKey } from '@/lib/storage';
import { validateToken } from '@/lib/auth';

// GET /api/keys - Get all keys (admin only)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !validateToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const keys = await getAllKeys();
    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/keys - Create a new key (admin only)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !validateToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.map_id || !body.name || !body.location || !body.worth || !body.unlocks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const keyId = await createKey({
      id: body.id,
      map_id: body.map_id,
      name: body.name,
      location: body.location,
      uses: body.uses || -1,
      worth: body.worth,
      unlocks: body.unlocks,
      x: body.x,
      y: body.y,
    });

    return NextResponse.json({ success: true, id: keyId });
  } catch (error) {
    console.error('Error creating key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/keys?id={id} - Delete a key (admin only)
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !validateToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await deleteKey(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/keys?id={id} - Update a key (admin only)
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !validateToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const body = await request.json();
    await updateKey(id, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
