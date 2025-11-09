'use server';
/**
 * @fileOverview Predicts future GPA based on current courses and expected grades.
 *
 * - predictFutureGpa - A function that handles the GPA prediction process.
 * - PredictFutureGpaInput - The input type for the predictFutureGpa function.
 * - PredictFutureGpaOutput - The return type for the predictFutureGpa function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictFutureGpaInputSchema = z.object({
  currentGpa: z.number().describe('The current GPA.'),
  totalCredits: z.number().describe('The total number of credits earned so far.'),
  courses: z.array(
    z.object({
      name: z.string().describe('The name of the course.'),
      expectedGrade: z.number().describe('The expected grade for the course.'),
      credits: z.number().describe('The number of credits for the course.'),
    })
  ).describe('An array of courses with expected grades and credits.'),
});
export type PredictFutureGpaInput = z.infer<typeof PredictFutureGpaInputSchema>;

const PredictFutureGpaOutputSchema = z.object({
  predictedGpa: z.number().describe('The predicted GPA.'),
});
export type PredictFutureGpaOutput = z.infer<typeof PredictFutureGpaOutputSchema>;

export async function predictFutureGpa(input: PredictFutureGpaInput): Promise<PredictFutureGpaOutput> {
  return predictFutureGpaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictFutureGpaPrompt',
  input: {schema: PredictFutureGpaInputSchema},
  output: {schema: PredictFutureGpaOutputSchema},
  prompt: `You are a helpful assistant that predicts a student's future GPA based on their current GPA, total credits, and expected grades in current courses.

  The GPA scale is 5.0.

  Current GPA: {{{currentGpa}}}
  Total Credits: {{{totalCredits}}}
  Courses:
  {{#each courses}}
  - Course: {{{name}}}, Expected Grade: {{{expectedGrade}}}, Credits: {{{credits}}}
  {{/each}}

  Calculate the predicted GPA based on the provided information. Return only a number.
  Predicted GPA:`,
});

const predictFutureGpaFlow = ai.defineFlow(
  {
    name: 'predictFutureGpaFlow',
    inputSchema: PredictFutureGpaInputSchema,
    outputSchema: PredictFutureGpaOutputSchema,
  },
  async (input) => {
    const {currentGpa, totalCredits, courses} = input;
    
    const currentTotalPoints = currentGpa * totalCredits;
    
    let futureCredits = 0;
    let futurePoints = 0;

    courses.forEach(course => {
        futureCredits += course.credits;
        futurePoints += course.expectedGrade * course.credits;
    });

    const newTotalCredits = totalCredits + futureCredits;
    const newTotalPoints = currentTotalPoints + futurePoints;

    if (newTotalCredits === 0) {
        return { predictedGpa: 0 };
    }

    const predictedGpa = newTotalPoints / newTotalCredits;

    return { predictedGpa: Math.min(predictedGpa, 5.0) };
  }
);
