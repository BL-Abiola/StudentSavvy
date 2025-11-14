
"use client"

import { useState, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Grade } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle, Trash2, QrCode, Upload, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import QRCode from "qrcode.react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

const gradeMap = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 0,
};

const gradeSchema = z.object({
  name: z.string().min(2, "Course name is required"),
  grade: z.coerce
    .number()
    .min(0, "Grade must be between 0.0 and 5.0")
    .max(5, "Grade must be between 0.0 and 5.0"),
  credits: z.coerce.number().min(0.5, "Credits must be a positive number"),
  year: z.string().min(1, "Year is required"),
  session: z.string().min(1, "Session is required"),
})

function gpaToLetter(gpa: number): string {
  if (gpa >= 5) return "A"
  if (gpa >= 4) return "B"
  if (gpa >= 3) return "C"
  if (gpa >= 2) return "D"
  return "F"
}

type QrCodeInfo = {
  semester: string
  gpa: string
  courses: { name: string; grade: number; credits: number }[]
}

type GpaEditorProps = {
    grades: Grade[];
    setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
}

export default function GpaEditor({ grades, setGrades }: GpaEditorProps) {
  const [qrCodeData, setQrCodeData] = useState<QrCodeInfo | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const form = useForm<z.infer<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: "",
      grade: undefined,
      credits: undefined,
      year: "",
      session: "",
    },
  })

  function addGrade(values: z.infer<typeof gradeSchema>) {
    const newGrade: Grade = { id: Date.now(), ...values }
    setGrades([...grades, newGrade]);
    toast({
        title: "Grade Saved",
        description: `Your grade for ${values.name} has been recorded.`,
    });
    form.reset({
      name: "",
      grade: undefined,
      credits: undefined,
      year: "",
      session: "",
    });
  }

  function removeGrade(id: number) {
    setGrades(grades.filter((g) => g.id !== id))
  }

  function removeSemester(year: string, session: string) {
    setGrades(grades.filter((g) => !(g.year === year && g.session === session)))
  }
  
  function handleGenerateQrCode(semester: string, data: any) {
    const semesterGpa =
      data.totalCredits > 0
        ? (data.totalQualityPoints / data.totalCredits).toFixed(2)
        : "0.00"
    setQrCodeData({
      semester,
      gpa: semesterGpa,
      courses: data.grades.map((g: Grade) => ({
        name: g.name,
        grade: g.grade,
        credits: g.credits,
      })),
    })
  }

  const handleExport = () => {
    if (grades.length === 0) {
      toast({
        variant: "destructive",
        title: "No Grades to Export",
        description: "Add some grades before exporting.",
      });
      return;
    }
    
    const headers = ["id", "name", "grade", "credits", "year", "session"];
    const csvContent = [
      headers.join(','),
      ...grades.map(g => headers.map(header => {
        const value = g[header as keyof Grade];
        if (typeof value === 'string') {
          // Escape quotes by doubling them
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);

    const exportFileDefaultName = 'studentsavvy_grades.csv';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({
        title: "Export Successful",
        description: "Your grades have been exported as a CSV file.",
    });
  }

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("File could not be read.");
            }
            const importedGrades = JSON.parse(text);

            // Basic validation
            if (Array.isArray(importedGrades) && importedGrades.every(g => 'id' in g && 'name' in g && 'grade' in g)) {
                setGrades(importedGrades);
                toast({
                    title: "Import Successful",
                    description: `${importedGrades.length} grades have been imported.`,
                });
            } else {
                throw new Error("Invalid file format.");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Import Failed",
                description: "The selected file is not a valid grade export. Please try again.",
            });
        }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };


  const groupedGradesByYear = useMemo(() => {
    return grades.reduce((acc, grade) => {
      const { year, session } = grade;
      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][session]) {
        acc[year][session] = {
          grades: [],
          totalCredits: 0,
          totalQualityPoints: 0,
        };
      }
      acc[year][session].grades.push(grade);
      acc[year][session].totalCredits += grade.credits;
      acc[year][session].totalQualityPoints += grade.grade * grade.credits;
      return acc;
    }, {} as Record<string, Record<string, { grades: Grade[]; totalCredits: number; totalQualityPoints: number }>>);
  }, [grades]);


  return (
    <>
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

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Add New Grade</CardTitle>
          <CardDescription>
            Add your course grades here to calculate your CGPA in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addGrade)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Year 1">Year 1</SelectItem>
                          <SelectItem value="Year 2">Year 2</SelectItem>
                          <SelectItem value="Year 3">Year 3</SelectItem>
                          <SelectItem value="Year 4">Year 4</SelectItem>
                          <SelectItem value="Year 5">Year 5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="session"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session</FormLabel>
                       <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a session" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1st Semester">1st Semester</SelectItem>
                          <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value !== undefined ? String(field.value) : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(gradeMap).map(([letter, value]) => (
                            <SelectItem key={letter} value={String(value)}>
                              {letter}
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
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="Enter credits" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full rounded-full">
                <CheckCircle className="mr-2 h-4 w-4" /> Calculate &amp; Save
                Grade
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Grade History</CardTitle>
            <CardDescription>
              A detailed overview of your academic performance.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <input
              type="file"
              ref={importInputRef}
              className="hidden"
              accept=".json"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={handleImportClick} className="rounded-full">
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-full">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedGradesByYear).length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-4">
              {Object.entries(groupedGradesByYear).map(([year, sessions]) => (
                <AccordionItem value={year} key={year} className="border-b-0 rounded-2xl bg-muted/30">
                  <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline hover:bg-muted/50 rounded-t-2xl">
                    {year}
                  </AccordionTrigger>
                  <AccordionContent className="p-2 space-y-2">
                    {Object.entries(sessions).map(([session, data]) => {
                        const semesterGpa =
                        data.totalCredits > 0
                          ? (data.totalQualityPoints / data.totalCredits).toFixed(2)
                          : "0.00"
                      return (
                        <div key={session} className="border rounded-md">
                          <div className="px-4 py-2 bg-muted/50 rounded-t-md">
                            <div className="flex justify-between w-full items-center">
                              <span className="font-semibold text-base">{session}</span>
                              <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="text-sm">GPA: {semesterGpa}</Badge>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleGenerateQrCode(`${year} ${session}`, data)}
                                  >
                                    <QrCode className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => removeSemester(year, session)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          {isMobile ? (
                            <div className="p-2 space-y-2">
                                {data.grades.map(g => (
                                    <Card key={g.id} className="p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-bold">{g.name}</p>
                                                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                                    <span>Grade: <span className="font-semibold text-foreground">{gpaToLetter(g.grade)} ({g.grade.toFixed(1)})</span></span>
                                                    <span>Credits: <span className="font-semibold text-foreground">{g.credits}</span></span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                                                onClick={() => removeGrade(g.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                          ) : (
                          <div className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Course</TableHead>
                                  <TableHead className="text-center">Grade</TableHead>
                                  <TableHead className="text-center">Credits</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {data.grades.map((g) => (
                                  <TableRow key={g.id}>
                                    <TableCell className="font-medium">{g.name}</TableCell>
                                    <TableCell className="text-center">{gpaToLetter(g.grade)} ({g.grade.toFixed(1)})</TableCell>
                                    <TableCell className="text-center">{g.credits}</TableCell>
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
                          </div>
                          )}
                        </div>
                      )
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground bg-muted p-8 rounded-lg">
              No grades have been added yet. Use the form above or import your data to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
