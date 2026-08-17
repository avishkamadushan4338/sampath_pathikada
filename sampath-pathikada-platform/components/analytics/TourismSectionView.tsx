"use client";

import * as React from "react";
import type { AreaProfileAggregate } from "@/lib/analytics/aggregate-sections";
import { Bilingual } from "@/components/Bilingual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AnalyticsTableWrapper,
  GnDivisionFilterSelect,
} from "@/components/analytics/AnalyticsSectionShells";

interface GnOption {
  id: string;
  en: string;
  si: string;
}

interface TourismSectionViewProps {
  lang: string;
  tourismGnDivision: string;
  onTourismGnDivisionChange: (value: string) => void;
  employmentGnOptions: GnOption[];
  analyticsError: unknown;
  areaProfile: AreaProfileAggregate | undefined;
}

export function TourismSectionView({
  lang,
  tourismGnDivision,
  onTourismGnDivisionChange,
  employmentGnOptions,
  analyticsError,
  areaProfile,
}: TourismSectionViewProps) {
  const tourismTableRows = React.useMemo(() => {
    const rows = areaProfile?.hotelInventory.rows ?? [];
    const totals = rows.reduce(
      (acc, row) => {
        const category = row.category;
        if (category === "star-graded") {
          acc.starClass.hotels += row.hotelCount ?? 0;
          acc.starClass.rooms += row.roomCount ?? 0;
        }
        if (category === "non-star-graded") {
          acc.nonStar.hotels += row.hotelCount ?? 0;
          acc.nonStar.rooms += row.roomCount ?? 0;
        }
        if (category === "guest-houses") {
          acc.guestHouses.hotels += row.hotelCount ?? 0;
          acc.guestHouses.rooms += row.roomCount ?? 0;
        }
        if (category === "villa-homestay") {
          acc.villaHomeStay.hotels += row.hotelCount ?? 0;
          acc.villaHomeStay.rooms += row.roomCount ?? 0;
        }
        if (category === "conference-centers") {
          acc.massageCenters.hotels += row.hotelCount ?? 0;
          acc.massageCenters.rooms += row.roomCount ?? 0;
        }
        return acc;
      },
      {
        starClass: { hotels: 0, rooms: 0 },
        nonStar: { hotels: 0, rooms: 0 },
        guestHouses: { hotels: 0, rooms: 0 },
        villaHomeStay: { hotels: 0, rooms: 0 },
        massageCenters: { hotels: 0, rooms: 0 },
      }
    );

    return [
      {
        labelEn: "Number of star-class hotels",
        labelSi: "තරු පන්තියේ හෝටල් සංඛ්‍යාව",
        hotels: totals.starClass.hotels,
        rooms: totals.starClass.rooms,
      },
      {
        labelEn: "Number of non-star hotels",
        labelSi: "තරු පන්තියේ නොවන හෝටල් සංඛ්‍යාව",
        hotels: totals.nonStar.hotels,
        rooms: totals.nonStar.rooms,
      },
      {
        labelEn: "Number of guest houses",
        labelSi: "ගෙස්ට් හවුස් සංඛ්‍යාව",
        hotels: totals.guestHouses.hotels,
        rooms: totals.guestHouses.rooms,
      },
      {
        labelEn: "Villas / Home Stay",
        labelSi: "විලාස්/home stay",
        hotels: totals.villaHomeStay.hotels,
        rooms: totals.villaHomeStay.rooms,
      },
      {
        labelEn: "Massage centers",
        labelSi: "සම්භාහන මධ්‍යස්ථාන",
        hotels: totals.massageCenters.hotels,
        rooms: totals.massageCenters.rooms,
      },
    ];
  }, [areaProfile]);

  return (
    <div className="space-y-4">
      <GnDivisionFilterSelect
        lang={lang}
        value={tourismGnDivision}
        onValueChange={onTourismGnDivisionChange}
        options={employmentGnOptions}
      />

      {analyticsError ? (
        <div className="text-sm text-destructive">
          <Bilingual en="Unable to load tourism data." si="සංචාරක දත්ත පූරණය කළ නොහැක." />
        </div>
      ) : !areaProfile ? (
        <div className="text-sm text-muted-foreground">
          <Bilingual en="Loading…" si="පූරණය වෙමින්..." />
        </div>
      ) : (
        <AnalyticsTableWrapper>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>
                  <Bilingual en="Hotel Category" si="හෝටල් වර්ග" />
                </TableHead>
                <TableHead>
                  <Bilingual en="Number of Hotels" si="හෝටල් සංඛ්‍යාව" />
                </TableHead>
                <TableHead>
                  <Bilingual en="Rooms Providing Residential Facilities" si="නේවාසික පහසුකම් ලබාදෙන කාමර ගණන" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tourismTableRows.map((row) => (
                <TableRow key={row.labelEn}>
                  <TableCell className="font-medium">
                    <Bilingual en={row.labelEn} si={row.labelSi} />
                  </TableCell>
                  <TableCell className="nums-tabular">{row.hotels.toLocaleString()}</TableCell>
                  <TableCell className="nums-tabular">{row.rooms.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AnalyticsTableWrapper>
      )}
    </div>
  );
}
