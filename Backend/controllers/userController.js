import dotenv from 'dotenv';
import { supabase } from '../Supabase/supabaseClient.js';
dotenv.config();

// POST /signup
export const signUpWithProfile = async (req, res) => {
  const { email, password, username, avatarUrl } = req.body;

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Signup Error:', signUpError.message);
      return res.status(400).json({ success: false, error: signUpError.message });
    }

    const user = signUpData.user;
    const session = signUpData.session;

    if (!session) {
      return res.status(401).json({ success: false, error: 'Email confirmation required' });
    }

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
      return res.status(400).json({ success: false, error: insertError.message });
    }

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username,
          avatarUrl,
          level: 1,
          xp: 0,
          gold: 0,
        },
        accessToken: session.access_token,
      },
    });
  } catch (err) {
    console.error('Signup Exception:', err.message);
    return res.status(500).json({ success: false, error: 'Unexpected error during signup.' });
  }
};

// POST /login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Login Error:', authError.message);
      return res.status(401).json({ success: false, error: authError.message });
    }

    const user = authData.user;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile Fetch Error:', profileError.message);
      return res.status(404).json({ success: false, error: profileError.message });
    }

    return res.status(200).json({
      success: true,
      data: {
        session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
          expires_in: authData.session?.expires_in,
        },
        user: profile,
      },
    });
  } catch (err) {
    console.error('Login Exception:', err.message);
    return res.status(500).json({ success: false, error: 'Unexpected error during login.' });
  }
};

//Me
export const getCurrentUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) return res.status(404).json({ error: 'Profile not found' });

  res.status(200).json(profile);
};


// GET /users/:id
export const getUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Fetch Profile Error:', error.message);
      return res.status(404).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Get Profile Exception:', err.message);
    return res.status(500).json({ success: false, error: 'Unexpected error fetching profile.' });
  }
};

// PATCH /users/:id
export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update Profile Error:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Update Profile Exception:', err.message);
    return res.status(500).json({ success: false, error: 'Unexpected error updating profile.' });
  }
};

// GET /users
export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      console.error('Get All Users Error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Get All Users Exception:', err.message);
    return res.status(500).json({ success: false, error: 'Unexpected error fetching users.' });
  }
};
