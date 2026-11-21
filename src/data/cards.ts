import type { CardDef } from "@/engine/types";
import { rp } from "@/engine/utils";

/** 40 kartu Kesempatan Nusantara: 10 serangan, 8 pertahanan, 8 ekonomi, 14 pramuka. */
/** Nilai rupiah pada kartu ditulis {v} di deskripsi dan diisi otomatis (mengikuti pengaturan admin). */
export const CHANCE_CARDS: CardDef[] = [
  // ---- SERANGAN (10) ----
  { id: "S01", category: "serangan", effect: "razia", title: "Razia Perkemahan", description: "Pilih satu pemain dan minta {v} darinya.", value: 150_000 },
  { id: "S02", category: "serangan", effect: "pencurian", title: "Pencurian Logistik", description: "Ambil {v} dari pemain pilihanmu.", value: 100_000 },
  { id: "S03", category: "serangan", effect: "blokade", title: "Blokade Jalur", description: "Pemain target hanya boleh melempar satu dadu pada giliran berikutnya." },
  { id: "S04", category: "serangan", effect: "seranganHutan", title: "Serangan Hutan", description: "Pemain target kehilangan {v} ke kas negara.", value: 200_000 },
  { id: "S05", category: "serangan", effect: "pengambilalihan", title: "Pengambilalihan Wilayah", description: "Target menjawab soal Pramuka. Jika salah, ia membayar {v} kepadamu.", value: 200_000 },
  { id: "S06", category: "serangan", effect: "perangkapTali", title: "Perangkap Tali", description: "Pemain target kehilangan satu giliran." },
  { id: "S07", category: "serangan", effect: "penyerbuan", title: "Penyerbuan Pos", description: "Ambil {v} dari setiap pemain lain.", value: 50_000 },
  { id: "S08", category: "serangan", effect: "duel", title: "Tantangan Duel", description: "Duel soal Pramuka melawan target. Yang menang mengambil {v} dari yang kalah.", value: 150_000 },
  { id: "S09", category: "serangan", effect: "perebutan", title: "Perebutan Logistik", description: "Ambil {v} dari pemain target.", value: 100_000 },
  { id: "S10", category: "serangan", effect: "sabotase", title: "Sabotase Perjalanan", description: "Pindahkan pion target mundur {n} kotak.", value: 3 },
  // ---- PERTAHANAN (8) ----
  { id: "P01", category: "pertahanan", effect: "benteng", title: "Benteng Pertahanan", description: "Simpan kartu ini. Batalkan satu serangan yang mengarah kepadamu." },
  { id: "P02", category: "pertahanan", effect: "penjagaan", title: "Penjagaan Ketat", description: "Langsung aktif: kebal dari pencurian uang selama {n} giliran.", value: 2 },
  { id: "P03", category: "pertahanan", effect: "evakuasi", title: "Evakuasi Darurat", description: "Simpan kartu ini. Batalkan hukuman kehilangan giliran atau keluar dari Pos Perkemahan." },
  { id: "P04", category: "pertahanan", effect: "perlindunganAset", title: "Perlindungan Aset", description: "Langsung aktif: wilayahmu terlindung dari Pengambilalihan Wilayah dan Pajak Wilayah selama {n} putaran.", value: 2 },
  { id: "P05", category: "pertahanan", effect: "p3k", title: "P3K Regu", description: "Kotak P3K regu lengkap! Dapatkan {v}.", value: 200_000 },
  { id: "P06", category: "pertahanan", effect: "strategiBertahan", title: "Strategi Bertahan", description: "Simpan kartu ini. Tangkis satu serangan dan penyerang membayar {v} kepadamu.", value: 100_000 },
  { id: "P07", category: "pertahanan", effect: "jalurAlternatif", title: "Jalur Alternatif", description: "Simpan kartu ini. Bebas dari satu kali pembayaran sewa." },
  { id: "P08", category: "pertahanan", effect: "kodeRahasia", title: "Kode Rahasia", description: "Simpan kartu ini. Sandi rahasia membatalkan satu efek kartu serangan." },
  // ---- EKONOMI (8) ----
  { id: "E01", category: "ekonomi", effect: "bantuanDana", title: "Bantuan Dana Nusantara", description: "Terima bantuan dana {v}.", value: 200_000 },
  { id: "E02", category: "ekonomi", effect: "pajakWilayah", title: "Pajak Wilayah", description: "Bayar {v} untuk setiap wilayah yang kamu miliki.", value: 50_000 },
  { id: "E03", category: "ekonomi", effect: "sponsor", title: "Sponsor Wisata", description: "Sponsor tertarik pada regumu! Dapatkan {v}.", value: 150_000 },
  { id: "E04", category: "ekonomi", effect: "kerusakan", title: "Kerusakan Fasilitas", description: "Perbaiki fasilitas yang rusak. Bayar {v}.", value: 150_000 },
  { id: "E05", category: "ekonomi", effect: "hadiahPrestasi", title: "Hadiah Prestasi", description: "Jawab soal Pramuka. Benar dapat {v}, salah kena penalti.", value: 250_000 },
  { id: "E06", category: "ekonomi", effect: "biayaTransport", title: "Biaya Transportasi", description: "Bayar ongkos perjalanan {v}.", value: 100_000 },
  { id: "E07", category: "ekonomi", effect: "investasi", title: "Investasi Wisata", description: "Setiap sewa yang kamu terima bertambah {v} selama dua putaran.", value: 50_000 },
  { id: "E08", category: "ekonomi", effect: "hartaKarun", title: "Harta Karun Nusantara", description: "Lempar satu dadu, hasilnya dikali {v}.", value: 50_000 },
  // ---- PRAMUKA (14) ----
  ...Array.from({ length: 14 }, (_, i): CardDef => {
    const difficulty = i < 6 ? "mudah" : i < 11 ? "sedang" : "sulit";
    return {
      id: `K${String(i + 1).padStart(2, "0")}`,
      category: "pramuka",
      effect: "kuis",
      difficulty,
      title: difficulty === "mudah" ? "Kuis Penggalang" : difficulty === "sedang" ? "Kuis Penegak" : "Kuis Pandega",
      description: `Jawab soal Pramuka tingkat ${difficulty}. Jawaban benar mendapat hadiah uang.`,
    };
  }),
];

