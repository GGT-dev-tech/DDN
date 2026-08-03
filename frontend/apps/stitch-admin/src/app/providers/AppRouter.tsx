import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '../../widgets/layout/AppLayout'
import { DashboardPage } from '../../pages/Dashboard/DashboardPage'
import { RoutesPage } from '../../pages/Operations/RoutesPage'
import { FleetPage } from '../../pages/Fleet/FleetPage'
import { DriversPage } from '../../pages/Drivers/DriversPage'
import { SettingsPage } from '../../pages/Settings/SettingsPage'
import { QuotationsPage } from '../../pages/Quotations/QuotationsPage'
import { QuotationDetailsPage } from '../../pages/Quotations/QuotationDetailsPage'
import { ContractsPage } from '../../pages/Contracts/ContractsPage'
import { ContractDetailsPage } from '../../pages/Contracts/ContractDetailsPage'
import { CustomersPage } from '../../pages/Commercial/CustomersPage'
import { CustomerDetailsPage } from '../../pages/Commercial/CustomerDetailsPage'
import { PricingPage } from '../../pages/Pricing/PricingPage'
import { CatalogPage } from '../../pages/Catalog/CatalogPage'
import { ServicePlansPage } from '../../pages/Operations/ServicePlansPage'
import { ServicePlanDetailsPage } from '../../pages/Operations/ServicePlanDetailsPage'
import { RequirementsPage } from '../../pages/Operations/Requirements/RequirementsPage'
import { PlannerPage } from '../../pages/Operations/PlannerPage'
import { ServiceOrdersPage } from '../../pages/Operations/ServiceOrders/ServiceOrdersPage'
import { MTRsPage } from '../../pages/Operations/MTRs/MTRsPage'
import { LoginPage } from '../../pages/Auth/LoginPage'
import { RegisterPage } from '../../pages/Auth/RegisterPage'
import { LandingPage } from '../../pages/Public/LandingPage'
import { BillingPage } from '../../pages/Billing/BillingPage'
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
            path: 'service-plans/:id',
            element: <ServicePlanDetailsPage />,
          },
          {
            path: 'service-orders',
            element: <ServiceOrdersPage />,
          },
          {
            path: 'mtrs',
            element: <MTRsPage />,
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
            path: 'contracts',
            element: <ContractsPage />,
          },
          {
            path: 'contracts/:id',
            element: <ContractDetailsPage />,
          },
          {
            path: 'catalog',
            element: <CatalogPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'billing',
            element: <BillingPage />,
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
