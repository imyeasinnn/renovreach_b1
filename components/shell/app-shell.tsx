'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/shell/sidebar'
import { Topbar } from '@/components/shell/topbar'
import { MobileNav } from '@/components/shell/mobile-nav'
import { ToastProvider } from '@/components/ui/toast'
import { useSidebarCollapsed } from '@/services/hooks'
import { cn } from '@/lib/cn'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const collapsed = useSidebarCollapsed()

  useEffect(() => {
    if (!mobileNavOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileNavOpen])

  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <Sidebar />

        <div
          className={cn(
            'flex min-h-dvh flex-col transition-[padding] duration-300',
            collapsed ? 'lg:pl-[84px]' : 'lg:pl-[264px]',
          )}
        >
          <Topbar onOpenNav={() => setMobileNavOpen(true)} />
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
            {children}
          </main>
        </div>

        <MobileNav onMore={() => setMobileNavOpen(true)} />

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 animate-pop-in shadow-2xl">
              <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        ) : null}
      </div>
    </ToastProvider>
  )
}
