// questController.js
import { supabase } from '../Supabase/supabaseClient.js'

import { updateUserProgress } from '../controllers/levelController.js' 

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

  // 1. Check if the hero is the requester
  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('requester_id')
    .eq('id', questId)
    .single();

  if (questError || !quest) {
    return res.status(404).json({ success: false, error: 'Quest not found.' });
  }

  if (quest.requester_id === heroId) {
    return res.status(403).json({ success: false, error: 'You cannot offer to help your own quest.' });
  }

  // 2. Insert the offer
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
    console.error('Error fetching offers:', error.message);
    return [];
  }

  return data;
}


export async function completeQuest(req, res) {
  const { questId, heroId } = req.body;

  if (!questId || !heroId) {
    return res.status(400).json({ success: false, error: 'Missing questId or heroId.' });
  }

  // 1. Fetch quest info
  const { data: questData, error: questError } = await supabase
    .from('quests')
    .select('id, xp, category, requester_id')
    .eq('id', questId)
    .single();

  if (questError || !questData) {
    console.error('Error fetching quest:', questError?.message);
    return res.status(404).json({ success: false, error: 'Quest not found.' });
  }

  const { xp: questXp, category, requester_id } = questData;

  // 2. Mark quest as completed
  const { error: updateQuestError } = await supabase
    .from('quests')
    .update({ status: 'completed' })
    .eq('id', questId);

  if (updateQuestError) {
    console.error('Error marking quest complete:', updateQuestError.message);
    return res.status(500).json({ success: false, error: updateQuestError.message });
  }

  // 3. Award XP to the hero
  try {
    await updateUserProgress(
      { params: { userId: heroId }, body: { category, xpGained: questXp } },
      { status: () => ({ json: () => {} }) }
    );
  } catch (err) {
    console.error('Error updating user progress:', err.message);
  }

  // 4. Fetch updated posted quests for the requester
  const { data: updatedQuests, error: postedError } = await supabase
    .from('quests')
    .select('*')
    .eq('requester_id', requester_id)
    .order('created_at', { ascending: false });

  if (postedError) {
    console.error('Error fetching updated posted quests:', postedError.message);
    return res.status(500).json({ success: false, error: postedError.message });
  }

  return res.status(200).json({
    success: true,
    message: `Quest complete. ${questXp} XP awarded to hero.`,
    data: updatedQuests,
  });
}


export async function fetchLatestQuest(requesterId) {

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

export const getPostedQuestsByUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId.' });
  }

  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('requester_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posted quests:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, data });
};

// Get Quest for Hero
export const getPendingQuestForHero = async (req, res) => {
  const { heroId } = req.params;
  if (!heroId) return res.status(400).json({ success: false, error: 'Missing heroId' });

  const { data, error } = await supabase
    .from('quest_offers')
    .select(`
      status,
      quests (
        id,
        title,
        description,
        category,
        difficulty,
        location,
        requester_id
      )
    `)
    .eq('hero_id', heroId)
    .in('status', ['pending', 'accepted'])
    .limit(1);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  if (!data.length) {
    return res.status(200).json({ success: true, data: null });
  }

  const offer = data[0];
  const quest = offer.quests;

  // Safely extract latitude/longitude from location
  const [longitude, latitude] = quest?.location?.coordinates || [];

  return res.status(200).json({
    success: true,
    data: {
      ...quest,
      status: offer.status,
      latitude,
      longitude,
    },
  });
};

