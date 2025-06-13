import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/Landingpage';
import OnBoarding from './pages/OnBoarding';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/protectedRoutes';
import ProfileEdit from './pages/ProfileEdit';
import ResumeBuilder from './pages/ResumeBuilder';
import IndustryInsightsPage from './pages/IndustryInsightsPage';
import ComparisonPage from './pages/ComparisonPage';
import CompetencyTest from './pages/CompetencyTest';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

import './index.css';

function App() {
  return (
    <Router>
      <Header/>
      <div className='min-h-screen'>
        <Routes>
          {/* Public routes */}
          <Route path="/jobnest" element={<LandingPage />} />
          <Route path="/jobnest/auth" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/jobnest/forgot-password" element={<ForgotPassword />} />
          <Route path="/jobnest/reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/jobnest/onboarding"
            element={
              <ProtectedRoute>
                <OnBoarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobnest/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />

          {/* Main protected routes */}
          <Route path="/jobnest/industry-insights" element={
            <ProtectedRoute>
              <IndustryInsightsPage />
            </ProtectedRoute>
          } />
          <Route path="/jobnest/comparison" element={
            <ProtectedRoute>
              <ComparisonPage />
            </ProtectedRoute>
          } />

          {/* Tools routes */}
          <Route path="/jobnest/resume-generator" element={
            <ProtectedRoute>
              <ResumeBuilder />
            </ProtectedRoute>
          } />

          {/* Competency Test Routes */}
          <Route path="/jobnest/competency-test" element={
            <ProtectedRoute>
              <CompetencyTest page="categories" />
            </ProtectedRoute>
          } />
          <Route path="/jobnest/competency-test/quiz/:categoryId" element={
            <ProtectedRoute>
              <CompetencyTest page="quiz" />
            </ProtectedRoute>
          } />
          <Route path="/jobnest/competency-test/results" element={
            <ProtectedRoute>
              <CompetencyTest page="results" />
            </ProtectedRoute>
          } />

          {/* Legacy routes for backward compatibility */}
          <Route path="/jobnest/dashboard/industry-insights" element={
            <ProtectedRoute>
              <IndustryInsightsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;