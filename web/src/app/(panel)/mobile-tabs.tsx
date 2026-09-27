'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Today', enabled: true },
  { href: '/businesses', label: 'Businesses', enabled: true },
  { href: '#', label: 'Payments', enabled: false },
  { href: '#', label: 'Stats', enabled: false },
  { href: '#', label: 'More', enabled: false },
]

// Bottom tab bar on phones (where the founder lives), top row on bigger screens.
export function MobileTabs() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <ul className="mx-auto flex max-w-2xl">
        {tabs.map((tab) => {
          const active = tab.enabled && pathname === tab.href
          return (
            <li key={tab.label} className="flex-1">
              {tab.enabled ? (
                <Link
                  href={tab.href}
                  className={`block py-3 text-center text-xs font-medium ${
                    active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </Link>
              ) : (
                <span className="block cursor-not-allowed py-3 text-center text-xs text-slate-700">
                  {tab.label}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
