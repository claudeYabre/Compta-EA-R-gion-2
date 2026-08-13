import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ROLES = [
  { id: 'HQ_ADMIN', label: 'Administrateur HQ (Accès Total)' },
  { id: 'HQ_COMPTABLE', label: 'Comptable Siège / Région' },
  { id: 'SITE_TRESO', label: 'Trésorier de Site / Assemblée' }
];

const INITIAL_SITES = ['E.A Nobéré', 'E.A Manga', 'Siège Régional 2'];

export default function Dashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  const [currentUser, setCurrentUser] = useState({
    name: 'Claude Yabre',
    role: 'HQ_ADMIN',
    site: 'E.A Nobéré'
  });

  const [activeTab, setActiveTab] = useState('SAISIE');
  const [transactions, setTransactions] = useState([]);
  const [selectedSite, setSelectedSite] = useState('E.A Nobéré');
  const [dateOp, setDateOp] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('RECETTE');
  const [codeCompte, setCodeCompte] = useState('701');
  const [libelle, setLibelle] = useState('Dîmes et Offrandes');
  const [montant, setMontant] = useState('');
  const [pieceJointe, setPieceJointe] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Claude Yabre', role: 'HQ_ADMIN', site: 'Siège Régional 2' },
    { id: 2, name: 'Trésorier Manga', role: 'SITE_TRESO', site: 'E.A Manga' }
  ]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const localTx = localStorage.getItem('compt_ea_tx');
    if (localTx) setTransactions(JSON.parse(localTx));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('compt_ea_tx', JSON.stringify(transactions));
  }, [transactions]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPieceJointe(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEcriture = (e) => {
    e.preventDefault();
    if (!montant || parseFloat(montant) <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }

    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? {
        ...t,
        date: dateOp,
        site: selectedSite,
        type,
        codeCompte,
        libelle,
        montant: parseFloat(montant),
        pieceJointe
      } : t));
      setEditingId(null);
      alert('Écriture corrigée avec succès !');
    } else {
      const newTx = {
        id: Date.now(),
        date: dateOp,
        site: selectedSite,
        type,
        codeCompte,
        libelle,
        montant: parseFloat(montant),
        pieceJointe,
        createdOffline: !isOnline
      };
      setTransactions([newTx, ...transactions]);
      alert('Écriture enregistrée !');
    }

    setMontant('');
    setPieceJointe(null);
  };

  const handleGenerateANouveau = () => {
    const totalRecettes = transactions.filter(t => t.site === selectedSite && t.type === 'RECETTE').reduce((a, b) => a + b.montant, 0);
    const totalDepenses = transactions.filter(t => t.site === selectedSite && t.type === 'DEPENSE').reduce((a, b) => a + b.montant, 0);
    const soldeCalcul = totalRecettes - totalDepenses;

    const autoRan = {
      id: Date.now(),
      date: `${new Date().getFullYear() + 1}-01-01`,
      site: selectedSite,
      type: soldeCalcul >= 0 ? 'RECETTE' : 'DEPENSE',
      codeCompte: '891',
      libelle: 'À-Nouveau Automatique (Bilan d\'ouverture)',
      montant: Math.abs(soldeCalcul),
      pieceJointe: null
    };

    setTransactions([autoRan, ...transactions]);
    alert(`À-nouveau généré automatiquement pour ${selectedSite} : ${soldeCalcul.toLocaleString()} FCFA`);
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setDateOp(tx.date);
    setSelectedSite(tx.site);
    setType(tx.type);
    setCodeCompte(tx.codeCompte);
    setLibelle(tx.libelle);
    setMontant(tx.montant.toString());
    setPieceJointe(tx.pieceJointe);
    setActiveTab('SAISIE');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* BARRE SUPÉRIEURE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: 'white', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #0284c7', backgroundColor: 'white', padding: '2px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>COMPT-EA</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{currentUser.name} ({currentUser.role})</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '20px', backgroundColor: isOnline ? '#166534' : '#991b1b', color: 'white' }}>
            {isOnline ? '🟢 En ligne' : '🔴 Mode Hors-Réseau'}
          </span>

          <button
            onClick={handleLogout}
            style={{ backgroundColor: '#be123c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* NAVIGATION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        {[
          { id: 'SAISIE', label: '📝 Saisie' },
          { id: 'JOURNAL', label: '📖 Journal Direct' },
          { id: 'ANOUVEAU', label: '🔄 À-Nouveau' },
          { id: 'USERS', label: '👥 Utilisateurs & HQ' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? '#0284c7' : '#e2e8f0',
              color: activeTab === tab.id ? 'white' : '#334155',
              fontSize: '13px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SAISIE */}
      {activeTab === 'SAISIE' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>
            {editingId ? '✏️ Correction d\'une Écriture' : '📝 Enregistrement d\'une Pièce Comptable'}
          </h3>

          <form onSubmit={handleSaveEcriture} style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>DATE</label>
                <input
                  type="date"
                  value={dateOp}
                  onChange={(e) => setDateOp(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>SITE / ASSEMBLÉE</label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {INITIAL_SITES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>TYPE D'OPÉRATION</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="RECETTE">Recette (Entrée)</option>
                  <option value="DEPENSE">Dépense (Sortie)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>MONTANT FCFA</label>
                <input
                  type="number"
                  placeholder="Ex: 50000"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>LIBELLÉ / DESCRIPTION</label>
              <input
                type="text"
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            {/* ATTACHER UN FICHIER OU CAPTURE PHOTO */}
            <div style={{ border: '2px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284c7', cursor: 'pointer', display: 'block' }}>
                📷 Prendre une photo du reçu ou Télécharger la pièce jointe
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {pieceJointe && (
                <div style={{ marginTop: '8px', color: '#15803d', fontSize: '12px', fontWeight: 'bold' }}>
                  ✅ Pièce comptable attachée !
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: editingId ? '#d97706' : '#059669',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {editingId ? 'Valider la Correction' : 'Enregistrer l\'Écriture'}
            </button>
          </form>
        </div>
      )}

      {/* JOURNAL DIRECT */}
      {activeTab === 'JOURNAL' && (
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>📖 Journal des Écritures ({transactions.length})</h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px' }}>Site</th>
                  <th style={{ padding: '8px' }}>Libellé</th>
                  <th style={{ padding: '8px' }}>Montant</th>
                  <th style={{ padding: '8px' }}>Preuve</th>
                  <th style={{ padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}>{t.date}</td>
                    <td style={{ padding: '8px' }}>{t.site}</td>
                    <td style={{ padding: '8px' }}>{t.libelle}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: t.type === 'RECETTE' ? '#059669' : '#e11d48' }}>
                      {t.type === 'RECETTE' ? '+' : '-'}{t.montant.toLocaleString()} F
                    </td>
                    <td style={{ padding: '8px' }}>
                      {t.pieceJointe ? '📄 Oui' : 'Non'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => handleEdit(t)}
                        style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                      >
                        ✏️ Corriger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* À-NOUVEAU */}
      {activeTab === 'ANOUVEAU' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>🔄 Gestion des À-Nouveau (Reports à Nouveau)</h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Générez ou saisissez le solde de départ au 1er janvier pour chaque assemblée.
          </p>

          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0284c7' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#0369a1' }}>Génération Automatique</h4>
              <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 12px 0' }}>
                Calcule automatiquement le solde final pour l'assemblée **{selectedSite}** et crée l'écriture d'À-nouveau.
              </p>
              <button
                onClick={handleGenerateANouveau}
                style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ⚙️ Générer l'À-Nouveau Automatique
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UTILISATEURS */}
      {activeTab === 'USERS' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>👥 Management des Utilisateurs et Rôles HQ</h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Nom</th>
                  <th style={{ padding: '8px' }}>Rôle</th>
                  <th style={{ padding: '8px' }}>Site / Assemblée</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ padding: '8px' }}>{u.role}</td>
                    <td style={{ padding: '8px' }}>{u.site}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
