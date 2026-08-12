import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Vous pouvez modifier le mot de passe ci-dessous ("compta2026")
    if (password === 'compta2026') {
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
      <h2>🔒 Connexion Requise</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>Veuillez entrer le mot de passe pour accéder à la gestion comptable.</p>
      
      <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        {error && <p style={{ color: 'red', fontSize: '14px' }}>Mot de passe incorrect</p>}
        <button
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
