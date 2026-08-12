import React, { useState } from 'react';

const CATEGORIES_RECETTES = [
  { id: 'dimes', label: 'Dîmes & Offrandes', icon: '🪙' },
  { id: 'don', label: 'Dons & Prégations', icon: '🎁' },
  { id: 'construction', label: 'Levée de fonds', icon: '🏗️' },
  { id: 'ventes', label: 'Ventes / Livres', icon: '📚' },
];

const CATEGORIES_DEPENSES = [
  { id: 'charite', label: 'Aide sociale / Charité', icon: '🤝' },
  { id: 'factures', label: 'Eau / Électricité', icon: '💡' },
  { id: 'entretien', label: 'Entretien & Travaux', icon: '🛠️' },
  { id: 'pastoral', label: 'Soutien Pastoral', icon: '👔' },
  { id: 'transport', label: 'Transport / Carburant', icon: '⛽' },
];

export default function Home() {
  const [solde, setSolde] = useState(1250000);
  const [type, setType] = useState('RECETTE');
  const [compte, setCompte] = useState('CAISSE_ESPECES');
  const [categorieId, setCategorieId] = useState('');
  const [montant, setMontant] = useState('0');
  const [successMsg, setSuccessMsg] = useState('');

  const handleKeyPress = (val) => {
    if (val === 'C') {
      setMontant('0');
    } else if (val === 'DEL') {
      setMontant((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else {
      setMontant((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const handleValidation = () => {
    const numericMontant = parseFloat(montant);
    if (!categorieId) {
      alert('Veuillez sélectionner une catégorie.');
      return;
    }
    if (numericMontant <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }

    if (type === 'RECETTE') {
      setSolde((prev) => prev + numericMontant);
    } else {
      setSolde((prev) => prev - numericMontant);
    }

    setSuccessMsg(`Transaction de ${numericMontant.toLocaleString()} FCFA enregistrée !`);
    setMontant('0');
    setCategorieId('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const categories = type === 'RECETTE' ? CATEGORIES_RECETTES : CATEGORIES_DEPENSES;

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* En-tête avec Logo Officiel */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <img 
          src="/logo.png" 
          alt="Logo Église" 
          style={{ height: '60px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* En-tête / Solde */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Centralisation des comptes EA Région 2 • Solde Caisse
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{solde.toLocaleString()} FCFA</span>
          <span>💼</span>
        </div>
      </div>

      {/* Message de succès */}
      {successMsg && (
        <div style={{ backgroundColor: '#d1fae5', border: '1px solid #34d399', color: '#065f46', padding: '10px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Commutateur Entrée / Sortie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
        <button
          type="button"
          onClick={() => { setType('RECETTE'); setCategorieId(''); }}
          style={{
            padding: '10px',
            borderRadius: '8px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: type === 'RECETTE' ? '#059669' : 'transparent',
            color: type === 'RECETTE' ? 'white' : '#475569'
          }}
        >
          ⬇️ Entrée (+)
        </button>
        <button
          type="button"
          onClick={() => { setType('DEPENSE'); setCategorieId(''); }}
          style={{
            padding: '10px',
            borderRadius: '8px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: type === 'DEPENSE' ? '#e11d48' : 'transparent',
            color: type === 'DEPENSE' ? 'white' : '#475569'
          }}
        >
          ⬆️ Sortie (-)
        </button>
      </div>

      {/* Choix du Compte */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Compte / Mode
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {['CAISSE_ESPECES', 'MOBILE_MONEY', 'BANQUE'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCompte(m)}
              style={{
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                backgroundColor: compte === m ? '#1e293b' : 'white',
                color: compte === m ? 'white' : '#334155'
              }}
            >
              {m === 'CAISSE_ESPECES' ? '💵 Espèces' : m === 'MOBILE_MONEY' ? '📱 Mobile' : '🏦 Banque'}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection Catégorie */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Catégorie ({type === 'RECETTE' ? 'Entrée' : 'Sortie'})
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategorieId(cat.id)}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: categorieId === cat.id ? `2px solid ${type === 'RECETTE' ? '#059669' : '#e11d48'}` : '1px solid #e2e8f0',
                backgroundColor: categorieId === cat.id ? (type === 'RECETTE' ? '#ecfdf5' : '#fff1f2') : 'white',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '20px' }}>{cat.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Affichage du Montant */}
      <div style={{ backgroundColor: 'white', border: '2px solid #cbd5e1', borderRadius: '16px', padding: '12px', marginBottom: '16px', textAlign: 'right' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Montant à saisir</div>
        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>
          {parseInt(montant, 10).toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#64748b' }}>FCFA</span>
        </div>
      </div>

      {/* Pavé Numérique Tactile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((btn) => (
          <button
            key={btn}
            type="button"
            onClick={() => handleKeyPress(btn)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              backgroundColor: btn === 'C' ? '#ffe4e6' : btn === 'DEL' ? '#fef3c7' : 'white',
              color: btn === 'C' ? '#be123c' : btn === 'DEL' ? '#b45309' : '#1e293b'
            }}
          >
            {btn === 'DEL' ? '⌫' : btn}
          </button>
        ))}
      </div>

      {/* Bouton de Validation */}
      <button
        type="button"
        onClick={handleValidation}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: type === 'RECETTE' ? '#059669' : '#e11d48'
        }}
      >
        Enregistrer la transaction
      </button>
    </div>
  );
}
