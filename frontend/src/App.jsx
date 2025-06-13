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
    <Router basename="/jobnest">
      <Header/>
      <div className='min-h-screen'>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnBoarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />

          {/* Main protected routes */}
          <Route path="/industry-insights" element={
            <ProtectedRoute>
              <IndustryInsightsPage />
            </ProtectedRoute>
          } />
          <Route path="/comparison" element={
            <ProtectedRoute>
              <ComparisonPage />
            </ProtectedRoute>
          } />

          {/* Tools routes */}
          <Route path="/resume-generator" element={
            <ProtectedRoute>
              <ResumeBuilder />
            </ProtectedRoute>
          } />

          {/* Competency Test Routes */}
          <Route path="/competency-test" element={
            <ProtectedRoute>
              <CompetencyTest page="categories" />
            </ProtectedRoute>
          } />
          <Route path="/competency-test/quiz/:categoryId" element={
            <ProtectedRoute>
              <CompetencyTest page="quiz" />
            </ProtectedRoute>
          } />
          <Route path="/competency-test/results" element={
            <ProtectedRoute>
              <CompetencyTest page="results" />
            </ProtectedRoute>
          } />

          {/* Legacy routes for backward compatibility */}
          <Route path="/dashboard/industry-insights" element={
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