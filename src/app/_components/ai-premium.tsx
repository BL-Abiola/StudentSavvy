
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { predictGpaAction, suggestSessionsAction } from '../actions';
import { Loader2, Sparkles, Wand2, Lightbulb } from 'lucide-react';

const gpaModelerSchema = z.object({
  currentGpa: z.coerce
    .number()
    .min(0, 'GPA must be positive')
    .max(5, 'GPA cannot exceed 5.0'),
  totalCredits: z.coerce.number().min(0, 'Credits must be positive'),
  courses: z.array(
    z.object({
      name: z.string().min(1, 'Course name is required'),
      credits: z.coerce.number().min(0.5, 'Min 0.5 credits'),
      expectedGrade: z.coerce
        .number()
        .min(0, 'Min grade is 0.0')
        .max(5, 'Max grade is 5.0'),
    })
  ).min(1, 'Please add at least one course.'),
});

const studySynthesizerSchema = z.object({
  notes: z
    .string()
    .min(50, 'Please enter at least 50 characters of notes.')
    .max(5000, 'Notes cannot exceed 5000 characters.'),
});

export default function AiPremium() {
  const [gpaPrediction, setGpaPrediction] = useState<number | null>(null);
  const [isGpaLoading, setIsGpaLoading] = useState(false);
  const [suggestedSessions, setSuggestedSessions] = useState<string[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [gpaError, setGpaError] = useState<string | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const gpaForm = useForm<z.infer<typeof gpaModelerSchema>>({
    resolver: zodResolver(gpaModelerSchema),
    defaultValues: {
      currentGpa: 0,
      totalCredits: 0,
      courses: [{ name: '', credits: 3, expectedGrade: 5.0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: gpaForm.control,
    name: 'courses',
  });

  const studyForm = useForm<z.infer<typeof studySynthesizerSchema>>({
    resolver: zodResolver(studySynthesizerSchema),
    defaultValues: {
      notes: '',
    },
  });

  const handleGpaSubmit = async (values: z.infer<typeof gpaModelerSchema>) => {
    setIsGpaLoading(true);
    setGpaPrediction(null);
    setGpaError(null);
    try {
      const result = await predictGpaAction(values);
      if (result.predictedGpa) {
        setGpaPrediction(result.predictedGpa);
      } else {
        setGpaError('Could not predict GPA. Please check your inputs.');
      }
    } catch (error) {
      setGpaError('An error occurred during prediction.');
    } finally {
      setIsGpaLoading(false);
    }
  };

  const handleSessionsSubmit = async (values: z.infer<typeof studySynthesizerSchema>) => {
    setIsSessionsLoading(true);
    setSuggestedSessions([]);
    setSessionsError(null);
    try {
      const result = await suggestSessionsAction(values);
       if (result.sessions && result.sessions.length > 0) {
        setSuggestedSessions(result.sessions);
      } else {
        setSessionsError('Could not generate sessions. Try different notes.');
      }
    } catch (error) {
      setSessionsError('An error occurred during generation.');
    } finally {
      setIsSessionsLoading(false);
    }
  };

  return (
    <section id="ai-tools" className="space-y-8">
      <div className="flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          AI Tools: Strategic Leverage
        </h2>
      </div>

      <Card className="border-2 border-primary shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Wand2 /> Future-Pacing GPA Modeler
          </CardTitle>
          <CardDescription>
            Predict your final GPA by estimating your grades in current courses.
            Drive motivation and strategic course correction!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...gpaForm}>
            <form onSubmit={gpaForm.handleSubmit(handleGpaSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={gpaForm.control}
                  name="currentGpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current CGPA</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={gpaForm.control}
                  name="totalCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Credits Earned</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Courses to Model</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-2 items-start">
                    <FormField
                      control={gpaForm.control}
                      name={`courses.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                           <FormLabel className="sr-only">Course Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Course Name" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={gpaForm.control}
                      name={`courses.${index}.credits`}
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel className="sr-only">Credits</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Credits" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={gpaForm.control}
                      name={`courses.${index}.expectedGrade`}
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel className="sr-only">Expected Grade</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="Grade" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', credits: 3, expectedGrade: 5.0 })}>
                    Add Course
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(fields.length - 1)} disabled={fields.length <= 1}>
                    Remove
                    </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full rounded-full" disabled={isGpaLoading}>
                {isGpaLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simulating...</> : 'Simulate Impact'}
              </Button>

              {(gpaPrediction !== null || gpaError) && (
                <div className="mt-4 text-center p-4 rounded-lg bg-secondary">
                  {gpaError ? (
                    <p className="font-semibold text-destructive">{gpaError}</p>
                  ) : (
                    <>
                      <p className="text-md font-medium text-muted-foreground">Predicted CGPA</p>
                      <p className="text-3xl font-bold text-primary">{gpaPrediction?.toFixed(2)}</p>
                    </>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Lightbulb /> Study Block Synthesizer
          </CardTitle>
          <CardDescription>
            Instantly generate micro-study sessions from raw text input using Gemini AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...studyForm}>
            <form onSubmit={studyForm.handleSubmit(handleSessionsSubmit)} className="space-y-4">
              <FormField
                control={studyForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Notes or Chapter Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your text here... A good summary will yield better results."
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full rounded-full" disabled={isSessionsLoading}>
                {isSessionsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate Sessions'}
              </Button>
            </form>
          </Form>

          {(suggestedSessions.length > 0 || sessionsError) && (
            <div className="mt-6">
                <h4 className="font-semibold mb-3">Suggested Study Sessions:</h4>
                {sessionsError ? (
                     <p className="font-semibold text-destructive">{sessionsError}</p>
                ) : (
                    <ul className="space-y-2">
                        {suggestedSessions.map((session, index) => (
                            <li key={index} className="flex items-start gap-3 bg-secondary p-3 rounded-md">
                                <Lightbulb className="w-5 h-5 text-accent mt-1 shrink-0" />
                                <span>{session}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
