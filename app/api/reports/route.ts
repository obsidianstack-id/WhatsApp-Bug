import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Report = {
  id: string;
  groupLink: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
};

// In-memory fallback is for local demos only. On Vercel it is not durable.
// Configure Supabase using the environment variables in .env.example for persistence.
const globalForReports = globalThis as typeof globalThis & { demoReports?: Report[] };
if (!globalForReports.demoReports) globalForReports.demoReports = [];
const demoReports = globalForReports.demoReports;

const allowedCategories = new Set([
  "Spam atau penipuan",
  "Ancaman atau pelecehan",
  "Konten berbahaya",
  "Penyamaran atau pelanggaran identitas",
  "Lainnya"
]);

function validGroupLink(value: unknown): value is string {
  if (value === "" || value === undefined) return true;
  if (typeof value !== "string" || value.length > 500) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "chat.whatsapp.com" || url.hostname === "www.whatsapp.com");
  } catch { return false; }
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers
    },
    cache: "no-store"
  });
}

export async function GET() {
  try {
    const response = await supabaseRequest("reports?select=id,group_link,category,description,status,created_at&order=created_at.desc&limit=100");
    if (response) {
      if (!response.ok) return NextResponse.json({ error: "Penyimpanan laporan gagal dibaca." }, { status: 502 });
      const rows = await response.json();
      const reports = rows.map((r: any) => ({
        id: r.id, groupLink: r.group_link ?? "", category: r.category,
        description: r.description, status: r.status, createdAt: r.created_at
      }));
      return NextResponse.json({ reports });
    }
    return NextResponse.json({ reports: [...demoReports].reverse() });
  } catch {
    return NextResponse.json({ error: "Tidak dapat membaca riwayat." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.REPORT_API_KEY;
  if (apiKey && request.headers.get("x-report-api-key") !== apiKey) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const groupLink = body?.groupLink ?? "";
    const category = body?.category;
    const description = body?.description;

    if (!validGroupLink(groupLink)) {
      return NextResponse.json({ error: "Tautan harus berupa tautan undangan WhatsApp yang valid." }, { status: 400 });
    }
    if (typeof category !== "string" || !allowedCategories.has(category)) {
      return NextResponse.json({ error: "Pilih kategori yang tersedia." }, { status: 400 });
    }
    if (typeof description !== "string" || description.trim().length < 10 || description.length > 3000) {
      return NextResponse.json({ error: "Keterangan harus 10–3.000 karakter." }, { status: 400 });
    }

    const record = {
      group_link: groupLink,
      category,
      description: description.trim(),
      status: "Catatan disimpan — belum dikirim ke WhatsApp"
    };

    const response = await supabaseRequest("reports", {
      method: "POST",
      body: JSON.stringify(record)
    });

    if (response) {
      if (!response.ok) return NextResponse.json({ error: "Gagal menyimpan ke database. Periksa konfigurasi Supabase." }, { status: 502 });
      const rows = await response.json();
      const r = rows[0];
      return NextResponse.json({
        message: "Catatan tersimpan di database. Ini bukan laporan yang sudah dikirim ke WhatsApp.",
        report: { id: r.id, groupLink: r.group_link ?? "", category: r.category, description: r.description, status: r.status, createdAt: r.created_at }
      }, { status: 201 });
    }

    const demoRecord: Report = {
      id: crypto.randomUUID(), groupLink, category, description: description.trim(),
      status: "Demo lokal — belum dikirim ke WhatsApp", createdAt: new Date().toISOString()
    };
    demoReports.push(demoRecord);
    return NextResponse.json({
      message: "Catatan demo tersimpan sementara. Konfigurasikan Supabase agar data persisten; laporan belum dikirim ke WhatsApp.",
      report: demoRecord
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid atau server gagal memprosesnya." }, { status: 400 });
  }
}