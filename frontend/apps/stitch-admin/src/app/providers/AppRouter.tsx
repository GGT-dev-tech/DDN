import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '../../widgets/layout/AppLayout'
import { DashboardPage } from '../../pages/Dashboard/DashboardPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Other routes to be implemented in Sprint 6
      {
        path: 'routes',
        element: <div className="p-4">Routes Content (WIP)</div>,
      },
      {
        path: 'fleet',
        element: <div className="p-4">Fleet Content (WIP)</div>,
      },
      {
        path: 'drivers',
        element: <div className="p-4">Drivers Content (WIP)</div>,
      },
      {
        path: 'settings',
        element: <div className="p-4">Settings Content (WIP)</div>,
      },
    ],
  },
])

export function AppRouterProvider() {
  return <RouterProvider router={router} />
}
