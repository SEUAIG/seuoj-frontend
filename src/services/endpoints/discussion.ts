export const discussionEndpoints = {
  comments: "/api/comments",
  summary: "/api/comments/summary",
  comment: (id: number) => `/api/comments/${id}`,
  subtree: (id: number) => `/api/comments/${id}/subtree`,
  moderation: (id: number) => `/api/comments/${id}/moderation`,
  votes: "/api/votes",
};
