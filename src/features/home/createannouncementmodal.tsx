import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { announcementsApi } from '@/api/announcements.api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateAnnouncementModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'announcement' as 'announcement' | 'meeting' | 'event',
    linkUrl: '',
    linkLabel: '',
  });

  const toast = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: announcementsApi.create,
    onSuccess: () => {
      toast.success('Announcement published.');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setForm({ title: '', body: '', type: 'announcement', linkUrl: '', linkLabel: '' });
      onClose();
    },
    onError: () => toast.error('Could not publish announcement.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and body are required.');
      return;
    }
    createMutation.mutate({
      title: form.title.trim(),
      body: form.body.trim(),
      type: form.type,
      linkUrl: form.linkUrl.trim() || undefined,
      linkLabel: form.linkLabel.trim() || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Publish Announcement" width={560}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type:</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
          >
            <option value="announcement">Announcement</option>
            <option value="meeting">Meeting</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div className="form-group">
          <label>Title:</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={120}
            required
          />
        </div>

        <div className="form-group">
          <label>Body (max 500 chars):</label>
          <textarea
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            maxLength={500}
            required
          />
          <small style={{ color: 'var(--text-muted)' }}>
            {form.body.length} / 500
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Link URL (optional):</label>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="form-group">
            <label>Link Label (optional):</label>
            <input
              value={form.linkLabel}
              onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
              placeholder="Join Meeting"
            />
          </div>
        </div>

        <div
          className="modal-footer"
          style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}
        >
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}