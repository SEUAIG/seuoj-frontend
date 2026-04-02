import { Routes, Route, Navigate, useParams } from "react-router-dom";
import React, { Suspense } from "react";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/bussiness/ProtectedRoute";
import { Loader2 } from "lucide-react";

// 路由级懒加载
const LoginPage = React.lazy(() => import("./components/pages/LoginPage"));
const SignupPage = React.lazy(() => import("./components/pages/SignupPage"));
const ForgetPage = React.lazy(() => import("./components/pages/ForgetPage"));
const NotFoundPage = React.lazy(
  () => import("./components/pages/NotFoundPage")
);
const HomePage = React.lazy(() => import("./components/pages/HomePage"));
const ProblemsLibraryPage = React.lazy(
  () => import("./components/pages/ProblemsLibraryPage")
);
const CompetitionPage = React.lazy(
  () => import("./components/pages/CompetitionPage")
);
const EvaluationPage = React.lazy(
  () => import("./components/pages/EvaluationPage")
);
const ProblemSetListPage = React.lazy(
  () => import("./components/pages/ProblemSetListPage")
);
const ProblemSetCreatePage = React.lazy(
  () => import("./components/pages/ProblemSetCreatePage")
);
const ProblemSetDetailPage = React.lazy(
  () => import("./components/pages/ProblemSetDetailPage")
);
const ProblemSetUpdatePage = React.lazy(
  () => import("./components/pages/ProblemSetUpdatePage")
);
const DiscussionPage = React.lazy(
  () => import("./components/pages/DiscussionPage")
);
const HelpPage = React.lazy(() => import("./components/pages/HelpPage"));
const ProblemDetailPage = React.lazy(
  () => import("./components/pages/ProblemDetailPage")
);
const SubmissionPage = React.lazy(
  () => import("./components/pages/SubmissionPage")
);
const ProblemEditPage = React.lazy(
  () => import("./components/pages/ProblemEditPage")
);
const ProblemCreatePage = React.lazy(
  () => import("./components/pages/ProblemCreatePage")
);
const PersonalPage = React.lazy(
  () => import("./components/pages/PersonalPage")
);
const UnauthorizedPage = React.lazy(
  () => import("./components/pages/UnauthorizedPage")
);
const ProblemTestFilePage = React.lazy(
  () => import("./components/pages/ProblemTestFilePage")
);
const ProblemConfigPage = React.lazy(
  () => import("./components/pages/ProblemConfigPage")
);
const ProblemJudgeConfigPage = React.lazy(
  () => import("./components/pages/ProblemJudgeConfigPage")
);
const ContestListDetailPage = React.lazy(
  () => import("./components/pages/ContestListDetailPage")
);
const ContestProblemDetailPage = React.lazy(
  () => import("./components/pages/ContestProblemDetailPage")
);
const ContestSubmissionPage = React.lazy(
  () => import("./components/pages/ContestSubmissionPage")
);
const ContestSubmissionListPage = React.lazy(
  () => import("./components/pages/ContestSubmissionListPage")
);
const ContestEditPage = React.lazy(
  () => import("./components/pages/ContestEditPage")
);
const CreateContestPage = React.lazy(
  () => import("./components/pages/CreateContestPage")
);
const ClassPage = React.lazy(() => import("./components/pages/ClassPage"));
const ClassDetailPage = React.lazy(
  () => import("./components/pages/ClassDetailPage")
);

function LegacyCompetitionRedirect() {
  const { "*": rest } = useParams();
  const targetPath = rest ? `/contest/${rest}` : "/contest";
  return <Navigate to={targetPath} replace />;
}

// 全局 Loading 组件
const PageLoading = () => (
  <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route index element={<Navigate to="/home" />}></Route>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/signup" element={<SignupPage />}></Route>
          <Route path="/forget" element={<ForgetPage />}></Route>
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/problemsLibrary">
            <Route index element={<ProblemsLibraryPage />} />
            <Route path=":id" element={<ProblemDetailPage />} />
          </Route>
          <Route element={<ProtectedRoute allowRole="user" />}>
            <Route path="/problemsLibrary/create" element={<ProblemCreatePage />} />
            <Route path="/problemsLibrary/:id/edit" element={<ProblemEditPage />} />
            <Route path="/problemsLibrary/:id/testfile" element={<ProblemTestFilePage />} />
            <Route path="/problemsLibrary/:id/config" element={<ProblemConfigPage />} />
            <Route
              path="/problemsLibrary/:id/judgeConfig"
              element={<ProblemJudgeConfigPage />}
            />
          </Route>
          <Route element={<ProtectedRoute allowRole="user" />}>
            <Route path="/submission">
              <Route index element={<SubmissionPage />} />
              <Route path=":submissionNo" element={<SubmissionPage />} />
            </Route>
            <Route path="/personal" element={<PersonalPage />} />
          </Route>
          <Route
            path="/competition/*"
            element={<LegacyCompetitionRedirect />}
          />
          <Route path="/contest">
            <Route index element={<CompetitionPage />} />
            <Route
              path=":contest_public_id"
              element={<ContestListDetailPage />}
            />
            <Route
              path=":contest_public_id/:id"
              element={<ContestProblemDetailPage />}
            />
            <Route
              path=":contest_public_id/submissions"
              element={<ContestSubmissionListPage />}
            />
          </Route>
          <Route element={<ProtectedRoute allowRole="user" />}>
            <Route path="/contest/create" element={<CreateContestPage />} />
            <Route
              path="/contest/:contest_public_id/edit"
              element={<ContestEditPage />}
            />
            <Route
              path="/contest/:contest_public_id/submission/:submission_no"
              element={<ContestSubmissionPage />}
            />
          </Route>
          <Route path="/class">
            <Route index element={<ClassPage />} />
            <Route path=":id" element={<ClassDetailPage />} />
          </Route>
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/problemset" element={<ProblemSetListPage />} />
          <Route path="/problemset/:id" element={<ProblemSetDetailPage />} />
          <Route element={<ProtectedRoute allowRole="user" />}>
            <Route path="/problemset/create" element={<ProblemSetCreatePage />} />
            <Route
              path="/problemset/:id/edit"
              element={<ProblemSetUpdatePage />}
            />
          </Route>
          <Route path="/discussion" element={<DiscussionPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </Suspense>
  );
}

export default App;
