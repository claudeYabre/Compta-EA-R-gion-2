import React, { useState } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, CheckCircle } from 'lucide-react';

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

  const handleValidation = async () => {
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
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen p-4 font-sans text-slate-800 border rounded-xl shadow-lg">
      
      {/* En-tête avec Logo Officiel */}
      <div className="flex items-center justify-center mb-3">
        <img 
          src="/logo.png" 
          alt="Logo Église" 
          style={{ height: '60px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* En-tête / Solde */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4 shadow">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          Centralisation des comptes EA Région 2 • Solde Caisse
        </div>
        <div className="text-2xl font-bold mt-1 flex items-center justify-between">
          <span>{solde.toLocaleString()} FCFA</span>
          <Wallet className="text-emerald-400" />
        </div>
      </div>

      {/* Message de succès */}
      {successMsg && (
        <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-2 rounded-xl mb-4 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Commutateur Entrée / Sortie */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-200 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => { setType('RECETTE'); setCategorieId(''); }}
          className={`py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
            type === 'RECETTE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600'
          }`}
        >
          <ArrowDownCircle className="w-5 h-5" /> Entrée (+)
        </button>
        <button
          type="button"
          onClick={() => { setType('DEPENSE'); setCategorieId(''); }}
          className={`py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
            type === 'DEPENSE' ? 'bg-rose-600 text-white shadow' : 'text-slate-600'
          }`}
        >
          <ArrowUpCircle className="w-5 h-5" /> Sortie (-)
        </button>
      </div>

      {/* Choix du Compte */}
      <div className="mb-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
          Compte / Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['CAISSE_ESPECES', 'MOBILE_MONEY', 'BANQUE'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCompte(m)}
              className={`py-2 px-1 text-xs font-semibold rounded-lg border transition ${
                compte === m ? 'border-slate-800 bg-slate-800 text-white' : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {m === 'CAISSE_ESPECES' ? '💵 Espèces' : m === 'MOBILE_MONEY' ? '📱 Mobile' : '🏦 Banque'}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection Catégorie */}
      <div className="mb-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
          Catégorie ({type === 'RECETTE' ? 'Entrée' : 'Sortie'})
        </label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategorieId(cat.id)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                categorieId === cat.id
                  ? type === 'RECETTE'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600'
                    : 'border-rose-600 bg-rose-50 ring-2 ring-rose-600'
                  : 'bg-white border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-bold text-slate-700">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Affichage du Montant */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-3 mb-4 text-right shadow-inner">
        <div className="text-xs text-slate-400 font-semibold uppercase">Montant à saisir</div>
        <div className="text-3xl font-black text-slate-900">
          {parseInt(montant, 10).toLocaleString()} <span className="text-lg font-normal text-slate-500">FCFA</span>
        </div>
      </div>

      {/* Pavé Numérique Tactile */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((btn) => (
          <button
            key={btn}
            type="button"
            onClick={() => handleKeyPress(btn)}
            className={`py-3 rounded-xl font-bold text-lg shadow-sm border transition active:scale-95 ${
              btn === 'C'
                ? 'bg-rose-100 text-rose-700 border-rose-200'
                : btn === 'DEL'
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-white text-slate-800 border-slate-200 active:bg-slate-200'
            }`}
          >
            {btn === 'DEL' ? '⌫' : btn}
          </button>
        ))}
      </div>

      {/* Bouton de Validation */}
      <button
        type="button"
        onClick={handleValidation}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition active:scale-98 ${
          type === 'RECETTE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
        }`}
      >
        Enregistrer la transaction
      </button>
    </div>
  );
}
