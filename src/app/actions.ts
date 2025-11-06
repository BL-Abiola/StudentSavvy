'use server';

import { z } from 'zod';
import {
  predictFutureGpa,
  PredictFutureGpaInput,
} from '@/ai/flows/predict-future-gpa';
import {
  suggestStudySessions,
  SuggestStudySessionsInput,
} from '@/ai/flows/suggest-study-sessions';

const gpaModelerSchema = z.object({
  currentGpa: z.number(),
  totalCredits: z.number(),
  courses: z.array(
    z.object({
      name: z.string(),
      credits: z.number(),
      expectedGrade: z.number(),
    })
  ),
});

const studySynthesizerSchema = z.object({
  notes: z.string(),
});

export async function predictGpaAction(data: unknown) {
  const validation = gpaModelerSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid input.' };
  }

  const input: PredictFutureGpaInput = validation.data;

  try {
    const result = await predictFutureGpa(input);
    return result;
  } catch (error) {
    console.error('Error in predictGpaAction:', error);
    return { error: 'Failed to predict GPA.' };
  }
}

export async function suggestSessionsAction(data: unknown) {
  const validation = studySynthesizerSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid input.' };
  }

  const input: SuggestStudySessionsInput = { text: validation.data.notes };

  try {
    const result = await suggestStudySessions(input);
    return result;
  } catch (error) {
    console.error('Error in suggestSessionsAction:', error);
    return { error: 'Failed to generate study sessions.' };
  }
}
