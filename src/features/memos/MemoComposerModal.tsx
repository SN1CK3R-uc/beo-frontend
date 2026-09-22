import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { memosApi, type MemoDraft } from '@/api/memos.api';
import { pdfApi } from '@/api/pdf.api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MemoComposerModal({ open, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [draft, setDraft] = useState<MemoDraft>({
    to: '',
    from: user?.role.toUpperCase() ?? '',
    date: new Date().toISOString().split('T')[0]!,
    subject: '',
    salute: '',
    body: '',
  });

  useEffect(() => {
    if (!open) return;
    setDraft({
      to: '',
      from: user?.role.toUpperCase() ?? '',
      date: new Date().toISOString().split('T')[0]!,
      subject: '',
      salute: '',
      body: '',
    });
  }, [open, user]);

  const update = (field: keyof MemoDraft, value: string) =>
    setDraft({ ...draft, [field]: value });

  const validate = () => {
    if (!draft.to.trim()) return 'Please fill in the "To" field.';
    if (!draft.subject.trim()) return 'Please fill in the Subject.';
    if (!draft.salute.trim()) return 'Please fill in the Salutation.';
    if (!draft.body.trim()) return 'Please fill in the memo body.';
    return null;
  };

  const handlePublish = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setPublishing(true);
    try {
      await memosApi.create(draft);
      toast.success('Memo published to all members.');
      await queryClient.invalidateQueries({ queryKey: ['memos'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Could not publish memo. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDownloadPreview = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      const memo = await memosApi.create(draft);
      const { pdfId } = await pdfApi.issue('memo', memo.id);
      await pdfApi.download(pdfId);
      toast.success('PDF generated.');
      await queryClient.invalidateQueries({ queryKey: ['memos'] });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Could not generate PDF.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compose Memo"
      width={1100}
    >
      <div className="memo-layout">
        <div className="memo-form-container">
          <div className="form-group">
            <label>To:</label>
            <input
              value={draft.to}
              onChange={(e) => update('to', e.target.value)}
              placeholder="e.g. All Members, Executive Committee"
            />
          </div>

          <div className="form-group">
            <label>From:</label>
            <input value={draft.from} readOnly />
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input value={draft.date} readOnly />
          </div>

          <div className="form-group">
            <label>Subject:</label>
            <input
              value={draft.subject}
              onChange={(e) => update('subject', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Salutation:</label>
            <input
              value={draft.salute}
              onChange={(e) => update('salute', e.target.value)}
              placeholder="e.g. Dear Members,"
            />
          </div>

          <div className="form-group">
            <label>Body:</label>
            <textarea
              rows={10}
              value={draft.body}
              onChange={(e) => update('body', e.target.value)}
            />
          </div>
        </div>

        <div className="memo-preview-container">
          <h3>Live Preview</h3>

          <div className="memo-document">
            <div className="memo_top">
              <img
                src="/logo.png"
                alt="Building Entrepreneurs"
                className="memo-logo"
              />
              <h3 className="memo-org-name">Building Entrepreneurs</h3>
              <small className="memo-org-slogan">
                Creating Great Minds For Youths
              </small>
            </div>

            <h2 style={{ textAlign: 'center' }}>OFFICIAL MEMORANDUM</h2>

            <p>
              <strong>TO:</strong> {draft.to || '[Audience]'}
            </p>
            <p>
              <strong>FROM:</strong> {draft.from || '[Position]'}
            </p>
            <p>
              <strong>DATE:</strong> {draft.date}
            </p>
            <hr />
            <p>
              <strong>SUBJECT:</strong> {draft.subject || '[Subject]'}
            </p>
            <br />
            <p>{draft.salute || '[Salutation]'}</p>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {draft.body || '[Memo body…]'}
            </div>
            <br />

            <div className="memo-ending" style={{ marginTop: 32 }}>
              <p>
                <strong>{user?.name}</strong>
              </p>
              <p>{user?.role.toUpperCase()}</p>

              {user?.signatureUrl ? (
                <img
                  src={user.signatureUrl}
                  alt="Digital Signature"
                  style={{
                    maxHeight: 60,
                    maxWidth: 200,
                    marginTop: 12,
                    display: 'block',
                  }}
                />
              ) : (
                <p
                  style={{
                    marginTop: 12,
                    fontSize: '0.75rem',
                    color: '#888',
                    fontStyle: 'italic',
                  }}
                >
                  (No signature on file)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          marginTop: 20,
          flexWrap: 'wrap',
        }}
      >
        <Button variant="secondary" onClick={onClose} disabled={publishing || saving}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={handleDownloadPreview}
          disabled={saving || publishing}
        >
          {saving ? 'Generating…' : 'Download PDF'}
        </Button>
        <Button onClick={handlePublish} disabled={publishing || saving}>
          {publishing ? 'Publishing…' : 'Publish to All Members'}
        </Button>
      </div>
    </Modal>
  );
}