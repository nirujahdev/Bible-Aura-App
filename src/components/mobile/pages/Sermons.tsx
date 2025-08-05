import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Headphones, Play, Pause, SkipBack, SkipForward, 
  Volume2, MoreVertical, ArrowLeft, Settings, Search,
  Filter, Download, Share, BookOpen, Clock, Star,
  Heart, Bookmark, List, Grid3X3, Calendar, User,
  ChevronDown, ChevronRight, Mic, Radio, Music, 
  HardDrive, CloudOff, CheckCircle, Save, Archive, Trash2, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';
import { 
  localStorageService, 
  LocalSermon, 
  saveSermon, 
  getSermons, 
  deleteSermon, 
  searchSermons 
} from '../../../lib/local-storage-service';
import LocalStorageManager from '../LocalStorageManager';

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  description: string;
  duration: string;
  date: Date;
  category: string;
  series?: string;
  scriptureRef: string;
  audioUrl?: string;
  transcript?: string;
  isFavorite: boolean;
  isDownloaded: boolean;
  playCount: number;
  tags: string[];
}

interface Speaker {
  name: string;
  title: string;
  sermonCount: number;
  imageUrl?: string;
}

interface Series {
  name: string;
  description: string;
  sermonCount: number;
  imageUrl?: string;
}

const categories = [
  'All', 'Sunday Service', 'Bible Study', 'Devotional', 
  'Evangelism', 'Prayer', 'Worship', 'Youth', 'Family'
];

const speakers: Speaker[] = [
  { name: 'Pastor John Smith', title: 'Senior Pastor', sermonCount: 45 },
  { name: 'Dr. Sarah Johnson', title: 'Associate Pastor', sermonCount: 28 },
  { name: 'Elder Mike Brown', title: 'Teaching Elder', sermonCount: 15 },
  { name: 'Pastor Lisa Davis', title: 'Youth Pastor', sermonCount: 22 }
];

const series: Series[] = [
  { name: 'Walking in Faith', description: 'A journey through the book of Hebrews', sermonCount: 12 },
  { name: 'Kingdom Principles', description: 'Living according to God\'s kingdom', sermonCount: 8 },
  { name: 'Psalms of Comfort', description: 'Finding peace in God\'s promises', sermonCount: 6 },
  { name: 'Gospel of John', description: 'Discovering Jesus through John\'s eyes', sermonCount: 24 }
];

const sampleSermons: Sermon[] = [
  {
    id: '1',
    title: 'Faith That Moves Mountains',
    speaker: 'Pastor John Smith',
    description: 'Exploring what it means to have mountain-moving faith in our daily lives and how we can cultivate deeper trust in God\'s promises.',
    duration: '42:15',
    date: new Date('2024-02-04'),
    category: 'Sunday Service',
    series: 'Walking in Faith',
    scriptureRef: 'Matthew 17:20',
    isFavorite: true,
    isDownloaded: false,
    playCount: 156,
    tags: ['faith', 'trust', 'miracles', 'prayer']
  },
  {
    id: '2',
    title: 'The Power of Forgiveness',
    speaker: 'Dr. Sarah Johnson',
    description: 'Understanding God\'s forgiveness and learning to extend that same grace to others in our relationships and daily interactions.',
    duration: '38:42',
    date: new Date('2024-02-03'),
    category: 'Bible Study',
    series: 'Kingdom Principles',
    scriptureRef: 'Ephesians 4:32',
    isFavorite: false,
    isDownloaded: true,
    playCount: 89,
    tags: ['forgiveness', 'grace', 'relationships']
  },
  {
    id: '3',
    title: 'Finding Peace in God\'s Presence',
    speaker: 'Pastor John Smith',
    description: 'A comforting message about finding rest and peace in God during life\'s storms and challenging seasons.',
    duration: '35:28',
    date: new Date('2024-02-01'),
    category: 'Devotional',
    series: 'Psalms of Comfort',
    scriptureRef: 'Psalm 46:10',
    isFavorite: true,
    isDownloaded: true,
    playCount: 203,
    tags: ['peace', 'comfort', 'presence', 'rest']
  },
  {
    id: '4',
    title: 'Young Faith, Big Dreams',
    speaker: 'Pastor Lisa Davis',
    description: 'Encouraging young believers to pursue God\'s calling with passion and to trust Him with their dreams and aspirations.',
    duration: '29:33',
    date: new Date('2024-01-28'),
    category: 'Youth',
    scriptureRef: '1 Timothy 4:12',
    isFavorite: false,
    isDownloaded: false,
    playCount: 67,
    tags: ['youth', 'calling', 'dreams', 'purpose']
  }
];

