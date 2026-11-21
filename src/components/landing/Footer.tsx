import Link from "next/link";
import Logo from "@/components/art/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#0B271D] py-12 text-cream/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Game papan edukasi The Indonesian Scout Adventure — dipersembahkan oleh UKM Pramuka untuk UKM Fair.
            Satyaku kudarmakan, darmaku kubaktikan!
          </p>
        </div>
        <div>
          <h4 className="font-display font-bold text-cream">Navigasi</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-gold-light" href="/#beranda">Beranda</Link></li>
            <li><Link className="hover:text-gold-light" href="/#cara-bermain">Cara Bermain</Link></li>
            <li><Link className="hover:text-gold-light" href="/#tentang">Tentang Game</Link></li>
            <li><Link className="hover:text-gold-light" href="/leaderboard">Leaderboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-cream">Main</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-gold-light" href="/setup">Mulai Petualangan</Link></li>
            <li><Link className="hover:text-gold-light" href="/play">Lanjutkan Permainan</Link></li>
            <li><Link className="hover:text-gold-light" href="/admin">Panel Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-cream/10 px-4 pt-6 text-xs sm:px-6">
        © {new Date().getFullYear()} Monopoli Nusantara · UKM Pramuka. Ilustrasi destinasi bersifat artistik.
      </div>
    </footer>
  );
}
