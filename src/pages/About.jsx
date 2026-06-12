import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { FLAGS } from '../components/shared';

export default function AboutPage({ onNavigate }) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 scroll-reveal">
        <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-4">Our Story</div>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none mb-6">
          WHO<br /><span className="text-amber-500">WE ARE</span>
        </h1>
        <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Born from a love of football and the culture it built across decades of World Cups. We preserve historic moments in premium organic cotton.
        </p>
      </section>

      {/* ── MISSÃO ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal">
            <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-4">Our Mission</div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-6">
              MORE THAN<br />A SHIRT
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Every piece in the Retro Mundial archive is a portal to the greatest moments in World Cup history. We don't make sportswear — we preserve culture.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              We use 100% GOTS-certified organic cotton, produced traceably and sustainably. Each design is limited to 500 units — when it's gone, it's gone for good.
            </p>
            <div className="space-y-3">
              {[
                '100% GOTS-certified organic cotton',
                'Traceable and sustainable production',
                'Limited editions of 500 units per design',
                'Free returns within 30 days',
                'Shipping across Europe',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-black" />
                  </div>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-reveal grid grid-cols-3 gap-1">
            {[
              { n: '500', l: 'Units\nPer Design' },
              { n: '100%', l: 'Organic\nCotton' },
              { n: '6', l: 'Historic\nNations' },
              { n: '30', l: 'Days\nReturns' },
              { n: 'GOTS', l: 'Organic\nCertified' },
              { n: '0', l: 'Restocks\nEver' },
            ].map(({ n, l }) => (
              <div key={n} className="border border-gray-800 p-4 text-center rounded-sm">
                <div className="text-xl sm:text-2xl font-black text-amber-500">{n}</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight whitespace-pre-line">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAÍSES ── */}
      <section className="bg-gray-900 py-20 px-4 mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center scroll-reveal mb-12">
            <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">The Collection</div>
            <h2 className="text-4xl font-black">NATIONS IN THE ARCHIVE</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 scroll-reveal">
            {[
              { country: 'Brazil',    year: '1958 – 2002', titles: '5× Champion' },
              { country: 'Argentina', year: '1978 – 2022', titles: '3× Champion' },
              { country: 'Germany',   year: '1954 – 2014', titles: '4× Champion' },
              { country: 'France',    year: '1998 – 2018', titles: '2× Champion' },
              { country: 'Spain',     year: '2010',        titles: '1× Champion' },
              { country: 'England',   year: '1966',        titles: '1× Champion' },
            ].map(({ country, year, titles }) => (
              <button key={country} onClick={() => onNavigate('shop')}
                className="border border-gray-700 hover:border-amber-500 p-4 rounded-sm text-center transition-all group">
                <div className="text-4xl mb-2">{FLAGS[country]}</div>
                <div className="font-black text-sm group-hover:text-amber-500 transition-colors">{country}</div>
                <div className="text-amber-500 text-xs font-bold mt-1">{titles}</div>
                <div className="text-gray-600 text-xs mt-0.5">{year}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-reveal">
        <div className="text-center mb-12">
          <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">What Drives Us</div>
          <h2 className="text-4xl font-black">OUR VALUES</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🌿',
              title: 'Sustainability',
              desc: 'Every material is traceable. GOTS-certified organic cotton, responsible production, recyclable packaging.',
            },
            {
              icon: '🏆',
              title: 'Authenticity',
              desc: 'Every design is grounded in real historical research. We document every detail so each piece tells a true story.',
            },
            {
              icon: '✂️',
              title: 'Quality',
              desc: 'Premium oversized cut, 180g/m² jersey, lasting dye. Built to last years, not seasons.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="border border-gray-800 p-6 rounded-sm hover:border-amber-500/40 transition-colors">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-black text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-amber-500 py-16 px-4 scroll-reveal">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-black mb-4">JOIN THE ARCHIVE</h2>
          <p className="text-black/70 mb-8">Limited editions. When it's gone, it's gone.</p>
          <button onClick={() => onNavigate('shop')}
            className="bg-black text-white font-black px-10 py-4 rounded-sm hover:bg-gray-900 uppercase tracking-widest text-sm transition-colors">
            View Collection →
          </button>
        </div>
      </section>
    </div>
  );
}
