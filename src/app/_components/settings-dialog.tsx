
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { Sun, Moon, Power, KeyRound, TriangleAlert, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserUpdate: (user: User) => void;
};

const profileSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  university: z.string().min(3, 'University name is required.'),
  faculty: z.string().min(2, 'Faculty is required.'),
  department: z.string().min(2, 'Department is required.'),
  year: z.string().min(1, 'Please select your year.'),
});

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-6">
        <div>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Currently in {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </CardDescription>
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default function SettingsDialog({
  open,
  onOpenChange,
  user,
  onUserUpdate,
}: SettingsDialogProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: user || {},
  });

  useEffect(() => {
    if (open) {
      const storedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(storedKey);
      form.reset(user || {});
    }
  }, [open, user, form]);

  const handleRestart = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    toast({
      title: 'API Key Saved',
      description:
        'The app will now use your API key. The page will refresh to apply the change.',
    });
    setTimeout(() => window.location.reload(), 2000);
  };
  
  const handleProfileUpdate = (values: z.infer<typeof profileSchema>) => {
    onUserUpdate(values);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-full sm:h-auto sm:max-w-[480px] sm:rounded-2xl flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Manage your preferences and data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 flex-1 overflow-y-auto">
          
          <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="university"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>University</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="faculty"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Faculty</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Year</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                        <Button type="submit" className="w-full">
                            <UserIcon className="mr-2" /> Save Profile
                        </Button>
                    </form>
                </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Gemini API Key</CardTitle>
              <CardDescription>
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google AI Studio
                </a>
                . Your key is stored locally and is used for AI features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveApiKey} className="w-full mt-4">
                <KeyRound className="mr-2" /> Save API Key
              </Button>
            </CardContent>
          </Card>
          
          <ThemeToggle />

          <Card className="border-destructive">
             <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                This will permanently delete all your data.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog
                open={showRestartConfirm}
                onOpenChange={setShowRestartConfirm}
                >
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                    <Power className="mr-2" /> Restart Application
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <TriangleAlert className="text-destructive" /> Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete all your grades, tasks, and
                        other saved information. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRestart}>
                        Yes, restart app
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </CardContent>
          </Card>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
