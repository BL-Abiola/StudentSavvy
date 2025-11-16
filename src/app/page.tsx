
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
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { GraduationCap, Settings } from 'lucide-react';
import Dashboard from './_components/dashboard';
import AiPremium from './_components/ai-premium';
import GpaTracker from './_components/gpa-tracker';
import { SidebarProvider } from '@/components/ui/sidebar';
import Onboarding from './_components/onboarding';
import SettingsDialog from './_components/settings-dialog';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>('performance');
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedScreen = localStorage.getItem('activeScreen');
    if (savedScreen) {
      setActiveScreen(savedScreen as Screen);
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Small delay to prevent flash of onboarding screen if user is found
      const timer = setTimeout(() => setShowOnboarding(true), 100);
      return () => clearTimeout(timer);
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
  
  const handleUserUpdate = (newUserData: User) => {
    setUser(newUserData);
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
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="flex flex-col gap-2 p-2 items-center">
            <GraduationCap className="w-8 h-8 text-primary" />
            <div className="text-center group-data-[collapsed=true]:hidden">
              <span className="text-lg font-bold">{user?.name}</span>
              <p className="text-xs text-muted-foreground">{user?.department} {user?.university} - {user?.year}</p>
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
           <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="w-full justify-start px-3 gap-3 hover:bg-transparent dark:hover:bg-transparent">
            <Settings className="h-5 w-5" />
            <span className={cn('transition-opacity duration-200', 'group-data-[collapsed=true]:opacity-0 group-data-[collapsed=true]:w-0')}>
              Settings
            </span>
            <span className="sr-only">Open Settings</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
             <SidebarTrigger className="hidden md:flex" />
            <GraduationCap className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold leading-tight">{user?.name}</h1>
              <p className="text-sm text-muted-foreground">{user?.department} {user?.university} - {user?.year}</p>
            </div>
          </div>
           <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="hover:bg-muted md:hidden">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Open Settings</span>
          </Button>
        </header>

        <main
          className={cn(
            'flex-1 mx-auto p-4 md:p-8 w-full max-w-4xl no-scrollbar pb-24',
            'overflow-y-auto'
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
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} user={user} onUserUpdate={handleUserUpdate} />
    </SidebarProvider>
  );
}
