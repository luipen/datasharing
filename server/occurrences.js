const { parseISO, addDays, addWeeks, addMonths, isAfter, isBefore, isEqual, format } = require('date-fns');

/**
 * Generate occurrence dates for a chore within [rangeStart, rangeEnd].
 * Returns array of date strings 'yyyy-MM-dd'.
 */
function getOccurrences(chore, rangeStart, rangeEnd) {
  const { recurrence, recurrence_interval, recurrence_days, start_date, end_date } = chore;
  const interval = recurrence_interval || 1;

  const rStart = parseISO(rangeStart);
  const rEnd = parseISO(rangeEnd);
  const choreStart = parseISO(start_date);
  const choreEnd = end_date ? parseISO(end_date) : null;

  const results = [];

  if (recurrence === 'none') {
    const d = choreStart;
    if (!isBefore(d, rStart) && !isAfter(d, rEnd)) {
      results.push(format(d, 'yyyy-MM-dd'));
    }
    return results;
  }

  // Walk from chore start, stepping by interval, collect dates in range
  let current = choreStart;
  const MAX_ITER = 10000;
  let iter = 0;

  // For weekly with specific days pattern
  let days = [];
  if (recurrence === 'weekly' && recurrence_days) {
    try { days = JSON.parse(recurrence_days); } catch {}
  }

  while (!isAfter(current, rEnd) && iter < MAX_ITER) {
    iter++;
    if (choreEnd && isAfter(current, choreEnd)) break;

    const inRange = !isBefore(current, rStart) && !isAfter(current, rEnd);

    if (recurrence === 'weekly' && days.length > 0) {
      // days of week: 0=Sun..6=Sat
      if (days.includes(current.getDay()) && inRange) {
        results.push(format(current, 'yyyy-MM-dd'));
      }
      current = addDays(current, 1);
      continue;
    }

    if (inRange) {
      results.push(format(current, 'yyyy-MM-dd'));
    }

    if (recurrence === 'daily') {
      current = addDays(current, interval);
    } else if (recurrence === 'weekly') {
      current = addWeeks(current, interval);
    } else if (recurrence === 'monthly') {
      current = addMonths(current, interval);
    } else {
      break;
    }
  }

  return results;
}

module.exports = { getOccurrences };
