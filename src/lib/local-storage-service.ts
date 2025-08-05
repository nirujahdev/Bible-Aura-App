// Local Storage Service for Mobile App
// Handles offline storage of sermons, journals, and Bible chats

export interface LocalSermon {
  id: string;
  title: string;
  speaker: string;
  description: string;
  duration: string;
  date: string;
  category: string;
  series?: string;
  scriptureRef: string;
  audioUrl?: string;
  audioBlob?: string; // Base64 encoded audio for offline
  transcript?: string;
  tags: string[];
  downloadedAt: string;
  lastPlayed?: string;
  playPosition?: number; // Last position in seconds
  notes?: string; // User notes
  isFavorite: boolean;
  fileSize?: number;
}

export interface LocalJournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  spiritual_state?: string;
  verse_reference?: string;
  verse_text?: string;
  verse_references: string[];
  tags: string[];
  is_private: boolean;
  entry_date: string;
  created_at: string;
  updated_at: string;
  word_count: number;
  reading_time: number;
  language: 'english' | 'tamil' | 'sinhala';
  category: string;
  is_pinned: boolean;
  template_used?: string;
  attachments?: string[]; // Base64 encoded images
  location?: string;
  weather?: string;
}

export interface LocalChatConversation {
  id: string;
  title: string;
  verse_reference?: string;
  verse_text?: string;
  mode: 'theological' | 'historical' | 'cross-reference' | 'insights';
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  category: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  mode: string;
}

export interface StorageStats {
  sermons: {
    count: number;
    totalSize: number;
    lastSynced?: string;
  };
  journals: {
    count: number;
    totalSize: number;
    lastSynced?: string;
  };
  chats: {
    count: number;
    totalSize: number;
    lastSynced?: string;
  };
  totalSize: number;
  available: number;
}

class LocalStorageService {
  private readonly SERMONS_KEY = 'bible_aura_sermons';
  private readonly JOURNALS_KEY = 'bible_aura_journals';
  private readonly CHATS_KEY = 'bible_aura_chats';
  private readonly SYNC_STATUS_KEY = 'bible_aura_sync_status';
  private readonly MAX_STORAGE_SIZE = 100 * 1024 * 1024; // 100MB limit

  // Sermon Storage Methods
  async saveSermon(sermon: LocalSermon): Promise<boolean> {
    try {
      const sermons = this.getSermons();
      const existingIndex = sermons.findIndex(s => s.id === sermon.id);
      
      if (existingIndex >= 0) {
        sermons[existingIndex] = { ...sermon, updated_at: new Date().toISOString() };
      } else {
        sermons.push(sermon);
      }
      
      localStorage.setItem(this.SERMONS_KEY, JSON.stringify(sermons));
      await this.updateSyncStatus('sermons');
      return true;
    } catch (error) {
      console.error('Error saving sermon:', error);
      return false;
    }
  }

  getSermons(): LocalSermon[] {
    try {
      const data = localStorage.getItem(this.SERMONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading sermons:', error);
      return [];
    }
  }

  async deleteSermon(sermonId: string): Promise<boolean> {
    try {
      const sermons = this.getSermons().filter(s => s.id !== sermonId);
      localStorage.setItem(this.SERMONS_KEY, JSON.stringify(sermons));
      await this.updateSyncStatus('sermons');
      return true;
    } catch (error) {
      console.error('Error deleting sermon:', error);
      return false;
    }
  }

  searchSermons(query: string, filters?: { category?: string; speaker?: string; tags?: string[] }): LocalSermon[] {
    const sermons = this.getSermons();
    const lowerQuery = query.toLowerCase();
    
    return sermons.filter(sermon => {
      const matchesQuery = !query || 
        sermon.title.toLowerCase().includes(lowerQuery) ||
        sermon.speaker.toLowerCase().includes(lowerQuery) ||
        sermon.description.toLowerCase().includes(lowerQuery) ||
        sermon.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

      const matchesCategory = !filters?.category || sermon.category === filters.category;
      const matchesSpeaker = !filters?.speaker || sermon.speaker === filters.speaker;
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => sermon.tags.includes(tag));

      return matchesQuery && matchesCategory && matchesSpeaker && matchesTags;
    }).sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
  }

