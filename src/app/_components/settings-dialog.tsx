
'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { Sun, Moon, Power, KeyRound, TriangleAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <h3 className="font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Switch between light and dark mode.
        </p>
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
    </div>
  );
};

export default function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      const storedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(storedKey);
    }
  }, [open]);

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your key is stored locally and is used for AI features.
              </p>
            </div>
            <Button onClick={handleSaveApiKey} className="w-full">
              <KeyRound className="mr-2" /> Save API Key
            </Button>
          </div>
          <ThemeToggle />
          <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your data.
              </p>
            </div>
            <AlertDialog
              open={showRestartConfirm}
              onOpenChange={setShowRestartConfirm}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Power className="mr-2" /> Restart
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
          </div>
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
