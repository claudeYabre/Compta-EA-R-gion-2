import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const router = useRouter();

  // Vérification de la connexion au chargement
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/login');
    }
  }, []);

  // Le reste de votre code de saisie (formulaire) continue ici
  // (Assurez-vous de garder vos fonctions handleInsert, etc. si elles y étaient)
  
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
       <h1>Gestion Comptable</h1>
       {/* Votre formulaire de saisie reste ici */}
    </div>
  );
}
