export function isAdminUser(clerkId: string | undefined): boolean {
  if (!clerkId) return false
  const ids = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  return ids.includes(clerkId)
}
