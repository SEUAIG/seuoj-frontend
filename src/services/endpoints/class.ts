export const classEndpoints = {
  create: "/api/class",
  page: "/api/class/page",
  byId: (classId: number) => `/api/class/${classId}`,
  join: (classId: number) => `/api/class/${classId}/join`,
  member: (classId: number, userId: number) => `/api/class/${classId}/member/${userId}`,
  memberPage: (classId: number) => `/api/class/${classId}/member/page`,
  overview: (classId: number) => `/api/class/${classId}/overview`,
  assignmentOverview: (classId: number, assignmentId: number) =>
    `/api/class/${classId}/overview/assignment/${assignmentId}`,
  announcementPage: (classId: number) => `/api/class/${classId}/announcement/page`,
  announcementById: (classId: number, announcementId: number) =>
    `/api/class/${classId}/announcement/${announcementId}`,
  createAnnouncement: (classId: number) => `/api/class/${classId}/announcement`,
  createAssignmentAnnouncement: (classId: number, assignmentId: number) =>
    `/api/class/${classId}/assignment/${assignmentId}/announcement`,
  linkedContestPage: (classId: number) => `/api/class/${classId}/contest/page`,
  linkedContestById: (classId: number, contestId: number) => `/api/class/${classId}/contest/${contestId}`,
  linkedProblemSetPage: (classId: number) => `/api/class/${classId}/problem_set/page`,
  linkedProblemSetById: (classId: number, problemSetId: number) =>
    `/api/class/${classId}/problem_set/${problemSetId}`,
  problemSetMatrix: (classId: number, problemSetId: number) =>
    `/api/class/${classId}/problem_set/${problemSetId}/matrix`,
  batchImportMembers: (classId: number) => `/api/class/${classId}/batch-import`,
};
