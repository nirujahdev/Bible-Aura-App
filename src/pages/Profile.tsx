import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX,
  Download,
  Trash2,
  LogOut,
  ArrowLeft,
  Crown,
  Shield,
  Heart,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Info,
  HelpCircle,
  Star,
  Share,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully" });
      navigate('/auth');
    } catch (error) {
      toast({ 
        title: "Sign out failed", 
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({ title: "Cache cleared", description: "App data has been cleared." });
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bible Aura',
          text: 'Check out this amazing AI-powered Bible study app!',
          url: window.location.origin
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.origin);
      toast({ title: "Link copied!", description: "Share the app with others." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-6 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Profile & Settings</h1>
            <p className="text-blue-100 text-sm">Customize your Bible study experience</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* User Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-blue-500 text-white text-lg">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'G'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.user_metadata?.full_name || 'Guest User'}
                </h3>
                <p className="text-gray-600 text-sm">{user?.email || 'guest@biblestudy.app'}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {user ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Signed In
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      <User className="h-3 w-3 mr-1" />
                      Guest Mode
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">127</div>
              <div className="text-xs text-gray-600">Verses Read</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">45</div>
              <div className="text-xs text-gray-600">AI Chats</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">23</div>
              <div className="text-xs text-gray-600">Days Active</div>
            </CardContent>
          </Card>
        </div>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>App Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-gray-600">Toggle dark theme</div>
                </div>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5" />
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-gray-600">Daily verse reminders</div>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                <div>
                  <div className="font-medium">Sound Effects</div>
                  <div className="text-sm text-gray-600">Audio feedback</div>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5" />
                <div>
                  <div className="font-medium">Auto Sync</div>
                  <div className="text-sm text-gray-600">Sync data across devices</div>
                </div>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5" />
                <div>
                  <div className="font-medium">Offline Mode</div>
                  <div className="text-sm text-gray-600">Work without internet</div>
                </div>
              </div>
              <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
            </div>
          </CardContent>
        </Card>

        {/* App Actions */}
        <Card>
          <CardHeader>
            <CardTitle>App Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button 
              onClick={shareApp}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Share className="h-5 w-5 text-blue-500" />
                <span>Share Bible Aura</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <button 
              onClick={() => navigate('/about')}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-gray-500" />
                <span>About Bible Aura</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <button 
              onClick={() => window.open('mailto:support@biblestudy.app')}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-5 w-5 text-green-500" />
                <span>Help & Support</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <button 
              onClick={clearCache}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="h-5 w-5 text-orange-500" />
                <span>Clear Cache</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </CardContent>
        </Card>

        {/* Sign Out / Authentication */}
        {user ? (
          <Card>
            <CardContent className="p-4">
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <Link to="/auth">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  <User className="h-4 w-4 mr-2" />
                  Sign In or Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* App Version */}
        <div className="text-center text-sm text-gray-500">
          <p>Bible Aura Mobile v2.0.0</p>
          <p>Made with ❤️ for spiritual growth</p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 