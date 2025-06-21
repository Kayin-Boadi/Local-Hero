// auth.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Init Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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
