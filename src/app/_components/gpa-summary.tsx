
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { LineChart, BarChart as BarChartIcon } from "lucide-react"

function gpaToGradePoints(gpa: number): string {
  if (gpa >= 4.0) return "A"
  if (gpa >= 3.0) return "B"
  if (gpa >= 2.0) return "C"
  if (gpa >= 1.0) return "D"
  return "F"
}

export default function GpaSummary({ grades }: { grades: Grade[] }) {
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  const groupedGrades = useMemo(() => {
    return grades.reduce(
      (acc, grade) => {
        const { semester } = grade
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
        name: semester,
        SemesterGPA: parseFloat(semesterGpa.toFixed(2)),
        CGPA: parseFloat(cumulativeGpa.toFixed(2)),
      }
    })

    const calculatedCgpa =
      cumulativeCredits > 0
        ? (cumulativeQualityPoints / cumulativeCredits).toFixed(2)
        : "0.00"

    return {
      cgpa: calculatedCgpa,
      totalCredits: cumulativeCredits,
      trajectoryData: calculatedTrajectoryData,
    }
  }, [groupedGrades])

  const gradeDistributionData = useMemo(() => {
    const distribution = grades.reduce(
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
  }, [grades])

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

  const trajectoryChartConfig = {
    CGPA: {
      label: "CGPA",
      color: "hsl(var(--chart-1))",
    },
    SemesterGPA: {
      label: "Semester GPA",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  const distributionChartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  return (
    <>
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
            <CardTitle className="text-2xl font-bold">
              {semesterCredits}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>Total Credits</CardDescription>
            <CardTitle className="text-2xl font-bold">{totalCredits}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
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
            <ChartContainer
              config={trajectoryChartConfig}
              className="h-[250px] w-full"
            >
              {chartType === "line" ? (
                <RechartsLineChart data={trajectoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => value.replace(" ", "\n")} />
                  <YAxis domain={[0, 4]} tickCount={5} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line dataKey="SemesterGPA" type="monotone" stroke="var(--color-SemesterGPA)" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} />
                  <Line dataKey="CGPA" type="monotone" stroke="var(--color-CGPA)" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} />
                </RechartsLineChart>
              ) : (
                <RechartsBarChart data={trajectoryData} barSize={30}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => value.replace(" ", "\n")} />
                  <YAxis domain={[0, 4]} tickCount={5} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="SemesterGPA" fill="var(--color-SemesterGPA)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="CGPA" fill="var(--color-CGPA)" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              )}
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
              <RechartsBarChart data={gradeDistributionData} barSize={30}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="grade"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
