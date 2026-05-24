// Performance utilities for bundle optimization and monitoring

interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  renderTime: number;
  interactionTime: number;
}

interface BundleInfo {
  name: string;
  size: number;
  gzipSize?: number;
  loadTime: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private bundleInfo: Map<string, BundleInfo> = new Map();

  // Track component load times
  trackComponentLoad(componentName: string, startTime: number = performance.now()) {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    
    this.metrics.set(componentName, {
      loadTime,
      bundleSize: 0, // Will be populated by bundle analyzer
      renderTime: 0,
      interactionTime: 0
    });

    // Report to analytics if in production
    if (process.env.NODE_ENV === 'production') {
      this.reportMetric('component_load', {
        component: componentName,
        loadTime,
        timestamp: Date.now()
      });
    }
  }

  // Track bundle chunk loading
  trackBundleLoad(bundleName: string, size: number, gzipSize?: number) {
    const startTime = performance.now();
    
    return {
      finish: () => {
        const loadTime = performance.now() - startTime;
        
        this.bundleInfo.set(bundleName, {
          name: bundleName,
          size,
          gzipSize,
          loadTime
        });

        console.log(`📦 Bundle ${bundleName} (${this.formatSize(size)}) loaded in ${loadTime.toFixed(2)}ms`);
      }
    };
  }

  // Preload critical components based on route
  async preloadByRoute(route: string) {
    const startTime = performance.now();
    
    try {
      switch (route) {
        case '/dashboard':
          await Promise.all([
            import('@/components/dashboard/WeeklyAppointmentsChart'),
            import('@/components/dashboard/DashboardStatsCard')
          ]);
          break;
          
        case '/patients':
          await Promise.all([
            import('@/components/patients/PatientModal'),
          ]);
          break;
          
        case '/appointments':
          await Promise.all([
            import('@/components/appointments/AppointmentModal'),
            import('@/components/ui/calendar')
          ]);
          break;
          
        case '/consultation':
          await Promise.all([
            import('@/components/consultation/ConsultationViewModal'),
            import('@/components/consultation/PrescriptionField')
          ]);
          break;
          
        case '/billing':
          await Promise.all([
            import('@/components/billing/BillingModal'),
          ]);
          break;
      }
      
      const loadTime = performance.now() - startTime;
      console.log(`⚡ Route ${route} preloaded in ${loadTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.warn(`Failed to preload route ${route}:`, error);
    }
  }

  // Monitor Web Vitals
  observeWebVitals() {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(`🎨 FCP: ${entry.startTime.toFixed(2)}ms`);
          this.reportMetric('fcp', { value: entry.startTime });
        }
      }
    });
    
    observer.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`🖼️ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      this.reportMetric('lcp', { value: lastEntry.startTime });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    let cumulativeLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
          cumulativeLayoutShift += layoutShiftEntry.value;
        }
      }
      console.log(`📐 CLS: ${cumulativeLayoutShift.toFixed(4)}`);
      this.reportMetric('cls', { value: cumulativeLayoutShift });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      components: Array.from(this.metrics.entries()),
      bundles: Array.from(this.bundleInfo.entries()),
      totalBundleSize: Array.from(this.bundleInfo.values())
        .reduce((total, bundle) => total + bundle.size, 0),
      averageLoadTime: Array.from(this.metrics.values())
        .reduce((total, metric) => total + metric.loadTime, 0) / this.metrics.size
    };

    console.table(summary.components);
    console.table(summary.bundles);
    
    return summary;
  }

  // Format file sizes
  private formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  // Report metrics to analytics service
  private reportMetric(metric: string, data: Record<string, unknown>) {
    // In a real app, you'd send this to your analytics service
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 Metric: ${metric}`, data);
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for component performance tracking
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    trackLoad: () => performanceMonitor.trackComponentLoad(componentName, startTime),
    trackRender: (renderStartTime: number) => {
      const renderTime = performance.now() - renderStartTime;
      console.log(`🎭 ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  };
};

// Preload utilities
export const preloadCriticalComponents = async () => {
  console.log('🚀 Preloading critical components...');
  
  const criticalComponents = [
    import('@/components/ui/dialog'),
    import('@/components/ui/button'),
    import('@/components/ui/form'),
    import('@/components/ui/input'),
    import('@/components/ui/select'),
  ];

  await Promise.all(criticalComponents);
  console.log('✅ Critical components preloaded');
};

// Route-based preloading hook
export const useRoutePreloading = () => {
  return {
    preloadDashboard: () => performanceMonitor.preloadByRoute('/dashboard'),
    preloadPatients: () => performanceMonitor.preloadByRoute('/patients'),
    preloadAppointments: () => performanceMonitor.preloadByRoute('/appointments'),
    preloadConsultation: () => performanceMonitor.preloadByRoute('/consultation'),
    preloadBilling: () => performanceMonitor.preloadByRoute('/billing')
  };
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    performanceMonitor.observeWebVitals();
    
    // Report bundle sizes after app loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceMonitor.getPerformanceSummary();
      }, 1000);
    });
  }
};

export default performanceMonitor;