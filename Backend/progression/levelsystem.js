function xpNeededForLevel(level) {
  const baseXP = 10
  const exponent = 1.5
  return Math.floor(baseXP * Math.pow(level, exponent))
}

function addXP(userProgress, amount) {
  userProgress.xp += amount

  // Level up as long as XP exceeds current level requirement
  while (userProgress.xp >= xpNeededForLevel(userProgress.level)) {
    userProgress.xp -= xpNeededForLevel(userProgress.level)
    userProgress.level += 1
  }

  return userProgress
}

module.exports = { addXP, xpNeededForLevel }
