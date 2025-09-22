"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Domain {
  id: string
  domain: string
  verified: boolean
  createdAt: string
  linksCount: number
}

interface DomainManagementProps {
  userId: string
}

export function DomainManagement({ userId }: DomainManagementProps) {
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: "1",
      domain: "example.com",
      verified: true,
      createdAt: new Date().toISOString(),
      linksCount: 5,
    },
    {
      id: "2",
      domain: "mysite.co",
      verified: false,
      createdAt: new Date().toISOString(),
      linksCount: 0,
    },
  ])
  const [newDomain, setNewDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isValidDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  const addDomain = async () => {
    if (!newDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      })
      return
    }

    if (!isValidDomain(newDomain.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid domain name",
        variant: "destructive",
      })
      return
    }

    const domainExists = domains.some(d => d.domain === newDomain.trim())
    if (domainExists) {
      toast({
        title: "Error",
        description: "This domain is already added",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const domain: Domain = {
      id: Date.now().toString(),
      domain: newDomain.trim(),
      verified: false,
      createdAt: new Date().toISOString(),
      linksCount: 0,
    }

    setDomains(prev => [domain, ...prev])
    setNewDomain("")
    setIsLoading(false)

    toast({
      title: "Domain Added",
      description: "Domain added successfully. Please verify ownership.",
    })
  }

  const removeDomain = (id: string) => {
    const domain = domains.find(d => d.id === id)
    if (domain && domain.linksCount > 0) {
      toast({
        title: "Cannot Remove",
        description: `This domain has ${domain.linksCount} active links. Remove them first.`,
        variant: "destructive",
      })
      return
    }

    setDomains(prev => prev.filter(d => d.id !== id))
    toast({
      title: "Domain Removed",
      description: "Domain removed successfully",
    })
  }

  const verifyDomain = async (id: string) => {
    setIsLoading(true)

    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const success = Math.random() > 0.3 // 70% success rate for demo

    if (success) {
      setDomains(prev => prev.map(d =>
        d.id === id ? { ...d, verified: true } : d
      ))
      toast({
        title: "Domain Verified",
        description: "Domain ownership verified successfully",
      })
    } else {
      toast({
        title: "Verification Failed",
        description: "Could not verify domain ownership. Please check DNS settings.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Add New Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Add Custom Domain
          </CardTitle>
          <CardDescription>
            Add your own domain to create branded short links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="yourdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDomain()}
              className="flex-1"
            />
            <Button onClick={addDomain} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Domain
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>
            Manage your custom domains and verify ownership
          </CardDescription>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No custom domains yet</p>
              <p className="text-sm">Add your first domain above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground">{domain.domain}</h3>
                      <Badge
                        variant={domain.verified ? "default" : "secondary"}
                        className="text-xs flex items-center gap-1"
                      >
                        {domain.verified ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{domain.linksCount} links</span>
                      <span>Added {new Date(domain.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!domain.verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verifyDomain(domain.id)}
                        disabled={isLoading}
                      >
                        Verify
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDomain(domain.id)}
                      disabled={domain.linksCount > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DNS Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Verification</CardTitle>
          <CardDescription>
            Follow these steps to verify your domain ownership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Step 1: Add CNAME Record</h4>
            <p className="text-sm text-muted-foreground">
              Add a CNAME record in your DNS settings:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <div>Type: CNAME</div>
              <div>Name: @ (or your subdomain)</div>
              <div>Value: proxy.shortlink.pro</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 2: Wait for Propagation</h4>
            <p className="text-sm text-muted-foreground">
              DNS changes can take up to 24 hours to propagate. Once complete, click "Verify" to confirm ownership.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}