import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('/login', 'routes/login.tsx'),
  route('/dashboard', 'routes/dashboard/index.tsx'),
  // TODO: tambah route baru di sini
  // route('/dashboard/users', 'routes/dashboard/users.tsx'),
] satisfies RouteConfig
