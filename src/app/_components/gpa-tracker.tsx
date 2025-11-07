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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
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
  CheckCircle,
  Trash2,
  QrCode,
  LineChart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode.react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  Bar,
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const gradeSchema = z.object({
  name: z.string().min(2, 'Course name is required'),
  grade: z.coerce
    .number()
    .min(0, 'Grade must be between 0.0 and 4.0')
    .max(4, 'Grade must be between 0.0 and 4.0'),
  credits: z.coerce.number().min(0.5, 'Credits must be a positive number'),
  semester: z.string().min(1, 'Semester is required'),
});

function gpaToLetter(gpa: number): string {
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.7) return 'A-';
  if (gpa >= 3.3) return 'B+';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.7) return 'B-';
  if (gpa >= 2.3) return 'C+';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.7) return 'C-';
  if (gpa >= 1.0) return 'D';
  return 'F';
}

function gpaToGradePoints(gpa: number): string {
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.0) return 'D';
  return 'F';
}

type QrCodeInfo = {
  semester: string;
  gpa: string;
  courses: { name: string; grade: number; credits: number }[];
};

const trajectoryChartConfig = {
  'CGPA': {
    label: 'CGPA',
    color: 'hsl(var(--primary))',
  },
  'Semester GPA': {
    label: 'Semester GPA',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const distributionChartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function GpaTracker() {
  const [grades, setGrades] = useState<Grade[]>([
    { id: 1, name: 'Intro to CS', grade: 3.7, credits: 3, semester: 'Sem 1' },
    { id: 2, name: 'Calculus I', grade: 3.3, credits: 4, semester: 'Sem 1' },
    { id: 3, name: 'Data Structures', grade: 3.0, credits: 3, semester: 'Sem 2' },
    { id: 4, name: 'Physics I', grade: 2.7, credits: 4, semester: 'Sem 2' },
    { id: 5, name: 'Algorithms', grade: 4.0, credits: 3, semester: 'Sem 3' },
    { id: 6, name: 'Web Development', grade: 3.5, credits: 3, semester: 'Sem 3' },
  ]);
  const [qrCodeData, setQrCodeData] = useState<QrCodeInfo | null>(null);

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

  function handleGenerateQrCode(semester: string, data: any) {
    const semesterGpa = (
      data.totalQualityPoints / data.totalCredits
    ).toFixed(2);
    setQrCodeData({
      semester,
      gpa: semesterGpa,
      courses: data.grades.map((g: Grade) => ({
        name: g.name,
        grade: g.grade,
        credits: g.credits,
      })),
    });
  }

  const {
    cgpa,
    totalCredits,
    groupedGrades,
    trajectoryData,
    gradeDistributionData,
  } = useMemo(() => {
    let totalCreditHours = 0;
    let totalQualityPoints = 0;

    const grouped = grades.reduce((acc, grade) => {
      const { semester } = grade;
      if (!acc[semester]) {
        acc[semester] = {
          grades: [],
          totalCredits: 0,
          totalQualityPoints: 0,
        };
      }
      acc[semester].grades.push(grade);
      acc[semester].totalCredits += grade.credits;
      acc[semester].totalQualityPoints += grade.grade * grade.credits;
      return acc;
    }, {} as Record<string, { grades: Grade[]; totalCredits: number; totalQualityPoints: number }>);

    let cumulativeCredits = 0;
    let cumulativeQualityPoints = 0;
    const sortedSemesters = Object.keys(grouped).sort();

    const calculatedTrajectoryData = sortedSemesters.map((semester) => {
      const semesterData = grouped[semester];
      const semesterGpa =
        semesterData.totalCredits > 0
          ? semesterData.totalQualityPoints / semesterData.totalCredits
          : 0;

      cumulativeCredits += semesterData.totalCredits;
      cumulativeQualityPoints += semesterData.totalQualityPoints;
      const cumulativeGpa =
        cumulativeCredits > 0
          ? cumulativeQualityPoints / cumulativeCredits
          : 0;

      totalCreditHours = cumulativeCredits;
      totalQualityPoints = cumulativeQualityPoints;

      return {
        name: semester.replace(' ', '\n'),
        'Semester GPA': parseFloat(semesterGpa.toFixed(2)),
        'CGPA': parseFloat(cumulativeGpa.toFixed(2)),
      };
    });

    const calculatedCgpa =
      totalCreditHours > 0
        ? (totalQualityPoints / totalCreditHours).toFixed(2)
        : '0.00';

    const distribution = grades.reduce((acc, grade) => {
      const letter = gpaToGradePoints(grade.grade);
      if (!acc[letter]) {
        acc[letter] = 0;
      }
      acc[letter]++;
      return acc;
    }, {} as Record<string, number>);

    const calculatedGradeDistributionData = ['A', 'B', 'C', 'D', 'F'].map(
      (grade) => ({
        grade,
        count: distribution[grade] || 0,
      })
    );

    return {
      cgpa: calculatedCgpa,
      totalCredits: totalCreditHours,
      groupedGrades: grouped,
      trajectoryData: calculatedTrajectoryData,
      gradeDistributionData: calculatedGradeDistributionData,
    };
  }, [grades]);

  const semesterGpa =
    trajectoryData.length > 0
      ? trajectoryData[trajectoryData.length - 1]['Semester GPA'].toFixed(2)
      : '0.00';
  const semesterCredits = useMemo(() => {
    if (grades.length === 0) return 0;
    const lastSemesterName =
      Object.keys(groupedGrades).sort()[
        Object.keys(groupedGrades).length - 1
      ];
    return groupedGrades[lastSemesterName]?.totalCredits || 0;
  }, [grades, groupedGrades]);

  return (
    <div id="performance" className="space-y-8">
      {qrCodeData && (
        <AlertDialog
          open={!!qrCodeData}
          onOpenChange={(open) => !open && setQrCodeData(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>QR Code for {qrCodeData.semester}</AlertDialogTitle>
              <AlertDialogDescription>
                Scan this code to view or share the semester's grade summary.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-center p-4 bg-white rounded-md">
              <QRCode
                value={JSON.stringify(qrCodeData, null, 2)}
                size={256}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setQrCodeData(null)}>
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div className="flex items-center gap-3">
        <LineChart className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-extrabold">Your Academic Trajectory</h2>
      </div>
      <p className="text-muted-foreground -mt-6">
        Instantly visualize your progress and gain insights.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardDescription>Semester GPA</CardDescription>
            <CardTitle className="text-2xl font-bold">{semesterGpa}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>Overall CGPA</CardDescription>
            <CardTitle className="text-2xl font-bold">{cgpa}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>Semester Credits</CardDescription>
            <CardTitle className="text-2xl font-bold">{semesterCredits}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>Total Credits</CardDescription>
            <CardTitle className="text-2xl font-bold">{totalCredits}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CGPA Trajectory</CardTitle>
            <CardDescription>
              Your cumulative GPA trend across semesters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={trajectoryChartConfig}
              className="h-[250px] w-full"
            >
              <RechartsLineChart
                data={trajectoryData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => value.replace('\n', ' ')}
                />
                <YAxis domain={[0, 4]} tickCount={5} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <RechartsLine
                  dataKey="Semester GPA"
                  type="monotone"
                  stroke="var(--color-Semester GPA)"
                  strokeWidth={2}
                  dot={true}
                />
                <RechartsLine
                  dataKey="CGPA"
                  type="monotone"
                  stroke="var(--color-CGPA)"
                  strokeWidth={2}
                  dot={true}
                />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Breakdown of your grades.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={distributionChartConfig}
              className="h-[250px] w-full"
            >
              <RechartsBarChart data={gradeDistributionData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="grade"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={4}
                />
              </RechartsBarChart>
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
                        <Input placeholder="e.g., Sem 1" {...field} />
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
                <CheckCircle className="mr-2 h-4 w-4" /> Calculate &amp; Save
                Grade
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade History</CardTitle>
          <CardDescription>
            A detailed overview of your academic performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedGrades).length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedGrades).map(([semester, data]) => {
                const semesterGpa =
                  data.totalCredits > 0
                    ? (data.totalQualityPoints / data.totalCredits).toFixed(2)
                    : '0.00';
                return (
                  <AccordionItem value={semester} key={semester}>
                    <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50">
                      <div className="flex justify-between w-full items-center">
                        <span className="font-semibold">{semester}</span>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">GPA: {semesterGpa}</Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateQrCode(semester, data);
                              }}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSemester(semester);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead className="text-center">Grade</TableHead>
                            <TableHead className="text-center">
                              Credits
                            </TableHead>
                            <TableHead className="text-right">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.grades.map((g) => (
                            <TableRow key={g.id}>
                              <TableCell className="font-medium">
                                {g.name}
                              </TableCell>
                              <TableCell className="text-center">
                                {gpaToLetter(g.grade)} ({g.grade.toFixed(2)})
                              </TableCell>
                              <TableCell className="text-center">
                                {g.credits}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => removeGrade(g.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground bg-muted p-8 rounded-lg">
              No grades have been added yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
