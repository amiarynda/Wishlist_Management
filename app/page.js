'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, Search, Pencil, Trash2, Check, Circle, Heart, Sparkles,
  Headphones, BookOpen, Shirt, LampDesk, Package, X, LoaderCircle,
  ShoppingBag, Flower2, ArrowUpRight, Wallet, SlidersHorizontal,
  CheckCircle2, Star, Gift, ChevronDown
} from 'lucide-react';

const emptyForm = {
  name: '',
  price: '',
  priority: 'Biasa',
  status: 'Belum Dibeli',
  category_id: '',
};

const money = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const iconForCategory = (name = '') => {
  const value = name.toLowerCase();

  if (value.includes('elektronik')) return Headphones;
  if (value.includes('fashion')) return Shirt;
  if (value.includes('buku')) return BookOpen;
  if (value.includes('kebutuhan')) return LampDesk;

  return Package;
};

const categoryStyles = [
  { bg: 'bg-[#f4e9dc]', color: 'text-[#a77e5c]', decoration: 'bg-[#ead8c4]' },
  { bg: 'bg-[#e5ebde]', color: 'text-[#617b58]', decoration: 'bg-[#d5e0cb]' },
  { bg: 'bg-[#eee7f2]', color: 'text-[#8b739c]', decoration: 'bg-[#e2d7eb]' },
  { bg: 'bg-[#f7e8e6]', color: 'text-[#b47c75]', decoration: 'bg-[#efd6d2]' },
  { bg: 'bg-[#e5edf0]', color: 'text-[#718f9b]', decoration: 'bg-[#d4e2e7]' },
];

