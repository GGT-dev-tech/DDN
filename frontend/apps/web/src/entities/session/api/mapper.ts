import { UserResponse } from "@repo/api";
import { UserSession } from "../model/types";

export function mapUserResponseToSession(dto: UserResponse): UserSession {
  // In the future, these fields might be added to UserResponse
  return {
    id: dto.id,
    email: dto.email,
    firstName: (dto as any).first_name || "User",
    lastName: (dto as any).last_name || "",
    role: (dto as any).role || "ADMIN",
    tenantId: (dto as any).tenant_id || "tenant-1",
  };
}
