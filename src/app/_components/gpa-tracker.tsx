
"use client"

import { useState, useEffect } from "react"
import type { Grade } from "@/types"

import GpaSummary from "./gpa-summary"
import GpaEditor from "./gpa-editor"

export default function GpaTracker() {
  const [grades, setGrades] = useState<Grade[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    const savedGrades = localStorage.getItem('grades');
    return savedGrades ? JSON.parse(savedGrades) : [];
  });

  useEffect(() => {
    localStorage.setItem('grades', JSON.stringify(grades));
  }, [grades]);

  return (
    <div className="space-y-8">
      <GpaSummary grades={grades} />
      <GpaEditor grades={grades} setGrades={setGrades} />
    </div>
  )
}
