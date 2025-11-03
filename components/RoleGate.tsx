'use client';
import { useEffect, useState } from 'react';
import { getMe } from '../lib/queries';

export default function RoleGate({
  roles,
  children
}: { roles: ('UM'|'DM'|'DIV'|'AVP')[], children: React.ReactNode }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    getMe().then(p => setOk(p && roles.includes(p.role)));
  }, []);

  if (!ok) return null;
  return <>{children}</>;
}
