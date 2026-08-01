import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '../../widgets/layout/AppLayout'
import { DashboardPage } from '../../pages/Dashboard/DashboardPage'
import { RoutesPage } from '../../pages/Routes/RoutesPage'
import { FleetPage } from '../../pages/Fleet/FleetPage'
import { DriversPage } from '../../pages/Drivers/DriversPage'
import { SettingsPage } from '../../pages/Settings/SettingsPage'
import { QuotationsPage } from '../../pages/Quotations/QuotationsPage'
import { QuotationDetailsPage } from '../../pages/Quotations/QuotationDetailsPage'
import { CustomersPage } from '../../pages/Commercial/CustomersPage'
import { CustomerDetailsPage } from '../../pages/Commercial/CustomerDetailsPage'
import { PricingPage } from '../../pages/Pricing/PricingPage'
import { CatalogPage } from '../../pages/Catalog/CatalogPage'
import { ServicePlansPage } from '../../pages/Operations/ServicePlans/ServicePlansPage'
import { RequirementsPage } from '../../pages/Operations/Requirements/RequirementsPage'
import { PlannerPage } from '../../pages/Operations/Planner/PlannerPage'
import { LoginPage } from '../../pages/Auth/LoginPage'
import { RegisterPage } from '../../pages/Auth/RegisterPage'
import { LandingPage } from '../../pages/Public/LandingPage'
import { AuthProvider, useAuth } from './AuthProvider'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Carregando...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'service-plans',
            element: <ServicePlansPage />,
          },
          {
            path: 'requirements',
            element: <RequirementsPage />,
          },
          {
            path: 'planner',
            element: <PlannerPage />,
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
            path: 'customers',
            element: <CustomersPage />,
          },
          {
            path: 'customers/:id',
            element: <CustomerDetailsPage />,
          },
          {
            path: 'pricing',
            element: <PricingPage />,
          },
          {
            path: 'quotations',
            element: <QuotationsPage />,
          },
          {
            path: 'quotations/:id',
            element: <QuotationDetailsPage />,
          },
          {
            path: 'catalog',
            element: <CatalogPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
])

export function AppRouterProvider() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
