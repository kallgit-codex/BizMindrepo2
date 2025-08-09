import { 
  type User, 
  type InsertUser, 
  type Bot, 
  type InsertBot,
  type TrainingData,
  type InsertTrainingData,
  type Conversation,
  type InsertConversation,
  type Integration,
  type InsertIntegration
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Bots
  getBot(id: string): Promise<Bot | undefined>;
  getBotsByUserId(userId: string): Promise<Bot[]>;
  createBot(bot: InsertBot): Promise<Bot>;
  updateBot(id: string, bot: Partial<Bot>): Promise<Bot | undefined>;
  deleteBot(id: string): Promise<boolean>;

  // Training Data
  getTrainingDataByBotId(botId: string): Promise<TrainingData[]>;
  createTrainingData(data: InsertTrainingData): Promise<TrainingData>;
  deleteTrainingData(id: string): Promise<boolean>;
  updateTrainingDataProcessed(id: string, processed: boolean): Promise<void>;
  updateTrainingDataWithContent(id: string, content: string): Promise<void>;

  // Conversations
  getConversationsByBotId(botId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<Conversation>): Promise<Conversation | undefined>;

  // Integrations
  getIntegrationsByBotId(botId: string): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<Integration>): Promise<Integration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bots: Map<string, Bot>;
  private trainingData: Map<string, TrainingData>;
  private conversations: Map<string, Conversation>;
  private integrations: Map<string, Integration>;

  constructor() {
    this.users = new Map();
    this.bots = new Map();
    this.trainingData = new Map();
    this.conversations = new Map();
    this.integrations = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Bot methods
  async getBot(id: string): Promise<Bot | undefined> {
    return this.bots.get(id);
  }

  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return Array.from(this.bots.values()).filter(bot => bot.userId === userId);
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const id = randomUUID();
    const now = new Date();
    const bot: Bot = { 
      ...insertBot,
      id,
      status: insertBot.status || "draft",
      description: insertBot.description || null,
      userId: insertBot.userId || null,
      createdAt: now,
      updatedAt: now 
    };
    this.bots.set(id, bot);
    return bot;
  }

  async updateBot(id: string, botUpdate: Partial<Bot>): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;

    const updatedBot = { 
      ...bot, 
      ...botUpdate, 
      updatedAt: new Date() 
    };
    this.bots.set(id, updatedBot);
    return updatedBot;
  }

  async deleteBot(id: string): Promise<boolean> {
    return this.bots.delete(id);
  }

  // Training Data methods
  async getTrainingDataByBotId(botId: string): Promise<TrainingData[]> {
    return Array.from(this.trainingData.values()).filter(data => data.botId === botId);
  }

  async createTrainingData(insertData: InsertTrainingData): Promise<TrainingData> {
    const id = randomUUID();
    const data: TrainingData = { 
      ...insertData,
      id,
      botId: insertData.botId || null,
      content: null,
      processed: insertData.processed || false,
      uploadedAt: new Date() 
    };
    this.trainingData.set(id, data);
    return data;
  }

  async deleteTrainingData(id: string): Promise<boolean> {
    return this.trainingData.delete(id);
  }

  async updateTrainingDataProcessed(id: string, processed: boolean): Promise<void> {
    const data = this.trainingData.get(id);
    if (data) {
      data.processed = processed;
      this.trainingData.set(id, data);
    }
  }

  async updateTrainingDataWithContent(id: string, content: string): Promise<void> {
    const data = this.trainingData.get(id);
    if (data) {
      data.content = content;
      this.trainingData.set(id, data);
    }
  }

  async getTrainingDataById(id: string): Promise<TrainingData | undefined> {
    return this.trainingData.get(id);
  }

  // Conversation methods
  async getConversationsByBotId(botId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.botId === botId);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = { 
      ...insertConversation,
      id,
      botId: insertConversation.botId || null,
      messages: insertConversation.messages || [],
      startedAt: new Date(),
      endedAt: null
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, conversationUpdate: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;

    const updatedConversation = { ...conversation, ...conversationUpdate };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Integration methods
  async getIntegrationsByBotId(botId: string): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(integration => integration.botId === botId);
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = randomUUID();
    const integration: Integration = { 
      ...insertIntegration,
      id,
      botId: insertIntegration.botId || null,
      enabled: insertIntegration.enabled || false,
      config: insertIntegration.config || {},
      connectedAt: insertIntegration.enabled ? new Date() : null
    };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: string, integrationUpdate: Partial<Integration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (!integration) return undefined;

    const updatedIntegration = { 
      ...integration, 
      ...integrationUpdate,
      connectedAt: integrationUpdate.enabled ? new Date() : integration.connectedAt
    };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteIntegration(id: string): Promise<boolean> {
    return this.integrations.delete(id);
  }
}

export const storage = new MemStorage();
