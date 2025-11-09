
"use client"

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

type GpaTrajectoryChartProps = {
  data: { name: string; SemesterGPA: number; CGPA: number }[]
  chartType: "line" | "bar"
}

export default function GpaTrajectoryChart({ data, chartType }: GpaTrajectoryChartProps) {
  return (
    <ChartContainer
      config={trajectoryChartConfig}
      className="h-[250px] w-full"
    >
      {chartType === "line" ? (
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => value.replace("\n", " ")} />
          <YAxis domain={[0, 4]} tickCount={5} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="SemesterGPA" type="monotone" stroke="var(--color-SemesterGPA)" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} />
          <Line dataKey="CGPA" type="monotone" stroke="var(--color-CGPA)" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} />
        </RechartsLineChart>
      ) : (
        <RechartsBarChart data={data} barSize={30}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => value.replace("\n", " ")} />
          <YAxis domain={[0, 4]} tickCount={5} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="SemesterGPA" fill="var(--color-SemesterGPA)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="CGPA" fill="var(--color-CGPA)" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      )}
    </ChartContainer>
  )
}
