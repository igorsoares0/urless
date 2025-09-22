import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

interface Url {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clicks: number
  createdAt: string
  userId: string
  title?: string
  customDomain?: string
  qrCodeUrl?: string
}

interface CreateUrlData {
  originalUrl: string
  customDomain?: string
  enableQR?: boolean
  title?: string
}

interface UpdateUrlData {
  title?: string
  originalUrl?: string
}

export function useUrls() {
  return useQuery({
    queryKey: ['urls'],
    queryFn: async (): Promise<{ urls: Url[], pagination: any }> => {
      const response = await fetch('/api/urls')
      if (!response.ok) {
        throw new Error('Failed to fetch URLs')
      }
      return response.json()
    }
  })
}

export function useCreateUrl() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: CreateUrlData): Promise<Url> => {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create URL')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] })
      toast({
        title: 'Success!',
        description: 'URL shortened successfully'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })
}

export function useUpdateUrl() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateUrlData }): Promise<Url> => {
      const response = await fetch(`/api/urls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update URL')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] })
      toast({
        title: 'Updated!',
        description: 'URL updated successfully'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })
}

export function useDeleteUrl() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/urls/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete URL')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] })
      toast({
        title: 'Deleted!',
        description: 'URL deleted successfully'
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })
}