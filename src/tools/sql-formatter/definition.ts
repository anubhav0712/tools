import type { ToolDefinition } from '../../core/types';
import { executeSqlFormatter } from './engine';
import { SqlFormatterUI } from './ui';

export interface SqlFormatterInput {
  sql: string;
  mode?: 'beautify' | 'minify';
  uppercaseKeywords?: boolean;
  indentSpaces?: number;
}

export interface SqlFormatterOutput {
  isValid: boolean;
  error?: string;
  formattedSql: string;
  statementCount: number;
  byteSize: number;
}

export const sqlFormatterTool: ToolDefinition<SqlFormatterInput, SqlFormatterOutput> = {
  metadata: {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    category: 'developer',
    description: 'Format, beautify, and minify SQL queries locally with keyword capitalization and zero network leaks.',
    keywords: ['sql', 'format', 'beautify', 'minify', 'database', 'postgres', 'mysql', 'query', 'developer'],
    version: '1.0.0',
    icon: 'Database',
    reviewPolicy: {
      cadence: 'immutable',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'ISO/IEC 9075:2023 (SQL Standard) grammar',
      lastReviewedDate: '2026-10-31',
      changeRisk: 'none',
      notes: 'ANSI/ISO SQL grammar indentation and formatting rules are stable.',
    },
  },
  examples: [
    {
      title: 'Messy SELECT Query',
      description: 'Nested query with JOIN and WHERE clauses',
      input: {
        sql: 'select u.id, u.name, o.total_amount from users u left join orders o on u.id = o.user_id where u.active = 1 and o.status = "completed" group by u.id, u.name order by o.total_amount desc limit 50;',
        mode: 'beautify',
        uppercaseKeywords: true,
        indentSpaces: 2,
      },
    },
    {
      title: 'INSERT & UPDATE Queries',
      description: 'Data manipulation statements',
      input: {
        sql: 'insert into audit_logs (user_id, action, timestamp) values (101, "login_success", now()); update users set last_login = now() where id = 101;',
        mode: 'beautify',
        uppercaseKeywords: true,
        indentSpaces: 2,
      },
    },
  ],
  execute: executeSqlFormatter,
  Component: SqlFormatterUI,
};
