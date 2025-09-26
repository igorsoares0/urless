import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // Check if QR code belongs to user
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId,
      },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    await prisma.qRCode.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'QR code deleted successfully' })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { title } = await request.json()

    // Check if QR code belongs to user
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId,
      },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    const updatedQrCode = await prisma.qRCode.update({
      where: { id: params.id },
      data: { title: title?.trim() || undefined },
    })

    return NextResponse.json({
      qrCode: {
        id: updatedQrCode.id,
        url: updatedQrCode.url,
        qrCodeUrl: updatedQrCode.qrCodeUrl,
        title: updatedQrCode.title,
        createdAt: updatedQrCode.createdAt,
        updatedAt: updatedQrCode.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error updating QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}