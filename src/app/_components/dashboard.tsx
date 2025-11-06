'use client';

import StudyPlanner from './study-planner';
import TaskManager from './task-manager';
import ClassSchedule from './class-schedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenText, CheckSquare, CalendarDays } from 'lucide-react';

export default function Dashboard() {
  return (
    <Tabs defaultValue="schedule" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="schedule">
          <CalendarDays className="mr-2 h-4 w-4" />
          Schedule
        </TabsTrigger>
        <TabsTrigger value="planner">
          <BookOpenText className="mr-2 h-4 w-4" />
          Planner
        </TabsTrigger>
        <TabsTrigger value="tasks">
          <CheckSquare className="mr-2 h-4 w-4" />
          Tasks
        </TabsTrigger>
      </TabsList>
      <TabsContent value="schedule">
        <ClassSchedule />
      </TabsContent>
      <TabsContent value="planner">
        <StudyPlanner />
      </TabsContent>
      <TabsContent value="tasks">
        <TaskManager />
      </TabsContent>
    </Tabs>
  );
}
