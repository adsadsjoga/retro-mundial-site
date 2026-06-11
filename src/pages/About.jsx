import { useState, useEffect } from 'react';
import { Wand2, Edit3, Save, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function AboutPage({ config, isAdmin, onNavigate }) {
  const [content, setContent] = useLocalStorage('rm_about_content', {
    title: 'QUEM SOMOS',
    subtitle: 'A história por trás de cada camisa',
    sections: [
      {
        heading: 'Nossa Missão',
        text: 'Preservar a história da Copa do Mundo através de roupas que contam histórias.',
      },
      {
        heading: 'O Começo',
        text: 'Nascemos da paixão pelo futebol e pela nostalgia dos grandes momentos da história esportiva.',
      },
      {
        heading: 'Qualidade e Sustentabilidade',
        text: '100% algodão orgânico GOTS. Cada peça é limitada, numerada e feita para durar.',
      },
    ],
  });

  const [editMode, setEditMode] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function generateWithAI() {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Quem Somos',
          brand: 'Retro Mundial - Camisetas premium de futebol',
          description: 'Preservamos história da Copa do Mundo através de camisetas oversized limitadas',
        }),
      });

      if (!res.ok) throw new Error('Erro ao gerar');
      const { content: generated } = await res.json();

      // Parsed content (esperamos JSON com title, subtitle, sections)
      try {
        const parsed = JSON.parse(generated);
        setContent(parsed);
      } catch {
        // Fallback: cria estrutura a partir do texto
        setContent({
          ...content,
          subtitle: 'Texto gerado pela IA',
          sections: [{ heading: 'Nossa História', text: generated }],
        });
      }
    } catch (error) {
      console.error('IA error:', error);
      alert('Erro ao gerar com IA');
    } finally {
      setGenerating(false);
    }
  }

  function updateSection(index, field, value) {
    setContent(prev => {
      const newSections = [...prev.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      return { ...prev, sections: newSections };
    });
  }

  if (editMode && isAdmin) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black">Editar: Quem Somos</h1>
            <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Título */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-sm">
              <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Título</label>
              <input
                value={content.title}
                onChange={e => setContent({ ...content, title: e.target.value })}
                className="w-full bg-black border border-gray-700 focus:border-amber-500 outline-none px-4 py-3 text-white rounded-sm"
              />
            </div>

            {/* Subtítulo */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-sm">
              <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Subtítulo</label>
              <input
                value={content.subtitle}
                onChange={e => setContent({ ...content, subtitle: e.target.value })}
                className="w-full bg-black border border-gray-700 focus:border-amber-500 outline-none px-4 py-3 text-white rounded-sm"
              />
            </div>

            {/* Seções */}
            <div className="space-y-4">
              {content.sections.map((section, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-sm">
                  <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Seção {i + 1} - Título</label>
                  <input
                    value={section.heading}
                    onChange={e => updateSection(i, 'heading', e.target.value)}
                    className="w-full bg-black border border-gray-700 focus:border-amber-500 outline-none px-4 py-2 text-white rounded-sm mb-3"
                  />
                  <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Texto</label>
                  <textarea
                    value={section.text}
                    onChange={e => updateSection(i, 'text', e.target.value)}
                    rows={4}
                    className="w-full bg-black border border-gray-700 focus:border-amber-500 outline-none px-4 py-3 text-white rounded-sm"
                  />
                </div>
              ))}
            </div>

            {/* Gerar com IA */}
            <button
              onClick={generateWithAI}
              disabled={generating}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-sm transition-colors w-full justify-center"
            >
              <Wand2 size={16} /> {generating ? 'Gerando...' : 'Gerar com IA'}
            </button>

            {/* Salvar */}
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-sm transition-colors w-full justify-center"
            >
              <Save size={16} /> Salvar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="py-12 text-center">
          <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">Nossa História</div>
          <h1 className="text-6xl font-black tracking-tight mb-4">{content.title}</h1>
          <p className="text-gray-400 text-lg">{content.subtitle}</p>
        </div>

        {isAdmin && (
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-sm transition-colors"
            >
              <Edit3 size={16} /> Editar Página
            </button>
          </div>
        )}

        {/* Seções */}
        <div className="space-y-16">
          {content.sections.map((section, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-12 items-center">
              {i % 2 === 0 ? (
                <>
                  <div>
                    <h2 className="text-4xl font-black mb-4">{section.heading}</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">{section.text}</p>
                  </div>
                  <div className="h-64 bg-gray-800 rounded-sm flex items-center justify-center">
                    <span className="text-gray-600">🏆</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-64 bg-gray-800 rounded-sm flex items-center justify-center">
                    <span className="text-gray-600">⚽</span>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black mb-4">{section.heading}</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">{section.text}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <button
            onClick={() => onNavigate('shop')}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-10 py-4 rounded-sm uppercase tracking-widest text-sm transition-colors"
          >
            Explorar a Coleção →
          </button>
        </div>
      </div>
    </div>
  );
}
