
"use client"

import { useMemo, useState } from "react"
import type { Grade } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarChartIcon, LineChart, Award } from "lucide-react"

import GpaTrajectoryChart from "./gpa-trajectory-chart"
import GpaDistributionChart from "./gpa-distribution-chart"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

function gpaToGradePoints(gpa: number): string {
  if (gpa >= 5) return "A"
  if (gpa >= 4) return "B"
  if (gpa >= 3) return "C"
  if (gpa >= 2) return "D"
  return "F"
}

function getDegreeClass(cgpa: number): string {
    if (cgpa >= 4.5) return "First Class";
    if (cgpa >= 3.5) return "Second Class Upper";
    if (cgpa >= 2.4) return "Second Class Lower";
    if (cgpa >= 1.5) return "Third Class";
    return "Fail";
}

export default function GpaSummary({ grades }: { grades: Grade[] }) {
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [selectedSemester, setSelectedSemester] = useState<string>("Overall")

  const groupedGrades = useMemo(() => {
    return grades.reduce(
      (acc, grade) => {
        const semester = `${grade.year} ${grade.session}`
        if (!acc[semester]) {
          acc[semester] = {
            grades: [],
            totalCredits: 0,
            totalQualityPoints: 0,
          }
        }
        acc[semester].grades.push(grade)
        acc[semester].totalCredits += grade.credits
        acc[semester].totalQualityPoints += grade.grade * grade.credits
        return acc
      },
      {} as Record<
        string,
        { grades: Grade[]; totalCredits: number; totalQualityPoints: number }
      >
    )
  }, [grades])

  const allSemesters = useMemo(() => {
    return Object.keys(groupedGrades).sort()
  }, [groupedGrades])

  const { cgpa, totalCredits, trajectoryData } = useMemo(() => {
    let cumulativeCredits = 0
    let cumulativeQualityPoints = 0
    const sortedSemesters = Object.keys(groupedGrades).sort()

    const calculatedTrajectoryData = sortedSemesters.map((semester) => {
      const semesterData = groupedGrades[semester]
      const semesterGpa =
        semesterData.totalCredits > 0
          ? semesterData.totalQualityPoints / semesterData.totalCredits
          : 0

      cumulativeCredits += semesterData.totalCredits
      cumulativeQualityPoints += semesterData.totalQualityPoints
      const cumulativeGpa =
        cumulativeCredits > 0
          ? cumulativeQualityPoints / cumulativeCredits
          : 0

      return {
        name: semester.replace(" ", "\n").replace(" Semester", ""),
        "SemesterGPA": parseFloat(semesterGpa.toFixed(2)),
        "CGPA": parseFloat(cumulativeGpa.toFixed(2)),
      }
    })

    const calculatedCgpa =
      cumulativeCredits > 0
        ? (cumulativeQualityPoints / cumulativeCredits)
        : 0

    return {
      cgpa: calculatedCgpa,
      totalCredits: cumulativeCredits,
      trajectoryData: calculatedTrajectoryData,
    }
  }, [groupedGrades])

  const gradeDistributionData = useMemo(() => {
    const gradesToDisplay = selectedSemester === "Overall"
        ? grades
        : groupedGrades[selectedSemester]?.grades || [];

    const distribution = gradesToDisplay.reduce(
      (acc, grade) => {
        const letter = gpaToGradePoints(grade.grade)
        acc[letter] = (acc[letter] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return ["A", "B", "C", "D", "F"].map((grade) => ({
      grade,
      count: distribution[grade] || 0,
    }))
  }, [grades, selectedSemester, groupedGrades])

  const semesterGpa =
    trajectoryData.length > 0
      ? trajectoryData[trajectoryData.length - 1]["SemesterGPA"].toFixed(2)
      : "0.00"
  const semesterCredits = useMemo(() => {
    if (grades.length === 0) return 0
    const lastSemesterName =
      Object.keys(groupedGrades).sort()[
        Object.keys(groupedGrades).length - 1
      ]
    return groupedGrades[lastSemesterName]?.totalCredits || 0
  }, [grades, groupedGrades])

  const degreeClass = grades.length > 0 ? getDegreeClass(cgpa) : '--';


  return (
    <>
      <div className="flex items-center gap-3">
        <LineChart className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-extrabold">Academic Snapshot</h2>
      </div>
      <p className="text-muted-foreground -mt-6">
        Instantly visualize your progress and gain insights.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="p-4">
            <CardDescription>Semester GPA</CardDescription>
            <CardTitle className="text-2xl font-bold">{semesterGpa}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="p-4">
            <CardDescription>Overall CGPA</CardDescription>
            <CardTitle className="text-2xl font-bold">{cgpa.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="p-4">
            <CardDescription>Class of Degree</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                {degreeClass}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="p-4">
            <CardDescription>Total Credits</CardDescription>
            <CardTitle className="text-2xl font-bold">{totalCredits}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>CGPA Trajectory</CardTitle>
              <CardDescription>
                Your cumulative GPA trend across semesters.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartType === "line" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
                className="h-8 px-2"
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "bar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType("bar")}
                className="h-8 px-2"
              >
                <BarChartIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <GpaTrajectoryChart
              data={trajectoryData}
              chartType={chartType}
            />
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <CardTitle>Grade Distribution</CardTitle>
                    <CardDescription>Breakdown of your grades.</CardDescription>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="rounded-full">
                        {selectedSemester}
                        <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setSelectedSemester("Overall")}>
                        Overall
                        </DropdownMenuItem>
                        {allSemesters.map(semester => (
                        <DropdownMenuItem key={semester} onSelect={() => setSelectedSemester(semester)}>
                            {semester}
                        </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <GpaDistributionChart data={gradeDistributionData} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
