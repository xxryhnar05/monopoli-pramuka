import type { GroupDef, GroupId, TileDef } from "@/engine/types";

export const GROUPS: Record<GroupId, GroupDef> = {
  sumatra: { id: "sumatra", name: "Cokelat", region: "Sumatra", color: "#8B5A3C", buildCost: 50_000 },
  jawa: { id: "jawa", name: "Biru Muda", region: "Jawa", color: "#6BB8E0", buildCost: 50_000 },
  balinusra: { id: "balinusra", name: "Pink", region: "Bali & Nusa Tenggara", color: "#D9679B", buildCost: 100_000 },
  kalimantan: { id: "kalimantan", name: "Oranye", region: "Kalimantan", color: "#E8872E", buildCost: 100_000 },
  sulawesi: { id: "sulawesi", name: "Merah", region: "Sulawesi", color: "#C8423B", buildCost: 150_000 },
  maluku: { id: "maluku", name: "Kuning", region: "Maluku", color: "#E3BC2D", buildCost: 150_000 },
  papua: { id: "papua", name: "Hijau", region: "Papua", color: "#3E9B57", buildCost: 200_000 },
  nasional: { id: "nasional", name: "Biru Tua", region: "Ikon Nasional", color: "#2A4A8C", buildCost: 200_000 },
};

export const BUILDING_NAMES = ["Tanah Kosong", "Pos Wisata", "Penginapan", "Resort Nusantara"] as const;

