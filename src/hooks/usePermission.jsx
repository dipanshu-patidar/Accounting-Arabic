import { useAuth } from './AuthContext';

export const usePermission = () => {
  const { hasPermission } = useAuth();

  const canView = (module) => hasPermission(module, 'view');
  const canCreate = (module) => hasPermission(module, 'create');
  const canUpdate = (module) => hasPermission(module, 'update');
  const canDelete = (module) => hasPermission(module, 'delete');

  return {
    canView,
    canCreate,
    canUpdate,
    canDelete,
    hasPermission
  };
};