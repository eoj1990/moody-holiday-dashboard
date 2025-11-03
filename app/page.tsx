'use client';

import React from 'react';

export default function Home() {
  // Only show links so we know rendering works.
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Moody Holiday Dashboard</h1>
      <p>Root page is rendering ✅</p>
      <p>
        <a href="/login" style={{ textDecoration: 'underline' }}>Go to Login</a> ·{' '}
        <a href="/dashboard" style={{ textDecoration: 'underline' }}>Go to Dashboard</a>
      </p>
    </div>
  );
}
