import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const INITIAL_CHURCHES = [
  "E.A Nobéré", "E.A Manga", "E.A Sarogho", "E.A Guéré", "E.A Bindé",
  "E.A Béré", "E.A Kombissiri", "E.A Zanghogo", "E.A Bonheur ville",
  "E.A Tanghin", "E.A Wentenga", "E.A TShalom"
];

const INITIAL_ACCOUNTS = [
  { code: '1', label: '1 - DIMES', type: 'INCOME' },
  { code: '2', label: '2 - offrande spéciale construction', type: 'INCOME' },
  { code: '3', label: '3 - Cotisation pour la construction', type: 'INCOME' },
  { code: '4', label: '4 - Offrandes spéciales', type: 'INCOME' },
  { code: '5', label: '5 - Dons spéciaux', type: 'INCOME' },
  { code: '6', label: '6 - Ventes des céréales', type: 'INCOME' },
  { code: '7', label: '7 - Autre Entrée', type: 'INCOME' },
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
  { code: '301', label: '301 - Entretien bâtiments de bâtiments', type: 'EXPENSE' },
  { code: '302', label: '302 - Entretien matériels + machines+ tam tam', type: 'EXPENSE' },
  { code: '401', label: '401 - compte de réserve', type: 'EXPENSE' },
  { code: '402', label: '402 - Amortissement et réparation sono', type: 'EXPENSE' },
];

