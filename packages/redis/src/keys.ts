export const keys = {
  user: (id: string) => `user:${id}`,
  userSession: (id: string) => `user_session:${id}`,
  store: (id: string) => `store:${id}`,
  member: (id: string) => `member:${id}`,
  userSessionSet: (userId: string) => `user_session_set:${userId}`,
}
