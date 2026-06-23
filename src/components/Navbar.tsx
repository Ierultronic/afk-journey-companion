'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home', icon: '◈' },
  { href: '/heroes', label: 'Heroes', icon: '⚔' },
  { href: '/tier-list', label: 'Tier List', icon: '⏺' },
  { href: '/team-builder', label: 'Team Builder', icon: '⊞' },
  { href: '/banners', label: 'Banners', icon: '⚑' },
  { href: '/events', label: 'Events', icon: '◉' },
  { href: '/patch-notes', label: 'Patches', icon: '↻' },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1 overflow-x-auto">
        <Link
          href="/"
          className="font-bold text-lg text-indigo-400 shrink-0 mr-4 tracking-tight hover:text-indigo-300 transition-colors"
        >
          AFK Journey
        </Link>
        {links.filter(l => l.href !== '/').map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
              path === l.href
                ? 'bg-indigo-600/15 text-indigo-300 font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <span className="text-xs opacity-60">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
