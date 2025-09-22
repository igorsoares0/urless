import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

const updateUrlSchema = z.object({
  title: z.string().optional(),
  originalUrl: z.string().url().optional()
})

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const id = request.url.split('/').pop()

    const url = await prisma.url.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(url)
  } catch (error) {
    console.error('Get URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const id = request.url.split('/').pop()
    const body = await request.json()
    const updates = updateUrlSchema.parse(body)

    const url = await prisma.url.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      )
    }

    const updatedUrl = await prisma.url.update({
      where: { id },
      data: updates
    })

    return NextResponse.json(updatedUrl)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (request: NextRequest, { user }) => {
  try {
    const id = request.url.split('/').pop()

    const url = await prisma.url.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      )
    }

    await prisma.url.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'URL deleted successfully' })
  } catch (error) {
    console.error('Delete URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})