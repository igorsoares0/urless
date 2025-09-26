"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Download, ExternalLink, Copy, Save, Trash2, Edit3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCreateQRCode, useQRCodes, useDeleteQRCode, useUpdateQRCode } from "@/hooks/use-qr-codes"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export function QRGenerator() {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const { toast } = useToast()
  const { data: qrCodesData, isLoading } = useQRCodes()
  const createQRMutation = useCreateQRCode()
  const deleteQRMutation = useDeleteQRCode()
  const updateQRMutation = useUpdateQRCode()

  const qrCodes = qrCodesData?.qrCodes || []

  const generateQRCode = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to generate QR code",
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

    setIsGenerating(true)

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
      setQrCodeUrl(qrUrl)

      toast({
        title: "Success",
        description: "QR code generated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const saveQRCode = async () => {
    if (!url.trim() || !qrCodeUrl) {
      toast({
        title: "Error",
        description: "Please generate a QR code first",
        variant: "destructive",
      })
      return
    }

    try {
      await createQRMutation.mutateAsync({
        url: url.trim(),
        title: title.trim() || undefined,
      })

      toast({
        title: "Success",
        description: "QR code saved successfully!",
      })

      // Reset form
      setUrl("")
      setTitle("")
      setQrCodeUrl("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save QR code",
        variant: "destructive",
      })
    }
  }

  const deleteQRCode = async (id: string) => {
    try {
      await deleteQRMutation.mutateAsync(id)
      toast({
        title: "Success",
        description: "QR code deleted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete QR code",
        variant: "destructive",
      })
    }
  }

  const startEditing = (qrCode: any) => {
    setEditingId(qrCode.id)
    setEditTitle(qrCode.title || "")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const saveEdit = async (id: string) => {
    try {
      await updateQRMutation.mutateAsync({
        id,
        data: { title: editTitle.trim() || undefined }
      })

      toast({
        title: "Success",
        description: "QR code updated successfully!",
      })

      setEditingId(null)
      setEditTitle("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update QR code",
        variant: "destructive",
      })
    }
  }

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `qr-code-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Success",
        description: "QR code downloaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
    }
  }

  const downloadQRCodeByUrl = async (qrUrl: string) => {
    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `qr-code-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Success",
        description: "QR code downloaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
    }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  const copyUrlToClipboard = async (urlToCopy: string) => {
    try {
      await navigator.clipboard.writeText(urlToCopy)
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  const openUrl = () => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Generator
          </CardTitle>
          <CardDescription>
            Generate QR codes for any URL - no shortening required
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="Enter any URL to generate QR code..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateQRCode()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter a title for this QR code..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <Button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>

          {qrCodeUrl && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="Generated QR Code"
                  className="max-w-[300px] max-h-[300px]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  onClick={saveQRCode}
                  disabled={createQRMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>

                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>

                <Button
                  onClick={copyUrl}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>

                <Button
                  onClick={openUrl}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open URL
                </Button>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">Original URL:</p>
                <p className="text-sm text-blue-600 break-all">{url}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved QR Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Saved QR Codes
          </CardTitle>
          <CardDescription>
            Manage your saved QR codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading QR codes...
            </div>
          ) : qrCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No QR codes saved yet. Generate and save your first QR code above!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {qrCodes.map((qrCode: any) => (
                <Card key={qrCode.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2">
                      <img
                        src={qrCode.qrCodeUrl}
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                    </div>

                    <div className="space-y-2">
                      {editingId === qrCode.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Enter title..."
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(qrCode.id)}
                              disabled={updateQRMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {qrCode.title ? (
                              <h3 className="font-medium text-sm">{qrCode.title}</h3>
                            ) : (
                              <h3 className="font-medium text-sm text-muted-foreground">Untitled</h3>
                            )}
                            <p className="text-xs text-muted-foreground break-all">
                              {qrCode.url}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(qrCode)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      <Badge variant="secondary" className="text-xs">
                        {new Date(qrCode.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQRCodeByUrl(qrCode.qrCodeUrl)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrlToClipboard(qrCode.url)}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteQRCode(qrCode.id)}
                        disabled={deleteQRMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}