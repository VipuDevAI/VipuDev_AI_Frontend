// @shared/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  files: jsonb('files').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const codeExecutions = pgTable('code_executions', {
  id: uuid('id').defaultRandom().primaryKey(),
  language: text('language').notNull(),
  code: text('code').notNull(),
  stdout: text('stdout'),
  stderr: text('stderr'),
  exitCode: integer('exit_code').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userConfig = pgTable('user_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  config: jsonb('config'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type CodeExecution = typeof codeExecutions.$inferSelect;
export type InsertCodeExecution = typeof codeExecutions.$inferInsert;
export type UserConfig = typeof userConfig.$inferSelect;
export type InsertUserConfig = typeof userConfig.$inferInsert;
