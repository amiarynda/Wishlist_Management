import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export const runtime = 'nodejs';

export async function PUT(request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 });
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
      'UPDATE wishlist SET name = ?, price = ?, priority = ?, status = ?, category_id = ? WHERE id = ?',
      [name, price, priority, status, categoryId, id]
    );
    if (!result.affectedRows) return NextResponse.json({ error: 'Barang tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ message: 'Barang berhasil diperbarui.' });
  } catch (error) {
    console.error('PUT wishlist:', error);
    return NextResponse.json({ error: 'Gagal memperbarui barang.' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 });
    const [result] = await db.execute('DELETE FROM wishlist WHERE id = ?', [id]);
    if (!result.affectedRows) return NextResponse.json({ error: 'Barang tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ message: 'Barang berhasil dihapus.' });
  } catch (error) {
    console.error('DELETE wishlist:', error);
    return NextResponse.json({ error: 'Gagal menghapus barang.' }, { status: 500 });
  }
}