/** 40 kotak, berurutan searah permainan mulai dari START (pojok kanan bawah). */
export const BOARD: TileDef[] = [
  { id: 0, type: "start", name: "Gerbang Nusantara", short: "START", info: "Lewati atau berhenti di sini: terima uang saku Rp150.000, lalu bayar PBB untuk setiap wilayah & bangunan yang dimiliki." },
  { id: 1, type: "property", name: "Danau Toba", group: "sumatra", price: 60_000, location: "Sumatra Utara", scene: "lake", info: "Danau vulkanik terbesar di Asia Tenggara dengan Pulau Samosir di tengahnya." },
  { id: 2, type: "fund", name: "Dana Nusantara" },
  { id: 3, type: "property", name: "Jam Gadang", group: "sumatra", price: 60_000, location: "Bukittinggi, Sumatra Barat", scene: "tower", info: "Menara jam ikonik Bukittinggi dengan atap bergonjong khas Minangkabau." },
  { id: 4, type: "tax", name: "Pajak Penghasilan", short: "PPh 10%", amount: 100_000, taxPercent: 10, info: "Bayar 10% dari total kekayaanmu (minimal Rp100.000) ke kas negara." },
  { id: 5, type: "transport", name: "Stasiun Kereta Indonesia", short: "Stasiun", price: 200_000, scene: "city", info: "Sewa naik sesuai jumlah transportasi yang dimiliki." },
  { id: 6, type: "property", name: "Malioboro", group: "jawa", price: 100_000, location: "Yogyakarta", scene: "street", info: "Jalan legendaris pusat budaya, kuliner, dan belanja Yogyakarta." },
  { id: 7, type: "chance", name: "Kesempatan Nusantara" },
  { id: 8, type: "property", name: "Candi Borobudur", group: "jawa", price: 100_000, location: "Magelang, Jawa Tengah", scene: "temple", info: "Candi Buddha terbesar di dunia, Warisan Dunia UNESCO." },
  { id: 9, type: "property", name: "Gunung Bromo", group: "jawa", price: 120_000, location: "Jawa Timur", scene: "volcano", info: "Gunung api aktif dengan lautan pasir dan panorama matahari terbit." },
  { id: 10, type: "camp", name: "Pos Perkemahan", short: "Pos Kemah", info: "Hanya mampir, atau sedang bertugas jaga di perkemahan." },
  { id: 11, type: "property", name: "Pantai Kuta", group: "balinusra", price: 140_000, location: "Bali", scene: "beach", info: "Pantai berpasir putih yang terkenal dengan ombak dan senjanya." },
  { id: 12, type: "tax", name: "Retribusi Taman Nasional", short: "Retribusi", amount: 100_000, info: "Bayar retribusi konservasi Rp100.000." },
  { id: 13, type: "property", name: "Labuan Bajo", group: "balinusra", price: 140_000, location: "Nusa Tenggara Timur", scene: "harbor", info: "Gerbang menuju Taman Nasional Komodo dengan teluk yang memesona." },
  { id: 14, type: "property", name: "Pulau Komodo", group: "balinusra", price: 160_000, location: "Nusa Tenggara Timur", scene: "dragon", info: "Habitat asli komodo, kadal terbesar di dunia." },
  { id: 15, type: "transport", name: "Pelabuhan Nusantara", short: "Pelabuhan", price: 200_000, scene: "harbor", info: "Sewa naik sesuai jumlah transportasi yang dimiliki." },
  { id: 16, type: "property", name: "Taman Nasional Tanjung Puting", short: "Tanjung Puting", group: "kalimantan", price: 180_000, location: "Kalimantan Tengah", scene: "forest", info: "Pusat rehabilitasi orangutan di tengah hutan hujan tropis." },
  { id: 17, type: "fund", name: "Dana Nusantara" },
  { id: 18, type: "property", name: "Sungai Mahakam", group: "kalimantan", price: 180_000, location: "Kalimantan Timur", scene: "river", info: "Sungai terpanjang kedua di Indonesia, rumah pesut Mahakam." },
  { id: 19, type: "property", name: "IKN Nusantara", group: "kalimantan", price: 200_000, location: "Kalimantan Timur", scene: "city", info: "Ibu Kota Nusantara, kota baru yang dirancang hijau dan cerdas." },
  { id: 20, type: "palace", name: "Istana Nusantara", short: "Istana", info: "Tempat beristirahat. Tidak terjadi apa-apa di sini." },
  { id: 21, type: "property", name: "Bunaken", group: "sulawesi", price: 220_000, location: "Sulawesi Utara", scene: "reef", info: "Taman laut dengan dinding karang dan keanekaragaman ikan yang luar biasa." },
  { id: 22, type: "chance", name: "Kesempatan Nusantara" },
  { id: 23, type: "property", name: "Tana Toraja", group: "sulawesi", price: 220_000, location: "Sulawesi Selatan", scene: "village", info: "Negeri rumah adat Tongkonan dengan tradisi budaya yang unik." },
  { id: 24, type: "property", name: "Wakatobi", group: "sulawesi", price: 240_000, location: "Sulawesi Tenggara", scene: "reef", info: "Surga penyelam di jantung Segitiga Karang Dunia." },
  { id: 25, type: "transport", name: "Bandara Nusantara", short: "Bandara", price: 200_000, scene: "city", info: "Sewa naik sesuai jumlah transportasi yang dimiliki." },
  { id: 26, type: "property", name: "Banda Neira", group: "maluku", price: 260_000, location: "Maluku Tengah", scene: "island", info: "Pulau rempah bersejarah dengan benteng dan Gunung Api Banda." },
  { id: 27, type: "property", name: "Pulau Morotai", group: "maluku", price: 260_000, location: "Maluku Utara", scene: "beach", info: "Pulau bersejarah Perang Dunia II dengan pantai-pantai jernih." },
  { id: 28, type: "tax", name: "Biaya Logistik Regu", short: "Logistik", amount: 150_000, info: "Bayar biaya logistik perjalanan Rp150.000." },
  { id: 29, type: "property", name: "Pantai Ora", group: "maluku", price: 280_000, location: "Pulau Seram, Maluku", scene: "beach", info: "Pantai tenang berlatar tebing hijau dan resor di atas air." },
  { id: 30, type: "goToCamp", name: "Masuk Hutan Tantangan", short: "Hutan Tantangan", info: "Tersesat! Langsung menuju Pos Perkemahan tanpa melewati START." },
  { id: 31, type: "property", name: "Raja Ampat", group: "papua", price: 300_000, location: "Papua Barat Daya", scene: "island", info: "Gugusan pulau karst dengan kekayaan terumbu karang tertinggi di dunia." },
  { id: 32, type: "property", name: "Lembah Baliem", group: "papua", price: 300_000, location: "Papua Pegunungan", scene: "valley", info: "Lembah subur di pegunungan tengah Papua, rumah Festival Baliem." },
  { id: 33, type: "fund", name: "Dana Nusantara" },
  { id: 34, type: "property", name: "Danau Sentani", group: "papua", price: 320_000, location: "Jayapura, Papua", scene: "lake", info: "Danau berbukit hijau dengan puluhan pulau kecil dan kampung di atas air." },
  { id: 35, type: "transport", name: "Kereta Wisata Nusantara", short: "Kereta Wisata", price: 200_000, scene: "park", info: "Sewa naik sesuai jumlah transportasi yang dimiliki." },
  { id: 36, type: "chance", name: "Kesempatan Nusantara" },
  { id: 37, type: "property", name: "Monas", group: "nasional", price: 350_000, location: "Jakarta", scene: "monument", info: "Monumen Nasional, simbol perjuangan kemerdekaan Indonesia." },
  { id: 38, type: "tax", name: "Pajak Barang Mewah", short: "PPnBM", amount: 200_000, info: "Bayar pajak barang mewah Rp200.000." },
  { id: 39, type: "property", name: "TMII", group: "nasional", price: 400_000, location: "Jakarta Timur", scene: "park", info: "Taman Mini Indonesia Indah, miniatur budaya seluruh provinsi." },
];

export const CAMP_INDEX = 10;
export const TRANSPORT_RENT = [0, 40_000, 80_000, 150_000, 250_000];

/** Sewa per level: [tanah, pos wisata, penginapan, resort]. Dibulatkan ke ribuan rupiah. */
export function rentTable(price: number): [number, number, number, number] {
  const base = Math.max(5_000, Math.round((price * 0.12) / 1_000) * 1_000);
  return [base, base * 5, base * 12, base * 22];
}
