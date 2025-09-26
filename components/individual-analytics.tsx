"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { ArrowLeft, Copy, ExternalLink, Users, MousePointer, TrendingUp, Globe, Smartphone, Monitor, Calendar, BarChart3, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ClickEvent {
  id: string
  timestamp: string
  ipAddress: string
  userAgent?: string
  country?: string
  city?: string
  device?: string
  browser?: string
  os?: string
  referrer?: string
}

interface Url {
  id: string
  originalUrl: string
  shortCode: string
  clicks: number
  uniqueClicks: number
  createdAt: string
  title?: string
  customDomain?: string
  qrCodeUrl?: string
  clickEvents: ClickEvent[]
}

interface IndividualAnalyticsProps {
  url: Url
}

export function IndividualAnalytics({ url }: IndividualAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const { toast } = useToast()
  const router = useRouter()

  // Build short URL
  const shortUrl = url.customDomain
    ? `https://${url.customDomain}/${url.shortCode}`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${url.shortCode}`

  // Filter events by time range
  const filterEventsByTimeRange = (events: ClickEvent[]) => {
    if (timeRange === "all") return events

    const now = new Date()
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return events.filter(event => new Date(event.timestamp) >= cutoff)
  }

  const filteredEvents = filterEventsByTimeRange(url.clickEvents)

  // 1. TOTAL + UNIQUE CLICKS
  const totalClicks = filteredEvents.length
  const uniqueClicks = new Set(filteredEvents.map(e => e.ipAddress)).size

  // 2. TIMELINE DATA (Last 30 days)
  const generateTimelineData = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365
    const timeline = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.timestamp).toISOString().split('T')[0]
        return eventDate === dateStr
      })

      timeline.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: dayEvents.length,
        uniqueClicks: new Set(dayEvents.map(e => e.ipAddress)).size
      })
    }

    return timeline
  }

  // 3. DEVICE ANALYTICS
  const generateDeviceData = () => {
    const deviceStats = filteredEvents.reduce((acc, event) => {
      const device = event.device || 'Unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(deviceStats)
      .map(([device, count]) => ({
        device,
        count,
        percentage: Math.round((count / totalClicks) * 100)
      }))
      .sort((a, b) => b.count - a.count)
  }

  // 4. GEOGRAPHY DATA
  const generateGeographyData = () => {
    const countryStats = filteredEvents.reduce((acc, event) => {
      const country = event.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(countryStats)
      .map(([country, count]) => ({
        country,
        count,
        percentage: Math.round((count / totalClicks) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 countries
  }

  // 5. TRAFFIC SOURCES
  const generateTrafficSources = () => {
    const sourceStats = filteredEvents.reduce((acc, event) => {
      let source = "Direct"

      if (event.referrer) {
        try {
          const domain = new URL(event.referrer).hostname.toLowerCase()
          if (domain.includes('google') || domain.includes('bing')) source = "Search"
          else if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram')) source = "Social"
          else if (domain.includes('email') || domain.includes('newsletter')) source = "Email"
          else source = "Referral"
        } catch {
          source = "Referral"
        }
      }

      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors = {
      "Direct": "#3b82f6",
      "Social": "#10b981",
      "Search": "#f59e0b",
      "Email": "#ef4444",
      "Referral": "#8b5cf6"
    }

    return Object.entries(sourceStats)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalClicks) * 100),
        color: colors[source as keyof typeof colors] || "#6b7280"
      }))
      .sort((a, b) => b.count - a.count)
  }

  const timelineData = generateTimelineData()
  const deviceData = generateDeviceData()
  const geographyData = generateGeographyData()
  const trafficData = generateTrafficSources()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-foreground truncate">
                {url.title || "Link Analytics"}
              </h1>
              <p className="text-sm text-muted-foreground">{shortUrl}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(shortUrl)}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(url.originalUrl, "_blank")}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
            <p className="text-muted-foreground">Detailed insights for your shortened link</p>
          </div>
          <div className="flex items-center gap-2">
            {(["7d", "30d", "90d", "all"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === "all" ? "All Time" : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                {timeRange === "all" ? "All time" : `Last ${timeRange}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{uniqueClicks}</div>
              <p className="text-xs text-muted-foreground">
                {totalClicks > 0 ? `${Math.round((uniqueClicks / totalClicks) * 100)}% unique` : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Daily</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {timelineData.length > 0 ? Math.round(totalClicks / timelineData.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Clicks per day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Peak Day</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {Math.max(...timelineData.map(d => d.clicks), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Best single day</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Click Timeline</CardTitle>
              <CardDescription>Daily clicks and unique visitors over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey={timeRange === "7d" ? "day" : "month"}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Total Clicks"
                  />
                  <Line
                    type="monotone"
                    dataKey="uniqueClicks"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                    name="Unique Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device & Geography Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Device Types</CardTitle>
                <CardDescription>How visitors access your link</CardDescription>
              </CardHeader>
              <CardContent>
                {deviceData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No device data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deviceData.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {device.device.toLowerCase().includes('mobile') ?
                            <Smartphone className="w-5 h-5 text-muted-foreground" /> :
                            <Monitor className="w-5 h-5 text-muted-foreground" />
                          }
                          <span className="text-sm font-medium">{device.device}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[40px]">
                            {device.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Geography */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Top Countries</CardTitle>
                <CardDescription>Geographic distribution of clicks</CardDescription>
              </CardHeader>
              <CardContent>
                {geographyData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No location data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {geographyData.slice(0, 8).map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm font-medium">{country.country}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[40px]">
                            {country.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Traffic Sources</CardTitle>
              <CardDescription>Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={trafficData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {trafficData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${value} clicks`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="space-y-4">
                  {trafficData.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="text-sm font-medium">{source.source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {source.percentage}%
                        </span>
                        <span className="text-sm font-medium min-w-[40px]">
                          {source.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}