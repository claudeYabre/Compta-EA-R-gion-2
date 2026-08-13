import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (identifiant && password) {
      localStorage.setItem('user', JSON.stringify({ name: identifiant, role: 'HQ_ADMIN' }));
      router.push('/');
    } else {
      alert('Veuillez remplir vos identifiants');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexWrap: 'wrap-reverse',
      backgroundColor: '#f8fafc',
      fontFamily: 'sans-serif'
    }}>
      {/* GAUCHE : Paramètres de connexion */}
      <div style={{
        flex: '1 1 400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 24px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '8px' }}>Connexion</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Accédez à la plateforme **COMPT-EA**.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                IDENTIFIANT / EMAIL
              </label>
              <input
                type="text"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="Ex: comptable.manga"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                MOT DE PASSE
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>

      {/* DROITE : Logo et Nom de l'application */}
      <div style={{
        flex: '1 1 400px',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        color: 'white'
      }}>
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          border: '4px solid #0284c7',
          padding: '12px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)',
          marginBottom: '20px'
        }}>
          <img
            src="/logo.png"
            alt="COMPT-EA Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0' }}>
          COMPT-EA
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', maxWidth: '300px', margin: 0 }}>
          Système Centralisé de Gestion Comptable
        </p>
      </div>
    </div>
  );
}
