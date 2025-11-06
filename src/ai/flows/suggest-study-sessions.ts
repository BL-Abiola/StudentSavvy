'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting study sessions based on lecture notes or chapter summaries.
 *
 * The flow takes text input and returns a list of suggested study sessions.
 * - suggestStudySessions - A function that suggests study sessions based on input text.
 * - SuggestStudySessionsInput - The input type for the suggestStudySessions function.
 * - SuggestStudySessionsOutput - The return type for the suggestStudySessions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStudySessionsInputSchema = z.object({
  text: z
    .string()
    .describe('Lecture notes or chapter summary to generate study sessions from.'),
});
export type SuggestStudySessionsInput = z.infer<typeof SuggestStudySessionsInputSchema>;

const SuggestStudySessionsOutputSchema = z.object({
  sessions: z
    .array(z.string())
    .describe('A list of suggested study sessions based on the input text.'),
});
export type SuggestStudySessionsOutput = z.infer<typeof SuggestStudySessionsOutputSchema>;

export async function suggestStudySessions(input: SuggestStudySessionsInput): Promise<SuggestStudySessionsOutput> {
  return suggestStudySessionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStudySessionsPrompt',
  input: {schema: SuggestStudySessionsInputSchema},
  output: {schema: SuggestStudySessionsOutputSchema},
  prompt: `You are an AI study assistant. Given the following text, generate a list of study sessions that would be helpful for a student.

Text: {{{text}}}

Each session should be concise and actionable.  Return the sessions as a JSON array of strings.

Example:
{
  "sessions": [
    "Review key concepts from chapter 3",
    "Practice problems on sections 3.1-3.3",
    "Create flashcards for vocabulary",
    "Attend office hours to clarify doubts"
  ]
}
`,
});

const suggestStudySessionsFlow = ai.defineFlow(
  {
    name: 'suggestStudySessionsFlow',
    inputSchema: SuggestStudySessionsInputSchema,
    outputSchema: SuggestStudySessionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
