import dotenv from 'dotenv';
import { supabase } from '../Supabase/supabaseClient';
dotenv.config();

// SIGN UP + INSERT INTO USERS TABLE
export async function signUpWithProfile(email, password, username, avatarUrl) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error('Signup Error:', signUpError.message);
    return;
  }

  const user = signUpData.user;

  // Now insert into custom `users` table
  const { error: insertError } = await supabase.from('users').insert({
    id: user.id,
    email: user.email,
    username: username,
    avatar_url: avatarUrl,
    level: 1,
    xp: 0,
    gold: 0,
    gear: ['Starter Sword'],
  });

  if (insertError) {
    console.error('Error inserting user profile:', insertError.message);
    return;
  }

  console.log('Signup + user profile created successfully!');
}

// LOG IN USER
export async function loginUser(email, password) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Login Error:', authError.message);
    return null;
  }

  const user = authData.user;

  // Fetch profile from custom users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Profile Fetch Error:', profileError.message);
    return null;
  }

  console.log('Login successful:', profile.username);
  return {
    session: authData.session,
    user: profile,
  };
}