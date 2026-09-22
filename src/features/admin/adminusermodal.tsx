import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { usersApi, type AdminUser } from '@/api/users.api';
import type { Role } from '@/types/models';

interface Props {
  open: boolean;
  onClose: () => void;
  editUserId: string | null;
  onSuccess: () => void;
}

const ROLES: Role[] = ['ceo', 'manager', 'treasurer', 'secretary', 'ict', 'member'];

export function AdminUserModal({ open, onClose, editUserId, onSuccess }: Props) {
  const isEdit = !!editUserId;
  const toast = useToast();

  const userQuery = useQuery({
    queryKey: ['admin', 'user', editUserId],
    queryFn: () => usersApi.get(editUserId!),
    enabled: isEdit && open,
  });

  const [form, setForm] = useState({
    id: '',
    name: '',
    role: 'member' as Role,
    sex: 'Male' as 'Male' | 'Female',
    dob: '',
    email: '',
    phone: '',
    passKey: '',
    balanceMWK: 0,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && userQuery.data) {
      const u = userQuery.data;
      setForm({
        id: u.id,
        name: u.name,
        role: u.role,
        sex: u.sex,
        dob: u.dob,
        email: u.email,
        phone: u.phone,
        passKey: '',
        balanceMWK: u.balanceMWK,
      });
    } else if (!isEdit) {
      setForm({
        id: '', name: '', role: 'member', sex: 'Male', dob: '',
        email: '', phone: '', passKey: '', balanceMWK: 0,
      });
    }
  }, [open, isEdit, userQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit) {
        const patch: any = {
          name: form.name,
          role: form.role,
          sex: form.sex,
          dob: form.dob,
          email: form.email,
          phone: form.phone,
        };
        if (form.passKey) patch.newPassKey = form.passKey;
        await usersApi.update(editUserId!, patch);
        toast.success('User updated.');
      } else {
        if (!form.passKey || form.passKey.length < 8) {
          toast.error('Password must be at least 8 chars.');
          return;
        }
        await usersApi.create({
          id: form.id,
          name: form.name,
          role: form.role,
          sex: form.sex,
          dob: form.dob,
          email: form.email,
          phone: form.phone,
          passKey: form.passKey,
          balanceMWK: form.balanceMWK,
        });
        toast.success('User created.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Operation failed');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Create User'} width={560}>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>User ID:</label>
            <input
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              disabled={isEdit}
              placeholder="USR-XXX"
              required
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Full Name:</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sex:</label>
            <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as any })}>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth:</label>
            <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
        </div>

        <div className="form-group">
          <label>{isEdit ? 'New Password (leave blank to keep current):' : 'Initial Password:'}</label>
          <input
            type="password"
            value={form.passKey}
            onChange={(e) => setForm({ ...form, passKey: e.target.value })}
            minLength={isEdit ? 0 : 8}
            required={!isEdit}
            placeholder="Min 8 chars"
          />
        </div>

        {!isEdit && (
          <div className="form-group">
            <label>Initial Balance (MWK):</label>
            <input
              type="number"
              value={form.balanceMWK}
              onChange={(e) => setForm({ ...form, balanceMWK: Number(e.target.value) })}
            />
          </div>
        )}

        <div className="modal-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}