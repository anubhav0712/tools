import type {
  CronParserInput,
  CronParserOutput,
  CronFieldBreakdown,
} from './definition';

const PRESETS: Record<string, string> = {
  '@hourly': '0 * * * *',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@weekly': '0 0 * * 0',
  '@monthly': '0 0 1 * *',
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
};

const MONTH_NAMES: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const DOW_NAMES: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

function normalizeNames(fieldStr: string, nameMap: Record<string, number>): string {
  let result = fieldStr.toUpperCase();
  for (const [name, num] of Object.entries(nameMap)) {
    result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), num.toString());
  }
  return result;
}

function parseFieldValues(fieldStr: string, min: number, max: number): number[] {
  const values = new Set<number>();
  const parts = fieldStr.split(',');

  for (const part of parts) {
    if (part === '*') {
      for (let i = min; i <= max; i++) values.add(i);
    } else if (part.includes('/')) {
      const [rangeStr, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) throw new Error(`Invalid step value in: "${part}"`);

      let start = min;
      let end = max;
      if (rangeStr !== '*') {
        if (rangeStr.includes('-')) {
          const [s, e] = rangeStr.split('-').map((v) => parseInt(v, 10));
          start = s;
          end = e;
        } else {
          start = parseInt(rangeStr, 10);
        }
      }
      for (let i = start; i <= end; i += step) {
        if (i >= min && i <= max) values.add(i);
      }
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map((v) => parseInt(v, 10));
      if (isNaN(start) || isNaN(end) || start > end) {
        throw new Error(`Invalid range in: "${part}"`);
      }
      for (let i = start; i <= end; i++) {
        if (i >= min && i <= max) values.add(i);
      }
    } else {
      const num = parseInt(part, 10);
      if (isNaN(num) || num < min || num > max) {
        throw new Error(`Value "${part}" out of allowed bounds [${min}-${max}]`);
      }
      values.add(num);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

function humanizeField(name: string, raw: string): string {
  if (raw === '*') return `Every ${name.toLowerCase()}`;
  if (raw.startsWith('*/')) return `Every ${raw.slice(2)} ${name.toLowerCase()}s`;
  if (raw.includes('-')) return `Between ${raw.split('-')[0]} and ${raw.split('-')[1]}`;
  if (raw.includes(',')) return `At ${name.toLowerCase()}s ${raw}`;
  return `At ${name.toLowerCase()} ${raw}`;
}

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

export function executeCronParser(input: CronParserInput): CronParserOutput {
  let expr = (input?.expression || '').trim();
  const previewCount = Math.max(1, Math.min(20, input?.previewCount ?? 5));

  if (!expr) {
    return {
      isValid: true,
      expression: '',
      humanDescription: 'Enter a cron expression to view schedule explanation.',
      nextRuns: [],
      fields: [],
    };
  }

  if (PRESETS[expr.toLowerCase()]) {
    expr = PRESETS[expr.toLowerCase()];
  }

  const segments = expr.split(/\s+/);
  if (segments.length !== 5) {
    return {
      isValid: false,
      error: `Standard cron expressions require exactly 5 fields (minute hour day-of-month month day-of-week), but found ${segments.length}.`,
      expression: expr,
      humanDescription: 'Invalid cron format',
      nextRuns: [],
      fields: [],
    };
  }

  const [minStr, hourStr, domStr, monStr, dowStr] = segments;

  let validMins: number[];
  let validHours: number[];
  let validDoms: number[];
  let validMons: number[];
  let validDows: number[];

  try {
    const normalizedMonStr = normalizeNames(monStr, MONTH_NAMES);
    const normalizedDowStr = normalizeNames(dowStr, DOW_NAMES);

    validMins = parseFieldValues(minStr, 0, 59);
    validHours = parseFieldValues(hourStr, 0, 23);
    validDoms = parseFieldValues(domStr, 1, 31);
    validMons = parseFieldValues(normalizedMonStr, 1, 12);
    validDows = parseFieldValues(normalizedDowStr, 0, 7);
    // Normalize 7 to 0 (both Sunday)
    if (validDows.includes(7) && !validDows.includes(0)) {
      validDows.push(0);
      validDows.sort((a, b) => a - b);
    }
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || 'Invalid cron expression',
      expression: expr,
      humanDescription: 'Invalid schedule',
      nextRuns: [],
      fields: [],
    };
  }

  const fields: CronFieldBreakdown[] = [
    { name: 'Minute', raw: minStr, meaning: humanizeField('Minute', minStr) },
    { name: 'Hour', raw: hourStr, meaning: humanizeField('Hour', hourStr) },
    { name: 'Day of Month', raw: domStr, meaning: humanizeField('Day of month', domStr) },
    { name: 'Month', raw: monStr, meaning: humanizeField('Month', monStr) },
    { name: 'Day of Week', raw: dowStr, meaning: humanizeField('Day of week', dowStr) },
  ];

  // Compose overall human-friendly sentence
  let humanDescription = '';
  if (minStr.startsWith('*/') && hourStr === '*' && domStr === '*' && monStr === '*' && dowStr === '*') {
    humanDescription = `Every ${minStr.slice(2)} minutes`;
  } else if (minStr === '0' && hourStr.startsWith('*/') && domStr === '*' && monStr === '*' && dowStr === '*') {
    humanDescription = `Every ${hourStr.slice(2)} hours, on the hour`;
  } else if (validHours.length === 1 && validMins.length === 1) {
    const timeStr = formatTime(validHours[0], validMins[0]);
    if (domStr === '*' && monStr === '*' && dowStr === '*') {
      humanDescription = `At ${timeStr}, every day`;
    } else if (domStr === '*' && monStr === '*' && dowStr === '1-5') {
      humanDescription = `At ${timeStr}, Monday through Friday`;
    } else if (domStr === '*' && monStr === '*' && (dowStr === '0,6' || dowStr === '6,0')) {
      humanDescription = `At ${timeStr}, only on Saturday and Sunday`;
    } else if (domStr !== '*' && monStr === '*' && dowStr === '*') {
      humanDescription = `At ${timeStr}, on day ${domStr} of every month`;
    } else {
      humanDescription = `At ${timeStr}, on specified schedule (${expr})`;
    }
  } else {
    humanDescription = `Runs on schedule: ${minStr} (min), ${hourStr} (hour), ${domStr} (day), ${monStr} (month), ${dowStr} (weekday)`;
  }

  // Calculate upcoming runs
  const nextRuns: string[] = [];
  const start = new Date();
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1); // Next possible minute

  const current = new Date(start.getTime());
  let iterations = 0;
  const maxIterations = 525600; // 1 year of minutes

  while (nextRuns.length < previewCount && iterations < maxIterations) {
    iterations++;
    const curMin = current.getMinutes();
    const curHour = current.getHours();
    const curDom = current.getDate();
    const curMon = current.getMonth() + 1;
    const curDow = current.getDay();

    const matchMin = validMins.includes(curMin);
    const matchHour = validHours.includes(curHour);
    const matchDom = validDoms.includes(curDom);
    const matchMon = validMons.includes(curMon);
    const matchDow = validDows.includes(curDow);

    if (matchMin && matchHour && matchDom && matchMon && matchDow) {
      nextRuns.push(current.toISOString());
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return {
    isValid: true,
    expression: expr,
    humanDescription,
    nextRuns,
    fields,
  };
}
