import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, X, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot as BotIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

/**
 * Represents a single chat message. Each message records who sent it (user or assistant),
 * the content of the message, and when it was sent. The timestamp is used as part of
 * the React key to ensure stable rendering of the message list.
 */
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Props for the BotChat component. The dialog can be toggled open or closed, and
 * callers must provide the ID and name of the bot being chatted with. The `onClose`
 * callback is fired whenever the dialog requests to close.
 */
interface BotChatProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  botName: string;
}

/**
 * A React component that renders a chat dialog for interacting with an AI bot. It
 * manages a list of messages, sends user input to the server via a mutation, and
 * displays assistant replies when they arrive. The scroll area grows to fill
 * available space and overflows vertically when needed.
 */
export default function BotChat({ isOpen, onClose, botId, botName }: BotChatProps) {
  // Initialise the chat with a friendly greeting from the assistant. This provides
  // immediate context to the user when they open the chat.
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm ${botName}. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Set up a mutation to send messages to the server. On success, the assistant's
  // reply is appended to the message list. On error, a generic error message is
  // inserted instead so the user knows something went wrong.
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", `/api/bots/${botId}/chat`, { message });
      return response.json();
    },
    onSuccess: (data: any) => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    },
  });

  // Sends the current input message to the chat. If the input is empty, it does
  // nothing. Otherwise, the user's message is added to the list and the mutation
  // fires off to get the assistant's response.
  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (!message) return;
    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: message,
        timestamp: new Date(),
      },
    ]);
    setInputMessage("");
    chatMutation.mutate(message);
  };

  // Allow pressing Enter to send a message, unless the user is holding Shift to
  // insert a newline. This avoids accidentally submitting when entering multi-line
  // messages.
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Formats the timestamp for display alongside each message. Using locale options
  // makes the time human-friendly.
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] p-0 flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Chat with {botName}</DialogTitle>
        </DialogHeader>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <BotIcon className="text-primary h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Test Bot Conversation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{botName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map(m => (
              <div
                key={m.timestamp.toISOString() + m.role}
                className={`flex ${m.role === "user" ? "justify-end" : ""} items-start space-x-3`}
              >
                {m.role === "assistant" && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <BotIcon className="text-primary h-4 w-4" />
                  </div>
                )}
                <div className={`flex-1 ${m.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`rounded-lg p-3 shadow-sm inline-block max-w-[80%] ${
                      m.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatTime(m.timestamp)}</p>
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                    <User className="text-slate-600 dark:text-slate-300 h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <BotIcon className="text-primary h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        {/* Message Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={chatMutation.isPending}
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || chatMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
