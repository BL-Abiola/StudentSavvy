"use client"

import { useState } from "react"
import type { Grade } from "@/types"

import GpaSummary from "./gpa-summary"
import GpaEditor from "./gpa-editor"

export default function GpaTracker() {
  const [grades, setGrades] = useState<Grade[]>([
    { id: 1, name: "Intro to CS", grade: 3.7, credits: 3, year: "2023", session: "1st Semester" },
    { id: 2, name: "Calculus I", grade: 3.3, credits: 4, year: "2023", session: "1st Semester" },
    {
      id: 3,
      name: "Data Structures",
      grade: 3.0,
      credits: 3,
      year: "2023", 
      session: "2nd Semester",
    },
    { id: 4, name: "Physics I", grade: 2.7, credits: 4, year: "2023", session: "2nd Semester" },
    { id: 5, name: "Algorithms", grade: 4.0, credits: 3, year: "2024", session: "1st Semester" },
    {
      id: 6,
      name: "Web Development",
      grade: 3.5,
      credits: 3,
      year: "2024",
      session: "1st Semester",
    },
  ])

  return (
    <div className="space-y-8">
      <GpaSummary grades={grades} />
      <GpaEditor grades={grades} setGrades={setGrades} />
    </div>
  )
}
