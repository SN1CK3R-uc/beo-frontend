import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import type { User } from '@/types/models';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  fullName: string;
  sex: 'Male' | 'Female';
  dob: string;
  email: string;
  phone: string;
  newPassKey: string;
  signatureUrl: string;
}

const EMPTY: FormState = {
  fullName: '',
  sex: 'Male',
  dob: '',
  email: '',
  phone: '',
  newPassKey: '',
  signatureUrl: '',
};

export function ProfileModal({ open, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const toast = useToast();

  const [form, setForm] = useState<FormState>(EMPTY);

  // Load current user into the form whenever the modal opens
  useEffect(() => {
    if (open && user) {
      setForm({
        fullName: user.name,
        sex: user.sex,
        dob: user.dob,
        email: user.email,
        phone: user.phone,
        newPassKey: '',
        signatureUrl: user.signatureUrl ?? '',
      });
    }
  }, [open, user]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSignatureUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        set('signatureUrl', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email is required.');
      return;
    }
    if (form.newPassKey && form.newPassKey.length < 8) {
      toast.error('Passkey must be at least 8 characters.');
      return;
    }

    await updateProfile({
      name: form.fullName.trim(),
      sex: form.sex,
      dob: form.dob,
      email: form.email.trim(),
      phone: form.phone.trim(),
      signatureUrl: form.signatureUrl || undefined,
      ...(form.newPassKey ? { newPassKey: form.newPassKey } : {}),
    });

    toast.success('Profile updated successfully.');
    onClose();
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title="My Profile & Settings" width={560}>
      <div
        className="read-only-box"
        style={{
          background: 'var(--bg-hover)',
          padding: 12,
          borderRadius: 6,
          marginBottom: 16,
          fontSize: '0.9rem',
        }}
      >
        <p>
          <strong>User ID #:</strong> {user.id}
        </p>
        <p>
          <strong>Position:</strong> {user.role.toUpperCase()}
        </p>
        <p>
          <strong>Created Date:</strong> {user.createdAt}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sex:</label>
            <select
              value={form.sex}
              onChange={(e) => set('sex', e.target.value as 'Male' | 'Female')}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Birth:</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set('dob', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone:</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Update Passkey (min 8 chars, leave blank to keep current):</label>
          <input
            type="password"
            value={form.newPassKey}
            onChange={(e) => set('newPassKey', e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label>Digital Signature Image:</label>
          <input type="file" accept="image/*" onChange={handleSignatureUpload} />
          {form.signatureUrl && (
            <img
              src={form.signatureUrl}
              alt="Signature preview"
              style={{
                maxHeight: 50,
                marginTop: 8,
                border: '1px solid var(--border-color)',
                borderRadius: 4,
                padding: 4,
                background: '#fff',
              }}
            />
          )}
        </div>

        <div
          className="modal-footer"
          style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}
        >
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}