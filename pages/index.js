import React, { useState } from 'react';

// LISTE INITIALE DES ÉGLISES
const INITIAL_EGLISES = [
  'E.A Nobéré',
  'E.A Manga',
];

// PLAN COMPTABLE DES RECETTES (Classe 7)
const CATEGORIES_RECETTES = [
  { id: '701', label: 'Dîmes et Offrandes', icon: '🪙' },
  { id: '702', label: 'Dons et Libéralités', icon: '🎁' },
  { id: '703', label: 'Levée de fonds / Construction', icon: '🏗️' },
  { id: '704', label: 'Vente de livres / Matériel', icon: '📚' },
  { id: '705', label: 'Cotisations des départements', icon: '👥' },
  { id: '706', label: 'Autres Recettes', icon: '➕' }
];

// PLAN COMPTABLE DES DÉPENSES (Classe 6)
const CATEGORIES_DEPENSES = [
  { id: '601', label: 'Aide sociale / Charité', icon: '🤝' },
  { id: '602', label: 'Factures (Eau / Électricité / Internet)', icon: '💡' },
  { id: '603', label: 'Entretien et Réparations', icon: '🛠️' },
  { id: '604', label: 'Soutien Pastoral et Honoraires', icon: '👔' },
  { id: '605', label: 'Transport / Carburant / Mission', icon: '⛽' },
  { id: '606', label: 'Fournitures de bureau / Papeterie', icon: '📝' },
  { id: '607', label: 'Achats d\'équipements et Matériels', icon: '🔊' },
  { id: '608', label: 'Autres Dépenses', icon: '➖' }
];

export default function Home() {
  const [solde, setSolde] = useState(1250000);
  const [type, setType] = useState('RECETTE');
  
  // Gestion de la liste des églises
  const [eglisesList, setEglisesList] = useState(INITIAL_EGLISES);
  const [eglise, setEglise] = useState(INITIAL_EGLISES[0]);
  const [showAddEglise, setShowAddEglise] = useState(false);
  const [newEgliseName, setNewEgliseName] = useState('');

  const [compte, setCompte] = useState('CAISSE_ESPECES');
  const [categorieId, setCategorieId] = useState('');
  const [montant, setMontant] = useState('0');
  const [successMsg, setSuccessMsg] = useState('');

  // Fonction pour ajouter une église à la liste
  const handleAddEglise = () => {
    const trimmed = newEgliseName.trim();
    if (!trimmed) {
      alert('Veuillez saisir le nom de l\'église.');
      return;
    }
    if (eglisesList.includes(trimmed)) {
      alert('Cette église existe déjà dans la liste.');
      return;
    }
    setEglisesList([...eglisesList, trimmed]);
    setEglise(trimmed);
    setNewEgliseName('');
    setShowAddEglise(false);
  };

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
      alert('Veuillez sélectionner un compte / une catégorie.');
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

    setSuccessMsg(`Transaction de ${numericMontant.toLocaleString()} FCFA enregistrée pour : ${eglise}`);
    setMontant('0');
    setCategorieId('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const categories = type === 'RECETTE' ? CATEGORIES_RECETTES : CATEGORIES_DEPENSES;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <img 
          src="/logo.png" 
          alt="Logo Église" 
          style={{ height: '65px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* Carte Solde & Entête */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Comptabilité EA Région 2 • Solde Actuel
        </div>
        <div style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{solde.toLocaleString()} FCFA</span>
          <span>💼</span>
        </div>
      </div>

      {/* Message de succès */}
      {successMsg && (
        <div style={{ backgroundColor: '#d1fae5', border: '1px solid #34d399', color: '#065f46', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* SELECTION / AJOUT DE L'EGLISE */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
            Sélectionner l&apos;Église / Assemblée
          </label>
          <button
            type="button"
            onClick={() => setShowAddEglise(!showAddEglise)}
            style={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {showAddEglise ? 'Fermer' : '➕ Ajouter une église'}
          </button>
        </div>

        {/* Champ de création d'une nouvelle église */}
        {showAddEglise && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '10px' }}>
            <input
              type="text"
              placeholder="Ex: E.A Manga 2"
              value={newEgliseName}
              onChange={(e) => setNewEgliseName(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={handleAddEglise}
              style={{
                backgroundColor: '#0284c7',
                color: 'white',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Ajouter
            </button>
          </div>
        )}

        <select
          value={eglise}
          onChange={(e) => {
            if (e.target.value === '__ADD_NEW__') {
              setShowAddEglise(true);
            } else {
              setEglise(e.target.value);
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            backgroundColor: 'white',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            outline: 'none'
          }}
        >
          {eglisesList.map((item) => (
            <option key={item} value={item}>
              ⛪ {item}
            </option>
          ))}
          <option value="__ADD_NEW__">➕ + Ajouter une nouvelle église...</option>
        </select>
      </div>

      {/* TYPE : ENTREE OU SORTIE */}
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
          ⬇️ Entrée (Recette)
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
          ⬆️ Sortie (Dépense)
        </button>
      </div>

      {/* MODE DE REGLEMENT */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Mode de règlement / Compte
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { id: 'CAISSE_ESPECES', label: '💵 Espèces' },
            { id: 'MOBILE_MONEY', label: '📱 Mobile' },
            { id: 'BANQUE', label: '🏦 Banque' }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCompte(m.id)}
              style={{
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                backgroundColor: compte === m.id ? '#1e293b' : 'white',
                color: compte === m.id ? 'white' : '#334155'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* PLAN COMPTABLE / CATEGORIES */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Plan comptable - {type === 'RECETTE' ? 'Recettes (Classe 7)' : 'Dépenses (Classe 6)'}
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
              <span style={{ fontSize: '18px' }}>{cat.icon}</span>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>Compte {cat.id}</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>{cat.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AFFICHAGE DU MONTANT */}
      <div style={{ backgroundColor: 'white', border: '2px solid #cbd5e1', borderRadius: '16px', padding: '12px', marginBottom: '16px', textAlign: 'right' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Montant à saisir</div>
        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>
          {parseInt(montant, 10).toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#64748b' }}>FCFA</span>
        </div>
      </div>

      {/* PAVÉ NUMÉRIQUE TACTILE */}
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

      {/* BOUTON D'ENREGISTREMENT */}
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
