'use client';

import React, { useState } from 'react';
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
import GpaTracker from './_components/gpa-tracker';
import { Button } from '@/components/ui/button';

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
      setTheme(theme);
    },
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Theme context
const ThemeContext = React.createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
} | null>(null);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}