export default function Home() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [itemResponse, categoryResponse] = await Promise.all([
        fetch('/api/wishlist', { cache: 'no-store' }),
        fetch('/api/categories', { cache: 'no-store' }),
      ]);

      const itemData = await itemResponse.json();
      const categoryData = await categoryResponse.json();

      if (!itemResponse.ok) {
        throw new Error(itemData.error || 'Gagal memuat wishlist.');
      }

      if (!categoryResponse.ok) {
        throw new Error(categoryData.error || 'Gagal memuat kategori.');
      }

      setItems(itemData);
      setCategories(categoryData);
    } catch (err) {
      setError(err.message || 'Tidak dapat terhubung ke database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(''), 3000);

    return () => clearTimeout(timer);
  }, [notice]);

  const boughtItems = items.filter(
    (item) => item.status === 'Sudah Dibeli'
  );

  const boughtCount = boughtItems.length;
  const totalCount = items.length;
  const remainingCount = totalCount - boughtCount;
  const progress = totalCount
    ? Math.round((boughtCount / totalCount) * 100)
    : 0;

  const spent = boughtItems.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  const planned = items
    .filter((item) => item.status === 'Belum Dibeli')
    .reduce((sum, item) => sum + Number(item.price), 0);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter =
        filter === 'Semua' ||
        (filter === 'Wishlist' && item.status === 'Belum Dibeli') ||
        (filter === 'Sudah Dibeli' && item.status === 'Sudah Dibeli');

      const keyword = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(keyword) ||
        (item.category_name || '').toLowerCase().includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [items, filter, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      category_id: categories[0]?.id
        ? String(categories[0].id)
        : '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      price: String(item.price),
      priority: item.priority,
      status: item.status,
      category_id: String(item.category_id),
    });
    setError('');
    setModalOpen(true);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editing
        ? `/api/wishlist/${editing.id}`
        : '/api/wishlist';

      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          price: Number(form.price),
          category_id: Number(form.category_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tidak bisa menyimpan barang.');
      }

      setModalOpen(false);
      setNotice(
        editing
          ? 'Your little wish has been updated ✿'
          : 'A new little wish has been added ♡'
      );

      await loadData();
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const toggleBought = async (item) => {
    if (busyId === item.id) return;

    setBusyId(item.id);
    setError('');

    const newStatus =
      item.status === 'Sudah Dibeli'
        ? 'Belum Dibeli'
        : 'Sudah Dibeli';

    try {
      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          price: Number(item.price),
          priority: item.priority,
          status: newStatus,
          category_id: Number(item.category_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Status gagal diubah.');
      }

      setItems((current) =>
        current.map((row) =>
          row.id === item.id
            ? { ...row, status: newStatus }
            : row
        )
      );

      setNotice(
        newStatus === 'Sudah Dibeli'
          ? 'One little wish came true! ✨'
          : 'Back on your wishlist ♡'
      );
    } catch (err) {
      setError(err.message || 'Status gagal diubah.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from your wishlist?`)) {
      return;
    }

    setError('');

    try {
      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Barang gagal dihapus.');
      }

      setItems((current) =>
        current.filter((row) => row.id !== item.id)
      );

      setNotice('Wish removed from your collection.');
    } catch (err) {
      setError(err.message || 'Barang gagal dihapus.');
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf9f5] px-4 pb-12 pt-5 text-[#394637] sm:px-8 sm:pt-8">
      <div className="pointer-events-none fixed -right-32 -top-32 h-80 w-80 rounded-full bg-[#e8eddf]/60 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#f4e7dc]/50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-9 flex items-center justify-between border-b border-[#e9e9df] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e5ebde] text-[#607956]">
              <Flower2 size={24} strokeWidth={1.7} />
            </div>

            <div>
              <p className="font-serif text-xl font-bold tracking-tight text-[#3d503a]">
                little wishlist
              </p>
              <p className="text-[10px] tracking-[0.16em] text-[#929787]">
                A LITTLE SPACE FOR THINGS I LOVE
              </p>
            </div>
          </div>

        </header>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#e5ebde] p-6 sm:p-9">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border-[1.5rem] border-white/20" />
            <div className="pointer-events-none absolute bottom-[-3rem] right-24 h-32 w-32 rounded-full bg-[#d4dfca]/60" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-medium text-[#687d60]">
                <Sparkles size={14} />
                Wishlist Management
              </div>

              <h1 className="max-w-xl font-serif text-4xl leading-[1.12] tracking-tight text-[#3d503a] sm:text-5xl">
                A little 
                <span className="italic text-[#829675]">' wish list
                </span>
                <br />
                <span className="italic text-[#3d503a]">
                  of mine.
                </span>
                <span className="ml-2 inline-block text-2xl text-[#b18c79]">
                  ✿
                </span>
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#74836d]">
                "Sedikit demi sedikit menjadi bukit."
                <br />
                Menabung untuk the little things that make you happy.
              </p>

              <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs text-[#778570]">
                    Your journey
                  </p>
                  <p className="mt-1 font-serif text-2xl text-[#3d503a]">
                    {boughtCount}
                    <span className="mx-1 text-[#98a18e]">/</span>
                    {totalCount}
                    <span className="ml-2 text-sm font-sans text-[#74836d]">
                      wishes collected
                    </span>
                  </p>
                </div>

                <span className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-semibold text-[#607956]">
                  {progress}%
                </span>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/75">
                <div
                  className="h-full rounded-full bg-[#819875] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[2rem] border border-[#eeece3] bg-[#fffefa] p-6 shadow-[0_8px_30px_rgba(65,76,55,0.035)] sm:p-7">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4e8dc] text-[#a67e60]">
                <Wallet size={21} strokeWidth={1.7} />
              </div>
              <span className="rounded-full bg-[#f7f2e9] px-3 py-1 text-[11px] text-[#9a826a]">
                Expense Tracker
              </span>
            </div>

            <div className="mt-3">
              <p className="text-sm text-[#96998d]">
                Total spent on your wishes
              </p>
              <p className="mt-2 break-words font-serif text-3xl tracking-tight text-[#43533e] sm:text-4xl">
                {money(spent)}
              </p>
              <div className="mt-5 h-px bg-[#eeece3]" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#a0a294]">
                    Still dreaming of
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#6c7d60]">
                    {money(planned)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#eeece3] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#829675]">
              <Gift size={16} />
              <span className="text-[11px] sm:text-xs">All wishes</span>
            </div>
            <p className="mt-2 font-serif text-2xl text-[#43533e]">
              {totalCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eeece3] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#b18c79]">
              <Star size={16} />
              <span className="text-[11px] sm:text-xs">To get</span>
            </div>
            <p className="mt-2 font-serif text-2xl text-[#43533e]">
              {remainingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eeece3] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#8c7b9e]">
              <CheckCircle2 size={16} />
              <span className="text-[11px] sm:text-xs">Collected</span>
            </div>
            <p className="mt-2 font-serif text-2xl text-[#43533e]">
              {boughtCount}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#eeece3] bg-[#fffefa] p-4 shadow-[0_10px_35px_rgba(65,76,55,0.04)] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl text-[#43533e]">
                  Your lovely things
                </h2>
                <span className="text-lg text-[#b18c79]">♡</span>
              </div>
              <p className="mt-1 text-sm text-[#999b90]">
                Every wish has a little place here.
              </p>
            </div>

            <button
              onClick={openAdd}
              disabled={!categories.length}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#526b4f] px-5 py-3 text-sm font-medium text-white shadow-[0_5px_12px_rgba(82,107,79,0.15)] transition hover:-translate-y-0.5 hover:bg-[#40583e] disabled:opacity-50"
            >
              <Plus size={17} />
              Add a wish
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {['Semua', 'Wishlist', 'Sudah Dibeli'].map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`rounded-full px-4 py-2.5 text-xs font-medium transition ${
                    filter === option
                      ? 'bg-[#e5ebde] text-[#4f6948]'
                      : 'bg-[#f7f6f1] text-[#909487] hover:bg-[#eef0e8]'
                  }`}
                >
                  {option === 'Semua'
                    ? 'All wishes'
                    : option === 'Wishlist'
                      ? 'Still dreaming'
                      : 'Collected'}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 rounded-full border border-[#eeece3] bg-[#faf9f5] px-4 py-2.5 text-[#929789] transition focus-within:border-[#b6c4aa] lg:w-64">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a little wish..."
                className="w-full bg-transparent text-sm text-[#43533e] outline-none placeholder:text-[#b0b1a7]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>

          {error && (
            <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-[#f0d9d3] bg-[#fff2ef] px-4 py-3 text-sm text-[#a45e50]">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                aria-label="Close error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#8d9b83]">
              <LoaderCircle size={27} className="animate-spin" />
              <p className="mt-3 text-sm">Gathering your little wishes...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#e9eee3] text-[#829675]">
                {search ? <Search size={26} /> : <Flower2 size={28} />}
              </div>

              <h3 className="mt-5 font-serif text-xl text-[#43533e]">
                {search
                  ? 'No wishes found'
                  : filter === 'Sudah Dibeli'
                    ? 'Your next little victory awaits'
                    : 'A little space for your dreams'}
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#999b90]">
                {search
                  ? 'Try another keyword and see what you find.'
                  : 'Add something you love and let your wishlist grow.'}
              </p>

              {!search && (
                <button
                  onClick={openAdd}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#526b4f] px-5 py-2.5 text-sm text-white transition hover:bg-[#40583e]"
                >
                  <Plus size={16} />
                  Add your first wish
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {filteredItems.map((item, index) => {
                const bought = item.status === 'Sudah Dibeli';
                const CategoryIcon = iconForCategory(item.category_name);
                const style = categoryStyles[index % categoryStyles.length];

                return (
                  <article
                    key={item.id}
                    className={`group overflow-hidden rounded-[1.6rem] border transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(65,76,55,0.07)] ${
                      bought
                        ? 'border-[#e8ebdf] bg-[#fcfcf8]'
                        : 'border-[#eeece3] bg-white hover:border-[#dce4d4]'
                    }`}
                  >
                    <div className={`relative flex h-32 items-center justify-center overflow-hidden ${style.bg} sm:h-36`}>
                      <div className={`absolute -left-6 -top-8 h-28 w-28 rounded-full ${style.decoration} opacity-70`} />
                      <div className={`absolute -bottom-10 -right-3 h-32 w-32 rounded-full ${style.decoration} opacity-60`} />
                      <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/75 px-3 py-1 text-[10px] font-medium tracking-wide text-[#777f70]">
                        <Flower2 size={12} />
                        {item.category_name || 'Little things'}
                      </div>

                      {bought && (
                        <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-medium text-[#66805e]">
                          Collected ♡
                        </span>
                      )}

                      <div className={`relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.6rem] bg-white/75 shadow-sm transition duration-300 group-hover:rotate-[-4deg] group-hover:scale-105 ${style.color}`}>
                        <CategoryIcon size={34} strokeWidth={1.35} />
                      </div>

                      <span className="absolute bottom-3 right-4 font-serif text-xl text-white/90">
                        ✿
                      </span>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className={`break-words font-serif text-lg leading-snug ${
                            bought
                              ? 'text-[#93998b]'
                              : 'text-[#43533e]'
                          }`}>
                            {item.name}
                          </h3>
                          <p className={`mt-2 text-base font-semibold ${
                            bought
                              ? 'text-[#92998a]'
                              : 'text-[#647c59]'
                          }`}>
                            {money(item.price)}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleBought(item)}
                          disabled={busyId === item.id}
                          title={bought ? 'Move back to wishlist' : 'Mark as collected'}
                          aria-label={bought ? 'Move back to wishlist' : 'Mark as collected'}
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                            bought
                              ? 'bg-[#dce8d4] text-[#55744d] hover:bg-[#cfdfc4]'
                              : 'border border-[#dfe5d8] bg-[#fbfcf8] text-[#a0aa97] hover:border-[#90a585] hover:bg-[#e9eee3] hover:text-[#526b4f]'
                          } disabled:opacity-50`}
                        >
                          {busyId === item.id ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : bought ? (
                            <Check size={19} strokeWidth={2.5} />
                          ) : (
                            <Circle size={19} strokeWidth={1.5} />
                          )}
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0eee7] pt-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                          item.priority === 'Penting'
                            ? 'bg-[#f8e8df] text-[#b2785d]'
                            : item.priority === 'Opsional'
                              ? 'bg-[#eee7f4] text-[#8b76a0]'
                              : 'bg-[#e9eee3] text-[#718765]'
                        }`}>
                          {item.priority === 'Penting'
                            ? '✦ Important'
                            : item.priority === 'Opsional'
                              ? '♡ Optional'
                              : '✿ Regular'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit wish"
                            aria-label="Edit wish"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#a0a394] transition hover:bg-[#e9eee3] hover:text-[#526b4f]"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => deleteItem(item)}
                            title="Delete wish"
                            aria-label="Delete wish"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#b4a19a] transition hover:bg-[#fae9e5] hover:text-[#b65d4b]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && filteredItems.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#eeece3] pt-5 text-xs text-[#a0a294]">
              <Heart size={13} className="text-[#b18c79]" />
              <span>
                Showing {filteredItems.length} of {totalCount} little wishes
              </span>
            </div>
          )}
        </section>

        <footer className="py-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2 text-[#9ba58f]">
            <span className="h-px w-8 bg-[#dfe4d8]" />
            <Flower2 size={17} strokeWidth={1.5} />
            <span className="h-px w-8 bg-[#dfe4d8]" />
          </div>
          <p className="font-serif text-sm italic text mt-2 text-[10px] tracking-[0.16em] text-[#b3b4a9]">
            Manifest your wishlist until it comes true ♡
          </p>
        </footer>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#273326]/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="my-8 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-[#fffefa] shadow-[0_25px_90px_rgba(34,46,31,0.2)]"
          >
            <div className="relative overflow-hidden bg-[#e5ebde] px-6 py-6 sm:px-7">
              <div className="absolute -right-4 -top-8 h-28 w-28 rounded-full border-[1.1rem] border-white/20" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#7b8d70]">
                    YOUR LITTLE COLLECTION
                  </p>
                  <h2
                    id="modal-title"
                    className="mt-2 font-serif text-2xl text-[#3d503a]"
                  >
                    {editing ? 'A little update' : 'A new little wish'} ✿
                  </h2>
                  <p className="mt-1 text-sm text-[#77856e]">
                    Write down something you would love to have.
                  </p>
                </div>

                <button
                  onClick={() => !saving && setModalOpen(false)}
                  disabled={saving}
                  aria-label="Close dialog"
                  className="rounded-full bg-white/70 p-2 text-[#6f8067] transition hover:bg-white disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={saveItem} className="space-y-4 p-6 sm:p-7">
              {error && (
                <div className="rounded-xl bg-[#fff0ec] px-3 py-2 text-sm text-[#a44e3d]">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-semibold text-[#596b51]"
                >
                  What are you wishing for?
                </label>
                <input
                  id="name"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Cute tote bag ♡"
                  className="w-full rounded-2xl border border-[#e8e9df] bg-white px-4 py-3.5 text-sm text-[#43533e] outline-none transition placeholder:text-[#b1b2a7] focus:border-[#91a585] focus:ring-4 focus:ring-[#e9eee3]"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-1.5 block text-xs font-semibold text-[#596b51]"
                >
                  Estimated price (Rp)
                </label>
                <input
                  id="price"
                  required
                  type="number"
                  min="0"
                  step="1000"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                  placeholder="85000"
                  className="w-full rounded-2xl border border-[#e8e9df] bg-white px-4 py-3.5 text-sm text-[#43533e] outline-none transition placeholder:text-[#b1b2a7] focus:border-[#91a585] focus:ring-4 focus:ring-[#e9eee3]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1.5 block text-xs font-semibold text-[#596b51]"
                  >
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      required
                      value={form.category_id}
                      onChange={(event) =>
                        setForm({ ...form, category_id: event.target.value })
                      }
                      className="w-full appearance-none rounded-2xl border border-[#e8e9df] bg-white px-3.5 py-3.5 pr-9 text-sm text-[#43533e] outline-none focus:border-[#91a585]"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#92998a]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-1.5 block text-xs font-semibold text-[#596b51]"
                  >
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      id="priority"
                      value={form.priority}
                      onChange={(event) =>
                        setForm({ ...form, priority: event.target.value })
                      }
                      className="w-full appearance-none rounded-2xl border border-[#e8e9df] bg-white px-3.5 py-3.5 pr-9 text-sm text-[#43533e] outline-none focus:border-[#91a585]"
                    >
                      <option value="Penting">Penting</option>
                      <option value="Biasa">Biasa</option>
                      <option value="Opsional">Opsional</option>
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#92998a]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-xs font-semibold text-[#596b51]"
                >
                  Purchase status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                    className="w-full appearance-none rounded-2xl border border-[#e8e9df] bg-white px-4 py-3.5 pr-9 text-sm text-[#43533e] outline-none focus:border-[#91a585]"
                  >
                    <option value="Belum Dibeli">Still dreaming</option>
                    <option value="Sudah Dibeli">Already collected</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#92998a]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="flex-1 rounded-full border border-[#e5e8de] px-4 py-3.5 text-sm font-medium text-[#73806b] transition hover:bg-[#f5f6f0] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  disabled={saving || !categories.length}
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#526b4f] px-4 py-3.5 text-sm font-medium text-white transition hover:bg-[#40583e] disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Heart size={15} />
                  )}
                  {saving
                    ? 'Saving...'
                    : editing
                      ? 'Save changes'
                      : 'Add my wish'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#3d503a] px-5 py-3 text-sm text-white shadow-xl"
        >
          <Check size={16} className="shrink-0 text-[#d5e3ca]" />
          <span>{notice}</span>
        </div>
      )}
    </main>
  );
}