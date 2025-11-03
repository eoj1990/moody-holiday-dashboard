'use client';
import { useEffect, useState } from 'react';

export default function CountdownBanner() {
  const [daysToThanksgiving, setDaysToThanksgiving] = useState<number | null>(
    null
  );
  const [daysToChristmas, setDaysToChristmas] = useState<number | null>(null);
  const [daysToNewYear, setDaysToNewYear] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();

    const getDaysLeft = (target: Date) =>
      Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const year = now.getFullYear();
    const thanksgiving = new Date(`${year}-11-27`); // Adjust as needed
    const christmas = new Date(`${year}-12-25`);
    const newYear = new Date(`${year + 1}-01-01`);

    setDaysToThanksgiving(getDaysLeft(thanksgiving));
    setDaysToChristmas(getDaysLeft(christmas));
    setDaysToNewYear(getDaysLeft(newYear));
  }, []);

  return (
    <div className="bg-black text-yellow-300 py-2 text-center font-semibold tracking-wide text-sm sm:text-base shadow-inner">
      <span className="mx-2">
        🦃 Thanksgiving: {daysToThanksgiving ?? '--'} days
      </span>
      <span className="mx-2">
        🎄 Christmas: {daysToChristmas ?? '--'} days
      </span>
      <span className="mx-2">
        🎆 New Year: {daysToNewYear ?? '--'} days
      </span>
    </div>
  );
}
