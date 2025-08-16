import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Bot as BotIcon, Play, Rocket, MessageCircle, Upload, Globe, Database, FileText, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import BotChat from "@/components/bot-chat";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BotData {
  id: string;
  name: string;
  description: string;
  status: string;
  updatedAt: string;
}

interface TrainingDataItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  processed: boolean;
  uploadedAt: string;
}

interface IntegrationData {
  id: string;
  platform: string;
  enabled: boolean;
  config: Record<string, any>;
}

export default function BotDetail() {
  const [, params] = useRoute("/bot/:id");
  const botId = params?.id;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  const { data: bot } = useQuery<BotData>({
    queryKey: ["/api/bots", botId],
    enabled: !!botId,
  });

  const { data: trainingData = [] } = useQuery<TrainingDataItem[]>({
    queryKey: ["/api/bots", botId, "training-data"],
    enabled: !!botId,
  });

  const { data: integrations = [] } = useQuery<IntegrationData[]>({
    queryKey: ["/api/bots", botId, "integrations"],
    enabled: !!botId,
  });

  const handleFileUpload = async () => {
    const response = await fetch("/api/objects/upload", { method: "POST" });
    const { uploadURL } = await response.json();
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      try {
        await apiRequest("POST", `/api/bots/${botId}/training-data`, {
          fileName: file.name,
          fileUrl: file.uploadURL,
          fileSize: file.size,
          fileType: file.type || "application/octet-stream"
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "training-data"] });
        
        toast({
          title: "Success",
          description: "Training data uploaded successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save training data",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteTrainingData = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/training-data/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "training-data"] });
      toast({
        title: "Success",
        description: "Training data deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete training data",
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  if (!bot) {
    return <div className="p-6">Loading...</div>;
  }

  const processedCount = trainingData.filter(item => item.processed).length;
  const totalCount = trainingData.length;
  const processingProgress = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;

  const platformIcons: Record<string, string> = {
    whatsapp: "🟢",
    telegram: "🔵", 
    messenger: "🔵",
    instagram: "🟣",
    payment: "💳",
    scheduling: "📅"
  };

  return (
    <div className="p-6 space-y-6">
      {/* Bot Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <BotIcon className="text-primary h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{bot.name}</h2>
                <p className="text-slate-600 dark:text-slate-400">{bot.description || "No description provided"}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(bot.status)}>
                    <div className="w-2 h-2 rounded-full bg-current mr-1"></div>
                    {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Last active: {formatTimeAgo(bot.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setIsChatOpen(true)}>
                <Play className="h-4 w-4 mr-2" />
                Test Bot
              </Button>
              <Button>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training Data</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Conversations</span>
                    <span className="font-semibold text-slate-900 dark:text-white">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Success Rate</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">N/A</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Avg Response Time</span>
                    <span className="font-semibold text-slate-900 dark:text-white">N/A</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">User Satisfaction</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">N/A</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Conversations */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Conversations</h3>
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No conversations yet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Test your bot to see conversations here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Integrations */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active Integrations</h3>
              {integrations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Rocket className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">No integrations configured</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Connect platforms to start engaging customers</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {integrations.slice(0, 4).map((integration) => (
                    <div key={integration.id} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-xl">{platformIcons[integration.platform] || "🔗"}</span>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white capitalize">{integration.platform}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          {integration.enabled ? "Connected" : "Disconnected"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Training Data</h3>
                    <ObjectUploader
                      maxNumberOfFiles={5}
                      maxFileSize={52428800}
                      onGetUploadParameters={handleFileUpload}
                      onComplete={handleUploadComplete}
                      buttonClassName="bg-primary text-white hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Data
                    </ObjectUploader>
                  </div>
                  
                  {/* File Upload Area Info */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center mb-6">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Upload className="text-slate-500 dark:text-slate-400 h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Upload Training Documents</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Click "Add Data" button to upload files</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Supports: PDF, TXT, DOC, CSV, JSON (up to 50MB each)</p>
                  </div>

                  {/* Existing Training Data */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900 dark:text-white">Existing Training Data</h4>
                    {trainingData.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">No training data uploaded</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Upload documents to train your bot</p>
                      </div>
                    ) : (
                      trainingData.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                              <FileText className="text-slate-500 dark:text-slate-400 h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{file.fileName}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatFileSize(file.fileSize)} • Uploaded {formatTimeAgo(file.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={file.processed ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"}>
                              {file.processed ? "Processed" : "Processing"}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTrainingData(file.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Training Stats */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Training Status</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Processing Progress</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Documents</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{totalCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">FAQ Entries</span>
                        <span className="font-semibold text-slate-900 dark:text-white">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Knowledge Base</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {processedCount > 0 ? "Ready" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="text-primary h-4 w-4 mr-3" />
                      <span className="text-slate-900 dark:text-white">Add FAQ Entry</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="text-emerald-600 dark:text-emerald-400 h-4 w-4 mr-3" />
                      <span className="text-slate-900 dark:text-white">Connect Website</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="text-violet-600 dark:text-violet-400 h-4 w-4 mr-3" />
                      <span className="text-slate-900 dark:text-white">Import Database</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* WhatsApp */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🟢</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">WhatsApp</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Business messaging</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                    Not connected
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Phone Number</span>
                    <span className="text-slate-500 dark:text-slate-400">Not configured</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Messages Today</span>
                    <span className="text-slate-500 dark:text-slate-400">0</span>
                  </div>
                  <Button className="w-full mt-4">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Telegram */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔵</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Telegram</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Bot messaging</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                    Not connected
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Bot Username</span>
                    <span className="text-slate-500 dark:text-slate-400">Not configured</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Active Users</span>
                    <span className="text-slate-500 dark:text-slate-400">0</span>
                  </div>
                  <Button className="w-full mt-4">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Facebook Messenger */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Messenger</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Facebook messaging</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                    Not connected
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Page ID</span>
                    <span className="text-slate-500 dark:text-slate-400">Not configured</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <span className="text-slate-500 dark:text-slate-400">Setup required</span>
                  </div>
                  <Button className="w-full mt-4">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📷</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Instagram</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Direct messaging</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                    Not connected
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Account</span>
                    <span className="text-slate-500 dark:text-slate-400">Not linked</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <span className="text-slate-500 dark:text-slate-400">Available</span>
                  </div>
                  <Button className="w-full mt-4">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Links */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Payment Links</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Stripe integration</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                    Not connected
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Provider</span>
                    <span className="text-slate-500 dark:text-slate-400">Stripe/PayPal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <span className="text-slate-500 dark:text-slate-400">Setup required</span>
                  </div>
                  <Button className="w-full mt-4">
                    Setup Payments
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Scheduling</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Calendly integration</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                    Not connected
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Calendar</span>
                    <span className="text-slate-500 dark:text-slate-400">Google/Outlook</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <span className="text-slate-500 dark:text-slate-400">Available</span>
                  </div>
                  <Button className="w-full mt-4">
                    Connect Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Analytics Data</h3>
                <p className="text-slate-600 dark:text-slate-400">Analytics will appear here once your bot starts having conversations.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BotIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Bot Settings</h3>
                <p className="text-slate-600 dark:text-slate-400">Bot configuration options will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BotChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        botId={botId || ""}
        botName={bot.name}
      />
    </div>
  );
}
