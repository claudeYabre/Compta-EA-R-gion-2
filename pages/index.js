import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

const PLAN_COMPTABLE = {
  DEPENSE: [
    { code: '101', label: '101 - Dîmes des dîmes' },
    { code: '102', label: '102 - Soutien du pasteur' },
    { code: '103', label: '103 - Assurance maladie' },
    { code: '104', label: '104 - Carburant véhicule' },
    { code: '105', label: '105 - Frais de déplacement / transports' },
    { code: '106', label: '106 - Téléphone' },
    { code: '107', label: '107 - Impôt et taxe sur salaires' },
    { code: '108', label: '108 - Caisse régionale' },
    { code: '109', label: '109 - Caisse Nationale' },
    { code: '110', label: '110 - Électricité / Bois / Groupe / Gaz' },
    { code: '111', label: '111 - Frais ONEA' },
    { code: '112', label: '112 - Frais de banque' },
    { code: '113', label: '113 - Soutien aux personnes en difficulté' },
    { code: '201', label: '201 - Frais de formation' },
    { code: '202', label: '202 - Restauration visiteurs' },
    { code: '203', label: '203 - Entretien mobilier' },
    { code: '204', label: '204 - Achat/Maintenance matériel musique' },
    { code: '205', label: '205 - Entretien/Réparations véhicules' },
    { code: '206', label: '206 - Soutiens aux différents mouvements' },
    { code: '207', label: '207 - Achat matériel/mobilier bureau' },
    { code: '208', label: '208 - Frais de fourniture' },
    { code: '209', label: '209 - Autres' },
    { code: '210', label: '210 - Construction' },
    { code: '301', label: '301 - Entretien des bâtiments' },
    { code: '302', label: '302 - Entretien matériels & machines' },
    { code: '401', label: '401 - Compte de réserve' },
    { code: '402', label: '402 - Amortissement / Réparation sono' },
  ],
  RECETTE: [
    { code: '1', label: '1 - DÎMES' },
    { code: '2', label: '2 - Offrande spéciale construction' },
    { code: '3', label: '3 - Cotisation pour la construction' },
    { code: '4', label: '4 - Offrandes spéciales' },
    { code: '5', label: '5 - Dons spéciaux' },
    { code: '6', label: '6 - Ventes de céréales' },
    { code: '7', label: '7 - Autre entrée' },
  ]
};

const MODES_PAIEMENT = ['Espèces', 'Mobile Money', 'Banque'];

