// lib/roleRoutes.ts
export const getRoleRoute = (role: string): string => {
  const routes: Record<string, string> = {
    admin: '/admin',
    moderator: '/moderator',
    user: '/dashboard',
  };
  return routes[role] ?? '/dashboard';
};
