export const keys = {
  user: (id: string) => `user:${id}`,
  session: (id: string) => `session:${id}`,
  store: (id: string) => `store:${id}`,
  member: (id: string) => `member:${id}`,
  userSessions: (userId: string) => `user_sessions:${userId}`,
  storeMembers: (storeId: string) => `store_members:${storeId}`,
  userStores: (userId: string) => `user_stores:${userId}`,
}
