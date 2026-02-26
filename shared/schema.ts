import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  description: text("description"),
  summary: text("summary"),
  whatTheyDo: jsonb("what_they_do").$type<string[]>(),
  keywords: jsonb("keywords").$type<string[]>(),
  derivedSignals: jsonb("derived_signals").$type<string[]>(),
  sources: jsonb("sources").$type<{url: string, timestamp: string}[]>(),
  lastEnrichedAt: timestamp("last_enriched_at"),
  logoUrl: text("logo_url"),
});

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listItems = pgTable("list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  companyId: integer("company_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  query: text("query"),
  filters: jsonb("filters"), // specific filters structure
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export const insertListSchema = createInsertSchema(lists).omit({ id: true, createdAt: true });
export const insertListItemSchema = createInsertSchema(listItems).omit({ id: true, addedAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });
export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({ id: true, createdAt: true });

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;
export type ListItem = typeof listItems.$inferSelect;
export type InsertListItem = z.infer<typeof insertListItemSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