export default function DashboardPleinEcran() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Données
  const [sites, setSites] = useState([]);
  const [newSiteName, setNewSiteName] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('SITE_TRESO');
  const [newUserSite, setNewUserSite] = useState('');

  const [activeTab, setActiveTab] = useState('DASHBOARD');
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

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setSelectedSite(parsedUser.site || '');
    } else {
      router.push('/login');
      return;
    }

    loadCentralData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCentralData = async () => {
    const { data: dbSites } = await supabase.from('sites').select('*');
    if (dbSites && dbSites.length > 0) {
      const siteNames = dbSites.map(s => s.name || s.nom);
      setSites(siteNames);
      if (!selectedSite) setSelectedSite(siteNames[0]);
      setNewUserSite(siteNames[0]);
    }

    const { data: dbTx } = await supabase.from('operations').select('*').order('id', { ascending: false });
    if (dbTx) setTransactions(dbTx);

    const { data: dbUsers } = await supabase.from('profiles').select('*');
    if (dbUsers) setUsersList(dbUsers);
  };

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
      const { error } = await supabase.from('operations').update(payload).eq('id', editingId);
      if (error) alert("Erreur : " + error.message);
      else {
        alert('Écriture mise à jour !');
        setEditingId(null);
        loadCentralData();
      }
    } else {
      const { error } = await supabase.from('operations').insert([payload]);
      if (error) alert("Erreur : " + error.message);
      else {
        alert('Écriture enregistrée !');
        loadCentralData();
      }
    }

    setMontant('');
    setLibelle('');
    setPieceJointe(null);
  };

  const handleVirement = async (e) => {
    e.preventDefault();
    if (virementSource === virementCible) {
      alert('Choisissez deux modes de paiement différents.');
      return;
    }
    if (!virementMontant || parseFloat(virementMontant) <= 0) {
      alert('Montant invalide.');
      return;
    }

    const val = parseFloat(virementMontant);
    const txOut = { date: dateOp, site: selectedSite, type: 'DEPENSE', codeCompte: '112', modePaiement: virementSource, libelle: `Virement interne vers ${virementCible}`, montant: val };
    const txIn = { date: dateOp, site: selectedSite, type: 'RECETTE', codeCompte: '7', modePaiement: virementCible, libelle: `Virement interne de ${virementSource}`, montant: val };

    const { error } = await supabase.from('operations').insert([txOut, txIn]);
    if (error) alert("Erreur : " + error.message);
    else {
      alert('Virement réussi !');
      setVirementMontant('');
      loadCentralData();
    }
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (newSiteName && !sites.includes(newSiteName)) {
      const { error } = await supabase.from('sites').insert([{ name: newSiteName }]);
      if (error) alert("Erreur : " + error.message);
      else {
        setNewSiteName('');
        loadCentralData();
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUserName) {
      const { error } = await supabase.from('profiles').insert([{ name: newUserName, role: newUserRole, site: newUserSite }]);
      if (error) alert("Erreur : " + error.message);
      else {
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

  // Calculs Financiers
  const filteredTx = transactions.filter(t => t.site === selectedSite);
  const totalRecettes = filteredTx.filter(t => t.type === 'RECETTE').reduce((a, b) => a + b.montant, 0);
  const totalDepenses = filteredTx.filter(t => t.type === 'DEPENSE').reduce((a, b) => a + b.montant, 0);
  const soldeNet = totalRecettes - totalDepenses;

  const soldeMode = (mode) => {
    const rec = filteredTx.filter(t => t.type === 'RECETTE' && (t.modePaiement === mode || (!t.modePaiement && mode === 'Espèces'))).reduce((a, b) => a + b.montant, 0);
    const dep = filteredTx.filter(t => t.type === 'DEPENSE' && (t.modePaiement === mode || (!t.modePaiement && mode === 'Espèces'))).reduce((a, b) => a + b.montant, 0);
    return rec - dep;
  };

  // Regroupement par Compte (pour widget dépense)
  const depensesParCompte = filteredTx
    .filter(t => t.type === 'DEPENSE')
    .reduce((acc, curr) => {
      acc[curr.codeCompte] = (acc[curr.codeCompte] || 0) + curr.montant;
      return acc;
    }, {});

  if (!currentUser) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Chargement...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER SUPERIEUR */}
      <header style={{ height: '60px', backgroundColor: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontWeight: '900', fontSize: '18px', letterSpacing: '1px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏛️</span> COMPT-EA <span style={{ fontSize: '10px', backgroundColor: '#0284c7', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>PRO</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', padding: '4px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Site actif :</span>
            <select 
              value={selectedSite} 
              onChange={(e) => setSelectedSite(e.target.value)}
              style={{ background: 'transparent', color: 'white', border: 'none', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
            >
              {sites.map(s => <option key={s} value={s} style={{ color: 'black' }}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* NAVIGATION NAVBAR */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'DASHBOARD', label: '📊 Tableau de Bord' },
            { id: 'SAISIE', label: '📝 Nouvelle Saisie' },
            { id: 'VIREMENT', label: '🔄 Virement' },
            { id: 'JOURNAL', label: '📖 Journal' },
            { id: 'SITES', label: '⚙️ Assemblées' },
            { id: 'USERS', label: '👥 Utilisateurs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === tab.id ? '#0284c7' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#94a3b8'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* PROFIL & ETAT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '20px', backgroundColor: isOnline ? '#166534' : '#991b1b', color: 'white', fontWeight: 'bold' }}>
            {isOnline ? '● En ligne' : '○ Hors-ligne'}
          </span>
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            <div style={{ fontWeight: 'bold' }}>{currentUser.name}</div>
            <div style={{ color: '#38bdf8', fontSize: '10px' }}>{currentUser.role}</div>
          </div>
          <button onClick={handleLogout} style={{ background: '#334155', border: 'none', color: '#f87171', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* ZONE DE CONTENU PRINCIPALE (FULL SCREEN) */}
      <main style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 1. TABLEAU DE BORD EXÉCUTIF (WIDGETS) */}
        {activeTab === 'DASHBOARD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            
            {/* RANGÉE 1: CARTE DE SYNTHÈSE RAPIDE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TOTAL RECETTES</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>{totalRecettes.toLocaleString()} <span style={{ fontSize: '12px' }}>FCFA</span></div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #f43f5e' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TOTAL DÉPENSES</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#e11d48', marginTop: '4px' }}>{totalDepenses.toLocaleString()} <span style={{ fontSize: '12px' }}>FCFA</span></div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `4px solid ${soldeNet >= 0 ? '#0284c7' : '#d97706'}` }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>SOLDE NET EN CAISSE</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: soldeNet >= 0 ? '#0284c7' : '#d97706', marginTop: '4px' }}>{soldeNet.toLocaleString()} <span style={{ fontSize: '12px' }}>FCFA</span></div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #6366f1' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>NOMBRE D&apos;OPÉRATIONS</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#4f46e5', marginTop: '4px' }}>{filteredTx.length}</div>
              </div>
            </div>

            {/* RANGÉE 2: WIDGETS PAR MODE & ANALYSE COMPTABILITÉ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', flex: 1 }}>
              
              {/* WIDGET VENTILATION PAR COMPTE/MODE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* SOLDE PAR MODE DE PAIEMENT */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '14px' }}>💳 Répartition par Mode de Paiement</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {MODES_PAIEMENT.map(m => {
                      const val = soldeMode(m);
                      return (
                        <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>{m}</span>
                          <span style={{ fontWeight: 'bold', fontSize: '14px', color: val >= 0 ? '#0f172a' : '#be123c' }}>{val.toLocaleString()} FCFA</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WIDGET SANTÉ FINANCIÈRE */}
                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase' }}>Indicateur de Gestion</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '6px' }}>
                      {totalRecettes > 0 ? `Ratio Dépenses/Recettes : ${((totalDepenses / totalRecettes) * 100).toFixed(1)}%` : 'Aucune entrée enregistrée'}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                    {soldeNet > 0 ? '🟢 La situation financière de l\'assemblée est saine.' : '🔴 Attentions, le niveau des dépenses dépasse les entrées.'}
                  </div>
                </div>

              </div>

              {/* WIDGET DERNIÈRES OPÉRATIONS INTERACTIVES */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '14px' }}>⚡ Dernières Opérations Saisies</h4>
                  <button onClick={() => setActiveTab('JOURNAL')} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Voir tout →</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Date</th>
                        <th style={{ padding: '8px' }}>Compte</th>
                        <th style={{ padding: '8px' }}>Libellé</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTx.slice(0, 7).map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{t.date}</td>
                          <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{t.codeCompte}</td>
                          <td style={{ padding: '10px 8px', color: '#334155' }}>{t.libelle}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold', color: t.type === 'RECETTE' ? '#059669' : '#e11d48' }}>
                            {t.type === 'RECETTE' ? '+' : '-'}{t.montant.toLocaleString()} F
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. FORMULAIRE DE SAISIE AVANCÉ */}
        {activeTab === 'SAISIE' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>{editingId ? '✏️ Modifier une Écriture' : '📝 Enregistrer une Opération'}</h3>

            <form onSubmit={handleSaveEcriture} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>DATE DE L&apos;OPÉRATION</label>
                  <input type="date" value={dateOp} onChange={(e) => setDateOp(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>TYPE D&apos;OPÉRATION</label>
                  <select value={type} onChange={(e) => handleTypeChange(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="RECETTE">Recette (Entrée de fonds)</option>
                    <option value="DEPENSE">Dépense (Sortie de fonds)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>MODE DE PAIEMENT</label>
                  <select value={modePaiement} onChange={(e) => setModePaiement(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>MONTANT FCFA</label>
                  <input type="number" placeholder="Ex: 50000" value={montant} onChange={(e) => setMontant(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>COMPTE COMPTABLE</label>
                <select value={codeCompte} onChange={(e) => setCodeCompte(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: type === 'RECETTE' ? '#f0fdf4' : '#fef2f2' }}>
                  {PLAN_COMPTABLE[type].map(item => <option key={item.code} value={item.code}>{item.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>LIBELLÉ DE L&apos;OPÉRATION</label>
                <input type="text" placeholder="Précisez l'objet de l'écriture..." value={libelle} onChange={(e) => setLibelle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div style={{ border: '2px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0284c7', cursor: 'pointer', display: 'block' }}>
                  📷 Attacher un reçu / justificatif
                  <input type="file" accept="image/*,application/pdf" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                {pieceJointe && <div style={{ marginTop: '8px', color: '#15803d', fontSize: '12px', fontWeight: 'bold' }}>✅ Preuve numérisée liée</div>}
              </div>

              <button type="submit" style={{ padding: '14px', borderRadius: '8px', backgroundColor: editingId ? '#d97706' : '#059669', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                {editingId ? 'Mettre à jour l\'écriture' : 'Valider et Sauvegarder'}
              </button>
            </form>
          </div>
        )}

        {/* 3. VIREMENT INTERNE */}
        {activeTab === 'VIREMENT' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>🔄 Transfert Interne entre Caisses</h3>
            <form onSubmit={handleVirement} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>DEPUIS LA CAISSE (PROVENANCE)</label>
                <select value={virementSource} onChange={(e) => setVirementSource(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>VERS LA CAISSE (DESTINATION)</label>
                <select value={virementCible} onChange={(e) => setVirementCible(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>MONTANT DU TRANSFERT FCFA</label>
                <input type="number" placeholder="Ex: 100000" value={virementMontant} onChange={(e) => setVirementMontant(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#0284c7', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                Exécuter le Transfert
              </button>
            </form>
          </div>
        )}

        {/* 4. JOURNAL COMPLET */}
        {activeTab === 'JOURNAL' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>📖 Grand Journal des Écritures ({selectedSite})</h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Code</th>
                    <th style={{ padding: '10px' }}>Mode</th>
                    <th style={{ padding: '10px' }}>Libellé</th>
                    <th style={{ padding: '10px' }}>Montant</th>
                    <th style={{ padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px' }}>{t.date}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.codeCompte}</td>
                      <td style={{ padding: '10px' }}>{t.modePaiement || 'Espèces'}</td>
                      <td style={{ padding: '10px' }}>{t.libelle}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: t.type === 'RECETTE' ? '#059669' : '#e11d48' }}>
                        {t.type === 'RECETTE' ? '+' : '-'}{t.montant.toLocaleString()} F
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => handleEdit(t)} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
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

        {/* 5. GESTION SITES & USERS */}
        {activeTab === 'SITES' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>🏛️ Ajouter une Assemblée</h3>
            <form onSubmit={handleAddSite} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="Nom de l'assemblée" value={newSiteName} onChange={(e) => setNewSiteName(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <button type="submit" style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Ajouter</button>
            </form>
            <h4>Assemblées existantes :</h4>
            <ul>{sites.map(s => <li key={s} style={{ padding: '6px 0', fontWeight: 'bold' }}>📍 {s}</li>)}</ul>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>👥 Ajouter un Utilisateur HQ</h3>
            <form onSubmit={handleAddUser} style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              <input type="text" placeholder="Nom complet" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="SITE_TRESO">Trésorier de Site</option>
                <option value="HQ_COMPTABLE">Comptable HQ / Siège</option>
                <option value="HQ_ADMIN">Administrateur Général</option>
              </select>
              <select value={newUserSite} onChange={(e) => setNewUserSite(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                {sites.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Créer l'utilisateur</button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
