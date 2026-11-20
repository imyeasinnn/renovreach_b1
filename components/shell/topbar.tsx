'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Brand } from '@/components/shell/brand'
import { OrgSwitcher } from '@/components/shell/org-switcher'
import { LocationSwitcher } from '@/components/shell/location-switcher'
import { Notifications } from '@/components/shell/notifications'
import { UserMenu } from '@/components/shell/user-menu'

type OpenMenu = 'org' | 'location' | 'bell' | 'user' | null

export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const setMenu = (menu: OpenMenu) => setOpenMenu((current) => (current === menu ? null : menu))

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-ink/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-5">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-fg lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <Link
          href="/dashboard"
          aria-label="RenovReach dashboard"
          className="shrink-0 rounded-lg lg:hidden"
        >
          <Brand compact />
        </Link>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <OrgSwitcher
            open={openMenu === 'org'}
            onOpenChange={(next) => setOpenMenu(next ? 'org' : null)}
          />
          <LocationSwitcher
            open={openMenu === 'location'}
            onOpenChange={(next) => setOpenMenu(next ? 'location' : null)}
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent-soft sm:px-2.5">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">Demo mode: sample data</span>
          </span>
          <Notifications
            open={openMenu === 'bell'}
            onOpenChange={(next) => setOpenMenu(next ? 'bell' : null)}
          />
          <UserMenu
            open={openMenu === 'user'}
            onOpenChange={(next) => setOpenMenu(next ? 'user' : null)}
          />
        </div>
      </div>
    </header>
  )
}
