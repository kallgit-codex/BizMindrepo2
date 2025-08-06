import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Header() {
  const [location] = useLocation();
  const [isCreateBotOpen, setIsCreateBotOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const { toast } = useToast();

  const getPageTitle = () => {
    if (location === "/") return "Dashboard";
    if (location.startsWith("/bot/")) return "Bot Details";
    return "BotFlow";
  };

  const handleCreateBot = async () => {
    if (!newBotName.trim()) {
      toast({
        title: "Error",
        description: "Bot name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/bots", {
        name: newBotName,
        description: newBotDescription,
        status: "draft"
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      setIsCreateBotOpen(false);
      setNewBotName("");
      setNewBotDescription("");
      
      toast({
        title: "Success",
        description: "Bot created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bot",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <Dialog open={isCreateBotOpen} onOpenChange={setIsCreateBotOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Bot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bot</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="botName">Bot Name</Label>
                  <Input
                    id="botName"
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="Enter bot name"
                  />
                </div>
                <div>
                  <Label htmlFor="botDescription">Description</Label>
                  <Textarea
                    id="botDescription"
                    value={newBotDescription}
                    onChange={(e) => setNewBotDescription(e.target.value)}
                    placeholder="Describe what this bot will help with"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateBotOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBot}>
                    Create Bot
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
