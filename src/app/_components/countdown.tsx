
'use client';

import { useState, useEffect } from 'react';

function calculateTimeRemaining(dueDate: Date) {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();

  if (diff <= 0) return 'OVERDUE';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  if (parts.length === 0 && diff > 0) return 'Due Soon!';

  return `Countdown: ${parts.join(' ')}`;
}

export function Countdown({ dueDate }: { dueDate: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Initial calculation on mount
    setTimeLeft(calculateTimeRemaining(dueDate));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(dueDate));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dueDate]);

  if (!timeLeft) {
    return null; // Avoid rendering on server or before first client-side calculation
  }

  const isOverdue = timeLeft === 'OVERDUE';

  return (
    <p className={`text-sm font-semibold mt-1 ${isOverdue ? 'text-destructive' : 'text-gray-700 dark:text-gray-300'}`}>
      {timeLeft}
    </p>
  );
}
