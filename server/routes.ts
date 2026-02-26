import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import OpenAI from "openai";
const ai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.companies.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const items = await storage.getCompanies(search);
    res.json(items);
  });

  app.get(api.companies.get.path, async (req, res) => {
    const company = await storage.getCompany(Number(req.params.id));
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  });

  app.post(api.companies.enrich.path, async (req, res) => {
    const company = await storage.getCompany(Number(req.params.id));
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    try {
      // Use AI to generate enrichment data
      const response = await ai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a VC intelligence scraper. Extract or infer details about a company based on its description, name, or general knowledge." },
          { role: "user", content: `Enrich this company: ${company.name} - ${company.description || "No description provided."}. Give me JSON with what_they_do (array of 3-6 strings), keywords (array of 5-10 strings), derived_signals (array of 2-4 strings like 'careers page exists'), and summary (1-2 sentences).` }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message.content;
      if (!content) throw new Error("No AI response");
      
      const parsed = JSON.parse(content);
      
      const updated = await storage.updateCompany(company.id, {
        summary: parsed.summary,
        whatTheyDo: parsed.what_they_do,
        keywords: parsed.keywords,
        derivedSignals: parsed.derived_signals,
        lastEnrichedAt: new Date(),
        sources: [{url: company.url || `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com`, timestamp: new Date().toISOString()}]
      });
      
      res.json(updated);
    } catch (err) {
      console.error("Enrichment failed:", err);
      res.status(500).json({ message: "Enrichment failed" });
    }
  });

  app.get(api.lists.list.path, async (req, res) => {
    const items = await storage.getLists();
    res.json(items);
  });

  app.post(api.lists.create.path, async (req, res) => {
    try {
      const input = api.lists.create.input.parse(req.body);
      const created = await storage.createList(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.lists.getItems.path, async (req, res) => {
    const items = await storage.getListItems(Number(req.params.id));
    res.json(items);
  });

  app.post(api.lists.addCompany.path, async (req, res) => {
    try {
      const input = api.lists.addCompany.input.parse(req.body);
      const created = await storage.addToList(Number(req.params.id), input.companyId);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.lists.removeCompany.path, async (req, res) => {
    await storage.removeFromList(Number(req.params.id), Number(req.params.companyId));
    res.status(204).send();
  });

  app.get(api.notes.list.path, async (req, res) => {
    const items = await storage.getNotes(Number(req.params.companyId));
    res.json(items);
  });

  app.post(api.notes.create.path, async (req, res) => {
    try {
      const input = api.notes.create.input.parse(req.body);
      const created = await storage.createNote({
        companyId: Number(req.params.companyId),
        content: input.content
      });
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.savedSearches.list.path, async (req, res) => {
    const items = await storage.getSavedSearches();
    res.json(items);
  });

  app.post(api.savedSearches.create.path, async (req, res) => {
    try {
      const input = api.savedSearches.create.input.parse(req.body);
      const created = await storage.createSavedSearch(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.savedSearches.delete.path, async (req, res) => {
    await storage.deleteSavedSearch(Number(req.params.id));
    res.status(204).send();
  });

  // Seed DB if empty
  const companies = await storage.getCompanies();
  if (companies.length === 0) {
    await storage.createCompany({
      name: "Anthropic",
      url: "https://anthropic.com",
      description: "AI safety and research company that builds reliable, interpretable, and steerable AI systems. Makers of Claude.",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/1200px-Anthropic_logo.svg.png"
    });
    await storage.createCompany({
      name: "Replit",
      url: "https://replit.com",
      description: "The world's leading online coding platform. Build, run, and scale software directly from your browser.",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Replit_logo.svg"
    });
    await storage.createCompany({
      name: "Stripe",
      url: "https://stripe.com",
      description: "Financial infrastructure platform for the internet. Payments, billing, subscriptions.",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png"
    });
  }

  return httpServer;
}