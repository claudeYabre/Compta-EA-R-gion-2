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

  // Récupérer la liste unique de toutes les églises présentes dans les transactions
  const uniqueChurches = Array.from(
    new Set(transactions.map((t) => t.church_id).filter(Boolean))
  ).sort();

  // Filtrer les transactions selon l'église sélectionnée
  const filteredTransactions = selectedChurchFilter === 'ALL'
    ? transactions
    : transactions.filter((t) => t.church_id === selectedChurchFilter);

  // Calculs financiers récapitulatifs basés sur le filtre actif
  const totalIncome = filteredTransactions
    .filter((t) => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpense;

  if (loading) return <p style={{ padding: '20px', fontFamily: 'sans-serif' }}>Chargement des données...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        <h2>📊 Bilan Comptable & Historique</h2>
        <a href="/" style={{ padding: '8px 15px', backgroundColor: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          ➕ Nouvelle Saisie
        </a>
      </div>

      {/* FILTRE PAR ÉGLISE */}
      <div style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filtrer par Église / Paroisse :</label>
        <select
          value={selectedChurchFilter}
          onChange={(e) => setSelectedChurchFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #cbd5e0', fontSize: '14px', width: '100%', maxWidth: '300px', marginTop: '5px' }}
        >
          <option value="ALL">🌐 Toutes les églises (Vue Globale Régionale)</option>
          {uniqueChurches.map((church, index) => (
            <option key={index} value={church}>
              ⛪ {church}
            </option>
          ))}
        </select>
      </div>

      {/* CARTES RÉSUMÉES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', color: '#155724' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>Total Recettes</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{totalIncome.toLocaleString()} FCFA</p>
        </div>
        <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '8px', color: '#721c24' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>Total Dépenses</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{totalExpense.toLocaleString()} FCFA</p>
        </div>
        <div style={{ backgroundColor: balance >= 0 ? '#cce5ff' : '#fff3cd', padding: '15px', borderRadius: '8px', color: balance >= 0 ? '#004085' : '#856404' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>Solde en Caisse</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{balance.toLocaleString()} FCFA</p>
        </div>
      </div>

      {/* TABLEAU DES TRANSACTIONS */}
      <h3>Liste des transactions ({filteredTransactions.length})</h3>
      {filteredTransactions.length === 0 ? (
        <p style={{ color: '#666' }}>Aucune transaction enregistrée pour ce filtre.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Église</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Type</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Compte</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Montant (FCFA)</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '13px' }}>
                    {new Date(t.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {t.church_id || 'N/A'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: t.transaction_type === 'INCOME' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {t.transaction_type === 'INCOME' ? 'ENTRÉE' : 'SORTIE'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.account_number}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {Number(t.amount).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{t.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
