import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    // Charger la liste des utilisateurs enregistrés
    const localUsers = localStorage.getItem('compt_ea_users');
    if (localUsers) {
      const users = JSON.parse(localUsers);
      setUsersList(users);
      if (users.length > 0) {
        setSelectedUserId(users[0].id.toString());
      }
    } else {
      // Utilisateurs par défaut si aucun n'existe encore
      const defaultUsers = [
        { id: 1, name: 'Claude Yabre', role: 'HQ_ADMIN', site: 'Siège Régional 2' },
        { id: 2, name: 'Trésorier Manga', role: 'SITE_TRESO', site: 'E.A Manga' }
      ];
      setUsersList(defaultUsers);
      localStorage.setItem('compt_ea_users', JSON.stringify(defaultUsers));
      setSelectedUserId('1');
    }
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // Trouver l'utilisateur sélectionné
    const userToConnect = usersList.find(u => u.id.toString() === selectedUserId);

    if (userToConnect) {
      // Sauvegarder l'utilisateur ACTUELlement connecté
      localStorage.setItem('user', JSON.stringify(userToConnect));
      
      // Rediriger vers le tableau de bord
      router.push('/');
    } else {
      alert('Veuillez sélectionner un utilisateur.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', padding: '16px' }}>
      <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center' }}>
        
        <div style={{ width: '60px', height: '60px', margin: '0 auto 16px auto', borderRadius: '50%', backgroundColor: '#f0f9ff', border: '2px solid #0284c7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        </div>

        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>COMPT-EA</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Connexion à la comptabilité</p>

        <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
              SÉLECTIONNER VOTRE COMPTE
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc' }}
            >
              {usersList.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role} - {u.site})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Se Connecter 🔑
          </button>
        </form>

      </div>
    </div>
  );
}
