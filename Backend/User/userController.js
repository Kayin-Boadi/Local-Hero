import { supabase } from '../supabaseClient.js';

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) console.error('Error fetching users:', error);
  else console.log(data);
};

fetchUsers();