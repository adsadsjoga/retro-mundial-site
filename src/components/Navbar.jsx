import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';

export default function Navbar({ cartCount, onCartOpen, onNavigate, currentPage, onAdminClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoClicks = useRef(0);
  const logoTimer = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
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

  const navLinks = [
    { id: 'home', label: 'Início' },
    { id: 'shop', label: 'Loja' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-gray-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={handleLogoClick} className="flex flex-col leading-none text-left">
            <span className="text-lg font-black tracking-tighter">RETRO MUNDIAL</span>
            <span className="text-amber-500 text-[9px] font-bold tracking-[0.3em] uppercase">Moments That Matter</span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => onNavigate(l.id)}
                className={`uppercase hover:text-amber-500 transition-colors ${currentPage === l.id ? 'text-amber-500' : 'text-gray-300'}`}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onCartOpen} className="relative hover:text-amber-500 transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden hover:text-amber-500 transition-colors">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 flex flex-col gap-1 bg-black">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => { onNavigate(l.id); setMenuOpen(false); }}
                className={`uppercase text-sm font-bold tracking-wide hover:text-amber-500 transition-colors text-left px-2 py-2 ${currentPage === l.id ? 'text-amber-500' : 'text-gray-300'}`}>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
