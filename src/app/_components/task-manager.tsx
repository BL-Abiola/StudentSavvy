
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Task, TaskPriority } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Countdown } from './countdown';

const taskSchema = z.object({
  title: z.string().min(3, 'Task title is required'),
  priority: z.enum(['urgent', 'intermediate', 'later'], {
    required_error: 'Priority is required',
  }),
  duedate: z.string().min(1, 'Due date is required'),
});

const priorityConfig = {
  urgent: {
    label: '🔴 Most Priority',
    style: 'border-l-destructive',
    text: 'Most Priority (URGENTLY)',
  },
  intermediate: {
    label: '🟡 Priority',
    style: 'border-l-warning',
    text: 'Priority (Intermediate)',
  },
  later: {
    label: '🟢 Do It Later',
    style: 'border-l-accent',
    text: 'Do It Later',
  },
};

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      return parsedTasks.map((task: any) => ({ ...task, dueDate: new Date(task.dueDate) }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      priority: undefined,
      duedate: '',
    },
  });

  function addTask(values: z.infer<typeof taskSchema>) {
    const newTask: Task = {
      id: Date.now(),
      title: values.title,
      priority: values.priority as TaskPriority,
      dueDate: new Date(values.duedate),
      isCompleted: false,
    };
    setTasks([...tasks, newTask]);
    form.reset();
  }

  function removeTask(id: number) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const priorityOrder = { urgent: 1, intermediate: 2, later: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }, [tasks]);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6" />
            Task Manager
        </CardTitle>
        <CardDescription>
            Manage your to-do list and track deadlines.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Finish Essay Draft"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Tier</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(priorityConfig).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duedate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full rounded-full">
                Add Task
              </Button>
            </form>
          </Form>
        </div>

        <div>
            <h3 className="text-lg font-semibold mt-6 mb-4 text-card-foreground">
            Active Tasks
            </h3>
            {sortedTasks.length === 0 ? (
            <div className="text-center text-muted-foreground bg-muted/50 p-8 rounded-lg">
                <p>All clear! Add a task to get started.</p>
            </div>
            ) : (
            <div className="space-y-3">
                {sortedTasks.map((task) => (
                <Card
                    key={task.id}
                    className={cn(
                    'p-4 flex justify-between items-center border-l-4 transition-all rounded-lg',
                    priorityConfig[task.priority].style
                    )}
                >
                    <div>
                    <p className="font-bold text-card-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {priorityConfig[task.priority].text} | Due:{' '}
                        {task.dueDate.toLocaleString()}
                    </p>
                    <Countdown dueDate={task.dueDate} />
                    </div>
                    <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeTask(task.id)}
                    >
                    <Trash2 size={18} />
                    <span className="sr-only">Remove task</span>
                    </Button>
                </Card>
                ))}
            </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
