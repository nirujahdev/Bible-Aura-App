import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from "react-router-dom";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Import pages
import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Funding from "./pages/Pricing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Bible from "./pages/Bible";
import EnhancedBible from "./pages/EnhancedBible";
import BibleAI from "./pages/BibleAI";
import BibleQA from "./pages/BibleQA";
import Journal from "./pages/Journal";
import SermonWriter from "./pages/SermonWriter";
import Sermons from "./pages/Sermons";
import SermonLibrary from "./pages/SermonLibrary";
import StudyHub from "./pages/StudyHub";
import TopicalStudy from "./pages/TopicalStudy";
import ParablesStudy from "./pages/ParablesStudy";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Songs from "./pages/Songs";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancelled from "./pages/SubscriptionCancelled";

// Blog posts
import HowAITransformsBibleStudy from "./pages/blog/HowAITransformsBibleStudy";
import BibleStudyAIBenefits from "./pages/blog/BibleStudyAIBenefits";
import AIBibleInsightsAccuracy from "./pages/blog/AIBibleInsightsAccuracy";
import BibleAIVsTraditionalStudy from "./pages/blog/BibleAIVsTraditionalStudy";

// Feature pages
import AIFeatures from "./pages/features/AIFeatures";
import BibleStudy from "./pages/features/BibleStudy";
import PersonalTools from "./pages/features/PersonalTools";
import ContentCreation from "./pages/features/ContentCreation";
import LearningResources from "./pages/features/LearningResources";
import AdvancedStudy from "./pages/features/AdvancedStudy";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";

// Hooks
import { useAuth } from "./hooks/useAuth";

// Utils
import { logDatabaseStatus } from "./utils/databaseTest";

// App.css for any global styles
import "./App.css";

// Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
    },
  },
});

// Authentication-First App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Checking your authentication..." />;
  }

  // If user is not authenticated, show only auth and marketing pages
  if (!user) {
    return (
      <Routes>
        {/* Authentication route */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Marketing pages - accessible without auth */}
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Funding />} />
        <Route path="/blog" element={<Blog />} />
        
        {/* Feature pages - marketing */}
        <Route path="/features/ai" element={<AIFeatures />} />
        <Route path="/features/bible-study" element={<BibleStudy />} />
        <Route path="/features/personal-tools" element={<PersonalTools />} />
        <Route path="/features/content-creation" element={<ContentCreation />} />
        <Route path="/features/learning" element={<LearningResources />} />
        <Route path="/features/advanced-study" element={<AdvancedStudy />} />
        
        {/* Blog posts - marketing */}
        <Route path="/blog/how-ai-transforms-bible-study" element={<HowAITransformsBibleStudy />} />
        <Route path="/blog/bible-study-ai-benefits" element={<BibleStudyAIBenefits />} />
        <Route path="/blog/ai-bible-insights-accuracy" element={<AIBibleInsightsAccuracy />} />
        <Route path="/blog/bible-ai-vs-traditional-study" element={<BibleAIVsTraditionalStudy />} />

        {/* Subscription pages */}
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancelled" element={<SubscriptionCancelled />} />
        
        {/* Marketing home page */}
        <Route path="/home" element={<Home />} />
        
        {/* Redirect all other routes to auth for sign in */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // If user is authenticated, show full app with protected routes
  return (
    <Routes>
      {/* Redirect root to AI Chat after auth */}
      <Route path="/" element={<Navigate to="/bible-ai" replace />} />
      
      {/* AI Chat is the main home interface */}
      <Route path="/bible-ai" element={
        <ErrorBoundary>
          <ProtectedRoute><BibleAI /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      {/* Dashboard redirects to AI Chat */}
      <Route path="/dashboard" element={<Navigate to="/bible-ai" replace />} />
      
      <Route path="/bible" element={
        <ErrorBoundary>
          <ProtectedRoute><Bible /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/enhanced-bible" element={
        <ErrorBoundary>
          <ProtectedRoute><EnhancedBible /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/bible-qa" element={
        <ErrorBoundary>
          <ProtectedRoute><BibleQA /></ProtectedRoute>
        </ErrorBoundary>
      } />

      <Route path="/journal" element={
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold mb-2">Journal Error</h2>
              <p className="text-gray-600 mb-4">Unable to load journal. This might be due to a database issue.</p>
              <div className="space-y-2">
                <button onClick={() => window.location.reload()} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
                  Refresh Page
                </button>
                <button onClick={() => window.location.href = '/dashboard'} className="w-full px-4 py-2 bg-gray-600 text-white rounded">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        }>
          <ProtectedRoute><Journal /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/study-hub" element={
        <ErrorBoundary>
          <ProtectedRoute><StudyHub /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/topical-study" element={
        <ErrorBoundary>
          <ProtectedRoute><TopicalStudy /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/parables" element={
        <ErrorBoundary>
          <ProtectedRoute><ParablesStudy /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/sermons" element={
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold mb-2">Sermons Error</h2>
              <p className="text-gray-600 mb-4">Unable to load sermons. This might be due to a database issue.</p>
              <div className="space-y-2">
                <button onClick={() => window.location.reload()} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
                  Refresh Page
                </button>
                <button onClick={() => window.location.href = '/dashboard'} className="w-full px-4 py-2 bg-gray-600 text-white rounded">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        }>
          <ProtectedRoute><Sermons /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/sermon-writer" element={
        <ErrorBoundary>
          <ProtectedRoute><SermonWriter /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/sermon-library" element={
        <ErrorBoundary>
          <ProtectedRoute><SermonLibrary /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/profile" element={
        <ErrorBoundary>
          <ProtectedRoute><Profile /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/favorites" element={
        <ErrorBoundary>
          <ProtectedRoute><Favorites /></ProtectedRoute>
        </ErrorBoundary>
      } />
      
      <Route path="/songs" element={
        <ErrorBoundary>
          <ProtectedRoute><Songs /></ProtectedRoute>
        </ErrorBoundary>
      } />

      {/* Marketing pages - still accessible after auth */}
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Funding />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/home" element={<Home />} />
      
      {/* Feature pages */}
      <Route path="/features/ai" element={<AIFeatures />} />
      <Route path="/features/bible-study" element={<BibleStudy />} />
      <Route path="/features/personal-tools" element={<PersonalTools />} />
      <Route path="/features/content-creation" element={<ContentCreation />} />
      <Route path="/features/learning" element={<LearningResources />} />
      <Route path="/features/advanced-study" element={<AdvancedStudy />} />
      
      {/* Blog posts */}
      <Route path="/blog/how-ai-transforms-bible-study" element={<HowAITransformsBibleStudy />} />
      <Route path="/blog/bible-study-ai-benefits" element={<BibleStudyAIBenefits />} />
      <Route path="/blog/ai-bible-insights-accuracy" element={<AIBibleInsightsAccuracy />} />
      <Route path="/blog/bible-ai-vs-traditional-study" element={<BibleAIVsTraditionalStudy />} />
      
      {/* Subscription pages */}
      <Route path="/subscription/success" element={<SubscriptionSuccess />} />
      <Route path="/subscription/cancelled" element={<SubscriptionCancelled />} />
      
      {/* Auth page - accessible after login for account management */}
      <Route path="/auth" element={<Auth />} />
      
      {/* 404 for authenticated users */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    // Run database health check on startup in development
    if (process.env.NODE_ENV === 'development') {
      logDatabaseStatus();
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <AppRoutes />
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
