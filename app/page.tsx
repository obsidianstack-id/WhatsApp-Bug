"use client";

import { FormEvent, useEffect, useState } from "react";

type Report = {
  id: string; groupLink: string; category: string; description: string;
  status: string; createdAt: string;
};

const categories = [
  "Spam atau penipuan",
  "Ancaman atau pelecehan",
  "Konten berbahaya",
  "Penyamaran atau pelanggaran identitas",
  "Lainnya"
];

export default function Home() {
  const [groupLink, setGroupLink] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadReports() {
    try {
      const response = await fetch("/api/reports", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && Array.isArray(data.reports)) setReports(data.reports);
    } catch { /* dashboard remains usable when storage is not configured */ }
  }

  useEffect(() => { loadReports(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupLink, category, description })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Permintaan gagal.");
      setMessage(data.message || "Catatan berhasil dibuat.");
      setGroupLink(""); setDescription("");
      await loadReports();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally { setBusy(false); }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">W</span><div><strong>WA Report Desk</strong><small>REPORTING & CASE TRACKING</small></div></div>
        <span className="badge"><i /> Sistem dokumentasi</span>
      </header>

      <section className="hero">
        <div className="eyebrow">PUSAT PELAPORAN</div>
        <h1>Laporkan dugaan pelanggaran.<br/><em>Catat dengan jelas.</em></h1>
        <p>Dokumentasikan dugaan pelanggaran secara tertib. Peninjauan dan keputusan tindakan tetap sepenuhnya berada pada WhatsApp.</p>
      </section>

      <section className="notice">
        <span className="notice-icon">i</span>
        <div><strong>Penting: laporan bukan pemblokiran otomatis</strong><p>Panel ini tidak dapat menonaktifkan grup dan tidak mengirim laporan langsung ke WhatsApp. Gunakan fitur pelaporan resmi WhatsApp untuk menyampaikan laporan yang akurat dan berdasarkan bukti.</p></div>
      </section>

      <div className="grid">
        <section className="card">
          <div className="section-head"><div><span className="step">01</span><h2>Buat catatan laporan</h2></div><span className="muted">Formulir</span></div>
          <form onSubmit={submit}>
            <label htmlFor="groupLink">Tautan undangan grup (opsional)</label>
            <input id="groupLink" value={groupLink} onChange={e => setGroupLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
            <label htmlFor="category">Kategori dugaan pelanggaran</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select>
            <label htmlFor="description">Keterangan dan bukti yang relevan</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Jelaskan apa yang terjadi, kapan, dan bukti yang tersedia..." rows={5} maxLength={3000} required />
            <div className="hint">Maksimal 3.000 karakter. Jangan masukkan kata sandi, kode OTP, atau data pribadi yang tidak diperlukan.</div>
            <button disabled={busy} type="submit">{busy ? "Menyimpan..." : "Simpan catatan laporan"} <span>→</span></button>
            {message && <div className="message" role="status">{message}</div>}
          </form>
        </section>

        <aside className="card side-card">
          <div className="section-head"><div><span className="step">02</span><h2>Kirim lewat kanal resmi</h2></div></div>
          <p className="side-copy">Setelah catatan disiapkan, gunakan menu pelaporan di WhatsApp dan sertakan bukti yang relevan. Hindari laporan palsu atau laporan massal yang tidak berdasar.</p>
          <a className="external" href="https://faq.whatsapp.com/" target="_blank" rel="noreferrer">Buka Pusat Bantuan WhatsApp <span>↗</span></a>
          <div className="divider"/>
          <div className="mini-stat"><span>API penonaktifan grup</span><strong>Tidak tersedia secara publik</strong></div>
          <div className="mini-stat"><span>Keputusan moderasi</span><strong>WhatsApp</strong></div>
          <div className="mini-stat"><span>Fungsi panel</span><strong>Dokumentasi & pelacakan</strong></div>
        </aside>
      </div>

      <section className="card history">
        <div className="section-head"><div><span className="step">03</span><h2>Riwayat catatan</h2></div><button className="refresh" onClick={loadReports} type="button">↻ Muat ulang</button></div>
        {reports.length === 0 ? <div className="empty"><div className="empty-icon">▤</div><strong>Belum ada catatan</strong><p>Catatan yang tersimpan akan muncul di sini setelah penyimpanan dikonfigurasi.</p></div> :
          <div className="table-wrap"><table><thead><tr><th>Waktu</th><th>Kategori</th><th>Tautan grup</th><th>Status</th></tr></thead><tbody>
            {reports.map(report => <tr key={report.id}><td>{new Date(report.createdAt).toLocaleString("id-ID")}</td><td>{report.category}</td><td>{report.groupLink ? <span className="link-text">{report.groupLink}</span> : "—"}</td><td><span className="status">{report.status}</span></td></tr>)}
          </tbody></table></div>}
      </section>

      <footer><span>WA REPORT DESK</span><span>Gunakan secara bertanggung jawab · Tidak berafiliasi dengan WhatsApp</span></footer>
    </main>
  );
}