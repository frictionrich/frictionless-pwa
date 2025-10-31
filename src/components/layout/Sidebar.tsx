'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'startup' | 'investor';
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const startupNav = [
    { name: 'Dashboard', href: '/dashboard/startup', icon: '📊' },
    { name: 'Investors', href: '/dashboard/startup/investors', icon: '💼' },
    { name: 'Performance', href: '/dashboard/startup/performance', icon: '📈' },
    { name: 'Readiness', href: '/dashboard/startup/readiness', icon: '✨' },
    { name: 'Settings', href: '/dashboard/startup/settings', icon: '⚙️' },
  ];

  const investorNav = [
    { name: 'Dashboard', href: '/dashboard/investor', icon: '📊' },
    { name: 'Startups', href: '/dashboard/investor/startups', icon: '🚀' },
    { name: 'Settings', href: '/dashboard/investor/settings', icon: '⚙️' },
  ];

  const navItems = role === 'startup' ? startupNav : investorNav;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-neutral-silver flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Image src="/logo.png" alt="Frictionless" width={120} height={32} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-body-2 transition-colors',
                isActive
                  ? 'bg-tint-5 text-primary font-medium'
                  : 'text-neutral-grey hover:bg-neutral-silver'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-neutral-silver">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
            {userName?.charAt(0) || userEmail?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-3-medium text-neutral-black truncate">
              {userName || 'User'}
            </p>
            <p className="text-body-4 text-neutral-grey truncate">
              {userEmail}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 text-body-3 text-neutral-grey hover:text-neutral-black transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
