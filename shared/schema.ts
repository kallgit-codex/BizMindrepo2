import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, training, active, paused
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trainingData = pgTable("training_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => bots.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  content: text("content"), // Processed file content
  processed: boolean("processed").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => bots.id),
  messages: json("messages").notNull().default("[]"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => bots.id),
  platform: text("platform").notNull(), // whatsapp, telegram, messenger, instagram, payment, scheduling
  config: json("config").notNull().default("{}"),
  enabled: boolean("enabled").default(false),
  connectedAt: timestamp("connected_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingDataSchema = createInsertSchema(trainingData).omit({
  id: true,
  content: true,
  uploadedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  connectedAt: true,
});

export type User = typeof users.$inferSelect;
export type Bot = typeof bots.$inferSelect;
export type TrainingData = typeof trainingData.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Integration = typeof integrations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type InsertTrainingData = z.infer<typeof insertTrainingDataSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
