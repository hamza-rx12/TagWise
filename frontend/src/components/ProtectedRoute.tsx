// cette import sert pour la navigation et la gestion de tracking de l'utilisateur
import { Navigate, useLocation } from 'react-router-dom';
// cette import est un hook customisé qui permet de gérer l'authentification de l'utilisateur
import { useAuth } from '../context/AuthContext';
// cette fonction est utilisée pour protéger les routes de l'application
// elle vérifie si l'utilisateur est authentifié et a le bon rôle
// si l'utilisateur n'est pas authentifié, il est redirigé vers la page de connexion    
// si l'utilisateur n'a pas de rôle, il est redirigé vers la page d'accès refusé
// si l'utilisateur n'a pas le bon rôle, il est redirigé vers la page d'accès refusé
// si l'utilisateur a le bon rôle, il peut accéder à la page demandée
interface ProtectedRouteProps {
    // c'est un composant react contenant les composants react qui ont un accès protégé 
    children: React.ReactNode;
    // c'est un tableau de chaînes de caractères contenant les rôles autorisés à accéder à la page
    allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, userRole, isLoading } = useAuth();// on utilise le hook useAuth pour récupérer l'état d'authentification de l'utilisateur
    // on utilise le hook useLocation pour récupérer l'URL actuelle
    const location = useLocation();

    // Show nothing while checking authentication
    if (isLoading) {
        return null;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect to unauthorized if no role found
    if (!userRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Redirect to unauthorized if role not allowed
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }
    // If the user is authenticated and has the right role, render the children
    // which are the protected components
    // This allows the user to access the protected route
    // and see the content of the page
    return <>{children}</>;
} 