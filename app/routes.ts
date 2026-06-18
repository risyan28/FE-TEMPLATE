import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('/dashboard-user/manufacture', 'routes/manufacture.tsx'),
  route('/dashboard-master', 'routes/dashboard-master.tsx'),
  route(
    '/dashboard-user/manufacture/pim-queue',
    'routes/dashboard-user/manufacture/pim-queue.tsx',
  ),
  route(
    '/dashboard-user/manufacture/pim-nes',
    'routes/dashboard-user/manufacture/pim-nes.tsx',
  ),
  route(
    '/dashboard-user/manufacture/pim-lines',
    'routes/dashboard-user/manufacture/pim-lines.tsx',
  ),
  route(
    '/dashboard-user/manufacture/settings',
    'routes/dashboard-user/manufacture/settings.tsx',
  ),
] satisfies RouteConfig
