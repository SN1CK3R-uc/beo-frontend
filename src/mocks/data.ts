export interface AuditEntry {
  time: string;
  actor: string;
  action: string;
}

export interface Receipt {
  id: string;
  date: string;
  amountMWK: number;
  channel: string;
  purpose: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  duration: string;
  chairperson: string;
  tag: string;
}

export interface NominationFee {
  position: string;
  feeMWK: number;
}

export interface OtherFee {
  description: string;
  rateMWK: number;
  dueDate: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
}

export const MOCK = {
  balances: {
    membership: 150,
    nomination: 0,
    affiliated: -50,
  },

  auditTrail: [
    { time: '10:14 AM', actor: 'Treasurer (Grace Lee)', action: 'logged membership payment for USR-101.' },
    { time: '09:30 AM', actor: 'CEO (Alex Johnson)', action: 'published memo: "Q3 Strategic Focus".' },
  ] as AuditEntry[],

  receipts: [
    { id: 'TXN-9081', date: '2026-08-01', amountMWK: 5000, channel: 'Airtel Money', purpose: 'Membership' },
    { id: 'TXN-9075', date: '2026-07-15', amountMWK: 3000, channel: 'TNM Mpamba', purpose: 'Membership' },
    { id: 'TXN-9050', date: '2026-06-02', amountMWK: 2500, channel: 'PayChangu', purpose: 'Tech Support' },
  ] as Receipt[],

  meetings: [
    {
      id: 'MTG-001',
      title: 'Q3 Strategic Planning Session',
      date: '2026-08-25T10:00',
      location: 'Conference Room A & Virtual',
      duration: '2 Hours',
      chairperson: 'Alex Johnson (CEO)',
      tag: 'Official Meeting',
    },
    {
      id: 'MTG-002',
      title: 'Finance Review Committee',
      date: '2026-09-05T14:00',
      location: 'Virtual Only',
      duration: '1.5 Hours',
      chairperson: 'Grace Lee (Treasurer)',
      tag: 'Committee',
    },
  ] as Meeting[],

  nominationFees: [
    { position: 'CEO', feeMWK: 5000 },
    { position: 'Manager', feeMWK: 3500 },
    { position: 'Treasurer', feeMWK: 3000 },
  ] as NominationFee[],

  otherFees: [
    { description: 'Annual Tech Support', rateMWK: 5000, dueDate: '2026-12-31' },
    { description: 'Youth Development Fund', rateMWK: 2500, dueDate: '2026-10-15' },
  ] as OtherFee[],

  summary: {
    activeMembers: 128,
    memosReleased: 42,
    meetingsHeld: 18,
  },

  notifications: [
    { id: 'NTF-1', title: '🎉 New Appointment', body: 'Grace Lee elevated to Financial Director.' },
    { id: 'NTF-2', title: '📅 Meeting Reminder', body: 'Q3 Strategic Planning Session in 3 days.' },
    { id: 'NTF-3', title: '💰 Payment Received', body: 'TXN-9081 confirmed via Airtel Money.' },
  ] as Notification[],
};