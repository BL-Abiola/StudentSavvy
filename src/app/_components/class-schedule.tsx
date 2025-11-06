'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Class } from '@/types';
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
import { CalendarDays, Clock, MapPin, Trash2 } from 'lucide-react';

const classSchema = z.object({
  name: z.string().min(2, 'Course name is required'),
  day: z.string().min(1, 'Please select a day'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().optional(),
});

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const dayFullName = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
};

export default function ClassSchedule() {
  const [classes, setClasses] = useState<Class[]>([]);

  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      day: '',
      time: '',
      location: '',
    },
  });

  function addClass(values: z.infer<typeof classSchema>) {
    const newClass: Class = {
      id: Date.now(),
      ...values,
      location: values.location || 'N/A',
    };
    setClasses([...classes, newClass]);
    form.reset();
  }

  function removeClass(id: number) {
    setClasses(classes.filter((c) => c.id !== id));
  }

  const groupedClasses = classes.reduce((acc, currentClass) => {
    const day = currentClass.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(currentClass);
    // Sort classes by time
    acc[day].sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {} as Record<string, Class[]>);

  return (
    <section id="schedule" className="space-y-8">
      <div className="flex items-center gap-3">
        <CalendarDays className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Class Schedule & Reminders
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Class</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addClass)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Intro to Microeconomics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of the Week</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day} value={day}>
                              {dayFullName[day as keyof typeof dayFullName]}
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
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location/Room</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Building C, 305" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Save Class
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-700 dark:text-gray-300">
          Your Weekly Schedule
        </h3>
        {classes.length === 0 ? (
          <p className="text-center text-gray-500 bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
            Your schedule is empty. Add a class to get started!
          </p>
        ) : (
          <div className="space-y-6">
            {daysOfWeek
              .filter((day) => groupedClasses[day])
              .map((day) => (
                <div key={day}>
                  <h4 className="font-semibold text-lg mb-2 text-primary">
                    {dayFullName[day as keyof typeof dayFullName]}
                  </h4>
                  <div className="space-y-3">
                    {groupedClasses[day].map((c) => (
                      <Card key={c.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">{c.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1.5"><Clock size={14} />{new Date(`1970-01-01T${c.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={14} />{c.location}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeClass(c.id)}
                        >
                          <Trash2 size={18} />
                          <span className="sr-only">Remove class</span>
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
