# Monopoli Nusantara — The Indonesian Scout Adventure

> *Jelajahi Nusantara, Kuasai Wilayahnya!*

Game papan Monopoly berbasis web untuk stan **UKM Pramuka** di UKM Fair. 2–4 pemain bergantian di satu perangkat, membeli destinasi wisata Indonesia, membangun Pos Wisata hingga Resort Nusantara, saling menyerang dengan kartu, dan menjawab soal kepramukaan.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # mode produksi
npm run typecheck  # pemeriksaan TypeScript
npm run simulate   # 50 permainan otomatis untuk menguji aturan
```

Butuh Node.js 18.18+ (disarankan 20/22). Supabase **tidak wajib** — tanpa konfigurasi, game berjalan penuh secara offline dengan localStorage.

## Teknologi

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide React · Zustand (persist ke localStorage) · Supabase (opsional, leaderboard online & login admin). Efek suara disintesis dengan Web Audio API, jadi tidak ada file audio yang perlu diunduh.

## Halaman

| Rute | Isi |
|---|---|
| `/` | Landing page: hero peta Nusantara, destinasi, fitur, cara bermain, tentang game, pratinjau leaderboard |
| `/setup` | Jumlah pemain, nama, avatar, warna pion, mode (Lokal / Tim), durasi (10 mnt / 20 mnt / bebas), tutorial |
| `/play` | Papan 40 kotak, dadu, panel pemain, panel properti/kartu/riwayat/info, semua jendela aksi |
| `/hasil` | Juara, podium emas/perak/perunggu, statistik semua pemain, confetti, Main Lagi |
| `/leaderboard` | Leaderboard perangkat ini + tab online (aktif hanya jika Supabase dikonfigurasi) |
| `/admin` | Kelola soal, hadiah kuis, kartu (aktif/nonaktif & nominal), harga properti, leaderboard |

## Struktur kode

```
src/
  engine/        Game engine murni (tanpa React) — bisa diuji tanpa UI
    types.ts       Tipe state, pemain, kartu, antrean aksi
    actions.ts     createGame, rollDice, finishMove, buyProperty, resolveCard, chooseTarget,
                   defend, answerQuiz, rentChoice, settleDebt, declareBankruptcy, buildOn,
                   sellBuilding, mortgage, unmortgage, sellProperty, endTurn, checkTime, forceEnd
    movement.ts    Gerak pion, bonus START, efek kotak, bayar sewa
    cards.ts       Efek 40 kartu Kesempatan + kartu Dana, resolusi serangan
    core.ts        Tagihan (charge) & utang, kebangkrutan, tumpukan kartu/soal, akhir game
    selectors.ts   Sewa, kekayaan bersih, syarat membangun, siapa yang boleh mengelola properti
  data/          Papan 40 kotak, kelompok warna, kartu, 50 soal Pramuka, avatar
  store/         Zustand: gameStore (progres), contentStore (pengaturan admin), settingsStore
  components/    landing/, setup/, game/, result/, leaderboard/, admin/, ui/, art/
  lib/           sound.ts (Web Audio), leaderboard.ts, supabase.ts
