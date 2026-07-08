"use client";

import { Hotel, Home } from "lucide-react";
import { StatCard, CoverageBadge, NAVY, GOLD, GREEN } from "@/components/dashboard/chart-primitives";
import { SectionDataTable } from "@/components/dashboard/SectionDataTable";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";

export function TourismTab({ data }: { data: AreaProfileAggregate }) {
  const totalHotelRooms = data.hotelInventory.rows.reduce((s: number, r: any) => s + (r.roomCount ?? 0), 0);
  const totalHotels = data.hotelInventory.rows.reduce((s: number, r: any) => s + (r.hotelCount ?? 0), 0);
  const totalGuestRooms = data.guestAccommodations.rows.reduce((s: number, r: any) => s + (r.roomCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <CoverageBadge {...data.coverage.tourism} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Hotel} label="Registered Hotels" value={totalHotels} sub={`${totalHotelRooms.toLocaleString()} rooms total`} iconBg={NAVY} />
        <StatCard icon={Home} label="Guest Houses / Villas / Homestays" value={data.guestAccommodations.rows.length} sub={`${totalGuestRooms.toLocaleString()} rooms`} iconBg={GOLD} />
        <StatCard icon={Home} label="Other Accommodations" value={data.otherAccommodations.rows.length} sub="Listed establishments" iconBg={GREEN} />
        <StatCard icon={Hotel} label="Total Accommodation Rooms" value={(totalHotelRooms + totalGuestRooms).toLocaleString()} sub="Across all categories" iconBg={NAVY} />
      </div>

      <SectionDataTable title="Registered Hotels (by Star Grade)" rows={data.hotelInventory.rows} truncated={data.hotelInventory.truncated} columns={[{ key: "starGrade", label: "Star Grade" }, { key: "hotelCount", label: "Hotels" }, { key: "roomCount", label: "Rooms" }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionDataTable title="Guest Houses / Villas / Homestays" rows={data.guestAccommodations.rows} truncated={data.guestAccommodations.truncated} columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "roomCount", label: "Rooms" }, { key: "address", label: "Address" }]} />
        <SectionDataTable title="Other Accommodation Establishments" rows={data.otherAccommodations.rows} truncated={data.otherAccommodations.truncated} columns={[{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "address", label: "Address" }]} />
      </div>
    </div>
  );
}
