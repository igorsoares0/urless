"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { ArrowLeft, Copy, ExternalLink, Users, MousePointer, TrendingUp, Globe, Smartphone, Monitor, Calendar, BarChart3, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRAnalyticsProps {
  qrCodeId: string
  onBack: () => void
}

interface QRAnalyticsData {
  qrCode: {
    id: string
    url: string
    title?: string
    qrCodeUrl: string
    createdAt: string
  }
  analytics: {
    totalClicks: number
    uniqueClicks: number
    deviceStats: Record<string, number>
    browserStats: Record<string, number>
    osStats: Record<string, number>
    dailyClicks: Record<string, number>
    countryStats: Record<string, number>
    recentActivity: Array<{
      timestamp: string
      device?: string
      browser?: string
      os?: string
      country?: string
    }>
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function QRAnalytics({ qrCodeId, onBack }: QRAnalyticsProps) {
  const [data, setData] = useState<QRAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [qrCodeId])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/qr-codes/${qrCodeId}/analytics`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyQRUrl = async () => {
    if (!data) return
    const qrTrackingUrl = `${window.location.origin}/qr/${data.qrCode.id}`
    try {
      await navigator.clipboard.writeText(qrTrackingUrl)
      toast({
        title: "Copied!",
        description: "QR tracking URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  const openOriginalUrl = () => {
    if (data) {
      window.open(data.qrCode.url, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to QR Codes
        </Button>
      </div>
    )
  }

  // Prepare chart data
  const deviceData = Object.entries(data.analytics.deviceStats).map(([device, count]) => ({
    device,
    count,
    percentage: Math.round((count / data.analytics.totalClicks) * 100)
  }))

  const browserData = Object.entries(data.analytics.browserStats).map(([browser, count]) => ({
    browser,
    count
  }))

  const dailyData = Object.entries(data.analytics.dailyClicks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: count
    }))

  const countryData = Object.entries(data.analytics.countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({
      country,
      count
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">QR Code Analytics</h1>
            <p className="text-muted-foreground">
              {data.qrCode.title || 'Untitled QR Code'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyQRUrl} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy QR URL
          </Button>
          <Button onClick={openOriginalUrl} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open URL
          </Button>
        </div>
      </div>

      {/* QR Code Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={data.qrCode.qrCodeUrl}
                alt="QR Code"
                className="w-24 h-24 border rounded-lg"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Original URL</p>
                <p className="text-sm break-all">{data.qrCode.url}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(data.qrCode.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.analytics.totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Scans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.analytics.uniqueClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scan Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.analytics.totalClicks > 0
                ? Math.round((data.analytics.uniqueClicks / data.analytics.totalClicks) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(data.analytics.countryStats).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="browsers">Browsers</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Daily Scans</CardTitle>
              <CardDescription>Scans over time (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
              <CardDescription>Scans by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ device, percentage }) => `${device} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browsers">
          <Card>
            <CardHeader>
              <CardTitle>Browsers</CardTitle>
              <CardDescription>Scans by browser</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={browserData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="browser" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>Scans by country (top 5)</CardDescription>
            </CardHeader>
            <CardContent>
              {countryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={countryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No country data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest scans</CardDescription>
            </CardHeader>
            <CardContent>
              {data.analytics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {data.analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.device} • {activity.browser} • {activity.os}
                            {activity.country && ` • ${activity.country}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No activity yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}