import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface RedirectPageProps {
  params: {
    shortCode: string
  }
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = params

  try {
    // Find the URL by short code
    const url = await prisma.url.findUnique({
      where: { shortCode }
    })

    if (!url) {
      // Redirect to 404 or homepage if URL not found
      redirect('/?error=not-found')
    }

    // Increment click counter
    await prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } }
    })

    // Redirect to original URL
    redirect(url.originalUrl)
  } catch (error) {
    console.error('Redirect error:', error)
    redirect('/?error=server-error')
  }
}