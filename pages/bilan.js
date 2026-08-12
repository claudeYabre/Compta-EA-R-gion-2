import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Bilan() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTransactions(data);
      }
      setLoading(false);
    }
    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'INCOME')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'EXPENSE')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h2>📊 Tableau de Bord & Bilan Financier</h2>
      
      {/* Cartes de synthèse */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '150px', background: '#e6fffa', border: '1px solid #319795', padding: '15px', borderRadius: '8px' }}>
          <small style={{ color: '#234e52' }}>Total Recettes</small>
          <h3 style={{ color: '#276749', margin: '5px 0 0 0' }}>{totalIncome.toLocaleString()} FCFA</h3>
        </div>
        <div style={{ flex: '1', minWidth: '150px', background: '#fff5f5', border: '1px solid #e53e3e', padding: '15px', borderRadius: '8px' }}>
          <small style={{ color: '#63171b' }}>Total Dépenses</small>
          <h3 style={{ color: '#9b2c2c', margin: '5px 0 0 0' }}>{totalExpense.toLocaleString()} FCFA</h3>
        </div>
        <div style={{ flex: '1', minWidth: '150px', background: '#ebf8ff', border: '1px solid #3182ce', padding: '15px', borderRadius: '8px' }}>
          <small style={{ color: '#1a365d' }}>Solde Caisse</small>
          <h3 style={{ color: '#2b6cb0', margin: '5px 0 0 0' }}>{balance.toLocaleString()} FCFA</h3>
        </div>
      </div>

      <h3>📜 Historique des Enregistrements</h3>
      
      {loading ? (
        <p>Chargement des données...</p>
      ) : transactions.length === 0 ? (
        <p>Aucune transaction enregistrée pour le moment.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px' }}>Type</th>
              <th style={{ padding: '10px' }}>Compte</th>
              <th style={{ padding: '10px' }}>Montant</th>
              <th style={{ padding: '10px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px', color: t.transaction_type === 'INCOME' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {t.transaction_type === 'INCOME' ? 'Entrée' : 'Sortie'}
                </td>
                <td style={{ padding: '10px' }}>{t.account_number}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.amount?.toLocaleString()} FCFA</td>
                <td style={{ padding: '10px' }}>{t.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Saisir une nouvelle transaction</a>
      </div>
    </div>
  );
}