/** Kartu Dana Nusantara (kotak Dana). */
export const FUND_CARDS: CardDef[] = [
  { id: "D01", category: "dana", effect: "danaTerima", title: "Juara Lomba Pionering", description: "Regumu juara lomba pionering. Terima {v}.", value: 100_000 },
  { id: "D02", category: "dana", effect: "danaTerima", title: "Iuran Kas Terkumpul", description: "Kas regu surplus. Terima {v}.", value: 80_000 },
  { id: "D03", category: "dana", effect: "danaBayar", title: "Tenda Robek", description: "Ganti tenda yang robek. Bayar {v}.", value: 100_000 },
  { id: "D04", category: "dana", effect: "danaKeStart", title: "Apel Pagi", description: "Kembali ke Gerbang Nusantara (START), terima uang saku dan bayar PBB." },
  { id: "D05", category: "dana", effect: "danaKeKemah", title: "Piket Jaga Malam", description: "Bertugas jaga. Langsung menuju Pos Perkemahan." },
  { id: "D06", category: "dana", effect: "danaKolekte", title: "Ulang Tahun Pramuka", description: "Setiap pemain memberimu {v} sebagai hadiah.", value: 30_000 },
  { id: "D07", category: "dana", effect: "danaBayar", title: "Denda Telat Apel", description: "Regumu terlambat apel. Bayar denda {v}.", value: 80_000 },
  { id: "D08", category: "dana", effect: "danaBayar", title: "Iuran Jambore", description: "Bayar iuran Jambore {v}.", value: 150_000 },
  { id: "D09", category: "dana", effect: "danaMaju", title: "Jalur Pintas Kompas", description: "Kompasmu akurat! Maju {n} kotak.", value: 3 },
  { id: "D10", category: "dana", effect: "danaTerima", title: "Penjualan Kerajinan", description: "Kerajinan tali-temali regumu laku. Terima {v}.", value: 60_000 },
  { id: "D11", category: "dana", effect: "danaBayar", title: "Obat P3K Habis", description: "Isi ulang kotak P3K. Bayar {v}.", value: 50_000 },
  { id: "D12", category: "dana", effect: "danaBayar", title: "Pajak Kendaraan Regu", description: "Bayar pajak kendaraan operasional regu {v}.", value: 120_000 },
];

/** Deskripsi kartu dengan nilai terisi. {v} = rupiah, {n} = angka biasa. */
export function cardText(card: CardDef): string {
  const v = card.value ?? 0;
  return card.description.replace("{v}", rp(v)).replace("{n}", String(v));
}

/** Kartu yang nilainya berupa angka (langkah/giliran), bukan rupiah. */
export const COUNT_VALUE_EFFECTS = new Set(["sabotase", "penjagaan", "perlindunganAset", "danaMaju"]);

export const CATEGORY_STYLE = {
  serangan: { label: "Serangan", from: "#123A2A", to: "#1F5C42", accent: "#E9C46A" },
  pertahanan: { label: "Pertahanan", from: "#1E4E7A", to: "#3B82B8", accent: "#DCEFFC" },
  ekonomi: { label: "Ekonomi", from: "#7A5326", to: "#C99543", accent: "#FFF3D6" },
  pramuka: { label: "Pramuka", from: "#4A2A73", to: "#7B4CB0", accent: "#EBDDFB" },
  dana: { label: "Dana Nusantara", from: "#805536", to: "#B07A4E", accent: "#F4EBD8" },
} as const;

/** Kartu pertahanan yang disimpan di tangan pemain. */
export const HELD_EFFECTS = new Set(["benteng", "evakuasi", "strategiBertahan", "jalurAlternatif", "kodeRahasia"]);
/** Kartu yang bisa menangkis serangan. */
export const BLOCK_EFFECTS = new Set(["benteng", "strategiBertahan", "kodeRahasia"]);
/** Serangan yang tergolong pencurian koin (ditangkis Penjagaan Ketat). */
export const THEFT_EFFECTS = new Set(["razia", "pencurian", "penyerbuan", "perebutan"]);
