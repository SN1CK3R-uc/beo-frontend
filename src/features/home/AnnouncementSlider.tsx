import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '@/api/announcements.api';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { usePermissions } from '@/hooks/usePermissions';

export function AnnouncementSlider() {
  const [index, setIndex] = useState(0);
  const { can } = usePermissions();

  const announcementsQuery = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.list,
  });

  const items = announcementsQuery.data ?? [];

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 6000);
    return () => clearInterval(t);
  }, [items.length]);

  if (announcementsQuery.isLoading) {
    return <StateBlock kind="loading" message="Loading announcements…" />;
  }

  if (announcementsQuery.isError) {
    return <StateBlock kind="error" message="Could not load announcements." />;
  }

  if (items.length === 0) {
    return (
      <div className="announcement-slider announcement-empty">
        <p>No announcements yet.</p>
        {can('announcements.publish') && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Use the button below to publish the first one.
          </p>
        )}
      </div>
    );
  }

  const current = items[index];
  if (!current) return null;

  return (
    <div className="announcement-slider">
      <div className="announcement-content">
        <span className={`announcement-badge announcement-${current.type}`}>
          {current.type === 'meeting' && '📅 Meeting'}
          {current.type === 'event' && '🎉 Event'}
          {current.type === 'announcement' && '📢 Announcement'}
        </span>

        <h2 className="announcement-title">{current.title}</h2>
        <p className="announcement-body">{current.body}</p>

        <div className="announcement-meta">
          <span>
            By {current.authorName} ({current.authorRole.toUpperCase()})
          </span>
          <span>
            {new Date(current.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {current.linkUrl && (
          <Button
            variant="primary"
            onClick={() => window.open(current.linkUrl, '_blank')}
          >
            {current.linkLabel || 'Learn more'}
          </Button>
        )}
      </div>

      {items.length > 1 && (
        <div className="announcement-dots">
          {items.map((_, i) => (
            <span
              key={i}
              className={`announcement-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}