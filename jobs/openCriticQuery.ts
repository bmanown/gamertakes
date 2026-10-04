export function openCriticSyncQuery(now = Date.now()) {
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000)
  return {
    where: {
      OR: [{ openCriticLastSync: null }, { openCriticLastSync: { lt: oneDayAgo } }],
    },
    orderBy: { popularityScore: 'desc' as const },
    take: 200,
  }
}