  // Journal Storage Methods
  async saveJournalEntry(entry: LocalJournalEntry): Promise<boolean> {
    try {
      const entries = this.getJournalEntries();
      const existingIndex = entries.findIndex(e => e.id === entry.id);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = { ...entry, updated_at: new Date().toISOString() };
      } else {
        entries.push(entry);
      }
      
      localStorage.setItem(this.JOURNALS_KEY, JSON.stringify(entries));
      await this.updateSyncStatus('journals');
      return true;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return false;
    }
  }

  getJournalEntries(): LocalJournalEntry[] {
    try {
      const data = localStorage.getItem(this.JOURNALS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  }

  async deleteJournalEntry(entryId: string): Promise<boolean> {
    try {
      const entries = this.getJournalEntries().filter(e => e.id !== entryId);
      localStorage.setItem(this.JOURNALS_KEY, JSON.stringify(entries));
      await this.updateSyncStatus('journals');
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  }

  searchJournalEntries(query: string, filters?: { category?: string; mood?: string; tags?: string[] }): LocalJournalEntry[] {
    const entries = this.getJournalEntries();
    const lowerQuery = query.toLowerCase();
    
    return entries.filter(entry => {
      const matchesQuery = !query || 
        entry.title.toLowerCase().includes(lowerQuery) ||
        entry.content.toLowerCase().includes(lowerQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

      const matchesCategory = !filters?.category || entry.category === filters.category;
      const matchesMood = !filters?.mood || entry.mood === filters.mood;
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => entry.tags.includes(tag));

      return matchesQuery && matchesCategory && matchesMood && matchesTags;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Chat Storage Methods
  async saveChatConversation(conversation: LocalChatConversation): Promise<boolean> {
    try {
      const conversations = this.getChatConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = { ...conversation, updated_at: new Date().toISOString() };
      } else {
        conversations.push(conversation);
      }
      
      localStorage.setItem(this.CHATS_KEY, JSON.stringify(conversations));
      await this.updateSyncStatus('chats');
      return true;
    } catch (error) {
      console.error('Error saving chat conversation:', error);
      return false;
    }
  }

  getChatConversations(): LocalChatConversation[] {
    try {
      const data = localStorage.getItem(this.CHATS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading chat conversations:', error);
      return [];
    }
  }

  async deleteChatConversation(conversationId: string): Promise<boolean> {
    try {
      const conversations = this.getChatConversations().filter(c => c.id !== conversationId);
      localStorage.setItem(this.CHATS_KEY, JSON.stringify(conversations));
      await this.updateSyncStatus('chats');
      return true;
    } catch (error) {
      console.error('Error deleting chat conversation:', error);
      return false;
    }
  }

  searchChatConversations(query: string, filters?: { mode?: string; tags?: string[] }): LocalChatConversation[] {
    const conversations = this.getChatConversations();
    const lowerQuery = query.toLowerCase();
    
    return conversations.filter(conversation => {
      const matchesQuery = !query || 
        conversation.title.toLowerCase().includes(lowerQuery) ||
        conversation.verse_reference?.toLowerCase().includes(lowerQuery) ||
        conversation.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery)) ||
        conversation.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

      const matchesMode = !filters?.mode || conversation.mode === filters.mode;
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => conversation.tags.includes(tag));

      return matchesQuery && matchesMode && matchesTags;
    }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  // Storage Management
  getStorageStats(): StorageStats {
    const sermons = this.getSermons();
    const journals = this.getJournalEntries();
    const chats = this.getChatConversations();
    
    const calculateSize = (data: any[]): number => {
      return new Blob([JSON.stringify(data)]).size;
    };

    const sermonsSize = calculateSize(sermons);
    const journalsSize = calculateSize(journals);
    const chatsSize = calculateSize(chats);
    const totalSize = sermonsSize + journalsSize + chatsSize;

    return {
      sermons: {
        count: sermons.length,
        totalSize: sermonsSize,
      },
      journals: {
        count: journals.length,
        totalSize: journalsSize,
      },
      chats: {
        count: chats.length,
        totalSize: chatsSize,
      },
      totalSize,
      available: this.MAX_STORAGE_SIZE - totalSize
    };
  }

  async clearStorage(type?: 'sermons' | 'journals' | 'chats'): Promise<boolean> {
    try {
      if (!type || type === 'sermons') {
        localStorage.removeItem(this.SERMONS_KEY);
      }
      if (!type || type === 'journals') {
        localStorage.removeItem(this.JOURNALS_KEY);
      }
      if (!type || type === 'chats') {
        localStorage.removeItem(this.CHATS_KEY);
      }
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Export/Import for backup
  async exportData(): Promise<string> {
    const data = {
      sermons: this.getSermons(),
      journals: this.getJournalEntries(),
      chats: this.getChatConversations(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.sermons) {
        localStorage.setItem(this.SERMONS_KEY, JSON.stringify(data.sermons));
      }
      if (data.journals) {
        localStorage.setItem(this.JOURNALS_KEY, JSON.stringify(data.journals));
      }
      if (data.chats) {
        localStorage.setItem(this.CHATS_KEY, JSON.stringify(data.chats));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Sync Status Management
  private async updateSyncStatus(type: 'sermons' | 'journals' | 'chats'): Promise<void> {
    try {
      const syncStatus = this.getSyncStatus();
      syncStatus[type] = {
        lastModified: new Date().toISOString(),
        needsSync: true
      };
      localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(syncStatus));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  getSyncStatus(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.SYNC_STATUS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading sync status:', error);
      return {};
    }
  }

  // Utility Methods
  isStorageFull(): boolean {
    const stats = this.getStorageStats();
    return stats.available < 10 * 1024 * 1024; // Less than 10MB available
  }

  getOldestEntries(type: 'sermons' | 'journals' | 'chats', count: number = 10): any[] {
    switch (type) {
      case 'sermons':
        return this.getSermons()
          .sort((a, b) => new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime())
          .slice(0, count);
      case 'journals':
        return this.getJournalEntries()
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .slice(0, count);
      case 'chats':
        return this.getChatConversations()
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .slice(0, count);
      default:
        return [];
    }
  }
}

// Singleton instance
export const localStorageService = new LocalStorageService();

// Utility functions for easy access
export const saveSermon = (sermon: LocalSermon) => localStorageService.saveSermon(sermon);
export const getSermons = () => localStorageService.getSermons();
export const deleteSermon = (id: string) => localStorageService.deleteSermon(id);
export const searchSermons = (query: string, filters?: any) => localStorageService.searchSermons(query, filters);

export const saveJournalEntry = (entry: LocalJournalEntry) => localStorageService.saveJournalEntry(entry);
export const getJournalEntries = () => localStorageService.getJournalEntries();
export const deleteJournalEntry = (id: string) => localStorageService.deleteJournalEntry(id);
export const searchJournalEntries = (query: string, filters?: any) => localStorageService.searchJournalEntries(query, filters);

export const saveChatConversation = (conversation: LocalChatConversation) => localStorageService.saveChatConversation(conversation);
export const getChatConversations = () => localStorageService.getChatConversations();
export const deleteChatConversation = (id: string) => localStorageService.deleteChatConversation(id);
export const searchChatConversations = (query: string, filters?: any) => localStorageService.searchChatConversations(query, filters);

export const getStorageStats = () => localStorageService.getStorageStats();
export const exportData = () => localStorageService.exportData();
export const importData = (data: string) => localStorageService.importData(data); 