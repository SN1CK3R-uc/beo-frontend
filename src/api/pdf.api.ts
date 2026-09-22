import { api } from './client';

export interface IssuedPdf {
  pdfId: string;
  downloadUrl: string;
}

export const pdfApi = {
  issue: (type: 'receipt' | 'memo' | 'statement', refId: string) =>
    api.post<IssuedPdf>('/pdfs/issue', { type, refId }).then((r) => r.data),

  download: async (pdfId: string) => {
    const res = await api.get(`/pdfs/${pdfId}/download`, {
      responseType: 'blob',
    });

    const disposition = res.headers['content-disposition'] ?? '';
    const match = /filename="?([^"]+)"?/.exec(disposition);
    const filename = match?.[1] ?? 'document.pdf';

    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};