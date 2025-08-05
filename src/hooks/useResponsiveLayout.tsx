import { useState, useEffect, useMemo } from 'react';

export type DeviceType = 'mobile' | 'tablet';
export type Orientation = 'portrait' | 'landscape';

interface LayoutConfig {
  device: DeviceType;
  orientation: Orientation;
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  aspectRatio: number;
}

interface LayoutHelpers {
  // Content sizing
  getContainerWidth: () => string;
  getContentPadding: () => string;
  getGridColumns: () => number;
  
  // Navigation
  getNavHeight: () => string;
  getSidebarWidth: () => number;
  getSidebarClass: () => string;
  
  // Typography
  getFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => string;
  getLineHeight: () => string;
  
  // Components
  getCardHeight: (variant: 'compact' | 'standard' | 'expanded') => string;
  
  // Utility
  getSpacing: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => string;
  shouldShowSidebar: () => boolean;
  getModalWidth: () => string;
}

interface ResponsiveLayoutReturn extends LayoutConfig, LayoutHelpers {
  // Quick access flags
  isMobileLayout: boolean;
  isTabletLayout: boolean;
  layoutClass: string;
}

// Mobile-first responsive layout hook
export const useResponsiveLayout = (): ResponsiveLayoutReturn => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    device: 'mobile',
    orientation: 'portrait',
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 375,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 667,
    isMobile: true,
    isTablet: false,
    isTouch: true,
    aspectRatio: 1
  });

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let device: DeviceType = 'mobile';
      
      // Mobile-first breakpoints
      if (width >= 768) {
        device = 'tablet';
      }
      
      const orientation: Orientation = width > height ? 'landscape' : 'portrait';
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setLayoutConfig({
        device,
        orientation,
        screenWidth: width,
        screenHeight: height,
        isMobile: device === 'mobile',
        isTablet: device === 'tablet',
        isTouch,
        aspectRatio: width / height
      });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  const layoutHelpers: LayoutHelpers = useMemo(() => ({
    getContainerWidth: () => {
      return layoutConfig.device === 'tablet' ? 'max-w-4xl' : 'max-w-full';
    },
    
    getContentPadding: () => {
      return layoutConfig.device === 'tablet' ? 'p-6' : 'p-4';
    },
    
    getGridColumns: () => {
      if (layoutConfig.device === 'tablet') {
        return layoutConfig.orientation === 'landscape' ? 3 : 2;
      }
      return 1;
    },
    
    getNavHeight: () => {
      return layoutConfig.device === 'tablet' ? 'h-16' : 'h-14';
    },
    
    getSidebarWidth: () => {
      return layoutConfig.device === 'tablet' ? 280 : 0;
    },
    
    getSidebarClass: () => {
      return layoutConfig.device === 'tablet' ? 'block w-70' : 'hidden';
    },
    
    getFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => {
      const sizes = {
        mobile: { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl' },
        tablet: { sm: 'text-base', base: 'text-lg', lg: 'text-xl', xl: 'text-2xl' }
      };
      return sizes[layoutConfig.device][size];
    },
    
    getLineHeight: () => {
      return layoutConfig.device === 'tablet' ? 'leading-relaxed' : 'leading-normal';
    },
    
    getCardHeight: (variant: 'compact' | 'standard' | 'expanded') => {
      if (layoutConfig.device === 'tablet') {
        return variant === 'compact' ? 'h-32' : variant === 'expanded' ? 'h-64' : 'h-48';
      }
      return variant === 'compact' ? 'h-24' : variant === 'expanded' ? 'h-48' : 'h-36';
    },
    
    getSpacing: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
      const spacing = {
        xs: layoutConfig.device === 'tablet' ? 'gap-2' : 'gap-1',
        sm: layoutConfig.device === 'tablet' ? 'gap-3' : 'gap-2',
        md: layoutConfig.device === 'tablet' ? 'gap-4' : 'gap-3',
        lg: layoutConfig.device === 'tablet' ? 'gap-6' : 'gap-4',
        xl: layoutConfig.device === 'tablet' ? 'gap-8' : 'gap-6'
      };
      return spacing[size];
    },
    
    shouldShowSidebar: () => {
      return layoutConfig.device === 'tablet' && layoutConfig.orientation === 'landscape';
    },
    
    getModalWidth: () => {
      return layoutConfig.device === 'tablet' ? 'max-w-lg' : 'max-w-sm';
    }
  }), [layoutConfig]);

  return {
    ...layoutConfig,
    ...layoutHelpers,
    isMobileLayout: layoutConfig.device === 'mobile',
    isTabletLayout: layoutConfig.device === 'tablet',
    layoutClass: `layout-${layoutConfig.device} orientation-${layoutConfig.orientation}`
  };
}; 