scripts/simulate.ts   Simulasi permainan acak + pemeriksaan invarian
supabase/schema.sql   Tabel & view leaderboard online
```

UI hanya memanggil fungsi engine lewat `useGame().act(fn)`. Setiap aksi mengembalikan state baru atau pesan galat (mis. "Koin tidak cukup"), jadi tombol tidak pernah mengubah data hanya secara visual.

## Aturan yang diterapkan

- **Papan**: 40 kotak, START di pojok kanan bawah, bergerak searah jarum jam. 22 wilayah (8 kelompok sesuai spesifikasi), 4 transportasi, 4 sudut (Gerbang Nusantara, Pos Perkemahan, Istana Nusantara, Masuk Hutan Tantangan), 3 Kesempatan, 3 Dana, 4 pajak/biaya.
- **Dadu**: dua dadu 1–6. Hasilnya hanya terlihat dari animasi dadu, tidak ditulis di log. Kartu *Blokade Jalur* membatasi korban ke satu dadu.
- **Mata uang Rupiah**: saldo awal Rp3.000.000; melewati START dapat uang saku Rp150.000. Sewa tanah ×2 jika satu warna lengkap. Bangunan 3 tingkat (Pos Wisata → Penginapan → Resort). Transportasi Rp40rb/80rb/150rb/250rb.
- **Aturan bangun** (dipilih di setup): *Klasik* = kuasai satu warna lengkap dulu; *Cepat* = boleh bangun di wilayah mana pun yang dimiliki. Bangun lewat tab **Properti** saat giliranmu, atau lewat jendela yang muncul otomatis saat berhenti di wilayah sendiri (jendela itu juga menjelaskan syarat yang belum terpenuhi).
- **Pajak** (bisa diubah di Admin → Ekonomi & Pajak): PPN 10% saat membeli wilayah; pajak sewa 10% (pemilik menerima 90%); PBB setiap melewati START Rp10.000/wilayah + Rp25.000/bangunan; kotak PPh 10% dari kekayaan (min Rp100.000), Retribusi Rp100.000, Biaya Logistik Rp150.000, PPnBM Rp200.000.
- **Pos Perkemahan**: keluar dengan dadu kembar, bayar 50, atau kartu Evakuasi Darurat; gagal 3× wajib bayar.
- **Kartu Kesempatan (40)**: 10 serangan, 8 pertahanan, 8 ekonomi, 14 Pramuka (6 mudah, 5 sedang, 3 sulit). Diacak; tumpukan dikocok ulang saat habis (kartu yang masih disimpan pemain tidak ikut).
- **Pertahanan**: Benteng, Kode Rahasia, Strategi Bertahan ditawarkan otomatis saat diserang; Jalur Alternatif saat membayar sewa; Evakuasi di awal giliran. Penjagaan Ketat & Perlindungan Aset langsung aktif.
- **Kuis**: 4 opsi, timer 20 detik, kunci jawaban tidak tampil sebelum menjawab, penjelasan setelah menjawab. Soal tidak berulang sebelum semua soal di tingkat yang sama terpakai. Untuk duel/pengambilalihan, ada layar "serahkan perangkat" sebelum timer mulai.
- **Saldo tidak pernah negatif**: jika tagihan (termasuk pajak) lebih besar dari saldo, pemain wajib menjual bangunan/menggadaikan/menjual wilayah lalu membayar, atau menyatakan bangkrut. Aset pemain bangkrut diambil alih kreditor (atau kembali ke bank).
- **Akhir game**: tinggal satu pemain aktif, waktu habis, atau diakhiri lewat Pengaturan. Pemenang = kekayaan tertinggi (saldo + harga wilayah + nilai bangunan; wilayah digadai dihitung setengah).

Keputusan yang saya ambil di luar spesifikasi: kotak Dana Nusantara memakai 12 kartu kegiatan regu tersendiri; tidak ada lempar ulang saat dadu kembar (kecuali untuk keluar dari Pos Perkemahan). Semua mudah diubah di `src/data/` dan `src/engine/`.

## Gambar destinasi

Tanpa koneksi ke bank foto, setiap destinasi memakai **ilustrasi vektor** buatan sendiri (`components/art/DestinationArt.tsx`) dengan gaya seragam — tanpa watermark dan tanpa masalah lisensi. Untuk memakai foto sungguhan, letakkan file di `public/images/destinasi/` dan isi kolom `image` di `src/data/board.ts`, mis. `image: "/images/destinasi/danau-toba.jpg"`. Jika foto gagal dimuat, ilustrasi otomatis menjadi cadangan. Gunakan foto berlisensi bebas (mis. Wikimedia Commons, Unsplash) dan cantumkan kredit bila diminta.

## Supabase (opsional)

1. Buat proyek Supabase, jalankan `supabase/schema.sql` di SQL Editor.
2. Salin `.env.example` menjadi `.env.local` dan isi `NEXT_PUBLIC_SUPABASE_URL` serta `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Buat akun admin di Authentication → Users. Dengan Supabase aktif, `/admin` memakai login email + kata sandi.

Tanpa Supabase, `/admin` dikunci PIN (`NEXT_PUBLIC_ADMIN_PIN`, bawaan `pramuka2026`). PIN ini hanya pengunci ringan di perangkat stan, bukan keamanan sungguhan. Pengaturan admin (soal, kartu, harga) tersimpan di browser perangkat tersebut, jadi atur dari perangkat yang dipakai untuk bermain.

## Tips untuk stan UKM Fair

- Pakai durasi **Cepat (10 menit)** agar antrean pengunjung bergerak.
- Aktifkan **Animasi cepat** di Pengaturan bila perangkat lambat.
- Progres tersimpan otomatis; menutup tab lalu membuka `/play` melanjutkan permainan.
