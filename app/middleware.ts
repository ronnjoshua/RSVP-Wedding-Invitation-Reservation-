// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// JWT secret should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Function to verify JWT token
function verifyAuth(token: string) {
  try {
    // Verify and decode the token
    const decoded = verify(token, JWT_SECRET);
    return { verified: true, payload: decoded };
  } catch (error) {
    return { verified: false, payload: null };
  }
}

export function middleware(request: NextRequest) {
  // Only run middleware on admin routes except for the login page
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin') && !pathname.includes('/admin/login')) {
    // Get token from cookies
    const token = request.cookies.get('admin_token')?.value;
    
    // If no token or token is invalid, redirect to login page
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    const { verified } = verifyAuth(token);
    
    if (!verified) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Specify which paths this middleware is applied to
export const config = {
  matcher: ['/admin/:path*'],
};