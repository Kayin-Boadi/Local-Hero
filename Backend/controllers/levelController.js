// Backend/controllers/levelController.js
import { supabase } from 'Backend/supabaseClient.js'
import { addXP } from 'Backend/progression/levelsystem.js'

export async function updateUserProgress(req, res) {
  try {
    const userId = req.params.userId
    const { category, xpGained } = req.body

    if (!category || !xpGained) {
      return res.status(400).json({ error: 'Missing category or xpGained' })
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updatedStats = { ...user.category_stats }
    updatedStats[category] = (updatedStats[category] || 0) + 1

    const { level, xp } = addXP({ level: user.level, xp: user.xp }, xpGained)

    const badges = [...user.badges]
    const milestones = [10, 25, 50, 100]

    milestones.forEach((milestone) => {
      const badgeName = `${milestone}x ${category}`
      if (updatedStats[category] === milestone && !badges.includes(badgeName)) {
        badges.push(badgeName)
      }
    })

    const { error: updateError } = await supabase
      .from('users')
      .update({
        level,
        xp,
        category_stats: updatedStats,
        badges,
      })
      .eq('id', userId)

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update user progress' })
    }

    res.json({ level, xp, category_stats: updatedStats, badges })
  } catch (error) {
    console.error('Error in updateUserProgress:', error)
    res.status(500).json({ error: 'Internal server error' })
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
