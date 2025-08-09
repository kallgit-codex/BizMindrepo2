import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBotSchema, insertTrainingDataSchema, insertIntegrationSchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";
import { chatWithBot } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Bot routes
  app.get("/api/bots", async (req, res) => {
    try {
      // For now, using a default user ID - in production this would come from auth
      const userId = "default-user";
      const bots = await storage.getBotsByUserId(userId);
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.get("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.json(bot);
    } catch (error) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ error: "Failed to fetch bot" });
    }
  });

  app.post("/api/bots", async (req, res) => {
    try {
      const botData = insertBotSchema.parse({
        ...req.body,
        userId: "default-user" // In production, this would come from auth
      });
      const bot = await storage.createBot(botData);
      res.status(201).json(bot);
    } catch (error) {
      console.error("Error creating bot:", error);
      res.status(500).json({ error: "Failed to create bot" });
    }
  });

  app.put("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.updateBot(req.params.id, req.body);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.json(bot);
    } catch (error) {
      console.error("Error updating bot:", error);
      res.status(500).json({ error: "Failed to update bot" });
    }
  });

  app.delete("/api/bots/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBot(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ error: "Failed to delete bot" });
    }
  });

  // Training data routes
  app.get("/api/bots/:botId/training-data", async (req, res) => {
    try {
      const trainingData = await storage.getTrainingDataByBotId(req.params.botId);
      res.json(trainingData);
    } catch (error) {
      console.error("Error fetching training data:", error);
      res.status(500).json({ error: "Failed to fetch training data" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.post("/api/bots/:botId/training-data", async (req, res) => {
    try {
      if (!req.body.fileUrl || !req.body.fileName) {
        return res.status(400).json({ error: "fileUrl and fileName are required" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(req.body.fileUrl);

      const trainingDataInput = insertTrainingDataSchema.parse({
        botId: req.params.botId,
        fileName: req.body.fileName,
        fileUrl: normalizedPath,
        fileSize: req.body.fileSize || 0,
        fileType: req.body.fileType || "application/octet-stream",
        processed: false
      });

      const trainingData = await storage.createTrainingData(trainingDataInput);
      
      // Process the file content in the background
      processFileInBackground(trainingData.id, normalizedPath, req.body.fileName);

      res.status(201).json(trainingData);
    } catch (error) {
      console.error("Error creating training data:", error);
      res.status(500).json({ error: "Failed to create training data" });
    }
  });

  // Background file processing function
  async function processFileInBackground(trainingDataId: string, filePath: string, fileName: string) {
    try {
      // Simulate processing time based on file type
      const processingTime = getProcessingTime(fileName);
      
      setTimeout(async () => {
        try {
          // Extract text content from the file (simplified for now)
          const content = await extractFileContent(filePath, fileName);
          
          // Store the processed content
          await storage.updateTrainingDataWithContent(trainingDataId, content);
          await storage.updateTrainingDataProcessed(trainingDataId, true);
          
          console.log(`Successfully processed file: ${fileName}`);
        } catch (error) {
          console.error(`Error processing file ${fileName}:`, error);
          // Mark as failed processing
          await storage.updateTrainingDataProcessed(trainingDataId, false);
        }
      }, processingTime);
    } catch (error) {
      console.error("Error in background processing:", error);
    }
  }

  function getProcessingTime(fileName: string): number {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const baseTimes: Record<string, number> = {
      'txt': 1000,
      'json': 1500,
      'csv': 2000,
      'pdf': 3000,
      'doc': 3500,
      'docx': 3500,
      'md': 1000
    };
    return baseTimes[extension || 'txt'] || 2000;
  }

  async function extractFileContent(filePath: string, fileName: string): Promise<string> {
    // For now, return a placeholder content based on file type
    // In a real implementation, you'd fetch the file from object storage
    // and use appropriate libraries to extract text content
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const sampleContent: Record<string, string> = {
      'txt': `This is sample text content from ${fileName}. Contains training information for the chatbot.`,
      'json': `{"training": "data", "from": "${fileName}", "content": "Sample JSON training data"}`,
      'csv': `"question","answer"\n"Sample question","Sample answer from ${fileName}"`,
      'pdf': `Sample PDF content from ${fileName}. This would normally be extracted text from the PDF document.`,
      'doc': `Sample document content from ${fileName}. Contains important training information.`,
      'md': `# Training Data\n\nThis is sample markdown content from ${fileName}.\n\n## Key Information\n- Training point 1\n- Training point 2`
    };
    
    return sampleContent[extension || 'txt'] || `Sample content extracted from ${fileName}`;
  }

  app.delete("/api/training-data/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTrainingData(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Training data not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting training data:", error);
      res.status(500).json({ error: "Failed to delete training data" });
    }
  });

  // Integration routes
  app.get("/api/bots/:botId/integrations", async (req, res) => {
    try {
      const integrations = await storage.getIntegrationsByBotId(req.params.botId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.post("/api/bots/:botId/integrations", async (req, res) => {
    try {
      const integrationData = insertIntegrationSchema.parse({
        ...req.body,
        botId: req.params.botId
      });
      const integration = await storage.createIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ error: "Failed to create integration" });
    }
  });

  app.put("/api/integrations/:id", async (req, res) => {
    try {
      const integration = await storage.updateIntegration(req.params.id, req.body);
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }
      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(500).json({ error: "Failed to update integration" });
    }
  });

  // Chat routes
  app.post("/api/bots/:botId/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const bot = await storage.getBot(req.params.botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      const trainingData = await storage.getTrainingDataByBotId(req.params.botId);
      const response = await chatWithBot(message, bot, trainingData);

      res.json({ response });
    } catch (error) {
      console.error("Error in bot chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = "default-user";
      const bots = await storage.getBotsByUserId(userId);
      const activeBots = bots.filter(bot => bot.status === "active").length;
      
      // Calculate total conversations across all bots
      let totalConversations = 0;
      for (const bot of bots) {
        const conversations = await storage.getConversationsByBotId(bot.id);
        totalConversations += conversations.length;
      }

      const stats = {
        activeBots,
        totalConversations,
        successRate: "94.2%", // This would be calculated from real data
        responseTime: "1.2s" // This would be calculated from real data
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
