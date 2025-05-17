import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verification from './pages/Verification';
import AnnotatorHome from './pages/AnnotatorHome';
import AdminHome from './pages/AdminHome';
import CreateDataset from './pages/CreateDataset';
import DatasetList from '/home/oumaima/Desktop/ID2-S2/JEE && Spring/PROJECT/Newtagwise/TagWise/frontend/src/pages/DatasetList.tsx';
import DatasetDetails from './pages/DatasetDetails';
import AssignAnnotators from './pages/AssignAnnotators';
import ManageAnnotators from './pages/ManageAnnotators';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Unauthorized from './pages/Unauthorized';

function App() {
    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/verify" element={<Verification />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/annotator" element={
                            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
                                <AnnotatorHome />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                                <AdminHome />
                            </ProtectedRoute>
                        }>
                            <Route index element={<DatasetList />} />
                            <Route path="datasets" element={<DatasetList />} />
                            <Route path="datasets/create" element={<CreateDataset />} />
                            <Route path="datasets/:id" element={<DatasetDetails />} />
                            <Route path="datasets/:id/assign" element={<AssignAnnotators />} />
                            <Route path="annotators" element={<ManageAnnotators />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}

export default App;