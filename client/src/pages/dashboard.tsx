import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bot, ChartBar, Clock, MessageCircle, Plus, Upload, Plug, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DashboardStats {
  activeBots: number;
  totalConversations: number;
  successRate: string;
  responseTime: string;
}

interface BotData {
  id: string;
  name: string;
  description: string;
  status: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [isCreateBotOpen, setIsCreateBotOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const { toast } = useToast();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: bots = [], isLoading } = useQuery<BotData[]>({
    queryKey: ["/api/bots"],
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "training": return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      case "draft": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
      case "paused": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Bots</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {stats?.activeBots ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <Bot className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 dark:text-emerald-400">+2</span>
              <span className="text-slate-600 dark:text-slate-400 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Conversations</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {stats?.totalConversations ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-primary h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 dark:text-emerald-400">+15%</span>
              <span className="text-slate-600 dark:text-slate-400 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {stats?.successRate ?? "0%"}
                </p>
              </div>
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                <ChartBar className="text-violet-600 dark:text-violet-400 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 dark:text-emerald-400">+3.2%</span>
              <span className="text-slate-600 dark:text-slate-400 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Response Time</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {stats?.responseTime ?? "0s"}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600 dark:text-amber-400 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 dark:text-emerald-400">-0.3s</span>
              <span className="text-slate-600 dark:text-slate-400 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bots and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bots */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Bots</h3>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View all
                </Button>
              </div>
            </div>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bots.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No bots created yet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Create your first bot to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bots.slice(0, 5).map((bot) => (
                    <Link key={bot.id} href={`/bot/${bot.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Bot className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{bot.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {bot.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(bot.status)}>
                            {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {formatTimeAgo(bot.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
          </div>
          <CardContent className="p-6 space-y-3">
            <Dialog open={isCreateBotOpen} onOpenChange={setIsCreateBotOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Plus className="text-primary h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-white">Create New Bot</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Start from template or scratch</p>
                    </div>
                  </div>
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

            <Button 
              variant="outline" 
              className="w-full justify-start h-auto p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Upload className="text-emerald-600 dark:text-emerald-400 h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-white">Upload Training Data</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Import FAQs and documents</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-auto p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-violet-600 dark:text-violet-400 h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-white">View Analytics</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Performance insights</p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-auto p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Plug className="text-amber-600 dark:text-amber-400 h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-white">Manage Integrations</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Connect platforms</p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
