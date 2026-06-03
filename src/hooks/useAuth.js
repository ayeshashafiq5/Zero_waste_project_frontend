// Re-export so components can `import { useAuth } from '../hooks/useAuth'`
// (symmetry with other hooks). Source of truth lives in AuthContext.
export { useAuth } from '../context/AuthContext';
