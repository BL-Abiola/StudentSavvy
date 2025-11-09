
"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

const distributionChartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type GpaDistributionChartProps = {
  data: { grade: string; count: number }[]
}

export default function GpaDistributionChart({ data }: GpaDistributionChartProps) {
  return (
    <ChartContainer
      config={distributionChartConfig}
      className="h-[250px] w-full"
    >
      <RechartsBarChart data={data} barSize={30}>
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
  )
}
