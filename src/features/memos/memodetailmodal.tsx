import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { memosApi, type Memo } from '@/api/memos.api';
import { pdfApi } from '@/api/pdf.api';

interface Props {
  memo: Memo | null;
  onClose: () => void;
}

export function MemoDetailModal({ memo, onClose }: Props) {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  // Mark as read the moment the modal opens
  useEffect(() => {
    if (!memo) return;
    memosApi.markRead(memo.id).catch(() => {
      /* silent */
    });
  }, [memo]);

  if (!memo) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { pdfId } = await pdfApi.issue('memo', memo.id);
      await pdfApi.download(pdfId);
      toast.success('PDF downloaded.');
    } catch {
      toast.error('Could not download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal open={!!memo} onClose={onClose} title="Memo" width={800}>
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
          <strong>TO:</strong> {memo.to}
        </p>
        <p>
          <strong>FROM:</strong> {memo.from}
        </p>
        <p>
          <strong>DATE:</strong> {memo.date}
        </p>
        <hr />
        <p>
          <strong>SUBJECT:</strong> {memo.subject}
        </p>
        <br />
        <p>{memo.salute}</p>
        <div style={{ whiteSpace: 'pre-wrap' }}>{memo.body}</div>
        <br />

        {/* Signature block — shows the AUTHOR, not the reader */}
        <div className="memo-ending" style={{ marginTop: 32 }}>
          <p>
            <strong>{memo.authorName}</strong>
          </p>
          <p>{memo.authorRole.toUpperCase()}</p>

          {memo.authorSignatureUrl ? (
            <img
              src={memo.authorSignatureUrl}
              alt="Signature"
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

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          marginTop: 20,
          flexWrap: 'wrap',
        }}
      >
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Generating…' : 'Download PDF'}
        </Button>
      </div>
    </Modal>
  );
}