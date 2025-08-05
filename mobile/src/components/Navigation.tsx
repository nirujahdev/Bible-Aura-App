import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  BookOpen, 
  Search, 
  BookHeart, 
  Mic, 
  Menu,
  X,
  User,
  Music,
  Settings
} from 'lucide-react';
// No authentication needed for mobile-only app

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

// MOBILE-ONLY navigation structure - Core features only
const sideMenuItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Search, color: 'text-green-500', description: 'Home dashboard' },
  { name: 'AI Bible Chat', href: '/ai-chat', icon: MessageSquare, color: 'text-orange-500', description: 'Your AI Bible companion' },
  { name: 'Bible Reading', href: '/bible', icon: BookOpen, color: 'text-blue-500', description: 'Scripture reading & study' },
  { name: 'Study Hub', href: '/study-hub', icon: Search, color: 'text-purple-500', description: 'AI-powered Bible study' },
  { name: 'Spiritual Journal', href: '/journal', icon: BookHeart, color: 'text-pink-500', description: 'Personal reflections' },
  { name: 'Sermons', href: '/sermons', icon: Mic, color: 'text-indigo-500', description: 'Ministry tools' },
];

// Bottom navigation - 5 core mobile features
const bottomNavItems: NavigationItem[] = [
  { name: 'Home', href: '/dashboard', icon: Search, color: 'text-green-500' },
  { name: 'AI Chat', href: '/ai-chat', icon: MessageSquare, color: 'text-orange-500' },
  { name: 'Bible', href: '/bible', icon: BookOpen, color: 'text-blue-500' },
  { name: 'Study', href: '/study-hub', icon: Search, color: 'text-purple-500' },
  { name: 'Journal', href: '/journal', icon: BookHeart, color: 'text-pink-500' },
];

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  // No authentication needed for mobile-only app

  const isActive = (href: string) => {
    if (href === '/ai-chat') {
      return location.pathname === '/ai-chat' || location.pathname === '/bible-ai' || 
             location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (href === '/journal') {
      return location.pathname === '/journal' || location.pathname === '/favorites' || location.pathname === '/personal';
    }
    if (href === '/sermons') {
      return location.pathname === '/sermons' || location.pathname === '/sermon-writer' || 
             location.pathname === '/sermon-library' || location.pathname === '/sermon';
    }
    return location.pathname === href;
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✦</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Bible Aura</h1>
              <p className="text-xs text-gray-500">Mobile Bible Study</p>
            </div>
          </div>

          {/* Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-2 px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  active 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${active ? 'text-orange-600' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${active ? 'text-orange-600' : 'text-gray-600'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">✦</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bible Aura</h2>
                    <p className="text-sm text-gray-500">Mobile Bible Study</p>
                  </div>
                </div>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1 px-4 py-6">
                {sideMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={toggleMenu}
                      className={`flex items-center space-x-4 px-4 py-4 rounded-xl mb-2 transition-all duration-200 ${
                        active 
                          ? 'bg-orange-50 text-orange-600' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-orange-600' : item.color}`} />
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile-only app - No authentication needed */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Bible Aura Mobile v2.0.0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation; 