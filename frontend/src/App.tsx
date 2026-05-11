import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DashboardPage from './components/dashboard/DashboardPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import ProfilePage from './components/profile/ProfilePage';
import RoutineList from './components/routines/RoutineList';
import RoutineBuilder from './components/routines/RoutineBuilder';
import WorkoutLogger from './components/routines/WorkoutLogger';
import CommunityPage from './components/community/CommunityPage';
import PublicProfile from './components/profile/PublicProfile';
import TermsOfUse from './components/legal/TermsOfUse';
import AdminDashboard from './components/admin/AdminDashboard';
import CoachDashboard from './components/admin/CoachDashboard';
import TrainingCalendar from './components/calendar/TrainingCalendar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;

    return children;
};

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'space_dashboard', label: 'Inicio', path: '/' },
        { icon: 'calendar_today', label: 'Rutinas', path: '/routines' },
        { icon: 'groups', label: 'Social', path: '/community' },
        { icon: 'leaderboard', label: 'Análisis', path: '/analytics' },
        { icon: 'person', label: 'Perfil', path: '/profile' },
    ];

    if (user?.role === 'trainer' || user?.role === 'admin') {
        navItems.splice(4, 0, { icon: 'sports', label: 'Coach', path: '/coach' });
    }

    return (
        <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 pb-safe">
            <div className="flex items-center justify-between px-4 py-2">
                {navItems.map((item) => (
                    <NavBtn key={item.path} {...item} active={isActive(item.path)} onClick={() => navigate(item.path)} />
                ))}
            </div>
        </nav>
    );
};

interface NavBtnProps {
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
}

const NavBtn: React.FC<NavBtnProps> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className="flex-1 flex flex-col items-center gap-1 transition-all relative group min-w-0"
    >
        <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                active 
                    ? 'bg-emerald-50 text-primary shadow-sm' 
                    : 'bg-transparent text-slate-400'
            }`}
        >
            <span className={`material-icons-round ${active ? 'text-2xl' : 'text-xl'}`}>{icon}</span>
        </div>
        <span className={`text-[7px] font-black uppercase tracking-tight truncate w-full px-0.5 ${active ? 'text-primary' : 'text-slate-400'}`}>
            {label}
        </span>
    </button>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="bg-white min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-900">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/terms" element={<TermsOfUse />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                    <BottomNav />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/analytics"
                            element={
                                <ProtectedRoute>
                                    <AnalyticsPage />
                                    <BottomNav />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                    <BottomNav />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/routines"
                            element={
                                <ProtectedRoute>
                                    <div className="pt-6">
                                        <RoutineList />
                                        <BottomNav />
                                    </div>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/community"
                            element={
                                <ProtectedRoute>
                                    <CommunityPage />
                                    <BottomNav />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/user/:id"
                            element={
                                <ProtectedRoute>
                                    <PublicProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/routines/new"
                            element={
                                <ProtectedRoute>
                                    <RoutineBuilder />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/workout/:routineId"
                            element={
                                <ProtectedRoute>
                                    <WorkoutLogger />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/calendar"
                            element={
                                <ProtectedRoute>
                                    <div className="p-6 pb-28">
                                        <h1 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Calendario de Entrenamiento</h1>
                                        <TrainingCalendar />
                                    </div>
                                    <BottomNav />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                    <BottomNav />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/coach"
                            element={
                                <ProtectedRoute>
                                    <CoachDashboard />
                                    <BottomNav />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
