"use client";

import { useMeQuery } from "../../features/auth/api/queries";
import { useCompaniesList } from "../../entities/company/api/use-companies-list";
import { useContractsQuery } from "../../features/contract/api/queries";
import { useRoutesQuery } from "../../features/routing/api/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/ui/card";
import { Badge } from "@repo/ui/src/components/ui/badge";
import { Button } from "@repo/ui/src/components/ui/button";
import {
  Skeleton,
} from "@repo/ui/src/components/ui/skeleton";
import {
  Building2,
  FileText,
  Route,
  CalendarDays,
  Plus,
  ArrowRight,
  Map as MapIcon,
  Library,
} from "lucide-react";
import Link from "next/link";

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  isLoading,
}: {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ElementType;
  href: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-zinc-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value}</div>
        )}
        {description && (
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        )}
        <Link
          href={href}
          className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

const QUICK_ACTIONS = [
  {
    label: "Nova Empresa",
    description: "Cadastrar um novo cliente ou fornecedor",
    icon: Building2,
    href: "/companies",
  },
  {
    label: "Novo Contrato",
    description: "Formalizar um acordo com um cliente",
    icon: FileText,
    href: "/contracts",
  },
  {
    label: "Calcular Rota",
    description: "Planejar rota de coleta otimizada",
    icon: MapIcon,
    href: "/routing/new",
  },
  {
    label: "Novo Plano",
    description: "Criar plano de serviço para contrato",
    icon: CalendarDays,
    href: "/service-plans",
  },
  {
    label: "Novo Serviço",
    description: "Adicionar serviço ao catálogo",
    icon: Library,
    href: "/catalog",
  },
];

export default function DashboardPage() {
  const { data: user } = useMeQuery();
  const { data: companies, isLoading: loadingCompanies } = useCompaniesList();
  const { data: contracts, isLoading: loadingContracts } = useContractsQuery();
  const { data: routes, isLoading: loadingRoutes } = useRoutesQuery();

  const activeContracts = contracts?.filter((c) =>
    ["ACTIVE", "active"].includes(c.status)
  ).length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const username = user?.email ? user.email.split("@")[0] : "";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* ── Header ───────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}{username ? `, ${username}` : ""}! 👋
        </h1>
        <p className="text-zinc-500 mt-2">
          Visão geral operacional da plataforma DDN OS.
        </p>
      </div>

      {/* ── Metric Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Empresas Cadastradas"
          value={companies?.length ?? "—"}
          description="Clientes e fornecedores"
          icon={Building2}
          href="/companies"
          isLoading={loadingCompanies}
        />
        <MetricCard
          title="Contratos Ativos"
          value={activeContracts ?? "—"}
          description={`${contracts?.length ?? 0} total`}
          icon={FileText}
          href="/contracts"
          isLoading={loadingContracts}
        />
        <MetricCard
          title="Rotas"
          value={routes?.length ?? "—"}
          description="Programadas e em andamento"
          icon={Route}
          href="/routing"
          isLoading={loadingRoutes}
        />
        <MetricCard
          title="Planos de Serviço"
          value="—"
          description="Requer seleção de contrato"
          icon={CalendarDays}
          href="/service-plans"
        />
      </div>

      {/* ── Quick Actions ─────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <action.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-sm font-semibold">
                      {action.label}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Routes ─────────────────────────────────── */}
      {routes && routes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Rotas Recentes</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/routing">
                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            {routes.slice(0, 5).map((route) => (
              <Link key={route.id} href={`/routing/${route.id}`}>
                <Card className="hover:shadow-sm hover:border-zinc-300 transition-all cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Route className="h-4 w-4 text-zinc-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium font-mono text-zinc-700">
                          {route.id}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {route.executionDate} · {route.stopsCount} paradas ·{" "}
                          {route.plannedDistance} km
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${route.statusColor}`}
                    >
                      {route.statusLabel}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
