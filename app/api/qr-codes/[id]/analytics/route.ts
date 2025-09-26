import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // Check if QR code belongs to user and get analytics
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId,
      },
      include: {
        clickEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Calculate analytics
    const totalClicks = qrCode.clicks
    const uniqueClicks = qrCode.uniqueClicks

    // Device analytics
    const deviceStats = qrCode.clickEvents.reduce((acc, event) => {
      const device = event.device || 'Unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Browser analytics
    const browserStats = qrCode.clickEvents.reduce((acc, event) => {
      const browser = event.browser || 'Unknown'
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // OS analytics
    const osStats = qrCode.clickEvents.reduce((acc, event) => {
      const os = event.os || 'Unknown'
      acc[os] = (acc[os] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Daily clicks for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentClicks = qrCode.clickEvents.filter(
      event => new Date(event.timestamp) >= thirtyDaysAgo
    )

    const dailyClicks = recentClicks.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top countries (if available)
    const countryStats = qrCode.clickEvents.reduce((acc, event) => {
      const country = event.country || 'Unknown'
      if (country !== 'Unknown') {
        acc[country] = (acc[country] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      qrCode: {
        id: qrCode.id,
        url: qrCode.url,
        title: qrCode.title,
        qrCodeUrl: qrCode.qrCodeUrl,
        createdAt: qrCode.createdAt,
      },
      analytics: {
        totalClicks,
        uniqueClicks,
        deviceStats,
        browserStats,
        osStats,
        dailyClicks,
        countryStats,
        recentActivity: qrCode.clickEvents.slice(0, 10).map(event => ({
          timestamp: event.timestamp,
          device: event.device,
          browser: event.browser,
          os: event.os,
          country: event.country,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching QR code analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}