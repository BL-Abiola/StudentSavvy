'use client';

import { useState } from 'react';
import type { Screen } from '@/types';
import MainNav from './_components/main-nav';
import StudyPlanner from './_components/study-planner';
import TaskManager from './_components/task-manager';
import ClassSchedule from './_components/class-schedule';
import AiPremium from './_components/ai-premium';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>('performance');

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
    <div className="flex h-screen flex-col">
      <header className="absolute top-0 right-0 p-4 z-50">
        <ThemeToggle />
      </header>
      <main
        className={cn(
          'flex-1 overflow-y-auto max-w-4xl mx-auto pt-8 pb-28 p-4 w-full no-scrollbar'
        )}
      >
        <div className="animate-in fade-in-50 duration-300">
          {renderScreen()}
        </div>
      </main>
      <MainNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
}
