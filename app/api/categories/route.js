import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET categories:', error);
    return NextResponse.json({ error: 'Gagal mengambil kategori. Periksa koneksi database dan jalankan schema.sql.' }, { status: 500 });
  }
}
