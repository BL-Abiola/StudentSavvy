'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { Screen } from '@/types';
import {
  BarChart3,
  BookOpenText,
  CheckSquare,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

interface MainNavProps {
  activeScreen: Screen;
  setActiveScreen: Dispatch<SetStateAction<Screen>>;
}

const navItems = [
  {
    id: 'performance',
    label: 'Performance',
    icon: BarChart3,
  },
  {
    id: 'planner',
    label: 'Planner',
    icon: BookOpenText,
  },
  {
    id: 'tasks',
    label: 'To-Do List',
    icon: CheckSquare,
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: CalendarDays,
  },
  {
    id: 'premium',
    label: 'AI Premium',
    icon: Sparkles,
  },
] as const;

function DesktopNav({ activeScreen, setActiveScreen }: MainNavProps) {
  const { state } = useSidebar();
  return (
    <nav className="flex flex-col gap-2 p-2">
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={cn(
              'flex items-center gap-3 p-3 text-sm font-medium rounded-md',
              'transition-colors duration-150',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-600 dark:text-gray-400 hover:bg-muted',
              item.id === 'premium' &&
                !isActive &&
                'text-primary/80 font-bold',
              state === 'collapsed' && 'justify-center'
            )}
          >
            <item.icon
              className="w-5 h-5 shrink-0"
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={cn(
                'transition-opacity duration-200',
                state === 'collapsed' ? 'opacity-0 w-0' : 'opacity-100'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function MobileNav({ activeScreen, setActiveScreen }: MainNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-[0_-1px_10px_rgba(0,0,0,0.05)] z-50 p-2 md:hidden">
      <div className="flex justify-around items-center max-w-4xl mx-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 text-sm font-medium rounded-md w-20',
                isActive
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-400',
                item.id === 'premium' && !isActive && 'text-primary/80 font-bold'
              )}
            >
              <item.icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function MainNav(props: MainNavProps) {
  return (
    <>
      <div className="hidden md:block">
        <DesktopNav {...props} />
      </div>
      <MobileNav {...props} />
    </>
  );
}
