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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  GraduationCap,
  CheckCircle,
  ArrowUpDown,
  Upload,
  Download,
  Trash2,
  QrCode,
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';

const gradeSchema = z.object({
  name: z.string().min(2, 'Course name is required'),
  grade: z.coerce
    .number()
    .min(0, 'Grade must be between 0.0 and 4.0')
    .max(4, 'Grade must be between 0.0 and 4.0'),
  credits: z.coerce.number().min(0.5, 'Credits must be a positive number'),
  semester: z.string().min(1, 'Semester is required'),
});

const gpaTrajectoryData = [
  { semester: 'Sem 1', semesterGpa: 3.5, cgpa: 3.5 },
  { semester: 'Sem 2', semesterGpa: 3.2, cgpa: 3.35 },
  { semester: 'Sem 3', semesterGpa: 3.8, cgpa: 3.5 },
  { semester: 'Sem 4', semesterGpa: 3.9, cgpa: 3.6 },
];

// Helper function to convert GPA to letter grade
function gpaToLetter(gpa: number): string {
  if (gpa >= 4.0) return 'A+';
  if (gpa >= 3.7) return 'A';
  if (gpa >= 3.3) return 'A-';
  if (gpa >= 3.0) return 'B+';
  if (gpa >= 2.7) return 'B';
  if (gpa >= 2.3) return 'B-';
  if (gpa >= 2.0) return 'C+';
  if (gpa >= 1.7) return 'C';
  if (gpa >= 1.3) return 'C-';
  if (gpa >= 1.0) return 'D';
  return 'F';
}

export default function GpaTracker() {
  const [grades, setGrades] = useState<Grade[]>([
    { id: 1, name: 'Intro to Psych', grade: 3.7, credits: 3, semester: 'Semester 1' },
    { id: 2, name: 'Calculus I', grade: 3.0, credits: 4, semester: 'Semester 1' },
    { id: 3, name: 'English Comp', grade: 4.0, credits: 3, semester: 'Semester 2' },
    { id: 4, name: 'Art History', grade: 3.3, credits: 3, semester: 'Semester 2' },
    { id: 5, name: 'Biology Lab', grade: 2.7, credits: 1, semester: 'Semester 3' },
    { id: 6, name: 'Statistics', grade: 2.3, credits: 3, semester: 'Semester 3' },
  ]);

  const form = useForm<z.infer<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: '',
      grade: 4.0,
      credits: 3,
      semester: '',
    },
  });

  function addGrade(values: z.infer<typeof gradeSchema>) {
    const newGrade: Grade = { id: Date.now(), ...values };
    setGrades([...grades, newGrade]);
    form.reset();
  }

  function removeGrade(id: number) {
    setGrades(grades.filter((g) => g.id !== id));
  }
  
  function removeSemester(semester: string) {
    setGrades(grades.filter((g) => g.semester !== semester));
  }

  const { cgpa, lastGpa, gradeDistribution, groupedGrades } = useMemo(() => {
    let totalCreditHours = 0;
    let totalQualityPoints = 0;
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    grades.forEach((g) => {
      totalCreditHours += g.credits;
      totalQualityPoints += g.grade * g.credits;
      if (g.grade >= 3.7) distribution['A']++;
      else if (g.grade >= 2.7) distribution['B']++;
      else if (g.grade >= 1.7) distribution['C']++;
      else if (g.grade >= 0.7) distribution['D']++;
      else distribution['F']++;
    });

    const calculatedCgpa =
      totalCreditHours > 0
        ? (totalQualityPoints / totalCreditHours).toFixed(2)
        : '0.00';
    const calculatedLastGpa =
      grades.length > 0
        ? grades[grades.length - 1].grade.toFixed(2)
        : '0.00';

    const gradeDistributionData = Object.entries(distribution).map(([name, value]) => ({ name, value }));

    const grouped = grades.reduce((acc, grade) => {
        const { semester } = grade;
        if (!acc[semester]) {
            acc[semester] = { grades: [], totalCredits: 0, totalQualityPoints: 0 };
        }
        acc[semester].grades.push(grade);
        acc[semester].totalCredits += grade.credits;
        acc[semester].totalQualityPoints += grade.grade * grade.credits;
        return acc;
    }, {} as Record<string, { grades: Grade[]; totalCredits: number; totalQualityPoints: number; }>);

    return {
      cgpa: calculatedCgpa,
      lastGpa: calculatedLastGpa,
      gradeDistribution: gradeDistributionData,
      groupedGrades: grouped
    };
  }, [grades]);

  const trajectoryChartConfig = {
    semesterGpa: { label: 'Semester GPA', color: 'hsl(var(--primary))' },
    cgpa: { label: 'CGPA', color: 'hsl(var(--accent))' },
  } satisfies import('@/components/ui/chart').ChartConfig;

  const distributionChartConfig = {
    value: { label: 'Count', color: 'hsl(var(--primary))' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CGPA Trajectory</CardTitle>
            <CardDescription>
              Your cumulative GPA trend across semesters.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={trajectoryChartConfig}
              className="w-full h-full"
            >
              <LineChart
                data={gpaTrajectoryData}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="semester"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  domain={[2.0, 4.0]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="semesterGpa"
                  stroke="var(--color-semesterGpa)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--color-semesterGpa)' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="cgpa"
                  stroke="var(--color-cgpa)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--color-cgpa)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Breakdown of your entered grades.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={distributionChartConfig}
              className="w-full h-full"
            >
              <BarChart data={gradeDistribution} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Add New Grade</CardTitle>
          <CardDescription>
            Add your course grades here to calculate your CGPA in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addGrade)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Semester 1" {...field} />
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
                        <Input type="number" step="0.5" {...field} />
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Grade History</CardTitle>
            <CardDescription>
              A detailed overview of your academic performance.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" /> Sort By
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-[1fr,120px,120px,80px] items-center px-4 py-2 font-semibold text-muted-foreground border-b">
              <span>Course</span>
              <span className="text-center">Grade</span>
              <span className="text-center">Credits</span>
              <span className="text-right">Action</span>
            </div>
            {Object.keys(groupedGrades).length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedGrades).map(([semester, data]) => {
                const semesterGpa = (data.totalQualityPoints / data.totalCredits).toFixed(2);
                return (
                  <AccordionItem value={semester} key={semester}>
                    <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50">
                      <div className="flex justify-between w-full items-center">
                        <span className="font-semibold">{semester}</span>
                        <div className="flex items-center gap-4">
                           <Badge variant="secondary">GPA: {semesterGpa}</Badge>
                           <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <QrCode className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeSemester(semester);}}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                           </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="divide-y">
                        {data.grades.map((g) => (
                           <div key={g.id} className="grid grid-cols-[1fr,120px,120px,80px] items-center px-4 py-3">
                                <span>{g.name}</span>
                                <span className="text-center">{gpaToLetter(g.grade)} ({g.grade.toFixed(2)})</span>
                                <span className="text-center">{g.credits}</span>
                                <div className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeGrade(g.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                           </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            ) : (
                <p className="p-8 text-center text-muted-foreground">No grades have been added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
