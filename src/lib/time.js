import { useEffect, useState } from 'react';

const clockFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function useBengaluruTime() {
  const [time, setTime] = useState(() => clockFormat.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(clockFormat.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}
