import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { IndividualAnalytics } from '@/components/individual-analytics'

interface AnalyticsPageProps {
  params: {
    id: string
  }
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { id } = params

  // Get URL with click events
  const url = await prisma.url.findUnique({
    where: { id },
    include: {
      clickEvents: {
        orderBy: { timestamp: 'desc' },
        take: 1000 // Limit to last 1000 clicks for performance
      }
    }
  })

  if (!url) {
    redirect('/?error=url-not-found')
  }

  return <IndividualAnalytics url={url} />
}