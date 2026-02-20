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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0D14' }}>
                <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(139,92,246,0.3)', borderTopColor: '#8B5CF6' }} />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;

    return children;
};

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'space_dashboard', label: 'Inicio', path: '/' },
        { icon: 'calendar_today', label: 'Rutinas', path: '/routines' },
        { icon: 'groups', label: 'Comunidad', path: '/community' },
        { icon: 'leaderboard', label: 'Análisis', path: '/analytics' },
        { icon: 'person', label: 'Perfil', path: '/profile' },
    ];

    return (
        <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50">
            <div className="flex items-center justify-around px-4 py-3">
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
        className="flex flex-col items-center gap-1 min-w-[52px] transition-all"
        style={{ color: active ? '#A78BFA' : 'rgba(100,116,139,0.8)' }}
    >
        <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
                background: active ? 'rgba(139,92,246,0.15)' : 'transparent',
            }}
        >
            <span className="material-icons-round text-xl">{icon}</span>
        </div>
        <span className="text-[10px] font-semibold">{label}</span>
    </button>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <div style={{ background: '#0A0D14', minHeight: '100vh' }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
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
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
