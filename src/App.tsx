import { Routes, Route, Navigate, useParams } from "react-router-dom";
import LoginPage from "./components/pages/LoginPage";
import SignupPage from "./components/pages/SignupPage";
import ForgetPage from "./components/pages/ForgetPage";
import NotFoundPage from "./components/pages/NotFoundPage";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./components/pages/HomePage";
import ProblemsLibraryPage from "./components/pages/ProblemsLibraryPage";
import CompetitionPage from "./components/pages/CompetitionPage";
import EvaluationPage from "./components/pages/EvaluationPage";
import ProblemSetListPage from "./components/pages/ProblemSetListPage";
import ProblemSetCreatePage from "./components/pages/ProblemSetCreatePage";
import ProblemSetDetailPage from "./components/pages/ProblemSetDetailPage";
import ProblemSetUpdatePage from "./components/pages/ProblemSetUpdatePage";
import DiscussionPage from "./components/pages/DiscussionPage";
import HelpPage from "./components/pages/HelpPage";
import ProblemDetailPage from "./components/pages/ProblemDetailPage";
import SubmissionPage from "./components/pages/SubmissionPage";
import ProblemEditPage from "./components/pages/ProblemEditPage";
import ProblemCreatePage from "./components/pages/ProblemCreatePage";
import path from "path";
import PersonalPage from "./components/pages/PersonalPage";
import UnauthorizedPage from "./components/pages/UnauthorizedPage";
import ProtectedRoute from "./components/bussiness/ProtectedRoute";
import ProblemTestFilePage from "./components/pages/ProblemTestFilePage";
import ProblemConfigPage from "./components/pages/ProblemConfigPage";
import ProblemJudgeConfigPage from "./components/pages/ProblemJudgeConfigPage";
import ContestListDetailPage from "./components/pages/ContestListDetailPage";
import ContestProblemDetailPage from "./components/pages/ContestProblemDetailPage";
import ContestSubmissionPage from "./components/pages/ContestSubmissionPage";
import ContestSubmissionListPage from "./components/pages/ContestSubmissionListPage";
import ContestEditPage from "./components/pages/ContestEditPage";
import CreateContestPage from "./components/pages/CreateContestPage";
import ClassPage from "./components/pages/ClassPage";
import ClassDetailPage from "./components/pages/ClassDetailPage";

function LegacyCompetitionRedirect() {
  const { "*": rest } = useParams();
  const targetPath = rest ? `/contest/${rest}` : "/contest";
  return <Navigate to={targetPath} replace />;
}

function App() {
  return (
    <>
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
            <Route path="create" element={<ProblemCreatePage />} />
            <Route path=":id/edit" element={<ProblemEditPage />} />
            <Route path=":id/testfile" element={<ProblemTestFilePage />} />
            <Route path=":id/config" element={<ProblemConfigPage />} />
            <Route path=":id/judgeConfig" element={<ProblemJudgeConfigPage />} />
            <Route path=":id" element={<ProblemDetailPage />} />
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
            <Route path="create" element={<CreateContestPage />} />
            <Route
              path=":contest_public_id"
              element={<ContestListDetailPage />}
            />
            <Route
              path=":contest_public_id/edit"
              element={<ContestEditPage />}
            />
            <Route
              path=":contest_public_id/:id"
              element={<ContestProblemDetailPage />}
            />
            <Route
              path=":contest_public_id/submission/:submission_no"
              element={<ContestSubmissionPage />}
            />
            <Route
              path=":contest_public_id/submissions"
              element={<ContestSubmissionListPage />}
            />
          </Route>
          <Route path="/class">
            <Route index element={<ClassPage />} />
            <Route path=":id" element={<ClassDetailPage />} />
          </Route>
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/problemset" element={<ProblemSetListPage />} />
          <Route path="/problemset/create" element={<ProblemSetCreatePage />} />
          <Route path="/problemset/:id" element={<ProblemSetDetailPage />} />
          <Route
            path="/problemset/:id/edit"
            element={<ProblemSetUpdatePage />}
          />
          <Route path="/discussion" element={<DiscussionPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
