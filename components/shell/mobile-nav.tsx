'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, LayoutDashboard, Menu, Star, Users } from 'lucide-react'
import { cn } from '@/lib/cn'

const items = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/reviews', label: 'Reviews', icon: Star },
]

export function MobileNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors',
                  active ? 'text-accent-soft' : 'text-faint hover:text-fg',
                )}
              >
                <Icon className={cn('size-5', active && 'text-accent')} aria-hidden />
                {item.label}
              </Link>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={onMore}
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[10.5px] font-medium text-faint transition-colors hover:text-fg"
          >
            <Menu className="size-5" aria-hidden />
            More
          </button>
        </li>
      </ul>
    </nav>
  )
}
