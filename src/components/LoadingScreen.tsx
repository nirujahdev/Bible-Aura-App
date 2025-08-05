import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  duration = 2500 
}) => {
  const [fadeStage, setFadeStage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Logo fade in
    timers.push(setTimeout(() => {
      setFadeStage(1);
    }, 300));

    // Stage 2: Text fade in
    timers.push(setTimeout(() => {
      setFadeStage(2);
    }, 800));

    // Stage 3: Complete fade out
    timers.push(setTimeout(() => {
      setFadeStage(3);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
    }, duration - 500));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
      fadeStage === 3 ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8">
        {/* Logo Container */}
        <div className={`transition-all duration-1000 transform ${
          fadeStage >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
        }`}>
          {/* Bible Aura Logo */}
          <div className="relative mb-8">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse w-32 h-32 mx-auto" />
            
            {/* Main logo */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 w-24 h-24 mx-auto rounded-2xl flex items-center justify-center shadow-2xl">
              {/* Cross symbol */}
              <div className="relative">
                <div className="w-8 h-8 relative">
                  {/* Vertical line of cross */}
                  <div className="absolute left-1/2 top-0 w-1 h-8 bg-white rounded-full transform -translate-x-1/2"></div>
                  {/* Horizontal line of cross */}
                  <div className="absolute top-2 left-0 w-8 h-1 bg-white rounded-full"></div>
                  {/* Decorative elements */}
                  <div className="absolute -top-1 left-1/2 w-2 h-2 bg-yellow-300 rounded-full transform -translate-x-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* App Title */}
          <div className={`transition-all duration-1000 delay-300 transform ${
            fadeStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h1 className="text-4xl font-bold text-white mb-2">
              Bible Aura
            </h1>
            <p className="text-blue-100 text-lg font-light tracking-wide">
              Your AI-Powered Spiritual Journey
            </p>
          </div>

          {/* Loading Progress */}
          <div className={`mt-12 transition-all duration-1000 delay-500 transform ${
            fadeStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Progress text */}
            <p className="text-blue-200 text-sm mb-4 animate-pulse">
              Loading spiritual insights...
            </p>
            
            {/* Simple progress indicator */}
            <div className="w-64 mx-auto bg-white/20 rounded-full h-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Inspirational Quote */}
          <div className={`mt-8 transition-all duration-1000 delay-700 transform ${
            fadeStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-blue-100 text-sm italic max-w-xs mx-auto leading-relaxed">
              "Thy word is a lamp unto my feet, and a light unto my path"
              <span className="block text-xs text-blue-300 mt-1">- Psalm 119:105</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 