'use client'

import { useEffect } from 'react'
import { useNavigation } from '@/contexts/navigation-context'

interface AdminPageWrapperProps {
  children: React.ReactNode
}

export function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  const { setPageLoaded } = useNavigation()

  useEffect(() => {
    // Signal that the admin page has loaded
    setPageLoaded()
  }, [setPageLoaded])

  return <>{children}</>
}
