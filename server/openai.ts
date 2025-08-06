import OpenAI from "openai";
import { Bot, TrainingData } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export async function chatWithBot(
  message: string,
  bot: Bot,
  trainingData: TrainingData[]
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY_ENV_VAR) {
      return "I'm sorry, but the OpenAI API key is not configured. Please contact the administrator to set up the API key.";
    }

    // Build context from training data
    const trainingContext = trainingData
      .filter(data => data.processed)
      .map(data => `Training file: ${data.fileName}`)
      .join(", ");

    const systemPrompt = `You are ${bot.name}, an AI assistant for small businesses. ${bot.description || ""} 

${trainingContext ? `You have been trained on the following data: ${trainingContext}` : ""}

You are designed to help with:
- Answering frequently asked questions
- Assisting with scheduling appointments
- Providing information about products or services
- Helping customers with general inquiries

Please provide helpful, accurate, and professional responses. If you don't know something specific about the business, politely say so and offer to help find the information or connect them with a human representative.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I'm having trouble generating a response right now. Please try again.";
  } catch (error) {
    console.error("Error in OpenAI chat:", error);
    return "I'm sorry, but I'm experiencing technical difficulties. Please try again later or contact support if the problem persists.";
  }
}

export async function generateBotResponse(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  bot: Bot,
  trainingData: TrainingData[]
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY_ENV_VAR) {
      return "OpenAI API key not configured.";
    }

    const trainingContext = trainingData
      .filter(data => data.processed)
      .map(data => `Training file: ${data.fileName}`)
      .join(", ");

    const systemPrompt = `You are ${bot.name}, an AI assistant. ${bot.description || ""} 

${trainingContext ? `Training data: ${trainingContext}` : ""}

Provide helpful, professional responses for small business customer service.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to generate response.";
  } catch (error) {
    console.error("Error generating bot response:", error);
    return "Technical difficulties. Please try again.";
  }
}
