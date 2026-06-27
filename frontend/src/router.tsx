import type { ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { DashboardRoute } from './routes/DashboardRoute';
import { CourseAssignmentsRoute } from './routes/CourseAssignmentsRoute';
import { ConfidenceSurveyRoute } from './routes/ConfidenceSurveyRoute';
import { LoginRoute } from './routes/LoginRoute';
import { RegisterRoute } from './routes/RegisterRoute';
import { ConsentRoute } from './routes/ConsentRoute';
import { SelfDeclareRoute } from './routes/SelfDeclareRoute';
import { DiagnosticRoute } from './routes/DiagnosticRoute';
import { ProblemRoute } from './routes/ProblemRoute';
import { DesignProblemRoute } from './routes/DesignProblemRoute';
import { DesignShowcaseRoute } from './routes/DesignShowcaseRoute';
import { SettingsRoute } from './routes/SettingsRoute';

const shell = (element: ReactNode) => <AppShell>{element}</AppShell>;

export const router = createBrowserRouter([
  { path: '/',                        element: <LoginRoute /> },
  { path: '/login',                   element: <LoginRoute /> },
  { path: '/...',                     element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard.',              element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard',               element: <DashboardRoute /> },
  { path: '/settings',                element: <SettingsRoute /> },
  { path: '/courses/:courseId',                    element: <CourseAssignmentsRoute /> },
  { path: '/courses/:courseId/hw/:hwId/confidence', element: <ConfidenceSurveyRoute /> },
  { path: '/register',                element: <RegisterRoute /> },
  { path: '/onboarding',              element: <SelfDeclareRoute /> },
  { path: '/onboarding/consent',      element: shell(<ConsentRoute />) },
  { path: '/onboarding/self-declare', element: <SelfDeclareRoute /> },
  { path: '/onboarding/diagnostic',   element: shell(<DiagnosticRoute />) },
  { path: '/problemset',              element: <DesignProblemRoute /> },
  { path: '/problems',                element: <ProblemRoute /> },
  { path: '/problems/:id',            element: <ProblemRoute /> },
  { path: '/design/showcase',         element: <DesignShowcaseRoute /> },
  { path: '/design/problem',          element: <DesignProblemRoute /> },
]);
