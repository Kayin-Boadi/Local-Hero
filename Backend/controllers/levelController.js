// levelController.js (ES Module)

import { supabase } from '../supabaseClient.js'
import { addXP } from '../utils/levelSystem.js'

export async function updateUserProgress(userId, category, xpGained) {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (fetchError) {
    console.error('Error fetching user:', fetchError)
    return
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
      badges
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user:', updateError)
  } else {
    console.log('User progress updated')
  }
}

