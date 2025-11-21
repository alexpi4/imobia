import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/types';

interface ProtectedRouteProps {
    requiredRole?: AppRole;
}

export const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (profile?.role === 'NENHUM') {
        return <div className="flex h-screen items-center justify-center flex-col gap-4">
            <h1 className="text-2xl font-bold">Acesso Pendente</h1>
            <p>Seu cadastro está aguardando aprovação de um administrador.</p>
        </div>
    }

    if (requiredRole && profile?.role !== 'ADMIN' && profile?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
