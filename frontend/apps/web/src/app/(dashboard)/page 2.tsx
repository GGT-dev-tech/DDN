"use client";

import { useMeQuery } from "../../features/auth/api/queries";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@repo/ui/src/components/ui/card";
import { FileText, Map, Settings, Truck } from "lucide-react";

export default function DashboardPage() {
  const { data: user, isLoading } = useMeQuery();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ""}!
        </h1>
        <p className="text-zinc-500 mt-2">
          Here is the operational overview for your tenant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-zinc-500 mt-1">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Service Plans</CardTitle>
            <Settings className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-zinc-500 mt-1">14 needing routing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Routes</CardTitle>
            <Map className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-zinc-500 mt-1">In progress today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Fleet Active</CardTitle>
            <Truck className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-zinc-500 mt-1">Trucks on the road</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Skeleton while loading user data if necessary */}
      {isLoading && (
        <div className="mt-8 text-center text-sm text-zinc-400 animate-pulse">
          Loading operational data...
        </div>
      )}
    </div>
  );
}
