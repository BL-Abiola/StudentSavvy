
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { GraduationCap, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Dashboard from './_components/dashboard';
import AiPremium from './_components/ai-premium';
import GpaTracker from './_components/gpa-tracker';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

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

  const ThemeToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="w-full justify-start gap-3 p-3 text-sm font-medium rounded-2xl"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span
        className={cn(
          'transition-opacity duration-200',
          'group-data-[collapsed]/sidebar-wrapper:opacity-0 group-data-[collapsed]/sidebar-wrapper:w-0'
        )}
      >
        Toggle Theme
      </span>
    </Button>
  );

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
        <SidebarFooter className="p-2">
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between p-4 md:hidden border-b">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">StudentSavvy</h1>
          </div>
        </header>

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
      <AppContent />
  );
}
