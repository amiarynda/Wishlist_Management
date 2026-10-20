import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT w.id, w.name, w.price, w.priority, w.status, w.category_id,
             c.name AS category_name, w.created_at
      FROM wishlist w
      JOIN categories c ON c.id = w.category_id
      ORDER BY w.created_at DESC, w.id DESC
    `);
    return NextResponse.json(rows.map((item) => ({ ...item, price: Number(item.price) })));
  } catch (error) {
    console.error('GET wishlist:', error);
    return NextResponse.json({ error: 'Gagal mengambil wishlist. Periksa koneksi database dan jalankan schema.sql.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const price = Number(body.price);
    const priority = body.priority || 'Biasa';
    const status = body.status || 'Belum Dibeli';
    const categoryId = Number(body.category_id);

    if (!name) return NextResponse.json({ error: 'Nama barang wajib diisi.' }, { status: 400 });
    if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: 'Harga harus berupa angka 0 atau lebih.' }, { status: 400 });
    if (!Number.isInteger(categoryId) || categoryId < 1) return NextResponse.json({ error: 'Pilih kategori.' }, { status: 400 });
    if (!['Penting', 'Biasa', 'Opsional'].includes(priority)) return NextResponse.json({ error: 'Prioritas tidak valid.' }, { status: 400 });
    if (!['Belum Dibeli', 'Sudah Dibeli'].includes(status)) return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });

    const [result] = await db.execute(
      'INSERT INTO wishlist (name, price, priority, status, category_id) VALUES (?, ?, ?, ?, ?)',
      [name, price, priority, status, categoryId]
    );
    return NextResponse.json({ id: result.insertId, message: 'Barang berhasil ditambahkan.' }, { status: 201 });
  } catch (error) {
    console.error('POST wishlist:', error);
    return NextResponse.json({ error: 'Gagal menambahkan barang. Pastikan kategori tersedia.' }, { status: 500 });
  }
}
