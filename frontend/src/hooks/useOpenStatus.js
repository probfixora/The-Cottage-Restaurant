import { useEffect, useState } from 'react';
import { site } from '../data/site.js';

/** Minutes since midnight in India (IST), whatever the visitor's timezone. */
function istMinutes() {
  const now = new Date();
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
  return ist.getHours() * 60 + ist.getMinutes();
}

function compute() {
  const m = istMinutes();
  const open = m >= site.openMinutes && m < site.closeMinutes;
  const closingSoon = open && site.closeMinutes - m <= 45;
  let label;
  if (closingSoon) label = 'Closing soon, at 11:30 PM';
  else if (open) label = 'Open now until 11:30 PM';
  else label = 'Closed now, opens at 9:00 AM';
  return { open, label };
}

export function useOpenStatus() {
  const [status, setStatus] = useState(compute);
  useEffect(() => {
    const id = setInterval(() => setStatus(compute()), 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}
