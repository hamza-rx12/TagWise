import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verification from './pages/Verification';
import AnnotatorHome from './pages/AnnotatorHome';
import AdminHome from './pages/AdminHome';
import AnnotatorsManagement from './pages/admin/AnnotatorsManagement.tsx';
import EditAnnotator from './pages/admin/EditAnnotator.tsx';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import AdminMessages from './pages/admin/AdminMessages';
import AdminCalendar from './pages/admin/AdminCalendar';
import AnnotatorReports from './pages/annotator/AnnotatorReports';
import AnnotatorMessages from './pages/annotator/AnnotatorMessages';
import AnnotatorCalendar from './pages/annotator/AnnotatorCalendar';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AnnotatorSelection from './pages/admin/AnnotatorSelection.tsx';
import DatasetList from './pages/dataset/DatasetList';
import CreateDataset from './pages/dataset/CreateDataset';
import DatasetDetails from './pages/dataset/DatasetDetailsView';
import AssignAnnotators from './pages/dataset/AssignAnnotators';
import AnnotatorTasks from './pages/annotator/AnnotatorTasks.tsx';
import AnnotatorProfile from './pages/annotator/AnnotatorProfile';
import AnnotatorDashboard from './pages/annotator/AnnotatorDashboard';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden" role="main">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Annotator Route */}
            <Route
              path="/annotator"
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <AnnotatorHome />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/annotators-management"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AnnotatorsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-annotator"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <EditAnnotator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/annotator-selection"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AnnotatorSelection />
                </ProtectedRoute>
              }
            />

            {/* Dataset Management Routes */}
            <Route
              path="/admin/datasets"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <DatasetList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/datasets/create"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <CreateDataset />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/datasets-list/:id"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <DatasetDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/datasets/:id/assign"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AssignAnnotators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/annotator/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <AnnotatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/annotator/tasks"
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <AnnotatorTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/annotator/profile"
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <AnnotatorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/annotator/messages"
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <AnnotatorMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/annotator/calendar"
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <AnnotatorCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/annotator/reports"
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <AnnotatorReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
