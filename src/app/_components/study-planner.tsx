
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { StudySession } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { BookOpenText, Clock, Calendar, Pencil, Trash2 } from 'lucide-react';

const studySchema = z.object({
  topic: z.string().min(3, 'Topic is required'),
  datetime: z.string().min(1, 'Date and time are required'),
  notes: z.string().optional(),
});

export default function StudyPlanner() {
  const [sessions, setSessions] = useState<StudySession[]>([]);

  const form = useForm<z.infer<typeof studySchema>>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      topic: '',
      datetime: '',
      notes: '',
    },
  });

  function addStudySession(values: z.infer<typeof studySchema>) {
    const [date, time] = values.datetime.split('T');
    const newSession: StudySession = { id: Date.now(), topic: values.topic, date, time, notes: values.notes || '' };
    setSessions([...sessions, newSession].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
    form.reset({
      topic: '',
      datetime: '',
      notes: '',
    });
  }

  function removeSession(id: number) {
    setSessions(sessions.filter((s) => s.id !== id));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BookOpenText className="w-6 h-6" />
          Study Planner
        </CardTitle>
        <CardDescription>
          Schedule your personal study sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
            <Form {...form}>
                <form
                onSubmit={form.handleSubmit(addStudySession)}
                className="space-y-4"
                >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Topic/Course Focus</FormLabel>
                          <FormControl>
                          <Input placeholder="e.g., Chapter 5 Reading" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                  control={form.control}
                  name="datetime"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                          <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                </div>
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Goals for this session</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="e.g., Summarize key concepts, complete practice problems..."
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    Schedule Session
                </Button>
                </form>
            </Form>
        </div>

        <div>
            <h3 className="text-lg font-semibold mt-6 mb-4 text-card-foreground">
            Upcoming Sessions
            </h3>
            {sessions.length === 0 ? (
            <div className="text-center text-muted-foreground bg-muted/50 p-8 rounded-lg">
                <p>No study sessions scheduled. Plan one now!</p>
            </div>
            ) : (
            <div className="space-y-4">
                {sessions.map((session) => (
                <Card key={session.id} className="p-4">
                    <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-card-foreground">{session.topic}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1.5"><Calendar size={14} />{new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} />{new Date(`1970-01-01T${session.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {session.notes && (
                        <p className="flex items-start gap-1.5 text-sm text-muted-foreground mt-2"><Pencil size={14} className="mt-0.5 shrink-0" /> {session.notes}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => removeSession(session.id)}
                    >
                        <Trash2 size={18} />
                        <span className="sr-only">Remove session</span>
                    </Button>
                    </div>
                </Card>
                ))}
            </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
