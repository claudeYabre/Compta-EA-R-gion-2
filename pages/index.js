import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase'; // Assurez-vous du chemin exact vers votre client Supabase

const PLAN_COMPTABLE = {
  DEPENSE: [
    { code: '101', label: '101 - Dimes des dimes' },
    { code: '102', label: '102 - Soutien du pasteur' },
    { code: '103', label: '103 - Assurance maladie' },
    { code: '104', label: '104 - Carburant véhicule' },
    { code: '105', label: '105 - Frais de déplacement transports' },
    { code: '106', label: '106 - Téléphone' },
    { code: '107', label: '107 - Impôt et taxe sur salaires' },
    { code: '108', label: '108 - Caisse régionale' },
    { code: '109', label: '109 - Caisse Nationale' },
    { code: '110', label: '110 - Electricité / Bois / carburant groupe/Gaz' },
    { code: '111', label: '111 - Frais ONEA' },
    { code: '112', label: '112 - Frais de banque' },
    { code: '113', label: '113 - Soutien a des personnes en difficultés' },
    { code: '201', label: '201 - Frais de formation' },
    { code: '202', label: '202 - Restauration visiteurs' },
    { code: '203', label: '203 - Entretien mobilier' },
    { code: '204', label: '204 - Achat et maintenance de matériel de music' },
    { code: '205', label: '205 - Entretien et réparations véhicules' },
    { code: '206', label: '206 - soutiens aux différents mouvements' },
    { code: '207', label: '207 - Achat matériel et mobilier de bureau' },
    { code: '208', label: '208 - Frais de fourniture' },
    { code: '209', label: '209 - Autres' },
    { code: '210', label: '210 - Construction' },
    { code: '301', label: '301 - Entretien bâtiments de bâtiments' },
    { code: '302', label: '302 - Entretien matériels + machines+ tam tam' },
    { code: '401', label: '401 - compte de réserve' },
    { code: '402', label: '402 - Amortissement et réparation sono' },
  ],
  RECETTE: [
    { code: '1', label: '1 - DIMES' },
    { code: '2', label: '2 - offrande spéciale construction' },
    { code: '3', label: '3 - Cotisation pour la construction' },
    { code: '4', label: '4 - Offrandes spéciales' },
    { code: '5', label: '5 - Dons spéciaux' },
    { code: '6', label: '6 - Ventes des céréales' },
    { code: '7', label: '7 - Autre Entrée' },
  ]
};

const MODES_PAIEMENT = ['Espèces', 'Mobile Money', 'Banque'];