const MobileSermons = () => {
  const { toast } = useToast();
  const [sermons, setSermons] = useState<Sermon[]>(sampleSermons);
  const [localSermons, setLocalSermons] = useState<LocalSermon[]>([]);
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState<'sermons' | 'speakers' | 'series' | 'saved'>('sermons');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'title'>('date');
  const [showLocalStorageManager, setShowLocalStorageManager] = useState(false);
  const [downloadingSermons, setDownloadingSermons] = useState<string[]>([]);

  // Load local sermons on component mount
  useEffect(() => {
    loadLocalSermons();
  }, []);

  const loadLocalSermons = () => {
    const savedSermons = getSermons();
    setLocalSermons(savedSermons);
  };

  const saveSermonLocally = async (sermon: Sermon) => {
    setDownloadingSermons(prev => [...prev, sermon.id]);
    
    try {
      const localSermon: LocalSermon = {
        id: sermon.id,
        title: sermon.title,
        speaker: sermon.speaker,
        description: sermon.description,
        duration: sermon.duration,
        date: sermon.date.toISOString(),
        category: sermon.category,
        series: sermon.series,
        scriptureRef: sermon.scriptureRef,
        audioUrl: sermon.audioUrl,
        transcript: sermon.transcript,
        tags: sermon.tags,
        downloadedAt: new Date().toISOString(),
        isFavorite: sermon.isFavorite,
        notes: ''
      };

      const success = await saveSermon(localSermon);
      
      if (success) {
        loadLocalSermons();
        setSermons(prev => prev.map(s => 
          s.id === sermon.id ? { ...s, isDownloaded: true } : s
        ));
        
        toast({
          title: "Sermon Saved",
          description: `"${sermon.title}" saved to your device for offline listening.`,
          duration: 3000
        });
      } else {
        throw new Error('Failed to save sermon');
      }
    } catch (error) {
      toast({
        title: "Save Failed", 
        description: "Could not save sermon to device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingSermons(prev => prev.filter(id => id !== sermon.id));
    }
  };

  const removeSermonLocally = async (sermonId: string) => {
    try {
      const success = await deleteSermon(sermonId);
      
      if (success) {
        loadLocalSermons();
        setSermons(prev => prev.map(s => 
          s.id === sermonId ? { ...s, isDownloaded: false } : s
        ));
        
        toast({
          title: "Sermon Removed",
          description: "Sermon removed from local storage."
        });
      }
    } catch (error) {
      toast({
        title: "Remove Failed",
        description: "Could not remove sermon from device.",
        variant: "destructive"
      });
    }
  };

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sermon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sermon.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || sermon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.date.getTime() - a.date.getTime();
      case 'popularity':
        return b.playCount - a.playCount;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const togglePlayPause = (sermon?: Sermon) => {
    if (sermon && sermon.id !== currentSermon?.id) {
      setCurrentSermon(sermon);
      setIsPlaying(true);
      toast({
        title: "Now Playing",
        description: sermon.title
      });
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFavorite = (sermonId: string) => {
    setSermons(prev => prev.map(sermon => 
      sermon.id === sermonId 
        ? { ...sermon, isFavorite: !sermon.isFavorite }
        : sermon
    ));
    toast({
      title: "Updated",
      description: "Sermon favorite status updated."
    });
  };

  const downloadSermon = async (sermonId: string) => {
    const sermon = sermons.find(s => s.id === sermonId);
    if (!sermon) return;

    if (sermon.isDownloaded) {
      await removeSermonLocally(sermonId);
    } else {
      await saveSermonLocally(sermon);
    }
  };

  const shareSermon = (sermon: Sermon) => {
    const text = `Check out this sermon: "${sermon.title}" by ${sermon.speaker} - ${sermon.scriptureRef}`;
    if (navigator.share) {
      navigator.share({ title: sermon.title, text });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Link Copied",
        description: "Sermon link copied to clipboard."
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Sermon Library</h1>
            <p className="text-xs text-amber-100">{sermons.length} sermons • {speakers.length} speakers</p>
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
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Sermon Library Settings</h3>
                <p className="text-xs text-gray-500">Manage your audio experience</p>
              </div>

              <div className="px-4 py-3 border-b border-gray-100">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Search Sermons</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sermons, speakers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('sermons')}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${activeTab === 'sermons' ? 'text-amber-700 bg-amber-50' : 'text-gray-700'}`}
              >
                <Headphones className="h-4 w-4 text-amber-500" />
                <span>Sermons</span>
              </button>

              <button
                onClick={() => setActiveTab('speakers')}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${activeTab === 'speakers' ? 'text-amber-700 bg-amber-50' : 'text-gray-700'}`}
              >
                <User className="h-4 w-4 text-green-500" />
                <span>Speakers</span>
              </button>

              <button
                onClick={() => setActiveTab('series')}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${activeTab === 'series' ? 'text-amber-700 bg-amber-50' : 'text-gray-700'}`}
              >
                <BookOpen className="h-4 w-4 text-purple-500" />
                <span>Series</span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${activeTab === 'saved' ? 'text-amber-700 bg-amber-50' : 'text-gray-700'}`}
              >
                <HardDrive className="h-4 w-4 text-teal-500" />
                <span>Saved Locally ({localSermons.length})</span>
              </button>

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => setSortBy(sortBy === 'date' ? 'popularity' : sortBy === 'popularity' ? 'title' : 'date')}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Sort by {sortBy === 'date' ? 'Popularity' : sortBy === 'popularity' ? 'Title' : 'Date'}</span>
                </button>

                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  {viewMode === 'list' ? <Grid3X3 className="h-4 w-4 text-indigo-500" /> : <List className="h-4 w-4 text-indigo-500" />}
                  <span>{viewMode === 'list' ? 'Grid View' : 'List View'}</span>
                </button>

                <button
                  onClick={() => toast({ title: "Download Manager", description: "Manage your downloaded sermons." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Download className="h-4 w-4 text-cyan-500" />
                  <span>My Downloads</span>
                </button>

                <button
                  onClick={() => toast({ title: "Audio Settings", description: "Adjust playbook and quality settings." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Settings className="h-4 w-4 text-orange-500" />
                  <span>Audio Settings</span>
                </button>

                <button
                  onClick={() => setShowLocalStorageManager(true)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Archive className="h-4 w-4 text-indigo-500" />
                  <span>Manage Storage</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Content */}
      <ScrollArea className="flex-1 px-4 py-4">
        {activeTab === 'sermons' && (
          <div className="space-y-6">
            {/* Categories */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sermons List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-4'}>
              {filteredSermons.map((sermon) => (
                <Card key={sermon.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col space-y-3' : 'items-start space-x-4'}`}>
                      <div className={`w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0 ${viewMode === 'grid' ? 'w-full h-20' : ''}`}>
                        <Mic className="h-8 w-8 text-amber-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800 line-clamp-2">{sermon.title}</h3>
                            <p className="text-sm text-amber-600 font-medium">{sermon.speaker}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button onClick={() => toggleFavorite(sermon.id)}>
                              <Heart className={`h-4 w-4 ${sermon.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                            <button 
                              onClick={() => downloadSermon(sermon.id)}
                              disabled={downloadingSermons.includes(sermon.id)}
                            >
                              {downloadingSermons.includes(sermon.id) ? (
                                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                              ) : (
                              <Download className={`h-4 w-4 ${sermon.isDownloaded ? 'text-green-500' : 'text-gray-400'}`} />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{sermon.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{sermon.date.toLocaleDateString()}</span>
                            <span>{sermon.duration}</span>
                            <span>{sermon.playCount} plays</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{sermon.category}</Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                          <BookOpen className="h-3 w-3" />
                          <span>{sermon.scriptureRef}</span>
                          {sermon.series && (
                            <>
                              <span>•</span>
                              <span>{sermon.series}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            onClick={() => togglePlayPause(sermon)}
                            className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
                            size="sm"
                          >
                            {currentSermon?.id === sermon.id && isPlaying ? (
                              <Pause className="h-4 w-4 mr-2" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            {currentSermon?.id === sermon.id && isPlaying ? 'Pause' : 'Play'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => shareSermon(sermon)} className="p-2">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'speakers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {speakers.map((speaker, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{speaker.name}</h3>
                        <p className="text-sm text-amber-600">{speaker.title}</p>
                        <p className="text-xs text-gray-500">{speaker.sermonCount} sermons</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'series' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {series.map((seriesItem, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{seriesItem.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{seriesItem.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs bg-amber-100 text-amber-700">
                            {seriesItem.sermonCount} sermons
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            {localSermons.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CloudOff className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">No Saved Sermons</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Save sermons to your device for offline listening. They'll appear here.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('sermons')}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Browse Sermons
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Saved Sermons ({localSermons.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLocalStorageManager(true)}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {localSermons.map((localSermon) => (
                    <Card key={localSermon.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Mic className="h-8 w-8 text-teal-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800 line-clamp-2">{localSermon.title}</h3>
                                <p className="text-sm text-teal-600 font-medium">{localSermon.speaker}</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <button onClick={() => removeSermonLocally(localSermon.id)}>
                                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{localSermon.description}</p>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{new Date(localSermon.date).toLocaleDateString()}</span>
                                <span>{localSermon.duration}</span>
                                <span>Saved {new Date(localSermon.downloadedAt).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{localSermon.category}</Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                              <BookOpen className="h-3 w-3" />
                              <span>{localSermon.scriptureRef}</span>
                              {localSermon.series && (
                                <>
                                  <span>•</span>
                                  <span>{localSermon.series}</span>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button 
                                onClick={() => {
                                  // Convert LocalSermon back to Sermon for playback
                                  const sermon: Sermon = {
                                    id: localSermon.id,
                                    title: localSermon.title,
                                    speaker: localSermon.speaker,
                                    description: localSermon.description,
                                    duration: localSermon.duration,
                                    date: new Date(localSermon.date),
                                    category: localSermon.category,
                                    series: localSermon.series,
                                    scriptureRef: localSermon.scriptureRef,
                                    audioUrl: localSermon.audioUrl,
                                    transcript: localSermon.transcript,
                                    isFavorite: localSermon.isFavorite,
                                    isDownloaded: true,
                                    playCount: 0,
                                    tags: localSermon.tags
                                  };
                                  togglePlayPause(sermon);
                                }}
                                className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
                                size="sm"
                              >
                                {currentSermon?.id === localSermon.id && isPlaying ? (
                                  <Pause className="h-4 w-4 mr-2" />
                                ) : (
                                  <Play className="h-4 w-4 mr-2" />
                                )}
                                {currentSermon?.id === localSermon.id && isPlaying ? 'Pause' : 'Play'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {}} className="p-2">
                                <Share className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Audio Player */}
      {currentSermon && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mic className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 truncate">{currentSermon.title}</h4>
              <p className="text-sm text-gray-600 truncate">{currentSermon.speaker}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toggleFavorite(currentSermon.id)}>
              <Heart className={`h-4 w-4 ${currentSermon.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="p-2">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => togglePlayPause()}
              className="bg-amber-600 hover:bg-amber-700 text-white p-2"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 flex items-center space-x-2">
              <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-amber-600 h-1 rounded-full transition-all"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{currentSermon.duration}</span>
            </div>
            
            <Button variant="outline" size="sm" className="p-2">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Local Storage Manager Modal */}
      {showLocalStorageManager && (
        <div className="fixed inset-0 z-50">
          <LocalStorageManager />
          <Button
            onClick={() => setShowLocalStorageManager(false)}
            className="fixed top-4 right-4 z-60 bg-white/90 text-gray-700 hover:bg-white"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileSermons; 