import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'alisucksbutwehelp';

export function validateAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  // Expect "Bearer password"
  const [type, password] = authHeader.split(' ');
  
  if (type !== 'Bearer' || password !== ADMIN_PASSWORD) {
    return false;
  }

  return true;
}

export function validateToken(authHeader: string | null): boolean {
  if (!authHeader) {
    return false;
  }

  // Expect "Bearer password"
  const [type, password] = authHeader.split(' ');
  
  if (type !== 'Bearer' || password !== ADMIN_PASSWORD) {
    return false;
  }

  return true;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
