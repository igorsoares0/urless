import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

interface RedirectPageProps {
  params: {
    shortCode: string
  }
}

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()

  // Device detection
  let device = 'Desktop'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet'
  }

  // Browser detection
  let browser = 'Unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'

  // OS detection
  let os = 'Unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios')) os = 'iOS'

  return { device, browser, os }
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = params

  // Find the URL by short code
  const url = await prisma.url.findUnique({
    where: { shortCode }
  })

  if (!url) {
    // Redirect to 404 or homepage if URL not found
    redirect('/?error=not-found')
  }

  // Get request headers for analytics
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const referrer = headersList.get('referer') || ''
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const ipAddress = forwardedFor?.split(',')[0] || realIp || '127.0.0.1'

  // Parse user agent for device/browser/OS info
  const userAgentInfo = parseUserAgent(userAgent)
  const { device, browser, os } = userAgentInfo

  // Track click event and update counters
  try {
    // Create the click event
    await prisma.clickEvent.create({
      data: {
        urlId: url.id,
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        referrer: referrer || undefined,
      }
    })

    // Count unique IPs for this URL
    const uniqueIpCount = await prisma.clickEvent.groupBy({
      by: ['ipAddress'],
      where: { urlId: url.id },
      _count: { ipAddress: true }
    })

    // Update both total clicks and unique clicks
    await prisma.url.update({
      where: { id: url.id },
      data: {
        clicks: { increment: 1 },
        uniqueClicks: uniqueIpCount.length
      }
    })
  } catch (error) {
    console.error('Failed to track click event:', error)
  }

  // Redirect to original URL
  redirect(url.originalUrl)
}