'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Grade } from '@/types';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, GraduationCap, CheckCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const gradeSchema = z.object({
  name: z.string().min(2, 'Course name is required'),
  grade: z.coerce
    .number()
    .min(0, 'Grade must be between 0.0 and 4.0')
    .max(4, 'Grade must be between 0.0 and 4.0'),
  credits: z.coerce.number().min(0.5, 'Credits must be a positive number'),
});

const mockPerformanceData = [
  { semester: 'Fall \'23', gpa: 3.2, credits: 15 },
  { semester: 'Spring \'24', gpa: 3.8, credits: 16 },
  { semester: 'Fall \'24', gpa: 3.5, credits: 15 },
];

export default function GpaTracker() {
  const [grades, setGrades] = useState<Grade[]>([]);

  const form = useForm<z.infer<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: '',
      grade: 4.0,
      credits: 3,
    },
  });

  function addGrade(values: z.infer<typeof gradeSchema>) {
    const newGrade: Grade = { id: Date.now(), ...values };
    setGrades([...grades, newGrade]);
    form.reset();
  }

  const { cgpa, lastGpa } = useMemo(() => {
    let totalCreditHours = 0;
    let totalQualityPoints = 0;

    grades.forEach((g) => {
      totalCreditHours += g.credits;
      totalQualityPoints += g.grade * g.credits;
    });

    const calculatedCgpa =
      totalCreditHours > 0
        ? (totalQualityPoints / totalCreditHours).toFixed(2)
        : '0.00';
    const calculatedLastGpa =
      grades.length > 0
        ? grades[grades.length - 1].grade.toFixed(2)
        : '0.00';

    return { cgpa: calculatedCgpa, lastGpa: calculatedLastGpa };
  }, [grades]);
  
  const chartConfig = {
    gpa: {
      label: "GPA",
      color: "hsl(var(--primary))",
    },
  } satisfies import('@/components/ui/chart').ChartConfig;

  return (
    <section id="performance" className="space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Performance & GPA Tracker
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-accent shadow-md">
          <CardHeader>
            <CardDescription>Current CGPA</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {cgpa}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-primary shadow-md">
          <CardHeader>
            <CardDescription>Last Entry GPA</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {lastGpa}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Mock data showing GPA over past semesters.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={mockPerformanceData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="semester"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis domain={[0, 4]} tickLine={false} axisLine={false} />
               <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="gpa" fill="var(--color-gpa)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add/Update Grades</CardTitle>
          <CardDescription>
            Add your course grades here to calculate your CGPA in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addGrade)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CS 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade (4.0 Scale)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" /> Calculate & Save Grade
              </Button>
            </form>
          </Form>
          {grades.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="font-semibold">Grade Entries:</h4>
              <ul className="space-y-1">
                {grades.map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{g.name}:</strong> {g.grade.toFixed(2)} ({g.credits}{' '}
                      Credits)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
