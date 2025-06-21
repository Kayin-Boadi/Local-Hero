// questController.js
<<<<<<< HEAD
import { supabase } from '../supabaseClient.js';
import { addXP } from '../util/levelsystem.js';
=======
import { supabase } from '../Supabase/supabaseClient.js'
import { addXP } from '../progression/levelsystem.js';
>>>>>>> e20115b188181527db13587949d1a3baf10bd571

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
  return Math.min(totalXp, XP_CAP)
}

// 🆕 1. Hero applies to a quest
export async function offerToHelp({ heroId, questId }) {
  const { error } = await supabase.from('quest_offers').insert({
    hero_id: heroId,
    quest_id: questId,
    status: 'pending',
  });

  if (error) {
    console.error('Error offering to help:', error.message);
  } else {
    console.log('Hero offer submitted and pending approval.');
  }
}

// 🆕 2. Requester approves a hero for their quest
export async function approveHeroOffer({ questId, heroId }) {
  // Mark all offers for this quest as rejected
  const { error: rejectError } = await supabase
    .from('quest_offers')
    .update({ status: 'rejected' })
    .eq('quest_id', questId)
    .neq('hero_id', heroId);

  // Set approved hero's offer to accepted
  const { error: acceptError } = await supabase
    .from('quest_offers')
    .update({ status: 'accepted' })
    .eq('quest_id', questId)
    .eq('hero_id', heroId);

  // Assign hero to the quest
  const { error: assignError } = await supabase
    .from('quests')
    .update({
      assigned_hero_id: heroId,
      status: 'assigned',
    })
    .eq('id', questId);

  if (assignError) {
    console.error('Error assigning hero:', assignError.message);
  } else {
    console.log(`Hero ${heroId} approved and assigned to quest.`);
  }
}

// 🆗 View pending hero offers for a specific quest
export async function getPendingOffersForQuest(questId) {
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

// 🎯 Create a new quest
export async function createQuest({
  title,
  description,
  categories,
  difficulties,
  requesterId,
}) {
  const xp = calculateXp(categories, difficulties);

  const { error } = await supabase.from('quests').insert({
    title,
    description,
    category: categories,
    difficulty: JSON.stringify(difficulties),
    xp,
    requester_id: requesterId,
    status: 'open',
  });

  if (error) {
    console.error('Error creating quest:', error.message);
  } else {
    console.log('Quest successfully created.');
  }
}

// 📜 Get all open quests
export async function getOpenQuests() {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('status', 'open');

  if (error) {
    console.error('Error fetching quests:', error.message);
    return [];
  }

  return data;
}

// ✅ Complete quest + award XP
// ✅ Mark quest complete + award XP using levelSystem
export async function completeQuest({ questId, heroId }) {
  const { data: questData, error: questError } = await supabase
    .from('quests')
    .select('xp')
    .eq('id', questId)
    .single();

  if (questError) {
    console.error('Error fetching quest XP:', questError.message);
    return;
  }

  const questXp = questData.xp;

  // Get user's current XP + level
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', heroId)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError.message);
    return;
  }

  // Apply XP and handle level-up using your levelSystem logic
  const updatedProgress = addXP({ xp: userData.xp, level: userData.level }, questXp);

  // Save updated progress
  const { error: updateUserError } = await supabase
    .from('users')
    .update({
      xp: updatedProgress.xp,
      level: updatedProgress.level,
    })
    .eq('id', heroId);

  if (updateUserError) {
    console.error('Error updating user XP:', updateUserError.message);
    return;
  }

  // Mark quest complete
  const { error: updateQuestError } = await supabase
    .from('quests')
    .update({ status: 'completed' })
    .eq('id', questId);

  if (updateQuestError) {
    console.error('Error marking quest complete:', updateQuestError.message);
  } else {
    console.log(`✅ Quest complete. ${questXp} XP awarded.`);
    console.log(`Hero is now level ${updatedProgress.level} with ${updatedProgress.xp} XP.`);
  }
}


export async function fetchLatestQuest(requesterId) {

  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('requester_id', requesterId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}
