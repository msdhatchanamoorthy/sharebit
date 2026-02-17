import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, name, email, location } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Call backend OTP API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${backendUrl}/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        otp,
        name,
        email,
        location,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[verify-otp] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify OTP',
      },
      { status: 500 }
    );
  }
}
