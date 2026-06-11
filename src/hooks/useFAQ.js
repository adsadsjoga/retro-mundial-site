import { useState, useEffect } from 'react';

/**
 * Hook para carregar FAQs de um produto
 * Puxando do Supabase
 *
 * @param {string} productId - ID do produto no Shopify
 * @returns {Object} - { faqs, loading, error }
 */
export function useFAQ(productId) {
  const [faqs, setFAQs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    async function fetchFAQs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/faq?productId=${productId}`);
        if (!res.ok) throw new Error('Erro ao carregar FAQs');
        const data = await res.json();
        setFAQs(data.faqs || []);
      } catch (err) {
        setError(err.message);
        setFAQs([]); // Fallback vazio
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, [productId]);

  return { faqs, loading, error };
}

/**
 * Hook para gerenciar FAQs no admin
 */
export function useFAQAdmin(productId) {
  const { faqs, loading, error, refetch } = useFAQ(productId);
  const [updating, setUpdating] = useState(false);

  async function addFAQ(question, answer) {
    setUpdating(true);
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, question, answer }),
      });
      if (!res.ok) throw new Error('Erro ao criar FAQ');
      // Refetch FAQs
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  async function deleteFAQ(faqId) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/faq/${faqId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar FAQ');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  return { faqs, loading, error, updating, addFAQ, deleteFAQ };
}
