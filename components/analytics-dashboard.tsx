"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Calendar, Globe, MousePointer, Clock, Award } from "lucide-react"

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  createdAt: string
}

interface AnalyticsDashboardProps {
  urls: ShortenedUrl[]
}

export function AnalyticsDashboard({ urls }: AnalyticsDashboardProps) {
  // Generate mock data for charts
  const generateDailyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days.map((day) => ({
      day,
      clicks: Math.floor(Math.random() * 100) + 20,
      links: Math.floor(Math.random() * 10) + 1,
    }))
  }

  const generateTopLinks = () => {
    return urls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((url) => ({
        shortCode: url.shortCode,
        clicks: url.clicks,
        originalUrl: url.originalUrl,
      }))
  }

  const generateTrafficSources = () => {
    const sources = [
      { name: "Direct", value: 45, color: "#8884d8" },
      { name: "Social Media", value: 30, color: "#82ca9d" },
      { name: "Email", value: 15, color: "#ffc658" },
      { name: "Search", value: 10, color: "#ff7300" },
    ]
    return sources
  }

  const dailyData = generateDailyData()
  const topLinks = generateTopLinks()
  const trafficSources = generateTrafficSources()

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)
  const avgClicksPerLink = urls.length > 0 ? (totalClicks / urls.length).toFixed(1) : "0"
  const topPerformer = urls.length > 0 ? Math.max(...urls.map((u) => u.clicks)) : 0

  // Calculate growth (mock data)
  const clickGrowth = "+12.5%"
  const linkGrowth = "+8.3%"

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{clickGrowth}</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Links</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{urls.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{linkGrowth}</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Clicks/Link</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgClicksPerLink}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+5.2%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{topPerformer}</div>
            <p className="text-xs text-muted-foreground">clicks on best link</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Daily Activity</CardTitle>
            <CardDescription>Clicks and links created over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Traffic Sources</CardTitle>
            <CardDescription>Where your clicks are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-sm text-muted-foreground">
                    {source.name} ({source.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Top Performing Links</CardTitle>
          <CardDescription>Your most clicked shortened URLs</CardDescription>
        </CardHeader>
        <CardContent>
          {topLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No link data available</p>
              <p className="text-sm">Create some links to see analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topLinks.map((link, index) => (
                <div
                  key={link.shortCode}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                      <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">short.ly/{link.shortCode}</p>
                      <p className="text-sm text-muted-foreground truncate">{link.originalUrl}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {link.clicks} clicks
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription>Latest link creation and click activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {urls.slice(0, 5).map((url) => (
              <div key={url.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Link created: short.ly/{url.shortCode}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(url.createdAt).toLocaleString()} • {url.clicks} clicks
                  </p>
                </div>
              </div>
            ))}
            {urls.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Your link activity will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
