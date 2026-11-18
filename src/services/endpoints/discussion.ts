export const discussionEndpoints = {
  comments: "/api/comments",
  summary: "/api/comments/summary",
  comment: (id: number) => `/api/comments/${id}`,
  subtree: (id: number) => `/api/comments/${id}/subtree`,
  revisions: (id: number) => `/api/comments/${id}/revisions`,
  moderation: (id: number) => `/api/comments/${id}/moderation`,
  votes: "/api/votes",
  solutions: (pid: string) => `/api/problem/${encodeURIComponent(pid)}/solutions`,
  posts: "/api/post",
  post: (id: number) => `/api/post/${id}`,
  postModeration: (id: number) => `/api/post/${id}/moderation`,
};
