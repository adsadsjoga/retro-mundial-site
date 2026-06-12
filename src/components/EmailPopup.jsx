import { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function EmailPopup({ config, onClose }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const activeCoupon = config.discounts?.find(d => d.active);

  async function handleSubmit(e) {
    e.preventDefault();
    const klaviyoId = config.integrations?.klaviyoFormId;
    if (klaviyoId) {
      try {
        await fetch('https://manage.kmail-lists.com/ajax/subscriptions/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ g: klaviyoId, email, $fields: '$source', $source: 'popup' }),
        });
      } catch {}
    }
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: 'email_popup',
        content_type: 'newsletter',
      });
    }
    setDone(true);
    setTimeout(onClose, 3200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gray-900 border border-gray-700 max-w-md w-full p-8 rounded-sm">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>

        {!done ? (
          <>
            <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-4">Exclusive Offer</div>
            <h2 className="text-3xl font-black mb-2 leading-tight">
              {activeCoupon ? `GET ${activeCoupon.percent}% OFF` : 'EARLY ACCESS'}<br />YOUR FIRST ORDER
            </h2>
            <p className="text-gray-400 mb-6 text-sm">Join the Retro Mundial community and be first in line for new drops.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="Your email"
                className="bg-black border border-gray-600 focus:border-amber-500 outline-none px-4 py-3 text-white placeholder-gray-500 rounded-sm transition-colors" />
              <button type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-sm transition-colors tracking-wide uppercase text-sm">
                {activeCoupon ? `Claim ${activeCoupon.percent}% Off` : 'Join the List'}
              </button>
            </form>

            {activeCoupon && (
              <div className="mt-4 border border-dashed border-amber-500/50 p-3 text-center rounded-sm">
                <p className="text-xs text-gray-400 mb-1">Your coupon:</p>
                <p className="font-black text-xl text-amber-500 tracking-widest">{activeCoupon.code}</p>
              </div>
            )}
            <button onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-300 text-xs transition-colors w-full text-center">
              No thanks, I'll pay full price
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-black" />
            </div>
            <h3 className="text-2xl font-black mb-2">You're in!</h3>
            <p className="text-gray-400 mb-4 text-sm">Check your inbox.</p>
            {activeCoupon && (
              <div className="bg-black border border-amber-500 px-6 py-3 inline-block rounded-sm">
                <span className="text-amber-500 font-black text-xl tracking-widest">{activeCoupon.code}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
