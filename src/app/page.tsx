'use client';

import { useState } from 'react';
import type { Screen } from '@/types';
import MainNav from './_components/main-nav';
import GpaTracker from './_components/gpa-tracker';
import StudyPlanner from './_components/study-planner';
import TaskManager from './_components/task-manager';
import ClassSchedule from './_components/class-schedule';
import AiPremium from './_components/ai-premium';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

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
