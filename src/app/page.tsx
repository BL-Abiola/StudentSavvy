'use client';

import { useState } from 'react';
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
import { GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Dashboard from './_components/dashboard';
import AiPremium from './_components/ai-premium';
import GpaTracker from './_components/gpa-tracker';


function AppContent() {
  const [activeScreen, setActiveScreen] = useState<Screen>('performance');
  const isMobile = useIsMobile();

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
        <header className="flex items-center p-4 md:hidden border-b">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold ml-4">StudentSavvy</h1>
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
  return <AppContent />;
}
