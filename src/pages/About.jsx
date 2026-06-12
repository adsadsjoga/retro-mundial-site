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
        <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-4">Nossa História</div>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none mb-6">
          QUEM<br /><span className="text-amber-500">SOMOS</span>
        </h1>
        <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Nascemos da paixão pelo futebol e pela cultura que ele criou ao longo de décadas de Copas do Mundo. Preservamos momentos históricos em algodão orgânico premium.
        </p>
      </section>

      {/* ── MISSÃO ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal">
            <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-4">Nossa Missão</div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-6">
              MAIS DO QUE<br />UMA CAMISA
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Cada peça do arquivo Retro Mundial é um portal para os maiores momentos da história da Copa do Mundo. Não fazemos sportswear — preservamos cultura.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Usamos 100% algodão orgânico certificado GOTS, produzido de forma rastreável e sustentável. Cada design é limitado a 500 unidades — quando acaba, acaba para sempre.
            </p>
            <div className="space-y-3">
              {[
                'Algodão 100% orgânico certificado GOTS',
                'Produção rastreável e sustentável',
                'Edições limitadas a 500 unidades por design',
                'Devolução gratuita em 30 dias',
                'Envio para toda a Europa',
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
              { n: '500', l: 'Unidades\npor Design' },
              { n: '100%', l: 'Algodão\nOrgânico' },
              { n: '6', l: 'Seleções\nHistóricas' },
              { n: '30', l: 'Dias de\nDevolução' },
              { n: 'GOTS', l: 'Certificação\nOrgânica' },
              { n: '0', l: 'Reposições\nApós Esgoto' },
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
            <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">A Coleção</div>
            <h2 className="text-4xl font-black">AS SELEÇÕES DO ARQUIVO</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 scroll-reveal">
            {[
              { country: 'Brazil',    year: '1958 – 2002', titles: '5× Campeão' },
              { country: 'Argentina', year: '1978 – 2022', titles: '3× Campeão' },
              { country: 'Germany',   year: '1954 – 2014', titles: '4× Campeão' },
              { country: 'France',    year: '1998 – 2018', titles: '2× Campeão' },
              { country: 'Spain',     year: '2010',        titles: '1× Campeão' },
              { country: 'England',   year: '1966',        titles: '1× Campeão' },
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
          <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">O Que Nos Move</div>
          <h2 className="text-4xl font-black">NOSSOS VALORES</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🌿',
              title: 'Sustentabilidade',
              desc: 'Todo material é rastreável. Algodão orgânico certificado GOTS, produção responsável, embalagem reciclável.',
            },
            {
              icon: '🏆',
              title: 'Autenticidade',
              desc: 'Cada design é baseado em pesquisa histórica real. Documentamos cada detalhe para que a peça conte uma história verdadeira.',
            },
            {
              icon: '✂️',
              title: 'Qualidade',
              desc: 'Corte oversized de alta qualidade, malha premium de 180g/m², tingimento duradouro. Feita para durar anos.',
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
          <h2 className="text-4xl font-black text-black mb-4">FAÇA PARTE DO ARQUIVO</h2>
          <p className="text-black/70 mb-8">Edições limitadas. Quando acaba, acaba.</p>
          <button onClick={() => onNavigate('shop')}
            className="bg-black text-white font-black px-10 py-4 rounded-sm hover:bg-gray-900 uppercase tracking-widest text-sm transition-colors">
            Ver Coleção →
          </button>
        </div>
      </section>
    </div>
  );
}
