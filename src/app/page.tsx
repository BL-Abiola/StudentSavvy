
'use client';

import React, { useState, useEffect } from 'react';
import type { Screen, User } from '@/types';
import MainNav from './_components/main-nav';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { GraduationCap, Sun, Moon } from 'lucide-react';
import Dashboard from './_components/dashboard';
import AiPremium from './_components/ai-premium';
import GpaTracker from './_components/gpa-tracker';
import { useTheme } from 'next-themes';
import { SidebarProvider } from '@/components/ui/sidebar';
import Onboarding from './_components/onboarding';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-full hover:bg-muted"
    >
      <div className="relative h-5 w-5 flex items-center justify-center">
        <Sun className="h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
};

const SidebarThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="w-full flex items-center gap-3 p-3 text-sm font-medium rounded-2xl hover:bg-muted"
    >
      <div className="relative h-5 w-5">
        <Sun className="h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute top-0 left-0 h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span
        className={cn(
          'transition-opacity duration-200',
          'group-data-[collapsed]/sidebar-wrapper:opacity-0 group-data-[collapsed]/sidebar-wrapper:w-0'
        )}
      >
        Toggle Theme
      </span>
    </button>
  );
};

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>('performance');
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const savedScreen = localStorage.getItem('activeScreen');
    if (savedScreen) {
      setActiveScreen(savedScreen as Screen);
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activeScreen', activeScreen);
  }, [activeScreen]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const handleOnboardingComplete = (userData: User) => {
    setUser(userData);
    setShowOnboarding(false);
  };

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

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="hidden md:block border-r">
        <SidebarHeader>
          <div className="flex flex-col gap-2 p-2 items-center">
            <GraduationCap className="w-8 h-8 text-primary" />
            <div className="text-center">
              <span className="text-lg font-bold">{user?.name}</span>
              <p className="text-xs text-muted-foreground">{user?.university}</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        </SidebarContent>
        <SidebarFooter className="p-2">
          <SidebarThemeToggle />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between p-4 md:hidden border-b">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-base font-semibold leading-tight">{user?.name}</h1>
              <p className="text-xs text-muted-foreground">{user?.university}</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <main
          className={cn(
            'flex-1 mx-auto p-4 md:p-8 w-full max-w-4xl no-scrollbar pb-24 overflow-x-hidden'
          )}
        >
          <div className="animate-in fade-in-50 duration-300">
            {renderScreen()}
          </div>
        </main>

        <div className="md:hidden">
          <MainNav
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
