export const assignmentEndpoints = {
  create: (classId: number) => `/api/class/${classId}/assignment`,
  byId: (classId: number, assignmentId: number) => `/api/class/${classId}/assignment/${assignmentId}`,
  page: (classId: number) => `/api/class/${classId}/assignment/page`,
  problems: (classId: number, assignmentId: number) => `/api/class/${classId}/assignment/${assignmentId}/problems`,
  progress: (classId: number) => `/api/class/${classId}/assignment/progress`,
  submissionPage: (classId: number, assignmentId: number) =>
    `/api/class/${classId}/assignment/${assignmentId}/submission/page`,
  importFromProblemSet: (classId: number, assignmentId: number) =>
    `/api/class/${classId}/assignment/${assignmentId}/import`,
  announcementPage: (classId: number, assignmentId: number) =>
    `/api/class/${classId}/assignment/${assignmentId}/announcement/page`,
};
