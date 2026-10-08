export function popularityScore(entryCount: number, reviewCount: number) {
  return entryCount * 1 + reviewCount * 3
}

export function recentActivityWhere(since: Date) {
  return {
    OR: [
      { entries: { some: { updatedAt: { gte: since } } } },
      { reviews: { some: { createdAt: { gte: since } } } },
    ],
  }
}
