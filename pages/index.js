import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Formulaire state
  const [church, setChurch] = useState('');
  const [transactionType, setTransactionType] = useState('INCOME');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Enregistrement en cours...');

    const { error } = await supabase.from('financial_transactions').insert([
      {
        church_id: church || null,
        transaction_type: transactionType,
        account_number: accountNumber,
        amount: parseFloat(amount),
        description: description,
      },
    ]);

    if (error) {
      setMessage('❌ Erreur lors de l\'enregistrement : ' + error.message);
    } else {
      setMessage('✅ Transaction enregistrée avec succès !');
      setAmount('');
      setDescription('');
      setAccountNumber('');
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Vérification des accès...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Gestion Comptable - Culte</h2>
      
      {message && (
        <p style={{ padding: '10px', borderRadius: '5px', backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da', color: message.startsWith('✅') ? '#155724' : '#721c24' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label><b>Église / Paroisse :</b></label>
          <select value={church} onChange={(e) => setChurch(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
            <option value="">-- Sélectionner une église --</option>
            <option value="Paroisse 1">Paroisse 1</option>
            <option value="Paroisse 2">Paroisse 2</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><b>Type de mouvement :</b></label>
          <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
            <option value="INCOME">Entrée (Dîmes, Offrandes, Dons)</option>
            <option value="EXPENSE">Sortie (Dépense, Charge)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><b>Compte comptable :</b></label>
          <input
            type="text"
            placeholder="Ex: 701 - Dîmes"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><b>Montant (FCFA) :</b></label>
          <input
            type="number"
            placeholder="Ex: 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label><b>Description / Remarque :</b></label>
          <input
            type="text"
            placeholder="Ex: Dîmes du culte de dimanche"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          Enregistrer la transaction
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/bilan" style={{ color: '#0070f3' }}>📊 Voir le Bilan & L'historique →</a>
      </div>
    </div>
  );
}
