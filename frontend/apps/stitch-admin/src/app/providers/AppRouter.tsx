import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '../../widgets/layout/AppLayout'
import { DashboardPage } from '../../pages/Dashboard/DashboardPage'
import { RoutesPage } from '../../pages/Routes/RoutesPage'
import { FleetPage } from '../../pages/Fleet/FleetPage'
import { DriversPage } from '../../pages/Drivers/DriversPage'
import { SettingsPage } from '../../pages/Settings/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'routes',
        element: <RoutesPage />,
      },
      {
        path: 'fleet',
        element: <FleetPage />,
      },
      {
        path: 'drivers',
        element: <DriversPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
])

export function AppRouterProvider() {
  return <RouterProvider router={router} />
}
