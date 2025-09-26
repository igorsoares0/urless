import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { url, title } = await request.json()

    if (!url || !url.trim()) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Save QR code to database first to get ID
    const qrCode = await prisma.qRCode.create({
      data: {
        url,
        qrCodeUrl: '', // Temporary empty value
        title: title?.trim() || undefined,
        userId: decoded.userId,
      },
    })

    // Generate tracking URL and QR code URL
    const trackingUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/qr/${qrCode.id}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(trackingUrl)}`

    // Update with the actual QR code URL
    const updatedQrCode = await prisma.qRCode.update({
      where: { id: qrCode.id },
      data: { qrCodeUrl },
    })

    return NextResponse.json({
      qrCode: {
        id: updatedQrCode.id,
        url: updatedQrCode.url,
        qrCodeUrl: updatedQrCode.qrCodeUrl,
        title: updatedQrCode.title,
        createdAt: updatedQrCode.createdAt,
      }
    })
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const qrCodes = await prisma.qRCode.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { clickEvents: true }
        }
      }
    })

    // Add analytics summary to each QR code
    const qrCodesWithAnalytics = qrCodes.map(qrCode => ({
      id: qrCode.id,
      url: qrCode.url,
      qrCodeUrl: qrCode.qrCodeUrl,
      title: qrCode.title,
      clicks: qrCode.clicks,
      uniqueClicks: qrCode.uniqueClicks,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt,
    }))

    return NextResponse.json({ qrCodes: qrCodesWithAnalytics })
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}