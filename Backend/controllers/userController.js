import dotenv from 'dotenv';
import { supabase } from '../Supabase/supabaseClient.js';
dotenv.config();

// SIGN UP + INSERT INTO USERS TABLE
export async function signUpWithProfile(email, password, username, avatarUrl) {
  console.log("Hi");
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Signup Error:', signUpError.message);
      return { success: false, error: signUpError.message };
    }

    const user = signUpData.user;

    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      username,
      avatar_url: avatarUrl,
      level: 1,
      xp: 0,
      gold: 0,
    });

    if (insertError) {
      console.error('Insert User Error:', insertError.message);
      return { success: false, error: insertError.message };
    }

    return { success: true, data: { userId: user.id } };
  } catch (err) {
    console.error('Signup Exception:', err.message);
    return { success: false, error: 'Unexpected error during signup.' };
  }
}

// LOG IN USER
export async function loginUser(email, password) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Login Error:', authError.message);
      return { success: false, error: authError.message };
    }

    const user = authData.user;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile Fetch Error:', profileError.message);
      return { success: false, error: profileError.message };
    }

    return {
      success: true,
      data: {
        session: authData.session,
        user: profile,
      },
    };
  } catch (err) {
    console.error('Login Exception:', err.message);
    return { success: false, error: 'Unexpected error during login.' };
  }
}

// GET USER PROFILE BY ID
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Fetch Profile Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Get Profile Exception:', err.message);
    return { success: false, error: 'Unexpected error fetching profile.' };
  }
}

// UPDATE USER PROFILE
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update Profile Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Update Profile Exception:', err.message);
    return { success: false, error: 'Unexpected error updating profile.' };
  }
}

// GET ALL USERS (e.g., for leaderboard or admin)
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Get All Users Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Get All Users Exception:', err.message);
    return { success: false, error: 'Unexpected error fetching users.' };
  }
}