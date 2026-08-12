import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// LISTE INITIALE DES ÉGLISES
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

// PLAN COMPTABLE INITIAL ISSU DE VOTRE TABLEAU
const INITIAL_ACCOUNTS = [
  // RECETTES
  { code: '1', label: '1 - DIMES', type: 'INCOME' },
  { code: '2', label: '2 - offrande spéciale construction', type: 'INCOME' },
  { code: '3', label: '3 - Cotisation pour la construction', type: 'INCOME' },
  { code: '4', label: '4 - Offrandes spéciales', type: 'INCOME' },
  { code: '5', label: '5 - Dons spéciaux', type: 'INCOME' },
  { code: '6', label: '6 - Ventes des céréales', type: 'INCOME' },
  { code: '7', label: '7 - Autre Entrée', type: 'INCOME' },

  // DÉPENSES (100)
  { code: '101', label: '101 - Dimes des dimes', type: 'EXPENSE' },
  { code: '102', label: '102 - Soutien du pasteur', type: 'EXPENSE' },
  { code: '103', label: '103 - Assurance maladie', type: 'EXPENSE' },
  { code: '104', label: '104 - Carburant véhicule', type: 'EXPENSE' },
  { code: '105', label: '105 - Frais de déplacement transports', type: 'EXPENSE' },
  { code: '106', label: '106 - Téléphone', type: 'EXPENSE' },
  { code: '107', label: '107 - Impôt et taxe sur salaires', type: 'EXPENSE' },
  { code: '108', label: '108 - Caisse régionale', type: 'EXPENSE' },
  { code: '109', label: '109 - Caisse Nationale', type: 'EXPENSE' },
  { code: '110', label: '110 - Electricité / Bois / carburant groupe/Gaz', type: 'EXPENSE' },
  { code: '111', label: '111 - Frais ONEA', type: 'EXPENSE' },
  { code: '112', label: '112 - Frais de banque', type: 'EXPENSE' },
  { code: '113', label: '113 - Soutien a des personnes en difficultés', type: 'EXPENSE' },

  // DÉPENSES (200)
  { code: '201', label: '201 - Frais de formation', type: 'EXPENSE' },
  { code: '202', label: '202 - Restauration visiteurs', type: 'EXPENSE' },
  { code: '203', label: '203 - Entretien mobilier', type: 'EXPENSE' },
  { code: '204', label: '204 - Achat et maintenance de matériel de music', type: 'EXPENSE' },
  { code: '205', label: '205 - Entretien et réparations véhicules', type: 'EXPENSE' },
  { code: '206', label: '206 - soutiens aux différents mouvements', type: 'EXPENSE' },
  { code: '207', label: '207 - Achat matériel et mobilier de bureau', type: 'EXPENSE' },
  { code: '208', label: '208 - Frais de fourniture', type: 'EXPENSE' },
  { code: '209', label: '209 - Autres', type: 'EXPENSE' },
  { code: '210', label: '210 - Construction', type: 'EXPENSE' },

  // DÉPENSES (300)
  { code: '301', label: '301 - Entretien bâtiments de bâtiments', type: 'EXPENSE' },
  { code: '302', label: '302 - Entretien matériels + machines+ tam tam', type: 'EXPENSE' },

  // DÉPENSES (400)
  { code: '401', label: '401 - compte de réserve', type: 'EXPENSE' },
  { code: '402', label: '402 - Amortissement et réparation sono', type: 'EXPENSE' },
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Gestion des églises
  const [churches, setChurches] = useState(INITIAL_CHURCHES);
  const [selectedChurch, setSelectedChurch] = useState('');
  const [newChurchInput, setNewChurchInput] = useState('');
  const [isAddingNewChurch, setIsAddingNewChurch] = useState(false);

  // Gestion du plan comptable
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [transactionType, setTransactionType] = useState('INCOME');
  const [accountNumber, setAccountNumber] = useState('1');
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [newAccountCode, setNewAccountCode] = useState('');
  const [newAccountLabel, setNewAccountLabel] = useState('');

  // Saisie financière
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/login');
    } else {
      // Charger églises
      const savedChurches = localStorage.getItem('custom_churches');
      if (savedChurches) {
        try { setChurches(JSON.parse(savedChurches)); } catch (e) { console.error(e); }
      }
      // Charger comptes personnalisés
      const savedAccounts = localStorage.getItem('custom_accounts');
      if (savedAccounts) {
        try { setAccounts(JSON.parse(savedAccounts)); } catch (e) { console.error(e); }
      }
      setLoading(false);
    }
  }, [router]);

  // Changement de type d'opération (Entrée / Sortie)
  const handleTypeChange = (newType) => {
    setTransactionType(newType);
    setIsAddingNewAccount(false);
    const available = accounts.filter((acc) => acc.type === newType);
    if (available.length > 0) {
      setAccountNumber(available[0].code);
    }
  };

  const handleChurchChange = (e) => {
    const val = e.target.value;
    if (val === 'ADD_NEW') {
      setIsAddingNewChurch(true);
      setSelectedChurch('');
    } else {
      setIsAddingNewChurch(false);
      setSelectedChurch(val);
    }
  };

  const handleAccountSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'ADD_NEW_ACCOUNT') {
      setIsAddingNewAccount(true);
    } else {
      setIsAddingNewAccount(false);
      setAccountNumber(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation/Ajout de l'église
    let finalChurchName = selectedChurch;
    if (isAddingNewChurch) {
      const trimmed = newChurchInput.trim();
      if (!trimmed) {
        setMessage('❌ Veuillez indiquer le nom de la nouvelle église.');
        return;
      }
      finalChurchName = trimmed;
      if (!churches.includes(trimmed)) {
        const updatedList = [...churches, trimmed];
        setChurches(updatedList);
        localStorage.setItem('custom_churches', JSON.stringify(updatedList));
      }
    }

    if (!finalChurchName) {
      setMessage('❌ Veuillez sélectionner une église.');
      return;
    }

    // 2. Validation/Ajout du nouveau compte comptable
    let finalAccountCode = accountNumber;
    if (isAddingNewAccount) {
      const codeTrimmed = newAccountCode.trim();
      const labelTrimmed = newAccountLabel.trim();

      if (!codeTrimmed || !labelTrimmed) {
        setMessage('❌ Veuillez remplir le numéro et l\'intitulé du nouveau compte.');
        return;
      }

      finalAccountCode = codeTrimmed;
      const fullLabel = `${codeTrimmed} - ${labelTrimmed}`;

      // Vérifier si le compte existe déjà
      const exists = accounts.some((a) => a.code === codeTrimmed && a.type === transactionType);
      if (!exists) {
        const updatedAccounts = [...accounts, { code: codeTrimmed, label: fullLabel, type: transactionType }];
        setAccounts(updatedAccounts);
        localStorage.setItem('custom_accounts', JSON.stringify(updatedAccounts));
      }
    }

    setMessage('Enregistrement en cours...');

    // 3. Enregistrement dans Supabase
    const { error } = await supabase.from('financial_transactions').insert([
      {
        church_id: finalChurchName,
        transaction_type: transactionType,
        account_number: finalAccountCode,
        amount: parseFloat(amount),
        description: description,
      },
    ]);

    if (error) {
      setMessage('❌ Erreur : ' + error.message);
    } else {
      setMessage('✅ Transaction enregistrée avec succès !');
      setAmount('');
      setDescription('');
      setNewChurchInput('');
      setNewAccountCode('');
      setNewAccountLabel('');
      setIsAddingNewChurch(false);
      setIsAddingNewAccount(false);
      setSelectedChurch(finalChurchName);
      setAccountNumber(finalAccountCode);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Vérification des accès...</p>;

  const filteredAccounts = accounts.filter((acc) => acc.type === transactionType);

  return (
    <div style={{ maxWidth: '520px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Gestion Comptable - Culte</h2>
      
      {message && (
        <p style={{ padding: '10px', borderRadius: '5px', backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da', color: message.startsWith('✅') ? '#155724' : '#721c24' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* ÉGLISE */}
        <div style={{ marginBottom: '15px' }}>
          <label><b>Église / Paroisse :</b></label>
          <select 
            value={isAddingNewChurch ? 'ADD_NEW' : selectedChurch} 
            onChange={handleChurchChange} 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }} 
            required
          >
            <option value="">-- Sélectionner une église --</option>
            {churches.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
            <option value="ADD_NEW" style={{ fontWeight: 'bold', color: '#0070f3' }}>
              ➕ Ajouter une nouvelle église...
            </option>
          </select>

          {isAddingNewChurch && (
            <input
              type="text"
              placeholder="Nom de la nouvelle église"
              value={newChurchInput}
              onChange={(e) => setNewChurchInput(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '8px', boxSizing: 'border-box', border: '2px solid #0070f3', borderRadius: '5px' }}
              required
            />
          )}
        </div>

        {/* TYPE DE MOUVEMENT */}
        <div style={{ marginBottom: '15px' }}>
          <label><b>Type de mouvement :</b></label>
          <select 
            value={transactionType} 
            onChange={(e) => handleTypeChange(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginTop: '5px', fontWeight: 'bold' }}
          >
            <option value="INCOME">📥 RECETTES (Entrées)</option>
            <option value="EXPENSE">📤 DÉPENSES (Sorties)</option>
          </select>
        </div>

        {/* SELECTION / AJOUT DE COMPTE */}
        <div style={{ marginBottom: '15px' }}>
          <label><b>Compte comptable ({transactionType === 'INCOME' ? 'Recette' : 'Dépense'}) :</b></label>
          <select 
            value={isAddingNewAccount ? 'ADD_NEW_ACCOUNT' : accountNumber} 
            onChange={handleAccountSelectChange} 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            required
          >
            {filteredAccounts.map((acc) => (
              <option key={acc.code} value={acc.code}>
                {acc.label}
              </option>
            ))}
            <option value="ADD_NEW_ACCOUNT" style={{ fontWeight: 'bold', color: '#0070f3' }}>
              ➕ Ajouter une nouvelle ligne (compte)...
            </option>
          </select>

          {/* Saisie d'une nouvelle ligne / compte comptable */}
          {isAddingNewAccount && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f7ff', border: '1px solid #0070f3', borderRadius: '5px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#0070f3' }}>
                Créer une nouvelle ligne en {transactionType === 'INCOME' ? 'Recette' : 'Dépense'} :
              </p>
              <input
                type="text"
                placeholder="N° Compte (Ex: 114 ou 8)"
                value={newAccountCode}
                onChange={(e) => setNewAccountCode(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
                required
              />
              <input
                type="text"
                placeholder="Désignation / Intitulé (Ex: Offrande de moisson)"
                value={newAccountLabel}
                onChange={(e) => setNewAccountLabel(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                required
              />
            </div>
          )}
        </div>

        {/* MONTANT */}
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

        {/* DESCRIPTION */}
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
