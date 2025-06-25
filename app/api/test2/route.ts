import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Simulate some processing
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Randomly succeed or fail for demonstration
    const shouldSucceed = Math.random() > 0.3
    
    if (shouldSucceed) {
      return NextResponse.json({
        success: true,
        message: "Notification sent successfully",
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: "Notification delivery failed",
          error: "Service temporarily unavailable"
        },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Notification system error",
        error: "Internal server error"
      },
      { status: 500 }
    )
  }
} 