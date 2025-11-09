"use client"

import { useState, useMemo } from "react"
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
import { CheckCircle, Trash2, QrCode } from "lucide-react"
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
  if (gpa >= 4.5) return "A"
  if (gpa >= 3.5) return "B"
  if (gpa >= 2.5) return "C"
  if (gpa >= 1.5) return "D"
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

  const form = useForm<z.infer<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: "",
      grade: 5.0,
      credits: 3,
      year: "Year 1",
      session: "1st Semester",
    },
  })

  function addGrade(values: z.infer<typeof gradeSchema>) {
    const newGrade: Grade = { id: Date.now(), ...values }
    setGrades([...grades, newGrade])
    form.reset()
  }

  function removeGrade(id: number) {
    setGrades(grades.filter((g) => g.id !== id))
  }

  function removeSemester(year: string, session: string) {
    setGrades(grades.filter((g) => !(g.year === year && g.session === session)))
  }
  
  function handleGenerateQrCode(semester: string, data: any) {
    const semesterGpa = (
      data.totalQualityPoints / data.totalCredits
    ).toFixed(2)
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        defaultValue={field.value}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="session"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session</FormLabel>
                       <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
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
          {Object.keys(groupedGradesByYear).length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-4">
              {Object.entries(groupedGradesByYear).map(([year, sessions]) => (
                <AccordionItem value={year} key={year} className="border-b-0 rounded-lg bg-muted/30">
                  <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline hover:bg-muted/50 rounded-t-lg">
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
                                    <TableCell className="text-center">{gpaToLetter(g.grade)} ({g.grade.toFixed(2)})</TableCell>
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
                        </div>
                      )
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground bg-muted p-8 rounded-lg">
              No grades have been added yet.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
