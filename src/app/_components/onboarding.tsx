
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { GraduationCap } from 'lucide-react';
import type { User } from '@/types';

const steps = [
  {
    title: "What's your name?",
    field: 'name',
    schema: z.object({ name: z.string().min(2, 'Please enter your name.') }),
  },
  {
    title: 'Which university do you attend?',
    field: 'university',
    schema: z.object({ university: z.string().min(3, 'University name is required.') }),
  },
  {
    title: 'What is your faculty?',
    field: 'faculty',
    schema: z.object({ faculty: z.string().min(2, 'Faculty is required.') }),
  },
  {
    title: 'And your department?',
    field: 'department',
    schema: z.object({ department: z.string().min(2, 'Department is required.') }),
  },
  {
    title: 'What is your current year?',
    field: 'year',
    schema: z.object({ year: z.string().min(1, 'Please select your year.') }),
  },
];

type OnboardingProps = {
  onComplete: (user: User) => void;
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<User>>({});

  const currentStep = steps[step];
  const form = useForm({
    resolver: zodResolver(currentStep.schema),
    defaultValues: {
      [currentStep.field]: '',
    },
  });

  const onSubmit = (values: any) => {
    const updatedData = { ...formData, ...values };
    setFormData(updatedData);

    if (step < steps.length - 1) {
      setStep(step + 1);
      form.reset({ [steps[step + 1].field]: '' });
    } else {
      onComplete(updatedData as User);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl" onInteractOutside={(e) => e.preventDefault()} hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <GraduationCap className="w-8 h-8 text-primary" /> Welcome to StudentSavvy!
          </DialogTitle>
          <DialogDescription>
            Let's get your profile set up in a few quick steps.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-semibold text-lg mb-4">{currentStep.title}</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {currentStep.field === 'year' ? (
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Year 1">Year 1</SelectItem>
                          <SelectItem value="Year 2">Year 2</SelectItem>
                          <SelectItem value="Year 3">Year 3</SelectItem>
                          <SelectItem value="Year 4">Year 4</SelectItem>
                          <SelectItem value="Year 5">Year 5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name={currentStep.field}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">{currentStep.title}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full">
                  {step < steps.length - 1 ? 'Next' : 'Finish Setup'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
            <div
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
            ></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