// Composant SVG du Logo de l'Église
function ChurchLogo({ size = 80, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ opacity }}>
      {/* Croix */}
      <rect x="90" y="20" width="20" height="110" fill="#003399" />
      <rect x="50" y="50" width="100" height="20" fill="#003399" />
      {/* Bible Ouverte */}
      <path d="M 20 150 Q 100 130 100 165 Q 100 130 180 150 L 180 160 Q 100 140 100 175 Q 100 140 20 160 Z" fill="#003399" />
      {/* Colombe */}
      <path d="M 50 80 Q 90 120 110 125 Q 130 120 170 70 Q 140 100 120 110 Q 130 90 120 80 Q 100 100 90 95 Q 70 85 50 80 Z" stroke="#003399" strokeWidth="3" fill="none" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [churches, setChurches] = useState(INITIAL_CHURCHES);
  const [selectedChurch, setSelectedChurch] = useState('');
  const [newChurchInput, setNewChurchInput] = useState('');
  const [isAddingNewChurch, setIsAddingNewChurch] = useState(false);

  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [transactionType, setTransactionType] = useState('INCOME');
  const [accountNumber, setAccountNumber] = useState('1');
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [newAccountCode, setNewAccountCode] = useState('');
  const [newAccountLabel, setNewAccountLabel] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [transactionDate, setTransactionDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/login');
    } else {
      const savedChurches = localStorage.getItem('custom_churches');
      if (savedChurches) try { setChurches(JSON.parse(savedChurches)); } catch (e) {}
      const savedAccounts = localStorage.getItem('custom_accounts');
      if (savedAccounts) try { setAccounts(JSON.parse(savedAccounts)); } catch (e) {}
      setLoading(false);
    }
  }, [router]);

  const handleTypeChange = (newType) => {
    setTransactionType(newType);
    setIsAddingNewAccount(false);
    const available = accounts.filter((acc) => acc.type === newType);
    if (available.length > 0) setAccountNumber(available[0].code);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const exists = accounts.some((a) => a.code === codeTrimmed && a.type === transactionType);
      if (!exists) {
        const updatedAccounts = [...accounts, { code: codeTrimmed, label: fullLabel, type: transactionType }];
        setAccounts(updatedAccounts);
        localStorage.setItem('custom_accounts', JSON.stringify(updatedAccounts));
      }
    }

    setMessage('Enregistrement en cours...');

    const { error } = await supabase.from('financial_transactions').insert([
      {
        church_id: finalChurchName,
        transaction_type: transactionType,
        account_number: finalAccountCode,
        amount: parseFloat(amount),
        description: description,
        created_at: transactionDate ? new Date(transactionDate).toISOString() : new Date().toISOString(),
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
    }
  };

  if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>Vérification des accès...</p>;

  const filteredAccounts = accounts.filter((acc) => acc.type === transactionType);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f6fb',
      backgroundImage: `radial-gradient(#003399 0.5px, transparent 0.5px)`,
      backgroundSize: '24px 24px',
      position: 'relative',
      padding: '20px 15px',
      fontFamily: 'Segoe UI, Roboto, sans-serif'
    }}>
      {/* Logo Filigrane de fond */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <ChurchLogo size={420} opacity={0.06} />
      </div>

      <div style={{
        maxWidth: '520px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 51, 153, 0.08)',
        padding: '30px 25px',
        position: 'relative',
        zIndex: 1,
        borderTop: '6px solid #003399'
      }}>
        {/* En-tête avec Logo */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
         function ChurchLogo({ size = 80, opacity = 1 }) {
  return (
    <img 
      src="/logo.png" 
      alt="Logo Église" 
      style={{ 
        width: `${size}px`, 
        height: 'auto', 
        opacity: opacity,
        mixBlendMode: 'multiply'
      }} 
    />
  );
}

        {message && (
          <p style={{
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: message.startsWith('✅') ? '#e6f4ea' : '#fce8e6',
            color: message.startsWith('✅') ? '#137333' : '#c5221f',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* DATE */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#003399', fontWeight: 'bold', fontSize: '14px' }}>Date de l'opération :</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>

          {/* ÉGLISE */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#003399', fontWeight: 'bold', fontSize: '14px' }}>Église / Paroisse :</label>
            <select 
              value={isAddingNewChurch ? 'ADD_NEW' : selectedChurch} 
              onChange={handleChurchChange} 
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc' }} 
              required
            >
              <option value="">-- Sélectionner une église --</option>
              {churches.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
              <option value="ADD_NEW" style={{ fontWeight: 'bold', color: '#003399' }}>
                ➕ Ajouter une nouvelle église...
              </option>
            </select>

            {isAddingNewChurch && (
              <input
                type="text"
                placeholder="Nom de la nouvelle église"
                value={newChurchInput}
                onChange={(e) => setNewChurchInput(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '8px', boxSizing: 'border-box', border: '2px solid #003399', borderRadius: '6px' }}
                required
              />
            )}
          </div>

          {/* TYPE DE MOUVEMENT */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#003399', fontWeight: 'bold', fontSize: '14px' }}>Type de mouvement :</label>
            <select 
              value={transactionType} 
              onChange={(e) => handleTypeChange(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}
            >
              <option value="INCOME">📥 RECETTES (Entrées)</option>
              <option value="EXPENSE">📤 DÉPENSES (Sorties)</option>
            </select>
          </div>

          {/* COMPTE */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#003399', fontWeight: 'bold', fontSize: '14px' }}>Compte comptable :</label>
            <select 
              value={isAddingNewAccount ? 'ADD_NEW_ACCOUNT' : accountNumber} 
              onChange={(e) => {
                if (e.target.value === 'ADD_NEW_ACCOUNT') setIsAddingNewAccount(true);
                else { setIsAddingNewAccount(false); setAccountNumber(e.target.value); }
              }} 
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc' }}
              required
            >
              {filteredAccounts.map((acc) => (
                <option key={acc.code} value={acc.code}>{acc.label}</option>
              ))}
              <option value="ADD_NEW_ACCOUNT" style={{ fontWeight: 'bold', color: '#003399' }}>
                ➕ Ajouter une nouvelle ligne (compte)...
              </option>
            </select>

            {isAddingNewAccount && (
              <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#eef3ff', border: '1px solid #003399', borderRadius: '6px' }}>
                <input
                  type="text"
                  placeholder="N° Compte (Ex: 114)"
                  value={newAccountCode}
                  onChange={(e) => setNewAccountCode(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
                <input
                  type="text"
                  placeholder="Intitulé du compte"
                  value={newAccountLabel}
                  onChange={(e) => setNewAccountLabel(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
              </div>
            )}
          </div>

          {/* MONTANT */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#003399', fontWeight: 'bold', fontSize: '14px' }}>Montant (FCFA) :</label>
            <input
              type="number"
              placeholder="Ex: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#003399', fontWeight: 'bold', fontSize: '14px' }}>Description / Libellé :</label>
            <input
              type="text"
              placeholder="Ex: Dîmes du culte de dimanche"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#003399',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            Enregistrer la transaction
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/bilan" style={{ color: '#003399', textDecoration: 'none', fontWeight: 'bold' }}>📊 Voir le Bilan & L'historique →</a>
        </div>
      </div>
    </div>
  );
}
