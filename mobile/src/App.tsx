import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';

// MOBILE-ONLY IMPORTS - Clean component names
import Dashboard from '@/components/mobile/pages/Dashboard';
import BibleAI from '@/components/mobile/pages/BibleAI';
import Journal from '@/components/mobile/pages/Journal';
import Sermons from '@/components/mobile/pages/Sermons';
import Bible from '@/components/mobile/pages/Bible';
import StudyHub from '@/components/mobile/pages/StudyHub';

// Create optimized QueryClient for mobile production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false, // Mobile optimization
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// MOBILE-ONLY APP - Clean architecture
const App: React.FC = () => {
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          {showLoading ? (
            <LoadingScreen onComplete={handleLoadingComplete} duration={2500} />
          ) : (
            <Router>
              <div className="min-h-screen bg-gray-50 font-sans antialiased mobile-safe-area">
                <AppRoutes />
                <Toaster 
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#ffffff',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb'
                    }
                  }}
                />
              </div>
            </Router>
          )}
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// MOBILE-ONLY ROUTES - Clean component names
const AppRoutes: React.FC = () => {
  return (
    <>
      <Navigation />
      <main className="pt-16 pb-20 min-h-screen">
        <Routes>
          {/* CORE MOBILE FEATURES */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* AI BIBLE ASSISTANT */}
          <Route path="/ai-chat" element={<BibleAI />} />
          <Route path="/bible-ai" element={<BibleAI />} />
          
          {/* BIBLE READING */}
          <Route path="/bible" element={<Bible />} />
          
          {/* BIBLE STUDY */}
          <Route path="/study-hub" element={<StudyHub />} />
          <Route path="/study" element={<Navigate to="/study-hub" replace />} />
          
          {/* SPIRITUAL JOURNAL */}
          <Route path="/journal" element={<Journal />} />
          <Route path="/personal" element={<Navigate to="/journal" replace />} />
          
          {/* SERMONS */}
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/sermon" element={<Navigate to="/sermons" replace />} />
          
          {/* FALLBACK - All other routes redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
};

export default App; 