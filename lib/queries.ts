import { supabase } from './supabase';

/**
 * Get the current user's profile data
 */
export async function getMe() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn('No Supabase user found', userError);
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }

  return data;
}

/**
 * Get the units visible to a given profile (AVP, DIV, DM, or UM)
 */
export async function getUnitsForProfile(profile: any) {
  if (!profile) return [];

  let query = supabase.from('units').select('*');

  switch (profile.role) {
    case 'AVP':
      query = query.order('number');
      break;
    case 'DIV':
      query = query.eq('division', profile.division).order('number');
      break;
    case 'DM':
      query = query.eq('district', profile.district).order('number');
      break;
    default:
      query = query.eq('number', profile.unit_number).limit(1);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching units:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Get task completion data for a given unit
 * (Returns an array of tasks for the dashboard list)
 */
export async function getTaskStatus(unitNumber: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('unit_number', unitNumber);

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching task status:', error.message);
    return [];
  }

  // Return empty array if no tasks yet
  return data || [];
}
