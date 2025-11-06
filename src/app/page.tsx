'use client';

import { useState } from 'react';
import type { Screen } from '@/types';
import MainNav from './_components/main-nav';
import StudyPlanner from './_components/study-planner';
import TaskManager from './_components/task-manager';
import ClassSchedule from './_components/class-schedule';
import AiPremium from './_components/ai-premium';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
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

const GpaTracker = dynamic(() => import('./_components/gpa-tracker'), {
  ssr: false,
  loading: () => (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-6 w-96" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>

      <Skeleton className="h-64" />
      <Skeleton className="h-96" />
    </div>
  ),
});

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<Screen>('performance');
  const isMobile = useIsMobile();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'performance':
        return <GpaTracker />;
      case 'planner':
        return <StudyPlanner />;
      case 'tasks':
        return <TaskManager />;
      case 'schedule':
        return <ClassSchedule />;
      case 'premium':
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
            'flex-1 mx-auto p-4 md:p-8 w-full max-w-4xl',
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