import { supabase } from './supabase';

export async function getMe() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function getUnitsForProfile(profile: any) {
  if (!profile) return [];
  if (profile.role === 'AVP') {
    const { data } = await supabase.from('units').select('*').order('number');
    return data || [];
  }
  if (profile.role === 'DIV') {
    const { data } = await supabase.from('units').select('*').eq('division', profile.division).order('number');
    return data || [];
  }
  if (profile.role === 'DM') {
    const { data } = await supabase.from('units').select('*').eq('district', profile.district).order('number');
    return data || [];
  }
  const { data } = await supabase.from('units').select('*').eq('number', profile.unit_number).limit(1);
  return data || [];
}

// 👇 make sure this is OUTSIDE any other function
export async function getTaskStatus(unitNumber: string, task: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('completed')
    .eq('unit_number', unitNumber)
    .eq('task', task)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('getTaskStatus error:', error);
  }

  return data ? data.completed : false;
}
