'use client';

import React, { useEffect, useState } from 'react';

export interface ARIALiveRegionProps {
  announcement: string | null;
  priority?: 'polite' | 'assertive';
}

export const ARIALiveRegion: React.FC<ARIALiveRegionProps> = ({
  announcement,
  priority = 'polite',
}) => {
  const [announcementKey, setAnnouncementKey] = useState(0);

  useEffect(() => {
    if (announcement) {
      // Force re-render to trigger announcement
      setAnnouncementKey((prev) => prev + 1);
    }
  }, [announcement]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      key={announcementKey}
    >
      {announcement}
    </div>
  );
};

/**
 * Formats an event announcement for screen readers
 */
export const formatEventAnnouncement = (
  action: 'added' | 'updated' | 'deleted',
  eventTitle: string,
  date: Date
): string => {
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  switch (action) {
    case 'added':
      return `Event "${eventTitle}" added on ${dateStr} at ${timeStr}`;
    case 'updated':
      return `Event "${eventTitle}" updated on ${dateStr} at ${timeStr}`;
    case 'deleted':
      return `Event "${eventTitle}" deleted`;
    default:
      return '';
  }
};

