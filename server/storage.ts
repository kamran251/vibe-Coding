import { db } from "./db";
import {
  companies, lists, listItems, notes, savedSearches,
  type InsertCompany, type InsertList, type InsertListItem, type InsertNote, type InsertSavedSearch,
  type Company, type List, type ListItem, type Note, type SavedSearch
} from "@shared/schema";
import { eq, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  getCompanies(search?: string): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  updateCompany(id: number, updates: Partial<Company>): Promise<Company>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  getLists(): Promise<List[]>;
  createList(list: InsertList): Promise<List>;
  getListItems(listId: number): Promise<Company[]>;
  addToList(listId: number, companyId: number): Promise<ListItem>;
  removeFromList(listId: number, companyId: number): Promise<void>;
  
  getNotes(companyId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  
  getSavedSearches(): Promise<SavedSearch[]>;
  createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch>;
  deleteSavedSearch(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCompanies(search?: string): Promise<Company[]> {
    if (search) {
      return await db.select().from(companies).where(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.description, `%${search}%`)
        )
      );
    }
    return await db.select().from(companies);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async updateCompany(id: number, updates: Partial<Company>): Promise<Company> {
    const [company] = await db.update(companies).set(updates).where(eq(companies.id, id)).returning();
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  async getLists(): Promise<List[]> {
    return await db.select().from(lists);
  }

  async createList(list: InsertList): Promise<List> {
    const [created] = await db.insert(lists).values(list).returning();
    return created;
  }

  async getListItems(listId: number): Promise<Company[]> {
    const items = await db.select({
      company: companies
    })
    .from(listItems)
    .innerJoin(companies, eq(listItems.companyId, companies.id))
    .where(eq(listItems.listId, listId));
    
    return items.map(i => i.company);
  }

  async addToList(listId: number, companyId: number): Promise<ListItem> {
    const [created] = await db.insert(listItems).values({ listId, companyId }).returning();
    return created;
  }

  async removeFromList(listId: number, companyId: number): Promise<void> {
    await db.delete(listItems).where(
      and(
        eq(listItems.listId, listId),
        eq(listItems.companyId, companyId)
      )
    );
  }

  async getNotes(companyId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.companyId, companyId));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [created] = await db.insert(notes).values(note).returning();
    return created;
  }

  async getSavedSearches(): Promise<SavedSearch[]> {
    return await db.select().from(savedSearches);
  }

  async createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch> {
    const [created] = await db.insert(savedSearches).values(search).returning();
    return created;
  }

  async deleteSavedSearch(id: number): Promise<void> {
    await db.delete(savedSearches).where(eq(savedSearches.id, id));
  }
}

export const storage = new DatabaseStorage();