// questController.js
import { addXP } from '../util/levelsystem.js';
import { supabase } from '../Supabase/supabaseClient.js'
import { checkAndAwardBadges } from './levelController.js';

const xpTable = {
  strength: { light: 10, medium: 25, heavy: 50 },
  intelligence: { easy: 10, moderate: 25, hard: 50 },
  agility: { small: 10, medium: 25, large: 50 },
  endurance: { short: 10, medium: 25, long: 50 },
};

const XP_CAP = 50;

function calculateXp(categories = [], difficulties = {}) {
  let totalXp = 0;
  for (const category of categories) {
    const difficulty = difficulties[category] || 'easy';
    const xp = xpTable[category]?.[difficulty] ?? 10;
    totalXp += xp;
  }
  return Math.min(totalXp, XP_CAP);
}

// Create a quest
export const createQuest = async (req, res) => {
  const { title, description, categories, difficulties, requesterId, latitude, longitude } = req.body;

  if (!title || !categories || !requesterId || !latitude || !longitude) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  const xp = calculateXp(categories, difficulties);

  const point = `POINT(${longitude} ${latitude})`; // GeoJSON format

  const { error } = await supabase.from('quests').insert({
    title,
    description,
    category: categories,
    difficulty: JSON.stringify(difficulties),
    xp,
    requester_id: requesterId,
    location: point,
    availability: false,
    photo_required: false,
    repeatable: false,
    status: 'open',
  });

  if (error) {
    console.error('Create Quest Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, message: 'Quest created successfully.' });
};

// Hero applies to help
export const offerToHelp = async (req, res) => {
  const { heroId, questId } = req.body;
  if (!heroId || !questId) {
    return res.status(400).json({ success: false, error: 'Missing hero or quest ID.' });
  }

  const { error } = await supabase.from('quest_offers').insert({
    hero_id: heroId,
    quest_id: questId,
    status: 'pending',
  });

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, message: 'Offer submitted.' });
};

// Approve a hero
export const approveHeroOffer = async (req, res) => {
  const { questId, heroId } = req.body;
  if (!questId || !heroId) {
    return res.status(400).json({ success: false, error: 'Missing IDs.' });
  }

  const { error: rejectError } = await supabase
    .from('quest_offers')
    .update({ status: 'rejected' })
    .eq('quest_id', questId)
    .neq('hero_id', heroId);

  const { error: acceptError } = await supabase
    .from('quest_offers')
    .update({ status: 'accepted' })
    .eq('quest_id', questId)
    .eq('hero_id', heroId);

  const { error: assignError } = await supabase
    .from('quests')
    .update({ assigned_hero_id: heroId, status: 'assigned' })
    .eq('id', questId);

  if (assignError || acceptError || rejectError) {
    return res.status(500).json({
      success: false,
      error: assignError?.message || acceptError?.message || rejectError?.message,
    });
  }

  return res.status(200).json({ success: true, message: 'Hero approved and quest assigned.' });
};

// Get all open quests with lat/lng extracted from location
export const getOpenQuests = async (_req, res) => {
  const { data, error } = await supabase.rpc('get_open_quests_with_coords');

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, data });
};



// Get pending hero offers for a quest
export const getPendingOffersForQuest = async (req, res) => {
  const { questId } = req.params;

  const { data, error } = await supabase
    .from('quest_offers')
    .select('hero_id, created_at')
    .eq('quest_id', questId)
    .eq('status', 'pending');

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, data });
};

// Complete quest + award XP
export const completeQuest = async (req, res) => {
  const { questId, heroId } = req.body;
  if (!questId || !heroId) {
    return res.status(400).json({ success: false, error: 'Missing questId or heroId.' });
  }

  const { data: questData, error: questError } = await supabase
    .from('quests')
    .select('xp')
    .eq('id', questId)
    .single();

  if (questError || !questData) {
    return res.status(500).json({ success: false, error: questError?.message || 'Quest not found' });
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', heroId)
    .single();

  if (userError || !userData) {
    return res.status(500).json({ success: false, error: userError?.message || 'User not found' });
  }

  const updatedProgress = addXP({ xp: userData.xp, level: userData.level }, questData.xp);

  const { error: updateUserError } = await supabase
    .from('users')
    .update({
      xp: updatedProgress.xp,
      level: updatedProgress.level,
    })
    .eq('id', heroId);

  if (updateUserError) {
    return res.status(500).json({ success: false, error: updateUserError.message });
  }

  const { error: updateQuestError } = await supabase
    .from('quests')
    .update({ status: 'completed' })
    .eq('id', questId);

  if (updateQuestError) {
    return res.status(500).json({ success: false, error: updateQuestError.message });
  }

  // 🟨 Award badges for each quest category
  let awardedBadges = [];
  for (const category of questData.category || []) {
    const badgeResult = await checkAndAwardBadges({
      body: { userId: heroId, category }
    }, {
      status: () => ({
        json: (result) => awardedBadges.push({ category, ...result })
      })
    });
  }

  return res.status(200).json({
    success: true,
    message: `Quest completed. ${questData.xp} XP awarded.`,
    newLevel: updatedProgress.level,
    remainingXP: updatedProgress.xp,
    badges: awardedBadges,
  });
};

// Fetch latest quest by requester (for testing/dev only)
export const fetchLatestQuest = async (req, res) => {
  const { requesterId } = req.params;

  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('requester_id', requesterId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return res.status(404).json({ success: false, error: 'No quests found.' });
  }

  return res.status(200).json({ success: true, data: data[0] });
};

export const getNearbyQuests = async (req, res) => {
  const { lat, lng, radiusKm = 10 } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const { data, error } = await supabase.rpc('get_nearby_quests', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radiusKm,
  });

  if (error) {
    console.error('Error fetching nearby quests:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};

export const withdrawFromQuest = async (req, res) => {
  const { heroId, questId } = req.body;

  if (!heroId || !questId) {
    return res.status(400).json({ success: false, error: 'Missing heroId or questId.' });
  }

  // Only delete if the offer is still pending
  const { error } = await supabase
    .from('quest_offers')
    .delete()
    .eq('hero_id', heroId)
    .eq('quest_id', questId)
    .eq('status', 'pending');

  if (error) {
    console.error('Withdraw Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, message: 'Offer withdrawn successfully.' });
};