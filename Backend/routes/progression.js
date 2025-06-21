const completeTask = async (userId, category, xpGained) => {
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

//add xp
  const { level, xp } = addXP({ level: user.level, xp: user.xp }, xpGained)

// badges for milestones
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

  if (updateError) console.error('Error updating user:', updateError)
  else console.log('User progress updated')
}
