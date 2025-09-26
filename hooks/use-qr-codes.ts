import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface QRCode {
  id: string
  url: string
  qrCodeUrl: string
  title?: string
  createdAt: string
  updatedAt?: string
}

interface CreateQRCodeData {
  url: string
  title?: string
}

interface UpdateQRCodeData {
  title?: string
}

// Fetch QR codes
export function useQRCodes() {
  return useQuery({
    queryKey: ['qr-codes'],
    queryFn: async () => {
      const response = await fetch('/api/qr-codes')
      if (!response.ok) {
        throw new Error('Failed to fetch QR codes')
      }
      return response.json()
    },
  })
}

// Create QR code
export function useCreateQRCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateQRCodeData) => {
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create QR code')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] })
    },
  })
}

// Update QR code
export function useUpdateQRCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateQRCodeData }) => {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update QR code')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] })
    },
  })
}

// Delete QR code
export function useDeleteQRCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete QR code')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] })
    },
  })
}