import React from 'react';
import Link from 'next/link';

export default function Bilan() {
  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <h2>📊 Bilan des comptes</h2>
      <p>Page de bilan en cours de configuration.</p>
      <Link href="/" style={{ color: '#0284c7', fontWeight: 'bold' }}>
        ← Retour à l'accueil
      </Link>
    </div>
  );
}
