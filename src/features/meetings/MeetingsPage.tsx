import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { usePermissions } from '@/hooks/usePermissions';
import { meetingsApi, type Meeting } from '@/api/meetings.api';

export function MeetingsPage() {
  usePageTitle('Meetings');
  const toast = useToast();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [registering, setRegistering] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    duration: '',
    chairperson: '',
    tag: 'Official Meeting',
    minutes: '',
  });

  const meetingsQuery = useQuery({
    queryKey: ['meetings'],
    queryFn: meetingsApi.list,
  });

  const resetForm = () => {
    setForm({
      title: '', date: '', location: '', duration: '',
      chairperson: '', tag: 'Official Meeting', minutes: '',
    });
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setCreateOpen(true); };
  const openEdit = (m: Meeting) => {
    setForm({
      title: m.title, date: m.date, location: m.location, duration: m.duration,
      chairperson: m.chairperson, tag: m.tag, minutes: m.minutes ?? '',
    });
    setEditing(m);
    setCreateOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await meetingsApi.update(editing.id, form);
        toast.success('Meeting updated.');
      } else {
        await meetingsApi.create(form);
        toast.success('Meeting created.');
      }
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setCreateOpen(false);
      resetForm();
    } catch {
      toast.error('Could not save meeting.');
    }
  };

  const remove = async (m: Meeting) => {
    if (!confirm(`Delete "${m.title}"? This cannot be undone.`)) return;
    try {
      await meetingsApi.remove(m.id);
      toast.success('Meeting deleted.');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    } catch {
      toast.error('Could not delete meeting.');
    }
  };

  const registerAttendance = async (meeting: Meeting) => {
    setRegistering(meeting.id);
    try {
      await meetingsApi.registerAttendance(meeting.id);
      toast.success(`Registered for: ${meeting.title}`);
    } catch {
      toast.error('Could not register.');
    } finally {
      setRegistering(null);
    }
  };

  const exportCalendar = (meeting: Meeting) => {
    const start = new Date(meeting.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `SUMMARY:${meeting.title}`, `LOCATION:${meeting.location}`,
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      'DESCRIPTION:Official BEO MIS Meeting', 'END:VEVENT', 'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="home-header">
        <h2>Scheduled Meetings</h2>
        {can('meetings.manage') && (
          <Button onClick={openCreate}>+ New Meeting</Button>
        )}
      </div>

      {meetingsQuery.isLoading ? (
        <StateBlock kind="loading" />
      ) : meetingsQuery.isError ? (
        <StateBlock kind="error" message="Could not load meetings." onRetry={() => meetingsQuery.refetch()} />
      ) : meetingsQuery.data?.length === 0 ? (
        <StateBlock kind="empty" message="No meetings scheduled." action={can('meetings.manage') ? <Button onClick={openCreate}>Create first meeting</Button> : undefined} />
      ) : (
        <div className="cards-grid">
          {meetingsQuery.data.map((m) => (
            <div key={m.id} className="card" style={{ opacity: m.cancelled ? 0.5 : 1 }}>
              <span className="card-tag">{m.cancelled ? 'Cancelled' : m.tag}</span>
              <h3 style={{ marginTop: 8 }}>{m.title}</h3>
              <p style={{ marginTop: 8 }}><strong>Date:</strong> {new Date(m.date).toLocaleString('en-GB')}</p>
              <p><strong>Location:</strong> {m.location}</p>
              <p><strong>Duration:</strong> {m.duration}</p>
              <p><strong>Chair:</strong> {m.chairperson}</p>

              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <Button onClick={() => registerAttendance(m)} disabled={registering === m.id || m.cancelled}>
                  {registering === m.id ? '…' : 'Register'}
                </Button>
                <Button variant="secondary" onClick={() => exportCalendar(m)}>Calendar</Button>
                {can('meetings.manage') && (
                  <>
                    <Button variant="secondary" onClick={() => openEdit(m)}>Edit</Button>
                    <Button variant="secondary" onClick={() => remove(m)}>Delete</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={editing ? 'Edit Meeting' : 'Create Meeting'}
        width={560}
      >
        <form onSubmit={save}>
          <div className="form-group">
            <label>Title:</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date & Time:</label>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Duration:</label>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2 Hours" required />
            </div>
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Chairperson:</label>
              <input value={form.chairperson} onChange={(e) => setForm({ ...form, chairperson: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Tag:</label>
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
            </div>
          </div>
          {editing && (
            <div className="form-group">
              <label>Minutes:</label>
              <textarea rows={4} value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} />
            </div>
          )}
          <div className="modal-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}