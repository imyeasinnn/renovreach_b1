'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  Coins,
  LayoutDashboard,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Settings,
  Star,
  Users,
  X,
} from 'lucide-react'
import { Brand } from '@/components/shell/brand'
import { toggleSidebar } from '@/services/organizations'
import { useSidebarCollapsed, useUsage } from '@/services/hooks'
import { cn } from '@/lib/cn'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/review-requests', label: 'Review Requests', icon: Send },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/credits', label: 'Credits & Usage', icon: Coins },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const collapsed = useSidebarCollapsed() && !mobile
  const usage = useUsage()

  const items = navItems
  const used = usage?.credits_used ?? 0
  const included = usage?.credits_included ?? 500
  const percent = Math.min(100, Math.round((used / included) * 100))

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-line/80 bg-surface/70 backdrop-blur-xl',
        mobile
          ? 'w-[280px]'
          : 'fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-300 lg:flex',
        !mobile && (collapsed ? 'w-[84px]' : 'w-[264px]'),
      )}
      aria-label="Main navigation"
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-line/70',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="rounded-lg"
          aria-label="RenovReach dashboard"
        >
          <Brand compact={collapsed} />
        </Link>
        {mobile ? (
          <button
            type="button"
            onClick={onNavigate}
            className="grid size-9 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg"
            aria-label="Close navigation"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex h-10 items-center gap-3 rounded-xl border text-[13.5px] font-medium transition-colors',
                    collapsed ? 'justify-center px-0' : 'px-3',
                    active
                      ? 'border-accent/20 bg-accent/12 text-accent-soft'
                      : 'border-transparent text-muted hover:bg-white/[0.04] hover:text-fg',
                  )}
                >
                  <Icon
                    className={cn('size-[18px] shrink-0', active ? 'text-accent' : 'text-faint group-hover:text-fg')}
                    aria-hidden
                  />
                  {collapsed ? (
                    <span className="sr-only">{item.label}</span>
                  ) : (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={cn('shrink-0 border-t border-line/70 p-3', collapsed && 'px-2')}>
        {!collapsed ? (
          <Link
            href="/credits"
            onClick={onNavigate}
            className="block rounded-xl border border-line bg-ink/40 p-3 transition-colors hover:border-line-strong"
          >
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-muted">Messaging credits</span>
              <span className="font-semibold text-fg">{included - used}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-faint">
              {used} of {included} used this month
            </p>
          </Link>
        ) : null}

        {!mobile ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'mt-2 flex h-9 w-full items-center gap-2 rounded-lg text-[12.5px] font-medium text-faint transition-colors hover:bg-white/[0.04] hover:text-fg',
              collapsed ? 'justify-center' : 'px-2',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <>
                <PanelLeftClose className="size-4" aria-hidden />
                Collapse
              </>
            )}
          </button>
        ) : null}
      </div>
    </aside>
  )
}
