import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface RequireProfileCompletionProps {
  children: React.ReactNode;
}

const RequireProfileCompletion: React.FC<RequireProfileCompletionProps> = ({ children }) => {
  const { needsProfileCompletion, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && needsProfileCompletion && location.pathname !== '/complete-profile') {
      navigate('/complete-profile', { replace: true });
    }
  }, [needsProfileCompletion, loading, navigate, location.pathname]);

  if (loading) return null;
  if (needsProfileCompletion && location.pathname !== '/complete-profile') return null;
  return <>{children}</>;
};

export default RequireProfileCompletion; 