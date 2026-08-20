import prisma from "@/lib/db";

export type TableKey = "gn" | "ad" | "ds";

export const ROLE_LABELS: Record<TableKey, string> = {
  gn: "Economic Development Officer",
  ad: "Assistant Director Planning",
  ds: "Divisional Secretariat",
};

export const USER_ROLE_MAP: Record<TableKey, "ECONOMIC_DEVELOPMENT_OFFICER" | "ASSISTANT_DIRECTOR_PLANNING" | "DIVISIONAL_SECRETARIAT"> = {
  gn: "ECONOMIC_DEVELOPMENT_OFFICER",
  ad: "ASSISTANT_DIRECTOR_PLANNING",
  ds: "DIVISIONAL_SECRETARIAT",
};

// dsDivision: pass null/undefined for SUPER_ADMIN (unrestricted). For any other role,
// pass session.dsDivision so an ADMIN can never fetch/mutate another division's
// registration by guessing its id — mirrors the scoping already enforced by the
// GET /api/registrations list endpoint.
export function findRecord(id: string, tableKey: TableKey, dsDivision?: string | null) {
  const where = dsDivision ? { id, dsDivision } : { id };
  if (tableKey === "gn") return prisma.economicDevelopmentOfficerRegistration.findFirst({ where });
  if (tableKey === "ad") return prisma.assistantDirectorPlanningRegistration.findFirst({ where });
  return prisma.divisionalSecretariatRegistration.findFirst({ where });
}

