import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'alisucksbutwehelp';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      // Return success with password as token (simple approach)
      return NextResponse.json({ 
        success: true,
        token: password // In production, use JWT or session token
      });
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
