import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { id: 'home',  label: 'Home'      },
  { id: 'shop',  label: 'Shop'      },
  { id: 'about', label: 'Our Story' },
];

export default function Navbar({ cartCount, onCartOpen, onNavigate, currentPage, onAdminClick, announcementText }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const logoClicks  = useRef(0);
  const logoTimer   = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  function handleLogoClick() {
    logoClicks.current += 1;
    clearTimeout(logoTimer.current);
    logoTimer.current = setTimeout(() => { logoClicks.current = 0; }, 2000);
    if (logoClicks.current >= 5) { logoClicks.current = 0; onAdminClick(); return; }
    onNavigate('home');
    setMenuOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30">

      {/* ── UTILITY BAR ───────────────────────────────────────────────────── */}
      <div className="bg-black border-b border-gray-900 hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-8">
          <span className="text-gray-500 text-[10px] tracking-wide">
            Free returns within 30 days · Shipping across Europe
          </span>
          <div className="flex items-center gap-5 text-[10px] text-gray-600">
            <button onClick={() => onNavigate('about')} className="hover:text-gray-300 transition-colors uppercase tracking-wide">
              Our Story
            </button>
            <span className="text-gray-800">|</span>
            <span className="uppercase tracking-wide">Help</span>
          </div>
        </div>
      </div>

      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────────────────── */}
      {announcementText && (
        <div className="bg-amber-500 py-2 px-4">
          <p className="text-black text-[10px] sm:text-xs font-black text-center tracking-wide">
            {announcementText}
          </p>
        </div>
      )}

      {/* ── MAIN NAV ──────────────────────────────────────────────────────── */}
      <nav className="bg-black border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* logo */}
            <button onClick={handleLogoClick} className="flex flex-col leading-none text-left flex-shrink-0">
              <span className="text-base sm:text-lg font-black tracking-tighter">RETRO MUNDIAL</span>
              <span className="text-amber-500 text-[8px] sm:text-[9px] font-bold tracking-[0.28em] uppercase">
                Moments That Matter
              </span>
            </button>

            {/* desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(l => (
                <button
                  key={l.id}
                  onClick={() => onNavigate(l.id)}
                  className={`text-xs font-black tracking-[0.15em] uppercase transition-colors hover:text-amber-500
                    ${currentPage === l.id ? 'text-amber-500' : 'text-gray-400'}`}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* right side */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* cart */}
              <button
                onClick={onCartOpen}
                className="relative hover:text-amber-500 transition-colors p-1"
                aria-label="Carrinho">
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden hover:text-amber-500 transition-colors p-1"
                aria-label="Menu">
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE MENU ─────────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden bg-black border-t border-gray-900">
            {/* announcement text on mobile */}
            {announcementText && (
              <div className="px-5 py-3 bg-amber-500/10 border-b border-gray-900">
                <p className="text-amber-500 text-[10px] font-bold">{announcementText}</p>
              </div>
            )}

            <nav className="px-5 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(l => (
                <button
                  key={l.id}
                  onClick={() => { onNavigate(l.id); setMenuOpen(false); }}
                  className={`text-left text-sm font-black tracking-[0.15em] uppercase py-3 border-b border-gray-900 transition-colors hover:text-amber-500
                    ${currentPage === l.id ? 'text-amber-500' : 'text-gray-300'}`}>
                  {l.label}
                </button>
              ))}
            </nav>

            <div className="px-5 py-4 border-t border-gray-900 text-[10px] text-gray-600 flex gap-5">
              <span>Free returns 30 days</span>
              <span>Free shipping over €50</span>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
