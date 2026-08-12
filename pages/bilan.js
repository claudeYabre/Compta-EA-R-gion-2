import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Bilan() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [selectedChurchFilter, setSelectedChurchFilter] = useState('ALL');

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/login');
    } else {
      fetchTransactions();
    }
  }, [router]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  const uniqueChurches = Array.from(new Set(transactions.map((t) => t.church_id).filter(Boolean))).sort();
  const filtered = selectedChurchFilter === 'ALL' ? transactions : transactions.filter((t) => t.church_id === selectedChurchFilter);

  // Calcul des totaux
  const totalIncome = filtered.filter((t) => t.transaction_type === 'INCOME').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = filtered.filter((t) => t.transaction_type === 'EXPENSE').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  
  // Centralisation par compte
  const accountsSummary = filtered.reduce((acc, t) => {
    const key = `${t.transaction_type}_${t.account_number}`;
    if (!acc[key]) acc[key] = { code: t.account_number, type: t.transaction_type, amount: 0 };
    acc[key].amount += Number(t.amount);
    return acc;
  }, {});

  if (loading) return <p style={{ padding: '20px' }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>📊 Bilan & Centralisation</h2>
      
      {/* FILTRE */}
      <div style={{ marginBottom: '20px' }}>
        <select value={selectedChurchFilter} onChange={(e) => setSelectedChurchFilter(e.target.value)} style={{ padding: '10px', width: '100%' }}>
          <option value="ALL">🌐 Vue Globale (Toutes les églises)</option>
          {uniqueChurches.map((c) => <option key={c} value={c}>⛪ {c}</option>)}
        </select>
      </div>

      {/* CARTES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#d4edda', padding: '10px', textAlign: 'center', borderRadius: '5px' }}><b>Recettes</b><br/>{totalIncome.toLocaleString()}</div>
        <div style={{ background: '#f8d7da', padding: '10px', textAlign: 'center', borderRadius: '5px' }}><b>Dépenses</b><br/>{totalExpense.toLocaleString()}</div>
        <div style={{ background: '#e2e3e5', padding: '10px', textAlign: 'center', borderRadius: '5px' }}><b>Solde</b><br/>{(totalIncome - totalExpense).toLocaleString()}</div>
      </div>

      {/* CENTRALISATION PAR COMPTE */}
      <h3>Centralisation par compte</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Code</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(accountsSummary).sort((a,b) => a.code.localeCompare(b.code)).map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.code}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.type === 'INCOME' ? 'Recette' : 'Dépense'}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>← Retour à la saisie</a>
    </div>
  );
}
