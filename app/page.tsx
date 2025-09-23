"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, BarChart3, Link2, Zap, LogOut, Settings, QrCode, Download, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { AuthForms } from "@/components/auth-forms"
import { LinkManagement } from "@/components/link-management"
import { DomainManagement } from "@/components/domain-management"
import { AuthWrapper } from "@/components/auth-wrapper"
import { useAuthStore } from "@/stores/auth-store"
import { useUrls, useCreateUrl, useUpdateUrl, useDeleteUrl } from "@/hooks/use-urls"

export default function Dashboard() {
  const [url, setUrl] = useState("")
  const [customDomain, setCustomDomain] = useState("")
  const [enableQR, setEnableQR] = useState(false)
  const { toast } = useToast()

  const { user, isAuthenticated, logout } = useAuthStore()
  const { data: urlsData, isLoading: urlsLoading } = useUrls()
  const createUrlMutation = useCreateUrl()
  const updateUrlMutation = useUpdateUrl()
  const deleteUrlMutation = useDeleteUrl()

  const urls = urlsData?.urls || []

  const shortenUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      })
      return
    }

    try {
      new URL(url)
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    createUrlMutation.mutate({
      originalUrl: url,
      customDomain: customDomain || undefined,
      enableQR
    })

    // Reset form on success
    if (createUrlMutation.isSuccess) {
      setUrl("")
      setCustomDomain("")
      setEnableQR(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    })
  }

  const downloadQRCode = async (qrCodeUrl: string, shortCode: string) => {
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-code-${shortCode}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: "Downloaded!",
        description: "QR code downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  const handleUpdateUrl = (id: string, updates: any) => {
    updateUrlMutation.mutate({ id, data: updates })
  }

  const handleDeleteUrl = (id: string) => {
    deleteUrlMutation.mutate(id)
  }

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)

  return (
    <AuthWrapper>
      {!isAuthenticated ? (
        <AuthForms />
      ) : (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4 max-w-6xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                    <Link2 className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-semibold text-foreground">ShortLink Pro</h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{user?.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Free Plan
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 max-w-6xl">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="manage" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Manage
                </TabsTrigger>
                <TabsTrigger value="domains" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Domains
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Links</CardTitle>
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{urls.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{totalClicks}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Click Rate</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {urls.length > 0 ? (totalClicks / urls.length).toFixed(1) : "0"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* URL Shortener Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Shorten a URL</CardTitle>
                    <CardDescription>Enter a long URL to get a shortened version</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder="https://example.com/very-long-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && shortenUrl()}
                        className="flex-1"
                      />
                      <Button
                        onClick={shortenUrl}
                        disabled={createUrlMutation.isPending}
                        className="min-w-[120px]"
                      >
                        {createUrlMutation.isPending ? "Shortening..." : "Shorten"}
                      </Button>
                    </div>

                    {/* Advanced Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div className="space-y-2">
                        <Label htmlFor="custom-domain" className="text-sm font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Custom Domain (Optional)
                        </Label>
                        <Input
                          id="custom-domain"
                          placeholder="yourdomain.com"
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <QrCode className="w-4 h-4" />
                          Generate QR Code
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enable-qr"
                            checked={enableQR}
                            onCheckedChange={(checked) => setEnableQR(checked as boolean)}
                          />
                          <Label htmlFor="enable-qr" className="text-sm text-muted-foreground">
                            Include QR code for easy sharing
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent URLs List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Recent Links</CardTitle>
                    <CardDescription>Your most recently created shortened URLs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {urlsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading...</p>
                      </div>
                    ) : urls.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No shortened URLs yet</p>
                        <p className="text-sm">Create your first short link above</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {urls.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-4 p-4 border border-border rounded-lg"
                          >
                            {/* QR Code Preview */}
                            {item.qrCodeUrl && (
                              <div className="flex-shrink-0">
                                <img
                                  src={item.qrCodeUrl}
                                  alt="QR Code"
                                  className="w-16 h-16 rounded border border-border"
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <a
                                  href={item.shortUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-primary hover:underline"
                                >
                                  {item.shortUrl}
                                </a>
                                <Badge variant="outline" className="text-xs">
                                  {item.clicks} clicks
                                </Badge>
                                {item.customDomain && (
                                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    Custom Domain
                                  </Badge>
                                )}
                                {item.qrCodeUrl && (
                                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                    <QrCode className="w-3 h-3" />
                                    QR Code
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{item.originalUrl}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Created {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.shortUrl)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              {item.qrCodeUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadQRCode(item.qrCodeUrl!, item.shortCode)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm" onClick={() => window.open(item.originalUrl, "_blank")}>
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {urls.length > 5 && (
                          <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground">
                              Showing 5 of {urls.length} links. View all in the Manage tab.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manage">
                <LinkManagement urls={urls} onUpdateUrl={handleUpdateUrl} onDeleteUrl={handleDeleteUrl} />
              </TabsContent>

              <TabsContent value="domains">
                <DomainManagement userId={user?.id || ""} />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsDashboard urls={urls} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      )}
    </AuthWrapper>
  )
}