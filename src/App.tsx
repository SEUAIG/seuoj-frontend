import { Routes, Route, Link, Navigate } from "react-router-dom";
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
import RankPage from "./components/pages/RankPage";
import DiscussionPage from "./components/pages/DiscussionPage";
import HelpPage from "./components/pages/HelpPage";
import ProblemDetailPage from "./components/pages/ProblemDetailPage";
import SubmissionPage from "./components/pages/SubmissionPage";
import ProblemEditPage from "./components/pages/ProblemEditPage";

import path from 'path';
import PersonalPage from "./components/pages/PersonalPage";

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
          <Route path="/problemsLibrary">
            <Route index element={<ProblemsLibraryPage />} />
            <Route path=":id" element={<ProblemDetailPage />} />
            <Route path=":id/edit" element={<ProblemEditPage />} />
          </Route>
          <Route path="/submission">
            <Route index element={<SubmissionPage/>}/>
            <Route path=":submissionNo" element={<SubmissionPage/>}/>
          </Route>
          <Route path="/competition" element={<CompetitionPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/rank" element={<RankPage />} />
          <Route path="/discussion" element={<DiscussionPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/personal" element={<PersonalPage/>} />
        </Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
