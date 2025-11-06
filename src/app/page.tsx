'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Screen } from '@/types';
import MainNav from './_components/main-nav';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { GraduationCap, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Dashboard from './_components/dashboard';
import AiPremium from './_components/ai-premium';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const GpaTracker = dynamic(() => import('./_components/gpa-tracker'), {
  ssr: false,
  loading: () => (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-1/3" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  ),
});

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<Screen>('performance');
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'performance':
        return <GpaTracker />;
      case 'ai-tools':
        return <AiPremium />;
      default:
        return <GpaTracker />;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">StudentSavvy</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between p-4 md:hidden border-b">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">StudentSavvy</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </header>

        <div className="hidden md:flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <main
          className={cn(
            'flex-1 mx-auto p-4 md:p-8 w-full max-w-4xl no-scrollbar',
            isMobile ? 'pb-28' : '' // Add padding-bottom only on mobile
          )}
        >
          <div className="animate-in fade-in-50 duration-300">
            {renderScreen()}
          </div>
        </main>
        {!isMobile ? null : (
          <MainNav
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

// Theme provider
interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeContext = React.createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
} | null>(null);


function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: 'light' | 'dark') => {
      localStorage.setItem('theme', theme);
      setTheme(theme);
    },
  };
  
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(isDarkMode ? 'dark' : 'light');
    }
  }, []);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
