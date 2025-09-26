"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, ExternalLink, Edit, Trash2, Search, Filter, SortAsc, SortDesc, Calendar, BarChart3, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  createdAt: string
  userId: string
  title?: string
  tags?: string[]
}

interface LinkManagementProps {
  urls: ShortenedUrl[]
  onUpdateUrl: (id: string, updates: Partial<ShortenedUrl>) => void
  onDeleteUrl: (id: string) => void
}

export function LinkManagement({ urls, onUpdateUrl, onDeleteUrl }: LinkManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "clicks" | "title">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterBy, setFilterBy] = useState<"all" | "high" | "medium" | "low">("all")
  const [editingUrl, setEditingUrl] = useState<ShortenedUrl | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editOriginalUrl, setEditOriginalUrl] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Filter and sort URLs
  const filteredAndSortedUrls = urls
    .filter((url) => {
      const matchesSearch =
        url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (url.title && url.title.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      if (filterBy === "all") return true
      if (filterBy === "high") return url.clicks >= 50
      if (filterBy === "medium") return url.clicks >= 10 && url.clicks < 50
      if (filterBy === "low") return url.clicks < 10

      return true
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === "clicks") {
        comparison = a.clicks - b.clicks
      } else if (sortBy === "title") {
        const aTitle = a.title || a.originalUrl
        const bTitle = b.title || b.originalUrl
        comparison = aTitle.localeCompare(bTitle)
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

  const handleEdit = (url: ShortenedUrl) => {
    setEditingUrl(url)
    setEditTitle(url.title || "")
    setEditOriginalUrl(url.originalUrl)
  }

  const handleSaveEdit = () => {
    if (!editingUrl) return

    const isValidUrl = (string: string): boolean => {
      try {
        new URL(string)
        return true
      } catch (_) {
        return false
      }
    }

    if (!isValidUrl(editOriginalUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    onUpdateUrl(editingUrl.id, {
      title: editTitle.trim() || undefined,
      originalUrl: editOriginalUrl,
    })

    toast({
      title: "Updated!",
      description: "Link has been updated successfully",
    })

    setEditingUrl(null)
    setEditTitle("")
    setEditOriginalUrl("")
  }

  const handleDelete = (id: string) => {
    onDeleteUrl(id)
    setDeleteConfirmId(null)
    toast({
      title: "Deleted!",
      description: "Link has been deleted successfully",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    })
  }

  const getPerformanceBadge = (clicks: number) => {
    if (clicks >= 50)
      return (
        <Badge variant="default" className="bg-green-500">
          High
        </Badge>
      )
    if (clicks >= 10) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="outline">Low</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Manage Your Links</CardTitle>
          <CardDescription>Search, filter, and organize your shortened URLs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search links by URL, title, or short code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: "date" | "clicks" | "title") => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="clicks">Clicks</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>

            {/* Filter */}
            <Select value={filterBy} onValueChange={(value: "all" | "high" | "medium" | "low") => setFilterBy(value)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Links</SelectItem>
                <SelectItem value="high">High Traffic</SelectItem>
                <SelectItem value="medium">Medium Traffic</SelectItem>
                <SelectItem value="low">Low Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Your Links ({filteredAndSortedUrls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedUrls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterBy !== "all" ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No links match your search criteria</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </>
              ) : (
                <>
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No links to manage yet</p>
                  <p className="text-sm">Create some links to get started</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedUrls.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
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
                      {getPerformanceBadge(item.clicks)}
                    </div>

                    {item.title && <p className="font-medium text-foreground mb-1">{item.title}</p>}

                    <p className="text-sm text-muted-foreground truncate mb-1">{item.originalUrl}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {(
                          item.clicks /
                          Math.max(
                            1,
                            Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)) || 1,
                          )
                        ).toFixed(1)}{" "}
                        clicks/day
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.shortUrl)}>
                      <Copy className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => window.open(item.originalUrl, "_blank")}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => router.push(`/analytics/${item.id}`)}>
                      <TrendingUp className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Dialog
                      open={deleteConfirmId === item.id}
                      onOpenChange={(open) => !open && setDeleteConfirmId(null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Link</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this link? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-muted-foreground">
                            <strong>Short URL:</strong> {item.shortUrl}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Original URL:</strong> {item.originalUrl}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Total Clicks:</strong> {item.clicks}
                          </p>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={() => handleDelete(item.id)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingUrl} onOpenChange={(open) => !open && setEditingUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>Update the title and destination URL for your shortened link</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title (Optional)</Label>
              <Input
                id="edit-title"
                placeholder="Enter a descriptive title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">Destination URL</Label>
              <Input
                id="edit-url"
                placeholder="https://example.com"
                value={editOriginalUrl}
                onChange={(e) => setEditOriginalUrl(e.target.value)}
              />
            </div>
            {editingUrl && (
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Short URL:</strong> {editingUrl.shortUrl}
                </p>
                <p>
                  <strong>Created:</strong> {new Date(editingUrl.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total Clicks:</strong> {editingUrl.clicks}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUrl(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
