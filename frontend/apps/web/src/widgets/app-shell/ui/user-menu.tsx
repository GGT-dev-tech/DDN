"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMeQuery } from "../../../features/auth/api/queries";

export function UserMenu() {
  const { data: user, isLoading } = useMeQuery();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse" />
        <div className="w-24 h-4 bg-zinc-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium leading-none">{user.email}</p>
        <p className="text-xs text-zinc-500 mt-1">{user.status || "ACTIVE"}</p>
      </div>
      <Avatar className="h-8 w-8">
        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
        <AvatarFallback>{(user.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>
  );
}
