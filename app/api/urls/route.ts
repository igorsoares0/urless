import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { generateShortCode, generateQRCode, buildShortUrl } from '@/lib/auth'

const createUrlSchema = z.object({
  originalUrl: z.string().url(),
  customDomain: z.string().optional(),
  enableQR: z.boolean().optional(),
  title: z.string().optional()
})

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json()
    const { originalUrl, customDomain, enableQR, title } = createUrlSchema.parse(body)

    // Generate unique short code
    let shortCode: string
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      shortCode = generateShortCode()
      const existing = await prisma.url.findUnique({
        where: { shortCode }
      })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique short code' },
        { status: 500 }
      )
    }

    // Build short URL
    const shortUrl = buildShortUrl(shortCode!, customDomain)

    // Generate QR code if requested
    const qrCodeUrl = enableQR ? generateQRCode(shortUrl) : undefined

    // Create URL in database
    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode: shortCode!,
        customDomain,
        qrCodeUrl,
        title,
        userId: user.userId
      }
    })

    return NextResponse.json({
      ...url,
      shortUrl
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const urls = await prisma.url.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.url.count({
      where: { userId: user.userId }
    })

    // Add shortUrl to each URL
    const urlsWithShortUrl = urls.map(url => ({
      ...url,
      shortUrl: buildShortUrl(url.shortCode, url.customDomain || undefined)
    }))

    return NextResponse.json({
      urls: urlsWithShortUrl,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get URLs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})