import type { ToolDefinition } from '../../core/types';
import { executeCronParser } from './engine';
import { CronParserUI } from './ui';

export interface CronParserInput {
  expression: string;
  previewCount?: number;
}

export interface CronFieldBreakdown {
  name: string;
  raw: string;
  meaning: string;
}

export interface CronParserOutput {
  isValid: boolean;
  error?: string;
  expression: string;
  humanDescription: string;
  nextRuns: string[];
  fields: CronFieldBreakdown[];
}

export const cronParserTool: ToolDefinition<CronParserInput, CronParserOutput> = {
  metadata: {
    id: 'cron-parser',
    name: 'Cron Expression Parser',
    category: 'developer',
    description: 'Parse, humanize, and preview upcoming scheduled execution dates for any cron expression.',
    keywords: ['cron', 'schedule', 'parser', 'humanize', 'timer', 'crontab', 'automation', 'developer'],
    version: '1.0.0',
    icon: 'Clock',
  },
  examples: [
    {
      title: 'Every 15 Minutes',
      description: 'Recurring quarter-hour schedule',
      input: {
        expression: '*/15 * * * *',
        previewCount: 5,
      },
    },
    {
      title: 'Daily at Midnight',
      description: 'End of day scheduled job',
      input: {
        expression: '0 0 * * *',
        previewCount: 5,
      },
    },
    {
      title: 'Weekday Business Hours',
      description: 'Every hour between 9 AM and 5 PM on weekdays',
      input: {
        expression: '0 9-17 * * 1-5',
        previewCount: 5,
      },
    },
  ],
  execute: executeCronParser,
  Component: CronParserUI,
};
