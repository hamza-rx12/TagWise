import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verification from './pages/Verification';
import AnnotatorHome from './pages/AnnotatorHome';
import AdminHome from './pages/AdminHome';
import AnnotatorsManagement from './pages/annotators_management/AnnotatorsManagement';
import EditAnnotator from './pages/annotators_management/EditAnnotator';
import Dashboard from './pages/annotators_management/Dashboard';
import Reports from './pages/annotators_management/Reports';
import Messages from './pages/annotators_management/Messages';
import Calendar from './pages/annotators_management/Calendar';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AnnotatorSelection from './pages/annotators_management/AnnotatorSelection';
import DatasetList from './pages/dataset/DatasetList';
import CreateDataset from './pages/dataset/CreateDataset';
import DatasetDetails from './pages/dataset/DatasetDetailsView';
import AssignAnnotators from './pages/dataset/AssignAnnotators';

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
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Calendar />
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

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
