import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// SIGN UP FUNCTION
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error('Signup Error:', error.message);
    return;
  }

  console.log('Signup successful:', data.user);
}

// LOGIN FUNCTION
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login Error:', error.message);
    return;
  }

  console.log('Login successful!');
  console.log('Access Token:', data.session.access_token);
  console.log('User:', data.user);
}

// GET CURRENT USER FUNCTION
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Get User Error:', error.message);
    return;
  }

  console.log('Current user:', user);
}