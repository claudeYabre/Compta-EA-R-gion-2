import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [churches, setChurches] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('INCOME');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: churchData } = await supabase.from('churches').select('*');
      const { data: accountData } = await supabase.from('chart_of_accounts').select('*');
      if (churchData) setChurches(churchData);
      if (accountData) setAccounts(accountData);
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChurch || !selectedAccount || !amount) {
      setMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const { error } = await supabase.from('financial_transactions').insert([
      {
        church_id: selectedChurch,
        account_number: selectedAccount,
        amount: parseFloat(amount),
        transaction_type: type,
        description: description
      }
    ]);

    if (error) {
      setMessage('Erreur : ' + error.message);
    } else {
      setMessage('Transaction enregistrée avec succès !');
      setAmount('');
      setDescription('');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: 'auto' }}>
      <h2>Gestion Comptable - Culte</h2>
      {message && <p style={{ color: message.includes('Erreur') ? 'red' : 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Église / Paroisse :</label><br/>
          <select value={selectedChurch} onChange={(e) => setSelectedChurch(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="">-- Sélectionner une église --</option>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Type de mouvement :</label><br/>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="INCOME">Entrée (Dîmes, Offrandes, Dons)</option>
            <option value="EXPENSE">Sortie (Dépenses, Charges, Secours)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Compte comptable :</label><br/>
          <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="">-- Sélectionner un compte --</option>
            {accounts
              .filter(a => type === 'INCOME' ? a.account_type === 'INCOME' : a.account_type === 'EXPENSE')
              .map((a) => (
                <option key={a.account_number} value={a.account_number}>
                  {a.account_number} - {a.label}
                </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Montant (FCFA / Monnaie locale) :</label><br/>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Ex: 50000" 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description / Remarque :</label><br/>
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Ex: Dîmes du culte de dimanche" 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
          Enregistrer la transaction
        </button>
      </form>
    </div>
  );
}
