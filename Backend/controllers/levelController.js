// Backend/controllers/levelController.js
import { supabase } from '../Supabase/supabaseClient.js'
import { addXP } from '../util/levelsystem.js'

export async function updateUserProgress(req, res = null) {
  const { userId } = req.params;
  const { category, xpGained } = req.body;

  try {
    // Fetch current user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Failed to fetch user:', userError.message);
      const errorRes = { success: false, error: userError.message };
      return res ? res.status(500).json(errorRes) : errorRes;
    }

    const newXp = (user.xp || 0) + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1;

    const { error: updateError } = await supabase
      .from('users')
      .update({ xp: newXp, level: newLevel })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update XP:', updateError.message);
      const errorRes = { success: false, error: updateError.message };
      return res ? res.status(500).json(errorRes) : errorRes;
    }

    const successRes = { success: true, xp: newXp, level: newLevel };
    return res ? res.status(200).json(successRes) : successRes;

  } catch (err) {
    console.error('Error in updateUserProgress:', err.message);
    const errorRes = { success: false, error: err.message };
    return res ? res.status(500).json(errorRes) : errorRes;
  }
}


export async function getUserProgress(req, res) {
  try {
    const userId = req.params.userId

    const { data: user, error } = await supabase
      .from('users')
      .select('level, xp, category_stats, badges')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error in getUserProgress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function resetUserProgress(req, res) {
  try {
    const userId = req.params.userId

    const { error } = await supabase
      .from('users')
      .update({
        level: 1,
        xp: 0,
        category_stats: {},
        badges: [],
      })
      .eq('id', userId)

    if (error) {
      return res.status(500).json({ error: 'Failed to reset user progress' })
    }

    res.json({ message: 'User progress reset successfully' })
  } catch (error) {
    console.error('Error in resetUserProgress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Milestone thresholds
const BADGE_MILESTONES = {
  strength: [5, 10, 20],
  intelligence: [5, 10, 20],
  agility: [5, 10, 20],
  endurance: [5, 10, 20],
};

// 🎖️ Main handler
export async function checkAndAwardBadges(req, res) {
  const { userId, category } = req.body;

  if (!userId || !category) {
    return res.status(400).json({ success: false, error: 'Missing userId or category' });
  }

  try {
    // 1. Get completed quests in this category
    const { data: quests, error: questError } = await supabase
      .from('quests')
      .select('id')
      .eq('assigned_hero_id', userId)
      .eq('status', 'completed')
      .contains('category', category);

    if (questError) {
      console.error('Quest fetch error:', questError.message);
      return res.status(500).json({ success: false, error: questError.message });
    }

    const completedCount = quests.length;
    const milestones = BADGE_MILESTONES[category] || [];
    let awardedCount = 0;

    for (const milestone of milestones) {
      if (completedCount >= milestone) {
        const badgeName = `${category}-milestone-${milestone}`;

        // Check if user already has this badge
        const { data: existing, error: checkError } = await supabase
          .from('badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_name', badgeName)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Badge check error:', checkError.message);
          return res.status(500).json({ success: false, error: checkError.message });
        }

        if (!existing) {
          // Insert the badge
          const { error: insertError } = await supabase.from('badges').insert({
            user_id: userId,
            badge_name: badgeName,
            category,
            milestone,
          });

          if (insertError) {
            console.error('Badge insert error:', insertError.message);
            return res.status(500).json({ success: false, error: insertError.message });
          }

          awardedCount++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      awarded: awardedCount,
      message: `${awardedCount} badge(s) awarded for ${category}`,
    });
  } catch (err) {
    console.error('Unexpected badge error:', err.message);
    return res.status(500).json({ success: false, error: 'Unexpected error checking badges.' });
  }
}