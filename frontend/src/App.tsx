import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/student/HomePage'
import CalendarPage from './pages/student/CalendarPage'
import ClinicalTutorHomePage from './pages/clinical_tutor/HomePage'
import ClinicalTutorCalendarPage from './pages/clinical_tutor/CalendarPage'
import ClinicalTutorProfilePage from './pages/clinical_tutor/ProfilePage'
import StudentProfilePage from './pages/student/ProfilePage'
import ClinicalTutorEvaluationPage from './pages/clinical_tutor/EvaluationPage'
import StudentEvaluationPage from './pages/student/EvaluationPage'
import CoordinatorHomePage from './pages/coordinator/HomePage'
import CoordinatorCalendarPage from './pages/coordinator/CalendarPage'
import CoordinatorUsersPage from './pages/coordinator/UsersPage'
import CoordinatorAssignmentsPage from './pages/coordinator/AssignmentsPage'
import CoordinatorRubricsPage from './pages/coordinator/RubricsPage'
import AcademicTutorHomePage from './pages/academic_tutor/HomePage'
import AcademicTutorCalendarPage from './pages/academic_tutor/CalendarPage'
import AcademicTutorEvaluationPage from './pages/academic_tutor/EvaluationPage'
import AcademicTutorProfilePage from './pages/academic_tutor/ProfilePage'


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={
            <PrivateRoute><HomePage /></PrivateRoute>
          } />
          <Route path="/calendar" element={
            <PrivateRoute><CalendarPage /></PrivateRoute>
          } />
          <Route path="/evaluation" element={
            <PrivateRoute><StudentEvaluationPage /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><StudentProfilePage /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/tutor/home" element={
            <PrivateRoute><ClinicalTutorHomePage /></PrivateRoute>
          } />
          <Route path="/tutor/calendar" element={
            <PrivateRoute><ClinicalTutorCalendarPage /></PrivateRoute>
          } />
          <Route path="/tutor/evaluation" element={
            <PrivateRoute><ClinicalTutorEvaluationPage /></PrivateRoute>
          } />
          <Route path="/tutor/profile" element={
            <PrivateRoute><ClinicalTutorProfilePage /></PrivateRoute>
          } />
          <Route path="/academic/home" element={
            <PrivateRoute><AcademicTutorHomePage /></PrivateRoute>
          } />
          <Route path="/academic/calendar" element={
            <PrivateRoute><AcademicTutorCalendarPage /></PrivateRoute>
          } />
          <Route path="/academic/evaluation" element={
            <PrivateRoute><AcademicTutorEvaluationPage /></PrivateRoute>
          } />
          <Route path="/academic/profile" element={
            <PrivateRoute><AcademicTutorProfilePage /></PrivateRoute>
          } />
          <Route path="/coordinator/home" element={
            <PrivateRoute><CoordinatorHomePage /></PrivateRoute>
          } />
          <Route path="/coordinator/calendar" element={
            <PrivateRoute><CoordinatorCalendarPage /></PrivateRoute>
          } />
          <Route path="/coordinator/users" element={
            <PrivateRoute><CoordinatorUsersPage /></PrivateRoute>
          } />
          <Route path="/coordinator/assignments" element={
            <PrivateRoute><CoordinatorAssignmentsPage /></PrivateRoute>
          } />
          <Route path="/coordinator/rubrics" element={
            <PrivateRoute><CoordinatorRubricsPage /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