export default function Dashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  // Utilisateur actuellement connecté
  const [currentUser, setCurrentUser] = useState(null);

  // Données configurables
  const [sites, setSites] = useState([]);
  const [newSiteName, setNewSiteName] = useState('');

  const [usersList, setUsersList] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('SITE_TRESO');
  const [newUserSite, setNewUserSite] = useState('');

  const [activeTab, setActiveTab] = useState('SAISIE');
  const [transactions, setTransactions] = useState([]);

  // Formulaire Saisie
  const [selectedSite, setSelectedSite] = useState('');
  const [dateOp, setDateOp] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('RECETTE');
  const [codeCompte, setCodeCompte] = useState('1');
  const [modePaiement, setModePaiement] = useState('Espèces');
  const [libelle, setLibelle] = useState('');
  const [montant, setMontant] = useState('');
  const [pieceJointe, setPieceJointe] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Formulaire Virement
  const [virementSource, setVirementSource] = useState('Espèces');
  const [virementCible, setVirementCible] = useState('Mobile Money');
  const [virementMontant, setVirementMontant] = useState('');

  // CHARGEMENT INITIAL CENTRALISÉ DEPUIS SUPABASE
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 1. Vérifier la session utilisateur
    const savedUser = localStorage.getItem('user'); // Conservé pour garder la session active
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setSelectedSite(parsedUser.site || '');
    } else {
      router.push('/login');
      return;
    }

    // 2. Charger toutes les données depuis Supabase
    loadCentralData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCentralData = async () => {
    // A. Charger les Assemblées/Sites
    const { data: dbSites } = await supabase.from('sites').select('*');
    if (dbSites && dbSites.length > 0) {
      const siteNames = dbSites.map(s => s.name || s.nom);
      setSites(siteNames);
      if (!selectedSite) setSelectedSite(siteNames[0]);
      setNewUserSite(siteNames[0]);
    }

    // B. Charger les Transactions / Opérations
    const { data: dbTx } = await supabase.from('operations').select('*').order('id', { ascending: false });
    if (dbTx) {
      setTransactions(dbTx);
    }

    // C. Charger les Utilisateurs
    const { data: dbUsers } = await supabase.from('profiles').select('*');
    if (dbUsers) {
      setUsersList(dbUsers);
    }
  };

  // DECONNEXION PROPRE
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setCodeCompte(PLAN_COMPTABLE[newType][0].code);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPieceJointe(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 1. SAUVEGARDER / CORRIGER UNE ÉCRITURE SUR SUPABASE
  const handleSaveEcriture = async (e) => {
    e.preventDefault();
    if (!montant || parseFloat(montant) <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }

    const payload = {
      date: dateOp,
      site: selectedSite,
      type,
      codeCompte,
      modePaiement,
      libelle: libelle || PLAN_COMPTABLE[type].find(c => c.code === codeCompte)?.label,
      montant: parseFloat(montant),
      pieceJointe
    };

    if (editingId) {
      // Modification dans Supabase
      const { error } = await supabase
        .from('operations')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        alert("Erreur de mise à jour sur le serveur : " + error.message);
      } else {
        alert('Écriture corrigée avec succès sur la base centralisée !');
        setEditingId(null);
        loadCentralData();
      }
    } else {
      // Insertion dans Supabase
      const { error } = await supabase
        .from('operations')
        .insert([payload]);

      if (error) {
        alert("Erreur d'enregistrement sur le serveur : " + error.message);
      } else {
        alert('Écriture enregistrée sur la base centralisée !');
        loadCentralData();
      }
    }

    setMontant('');
    setLibelle('');
    setPieceJointe(null);
  };

  // 2. EFECTUER UN VIREMENT INTERNE SUR SUPABASE
  const handleVirement = async (e) => {
    e.preventDefault();
    if (virementSource === virementCible) {
      alert('Le mode de provenance et de destination doivent être différents.');
      return;
    }
    if (!virementMontant || parseFloat(virementMontant) <= 0) {
      alert('Montant invalide.');
      return;
    }

    const val = parseFloat(virementMontant);

    const txOut = {
      date: dateOp,
      site: selectedSite,
      type: 'DEPENSE',
      codeCompte: '112',
      modePaiement: virementSource,
      libelle: `Virement interne vers ${virementCible}`,
      montant: val,
      pieceJointe: null
    };

    const txIn = {
      date: dateOp,
      site: selectedSite,
      type: 'RECETTE',
      codeCompte: '7',
      modePaiement: virementCible,
      libelle: `Virement interne reçu de ${virementSource}`,
      montant: val,
      pieceJointe: null
    };

    const { error } = await supabase.from('operations').insert([txOut, txIn]);

    if (error) {
      alert("Erreur lors du virement sur le serveur : " + error.message);
    } else {
      alert('Virement interne effectué et centralisé avec succès !');
      setVirementMontant('');
      loadCentralData();
    }
  };

  // 3. AJOUTER UNE ASSEMBLÉE SUR SUPABASE
  const handleAddSite = async (e) => {
    e.preventDefault();
    if (newSiteName && !sites.includes(newSiteName)) {
      const { error } = await supabase.from('sites').insert([{ name: newSiteName }]);

      if (error) {
        alert("Erreur lors de l'ajout du site sur Supabase : " + error.message);
      } else {
        alert('Nouvelle assemblée centralisée !');
        setNewSiteName('');
        loadCentralData();
      }
    }
  };

  // 4. CREER UN UTILISATEUR SUR SUPABASE
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUserName) {
      const { error } = await supabase.from('profiles').insert([{
        name: newUserName,
        role: newUserRole,
        site: newUserSite
      }]);

      if (error) {
        alert("Erreur lors de la création de l'utilisateur sur le serveur : " + error.message);
      } else {
        alert('Utilisateur ajouté à la base centralisée !');
        setNewUserName('');
        loadCentralData();
      }
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setDateOp(tx.date);
    setSelectedSite(tx.site);
    setType(tx.type);
    setCodeCompte(tx.codeCompte);
    setModePaiement(tx.modePaiement || 'Espèces');
    setLibelle(tx.libelle);
    setMontant(tx.montant.toString());
    setPieceJointe(tx.pieceJointe);
    setActiveTab('SAISIE');
  };

  const handleExportCSV = () => {
    let csv = 'ID;Date;Site;Type;Code Compte;Mode Paiement;Libelle;Montant (FCFA)\n';
    transactions.forEach(t => {
      csv += `${t.id};${t.date};${t.site};${t.type};${t.codeCompte};${t.modePaiement || 'Espèces'};${t.libelle};${t.montant}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `journal_compt_ea_${selectedSite}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentUser) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>;
  }

  const filteredTx = transactions.filter(t => t.site === selectedSite);
  const totalRecettes = filteredTx.filter(t => t.type === 'RECETTE').reduce((a, b) => a + b.montant, 0);
  const totalDepenses = filteredTx.filter(t => t.type === 'DEPENSE').reduce((a, b) => a + b.montant, 0);
  const soldeNet = totalRecettes - totalDepenses;

  const soldeMode = (mode) => {
    const rec = filteredTx.filter(t => t.type === 'RECETTE' && (t.modePaiement === mode || (!t.modePaiement && mode === 'Espèces'))).reduce((a, b) => a + b.montant, 0);
    const dep = filteredTx.filter(t => t.type === 'DEPENSE' && (t.modePaiement === mode || (!t.modePaiement && mode === 'Espèces'))).reduce((a, b) => a + b.montant, 0);
    return rec - dep;
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
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>👤 {currentUser.name} ({currentUser.role})</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '20px', backgroundColor: isOnline ? '#166534' : '#991b1b', color: 'white' }}>
            {isOnline ? '🟢 En ligne' : '🔴 Hors-Réseau'}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px', marginBottom: '16px' }}>
        {[
          { id: 'SAISIE', label: '📝 Saisie' },
          { id: 'VIREMENT', label: '🔄 Virement' },
          { id: 'JOURNAL', label: '📖 Journal' },
          { id: 'BILAN', label: '📊 Bilan' },
          { id: 'SITES', label: '🏛️ Assemblées' },
          { id: 'USERS', label: '👥 Utilisateurs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 6px',
              borderRadius: '8px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? '#0284c7' : '#e2e8f0',
              color: activeTab === tab.id ? 'white' : '#334155',
              fontSize: '12px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. SAISIE */}
      {activeTab === 'SAISIE' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>
            {editingId ? '✏️ Correction d\'une Écriture' : '📝 Saisie des Écritures'}
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
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>ASSEMBLÉE / SITE</label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {sites.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>TYPE D&apos;OPÉRATION</label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="RECETTE">Recette (Entrée)</option>
                  <option value="DEPENSE">Dépense (Sortie)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>MODE DE PAIEMENT</label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>MONTANT FCFA</label>
                <input
                  type="number"
                  placeholder="Ex: 25000"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>
                COMPTE COMPTABLE ({type === 'RECETTE' ? 'Recettes seulement' : 'Dépenses seulement'})
              </label>
              <select
                value={codeCompte}
                onChange={(e) => setCodeCompte(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: type === 'RECETTE' ? '#f0fdf4' : '#fef2f2' }}
              >
                {PLAN_COMPTABLE[type].map(item => (
                  <option key={item.code} value={item.code}>{item.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>LIBELLÉ OPTIONNEL</label>
              <input
                type="text"
                placeholder="Précision additionnelle si besoin..."
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ border: '2px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284c7', cursor: 'pointer', display: 'block' }}>
                📷 Prendre une photo du reçu / Télécharger la pièce
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
                  ✅ Pièce jointe attachée !
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

      {/* 2. VIREMENT INTERNE */}
      {activeTab === 'VIREMENT' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>🔄 Transfert entre Caisses / Modes de Paiement</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Effectuer un mouvement interne (ex: Déposer de l&apos;Espèce sur le compte Banque ou Mobile Money).
          </p>

          <form onSubmit={handleVirement} style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>PROVENANCE (DEPUIS)</label>
                <select
                  value={virementSource}
                  onChange={(e) => setVirementSource(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>DESTINATION (VERS)</label>
                <select
                  value={virementCible}
                  onChange={(e) => setVirementCible(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>MONTANT À TRANSFÉRER FCFA</label>
              <input
                type="number"
                placeholder="Ex: 50000"
                value={virementMontant}
                onChange={(e) => setVirementMontant(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Effectuer le Virement Interne
            </button>
          </form>
        </div>
      )}

      {/* 3. JOURNAL DES ÉCRITURES */}
      {activeTab === 'JOURNAL' && (
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>📖 Journal Direct ({selectedSite})</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleExportCSV} style={{ backgroundColor: '#15803d', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                📥 Exporter Excel/CSV
              </button>
              <button onClick={handlePrint} style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                🖨️ Imprimer
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px' }}>Compte</th>
                  <th style={{ padding: '8px' }}>Mode</th>
                  <th style={{ padding: '8px' }}>Libellé</th>
                  <th style={{ padding: '8px' }}>Montant</th>
                  <th style={{ padding: '8px' }}>Preuve</th>
                  <th style={{ padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}>{t.date}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{t.codeCompte}</td>
                    <td style={{ padding: '8px' }}>{t.modePaiement || 'Espèces'}</td>
                    <td style={{ padding: '8px' }}>{t.libelle}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: t.type === 'RECETTE' ? '#059669' : '#e11d48' }}>
                      {t.type === 'RECETTE' ? '+' : '-'}{t.montant.toLocaleString()} F
                    </td>
                    <td style={{ padding: '8px' }}>{t.pieceJointe ? '📄' : '-'}</td>
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

      {/* 4. BILAN FINANCIER */}
      {activeTab === 'BILAN' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>📊 Bilan Financier - {selectedSite}</h3>
            <button onClick={handlePrint} style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              🖨️ Imprimer le Bilan
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold' }}>TOTAL RECETTES</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803d' }}>{totalRecettes.toLocaleString()} FCFA</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 'bold' }}>TOTAL DÉPENSES</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#be123c' }}>{totalDepenses.toLocaleString()} FCFA</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#075985', fontWeight: 'bold' }}>SOLDE NET GLOBAL</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: soldeNet >= 0 ? '#0369a1' : '#be123c' }}>{soldeNet.toLocaleString()} FCFA</div>
            </div>
          </div>

          <h4 style={{ color: '#334155', marginBottom: '8px' }}>💳 Soldes Disponibles par Mode de Paiement</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {MODES_PAIEMENT.map(m => (
              <div key={m} style={{ padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>{m}</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{soldeMode(m).toLocaleString()} F</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GESTION DES ASSEMBLÉES */}
      {activeTab === 'SITES' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>🏛️ Gestion des Assemblées / Sites</h3>

          <form onSubmit={handleAddSite} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Nom de la nouvelle assemblée (Ex: E.A Koupéla)"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <button type="submit" style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              + Ajouter
            </button>
          </form>

          <h4 style={{ color: '#334155' }}>Liste des Assemblées Enregistrées ({sites.length})</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sites.map(s => (
              <li key={s} style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#0f172a' }}>
                📍 {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. GESTION DES UTILISATEURS */}
      {activeTab === 'USERS' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>👥 Gestion des Utilisateurs et Rôles HQ</h3>

          <form onSubmit={handleAddUser} style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Nom complet de l'utilisateur"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="SITE_TRESO">Trésorier de Site</option>
                <option value="HQ_COMPTABLE">Comptable HQ / Siège</option>
                <option value="HQ_ADMIN">Administrateur Général</option>
              </select>

              <select value={newUserSite} onChange={(e) => setNewUserSite(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                {sites.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button type="submit" style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              + Créer l'utilisateur
            </button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px' }}>Nom</th>
                <th style={{ padding: '8px' }}>Rôle</th>
                <th style={{ padding: '8px' }}>Assemblée</th>
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
      )}

    </div>
  );
}
