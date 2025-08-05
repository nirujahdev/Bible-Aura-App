import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { useToast } from '../../hooks/use-toast';
import { 
  HardDrive, Download, Upload, Trash2, Search, Filter,
  FileText, Headphones, MessageSquare, ArrowLeft, MoreVertical,
  Star, Heart, Calendar, Clock, Database, Zap, AlertCircle,
  CheckCircle, RefreshCw, Share, Archive, Settings, Eye,
  PieChart, BarChart3, TrendingUp, Smartphone, CloudOff, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  localStorageService, 
  getStorageStats, 
  exportData, 
  importData,
  LocalSermon,
  LocalJournalEntry,
  LocalChatConversation
} from '../../lib/local-storage-service';

type ContentType = 'all' | 'sermons' | 'journals' | 'chats';
type ViewMode = 'overview' | 'manage' | 'stats' | 'settings';

const LocalStorageManager = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storageStats, setStorageStats] = useState(getStorageStats());
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [allContent, setAllContent] = useState<{
    sermons: LocalSermon[];
    journals: LocalJournalEntry[];
    chats: LocalChatConversation[];
  }>({
    sermons: [],
    journals: [],
    chats: []
  });

  useEffect(() => {
    loadContent();
    setStorageStats(getStorageStats());
  }, []);

  const loadContent = () => {
    setAllContent({
      sermons: localStorageService.getSermons(),
      journals: localStorageService.getJournalEntries(),
      chats: localStorageService.getChatConversations()
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bible-aura-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Created",
        description: "Your data has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setIsImporting(true);
      try {
        const text = await file.text();
        const success = await importData(text);
        
        if (success) {
          loadContent();
          setStorageStats(getStorageStats());
          toast({
            title: "Import Successful",
            description: "Your data has been imported successfully."
          });
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedItems) {
        // Try to delete from all types
        await Promise.all([
          localStorageService.deleteSermon(id),
          localStorageService.deleteJournalEntry(id),
          localStorageService.deleteChatConversation(id)
        ]);
      }
      
      loadContent();
      setStorageStats(getStorageStats());
      setSelectedItems([]);
      
      toast({
        title: "Items Deleted",
        description: `${selectedItems.length} items removed from storage.`
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete some items.",
        variant: "destructive"
      });
    }
  };

  const clearAllStorage = async () => {
    try {
      await localStorageService.clearStorage();
      loadContent();
      setStorageStats(getStorageStats());
      setSelectedItems([]);
      
      toast({
        title: "Storage Cleared",
        description: "All saved content has been removed."
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear storage.",
        variant: "destructive"
      });
    }
  };

  const getStorageHealthColor = (usedPercentage: number): string => {
    if (usedPercentage < 50) return 'text-green-600';
    if (usedPercentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const usedPercentage = Math.round((storageStats.totalSize / (storageStats.totalSize + storageStats.available)) * 100);

  const filteredContent = () => {
    const { sermons, journals, chats } = allContent;
    const query = searchQuery.toLowerCase();
    
    const filterSermons = contentType === 'all' || contentType === 'sermons';
    const filterJournals = contentType === 'all' || contentType === 'journals';
    const filterChats = contentType === 'all' || contentType === 'chats';
    
    const filteredSermons = filterSermons ? sermons.filter(s => 
      s.title.toLowerCase().includes(query) ||
      s.speaker.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    ) : [];
    
    const filteredJournals = filterJournals ? journals.filter(j => 
      j.title.toLowerCase().includes(query) ||
      j.content.toLowerCase().includes(query) ||
      j.tags.some(tag => tag.toLowerCase().includes(query))
    ) : [];
    
    const filteredChats = filterChats ? chats.filter(c => 
      c.title.toLowerCase().includes(query) ||
      c.verse_reference?.toLowerCase().includes(query) ||
      c.messages.some(m => m.content.toLowerCase().includes(query))
    ) : [];
    
    return { sermons: filteredSermons, journals: filteredJournals, chats: filteredChats };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <HardDrive className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Local Storage</h1>
            <p className="text-xs text-indigo-100">
              {formatFileSize(storageStats.totalSize)} used • {storageStats.sermons.count + storageStats.journals.count + storageStats.chats.count} items
            </p>
          </div>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white p-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 text-blue-500" />
                )}
                <span>Export Backup</span>
              </button>

              <button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                {isImporting ? (
                  <RefreshCw className="h-4 w-4 text-green-500 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 text-green-500" />
                )}
                <span>Import Backup</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'stats' ? 'overview' : 'stats')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
              >
                <PieChart className="h-4 w-4 text-purple-500" />
                <span>Storage Stats</span>
              </button>

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={clearAllStorage}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center space-x-3 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All Storage</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: Eye },
            { id: 'manage', name: 'Manage', icon: Settings },
            { id: 'stats', name: 'Statistics', icon: BarChart3 }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={viewMode === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(tab.id as ViewMode)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Storage Health */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Storage Health</h3>
                  </div>
                  <Badge 
                    variant={usedPercentage < 80 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {usedPercentage}% Used
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      usedPercentage < 50 ? 'bg-green-500' : 
                      usedPercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${usedPercentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{formatFileSize(storageStats.totalSize)} used</span>
                  <span>{formatFileSize(storageStats.available)} available</span>
                </div>
              </CardContent>
            </Card>

            {/* Content Overview */}
            <div className="grid grid-cols-1 gap-4">
              {/* Sermons */}
              <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center">
                        <Headphones className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Sermons</h3>
                        <p className="text-sm text-gray-600">
                          {storageStats.sermons.count} items • {formatFileSize(storageStats.sermons.totalSize)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setContentType('sermons'); setViewMode('manage'); }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Journals */}
              <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Journal Entries</h3>
                        <p className="text-sm text-gray-600">
                          {storageStats.journals.count} items • {formatFileSize(storageStats.journals.totalSize)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setContentType('journals'); setViewMode('manage'); }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bible Chats */}
              <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-200 rounded-xl flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Bible Chats</h3>
                        <p className="text-sm text-gray-600">
                          {storageStats.chats.count} items • {formatFileSize(storageStats.chats.totalSize)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setContentType('chats'); setViewMode('manage'); }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex flex-col items-center justify-center"
                >
                  {isExporting ? (
                    <RefreshCw className="h-6 w-6 mb-1 animate-spin" />
                  ) : (
                    <Download className="h-6 w-6 mb-1" />
                  )}
                  <span className="text-sm">Export</span>
                </Button>
                
                <Button
                  onClick={handleImport}
                  disabled={isImporting}
                  variant="outline"
                  className="h-16 border-2 rounded-xl flex flex-col items-center justify-center"
                >
                  {isImporting ? (
                    <RefreshCw className="h-6 w-6 mb-1 animate-spin text-green-600" />
                  ) : (
                    <Upload className="h-6 w-6 mb-1 text-green-600" />
                  )}
                  <span className="text-sm">Import</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'manage' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search saved content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={contentType === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setContentType('all')}
              >
                All
              </Button>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[
                { id: 'sermons', name: 'Sermons', icon: Headphones },
                { id: 'journals', name: 'Journals', icon: FileText },
                { id: 'chats', name: 'Chats', icon: MessageSquare }
              ].map(type => (
                <Button
                  key={type.id}
                  variant={contentType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContentType(type.id as ContentType)}
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <type.icon className="h-4 w-4" />
                  <span>{type.name}</span>
                </Button>
              ))}
            </div>

            {/* Content List */}
            <div className="space-y-3">
              {(() => {
                const content = filteredContent();
                const allItems = [
                  ...content.sermons.map(s => ({ ...s, type: 'sermon' as const })),
                  ...content.journals.map(j => ({ ...j, type: 'journal' as const })),
                  ...content.chats.map(c => ({ ...c, type: 'chat' as const }))
                ].sort((a, b) => {
                  const dateA = new Date('updated_at' in a ? a.updated_at : 'downloadedAt' in a ? a.downloadedAt : a.created_at);
                  const dateB = new Date('updated_at' in b ? b.updated_at : 'downloadedAt' in b ? b.downloadedAt : b.created_at);
                  return dateB.getTime() - dateA.getTime();
                });

                if (allItems.length === 0) {
                  return (
                    <Card className="border-gray-200">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CloudOff className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">No Content Found</h3>
                        <p className="text-sm text-gray-600">
                          {searchQuery ? 'Try adjusting your search terms.' : 'Start saving content to see it here.'}
                        </p>
                      </CardContent>
                    </Card>
                  );
                }

                return allItems.map((item) => (
                  <Card key={item.id} className="border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            item.type === 'sermon' ? 'bg-gradient-to-br from-amber-100 to-orange-200' :
                            item.type === 'journal' ? 'bg-gradient-to-br from-green-100 to-emerald-200' :
                            'bg-gradient-to-br from-blue-100 to-purple-200'
                          }`}>
                            {item.type === 'sermon' && <Headphones className="h-5 w-5 text-amber-600" />}
                            {item.type === 'journal' && <FileText className="h-5 w-5 text-green-600" />}
                            {item.type === 'chat' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {item.title || (item.type === 'journal' ? 'Untitled Entry' : 'Conversation')}
                            </h3>
                            
                            {item.type === 'sermon' && 'speaker' in item && (
                              <p className="text-sm text-amber-600 mb-1">{item.speaker}</p>
                            )}
                            
                            {item.type === 'journal' && 'content' in item && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {item.content.substring(0, 100)}...
                              </p>
                            )}
                            
                            {item.type === 'chat' && 'verse_reference' in item && item.verse_reference && (
                              <p className="text-sm text-blue-600 mb-1">{item.verse_reference}</p>
                            )}
                            
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>{formatDate('updated_at' in item ? item.updated_at : 'downloadedAt' in item ? item.downloadedAt : item.created_at)}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {('isFavorite' in item && item.isFavorite) || ('is_favorite' in item && item.is_favorite) ? (
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          ) : null}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newSelected = selectedItems.includes(item.id) 
                                ? selectedItems.filter(id => id !== item.id)
                                : [...selectedItems, item.id];
                              setSelectedItems(newSelected);
                            }}
                            className={selectedItems.includes(item.id) ? 'bg-indigo-100 text-indigo-700' : ''}
                          >
                            {selectedItems.includes(item.id) ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="fixed bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium text-gray-900">{selectedItems.length} selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItems([])}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'stats' && (
          <div className="space-y-6">
            {/* Storage Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <span>Storage Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Sermons</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatFileSize(storageStats.sermons.totalSize)}</div>
                      <div className="text-xs text-gray-500">{storageStats.sermons.count} files</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Journals</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatFileSize(storageStats.journals.totalSize)}</div>
                      <div className="text-xs text-gray-500">{storageStats.journals.count} entries</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Bible Chats</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatFileSize(storageStats.chats.totalSize)}</div>
                      <div className="text-xs text-gray-500">{storageStats.chats.count} conversations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Recommendations */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Storage Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {usedPercentage > 80 && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Storage Almost Full</p>
                      <p className="text-xs text-red-600">Consider deleting old content or creating a backup.</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Regular Backups</p>
                    <p className="text-xs text-blue-600">Export your data regularly to prevent loss.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Organize Content</p>
                    <p className="text-xs text-green-600">Use tags and categories to keep content organized.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default LocalStorageManager; 