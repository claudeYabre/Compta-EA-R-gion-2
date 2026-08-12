import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// LISTE INITIALE DE DÉPART
const INITIAL_CHURCHES = [
  "E.A Nobéré",
  "E.A Manga",
  "E.A Sarogho",
  "E.A Guéré",
  "E.A Bindé",
  "E.A Béré",
  "E.A Kombissiri",
  "E.A Zanghogo",
  "E.A Bonheur ville",
  "E.A Tanghin",
  "E.A Wentenga",
  "E.A TShalom"
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Églises dynamique
  const [churches, setChurches] = useState(INITIAL_CHURCHES);
  const [selectedChurch, setSelectedChurch] = useState('');
  const [newChurchInput, setNewChurchInput] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Formulaire state
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
      // Charger les églises sauvegardées localement si elles existent
      const savedChurches = localStorage.getItem('custom_churches');
      if (savedChurches) {
        try {
          const parsed = JSON.parse(savedChurches);
          setChurches(parsed);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
  }, [router]);

  const handleChurchChange = (e) => {
    const value = e.target.value;
    if (value === 'ADD_NEW') {
      setIsAddingNew(true);
      setSelectedChurch('');
    } else {
      setIsAddingNew(false);
      setSelectedChurch(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalChurchName = selectedChurch;

    // Si l'utilisateur ajoute une nouvelle église à la volée
    if (isAddingNew) {
      const trimmed = newChurchInput.trim();
      if (!trimmed) {
        setMessage('❌ Veuillez saisir le nom de la nouvelle église.');
        return;
      }
      finalChurchName = trimmed;

      // Ajouter la nouvelle église à la liste si pas encore présente
      if (!churches.includes(trimmed)) {
        const updatedList = [...churches, trimmed];
        setChurches(updatedList);
        localStorage.setItem('custom_churches', JSON.stringify(updatedList));
      }
    }

    if (!finalChurchName) {
      setMessage('❌ Veuillez sélectionner ou ajouter une église.');
      return;
    }

    setMessage('Enregistrement en cours...');

    const { error } = await supabase.from('financial_transactions').insert([
      {
        church_id: finalChurchName,
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
      setNewChurchInput('');
      setIsAddingNew(false);
      setSelectedChurch(finalChurchName);
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
          <select 
            value={isAddingNew ? 'ADD_NEW' : selectedChurch} 
            onChange={handleChurchChange} 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }} 
            required
          >
            <option value="">-- Sélectionner une église --</option>
            {churches.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
            <option value="ADD_NEW" style={{ fontWeight: 'bold', color: '#0070f3' }}>
              ➕ Ajouter une nouvelle église...
            </option>
          </select>

          {/* Champ pour saisir le nom de la nouvelle église */}
          {isAddingNew && (
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Saisissez le nom de la nouvelle église (ex: E.A Manga 2)"
                value={newChurchInput}
                onChange={(e) => setNewChurchInput(e.target.value)}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '2px solid #0070f3', borderRadius: '5px' }}
                required
              />
            </div>
          )}
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
