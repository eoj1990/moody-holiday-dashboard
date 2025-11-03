'use client';

import React from 'react';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';


export default function Login() {
  const [email, setEmail] = useState('');
  async function signIn(){
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'test1234' // must match the password you set for this user in Supabase
    });
    if (error) alert(error.message);
    else window.location.href = '/dashboard';
    
  }
  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-2xl border">
      <h1 className="text-xl font-semibold mb-3">Sign in</h1>
      <input value={email} onChange={e=>setEmail(e.target.value)}
        placeholder="you@company.com" className="w-full border rounded-xl px-3 py-2 mb-3"/>
      <button onClick={signIn} className="w-full border rounded-xl px-3 py-2">Send magic link</button>
    </div>
  );
}
