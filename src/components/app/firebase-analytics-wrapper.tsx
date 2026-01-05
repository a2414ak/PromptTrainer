'use client';

import { analytics } from '@/lib/firebase';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logEvent } from 'firebase/analytics';

export function FirebaseAnalyticsWrapper() {
  const pathname = usePathname();

  useEffect(() => {
    const logPageView = async () => {
      try {
        const analyticsInstance = await analytics;
        if (analyticsInstance) {
          logEvent(analyticsInstance, 'page_view', {
            page_path: pathname,
            page_location: window.location.href,
          });
        }
      } catch (error) {
        console.error("Firebase Analytics error:", error);
      }
    };

    logPageView();
  }, [pathname]);

  return null;
}
