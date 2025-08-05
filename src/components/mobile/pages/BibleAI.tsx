import React from 'react';
import MobileEnhancedAIChat from '../MobileEnhancedAIChat';
import { useSEO, SEO_CONFIG } from '../../../hooks/useSEO';

const MobileBibleAI = () => {
  // SEO optimization
  useSEO(SEO_CONFIG.BIBLE_AI);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Bible AI Assistant</h1>
            <p className="text-xs text-blue-100">Ask questions about Scripture</p>
          </div>
        </div>
      </div>

      {/* AI Chat Component */}
      <div className="pb-4">
        <MobileEnhancedAIChat />
      </div>
    </div>
  );
};

export default MobileBibleAI; 