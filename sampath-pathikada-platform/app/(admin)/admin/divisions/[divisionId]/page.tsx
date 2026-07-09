import { redirect } from "next/navigation";

// An ADMIN account is permanently scoped to exactly one division, so there is
// no drill-down list to pick from — /admin/divisions already shows that one
// division directly. This route only exists to avoid a dead link if reached.
export default function AdminDivisionDetailPage() {
  redirect("/admin/divisions");
}
