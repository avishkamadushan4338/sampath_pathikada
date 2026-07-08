import { AGE_BANDS, ETHNICITIES, RELIGIONS, DISABILITY_TYPES } from "@/lib/validators/sections/demographics";
import type { SubmissionData } from "@/lib/types/submission";

/** Bilingual labels for demographic category keys — not yet covered by lib/i18n/sections/demographics.ts,
 *  which only labels the section's top-level fields, not each category value within them. */
export const AGE_BAND_LABELS: Record<string, { en: string; si: string }> = {
  "0-4":   { en: "0–4 yrs",   si: "අවු. 0-4" },
  "5-14":  { en: "5–14 yrs",  si: "අවු. 5-14" },
  "15-59": { en: "15–59 yrs", si: "අවු. 15-59" },
  "60-80": { en: "60–80 yrs", si: "අවු. 60-80" },
  "80+":   { en: "80+ yrs",   si: "අවු. 80ට වැඩි" },
};

export const ETHNICITY_LABELS: Record<string, { en: string; si: string }> = {
  sinhala:  { en: "Sinhala",  si: "සිංහල" },
  tamil:    { en: "Tamil",    si: "දෙමළ" },
  muslim:   { en: "Muslim",   si: "යෝනක (මුස්ලිම්)" },
  malay:    { en: "Malay",    si: "මැලේ" },
  burgher:  { en: "Burgher",  si: "බර්ගර්" },
  other:    { en: "Other",    si: "වෙනත්" },
};

export const RELIGION_LABELS: Record<string, { en: string; si: string }> = {
  buddhist: { en: "Buddhist", si: "බෞද්ධ" },
  hindu:    { en: "Hindu",    si: "හින්දු" },
  islam:    { en: "Islam",    si: "ඉස්ලාම්" },
  catholic: { en: "Catholic", si: "කතෝලික" },
  other:    { en: "Other",    si: "වෙනත්" },
};

export const DISABILITY_LABELS: Record<string, { en: string; si: string }> = {
  mentalIllness:          { en: "Mental Illness",           si: "මානසික ආබාධ" },
  intellectualDisability: { en: "Intellectual Disability",  si: "අංශභාගය" },
  speechImpairment:       { en: "Speech Impairment",        si: "කථන ආබාධ" },
  hearingImpairment:      { en: "Hearing Impairment",       si: "ශ්‍රවණ ඌනතා" },
  visualImpairment:       { en: "Visual Impairment",        si: "දෘෂ්‍යාබාධ" },
  physicalMobility:       { en: "Physical / Mobility",      si: "අත්පා/ඇවිදීමේ අපහසුතා" },
  multipleDisability:     { en: "Multiple Disability",      si: "බහු ආබාධ" },
};

export interface SexCountTotal { female: number; male: number; total: number; }
export interface CategoryBreakdownRow extends SexCountTotal { key: string; en: string; si: string; }

export interface DemographicsAggregate {
  totalPopulation: number;
  female: number;
  male: number;
  femalePercentage: number | null;
  populationByAge: (SexCountTotal & { band: string; en: string; si: string })[];
  populationByEthnicity: CategoryBreakdownRow[];
  populationByReligion: CategoryBreakdownRow[];
  disabilities: CategoryBreakdownRow[];
  disabilitiesTotal: number;
  foreignNationals: SexCountTotal;
  registeredVoters: SexCountTotal;
  households: { total: number; femaleHeaded: number; displaced: number };
}

function sumSex(rows: { female?: number; male?: number }[] | undefined): SexCountTotal {
  const totals = (rows ?? []).reduce<{ female: number; male: number }>(
    (acc, r) => ({ female: acc.female + (r.female ?? 0), male: acc.male + (r.male ?? 0) }),
    { female: 0, male: 0 }
  );
  return { ...totals, total: totals.female + totals.male };
}

function emptyAggregate(): DemographicsAggregate {
  return {
    totalPopulation: 0, female: 0, male: 0, femalePercentage: null,
    populationByAge: AGE_BANDS.map((band) => ({ band, ...AGE_BAND_LABELS[band], female: 0, male: 0, total: 0 })),
    populationByEthnicity: ETHNICITIES.map((key) => ({ key, ...ETHNICITY_LABELS[key], female: 0, male: 0, total: 0 })),
    populationByReligion: RELIGIONS.map((key) => ({ key, ...RELIGION_LABELS[key], female: 0, male: 0, total: 0 })),
    disabilities: DISABILITY_TYPES.map((key) => ({ key, ...DISABILITY_LABELS[key], female: 0, male: 0, total: 0 })),
    disabilitiesTotal: 0,
    foreignNationals: { female: 0, male: 0, total: 0 },
    registeredVoters: { female: 0, male: 0, total: 0 },
    households: { total: 0, femaleHeaded: 0, displaced: 0 },
  };
}

/** Aggregate every demographics sub-field across a set of submissions' JSON `data` blobs. Tolerates
 *  partial/missing data since a Submission can be a draft with only some sections filled in. */
export function aggregateDemographics(rows: { data: unknown }[]): DemographicsAggregate {
  const agg = emptyAggregate();

  const ageByBand = new Map(agg.populationByAge.map((r) => [r.band, r]));
  const ethnicityByKey = new Map(agg.populationByEthnicity.map((r) => [r.key, r]));
  const religionByKey = new Map(agg.populationByReligion.map((r) => [r.key, r]));
  const disabilityByKey = new Map(agg.disabilities.map((r) => [r.key, r]));

  for (const row of rows) {
    const demo = (row.data as SubmissionData | null)?.demographics;
    if (!demo) continue;

    for (const r of demo.populationByAge ?? []) {
      const bucket = r.band ? ageByBand.get(r.band) : undefined;
      if (!bucket) continue;
      bucket.female += r.female ?? 0;
      bucket.male += r.male ?? 0;
      bucket.total += (r.female ?? 0) + (r.male ?? 0);
    }

    for (const r of demo.populationByEthnicity ?? []) {
      const bucket = r.ethnicity ? ethnicityByKey.get(r.ethnicity) : undefined;
      if (!bucket) continue;
      bucket.female += r.female ?? 0;
      bucket.male += r.male ?? 0;
      bucket.total += (r.female ?? 0) + (r.male ?? 0);
    }

    for (const r of demo.populationByReligion ?? []) {
      const bucket = r.religion ? religionByKey.get(r.religion) : undefined;
      if (!bucket) continue;
      bucket.female += r.female ?? 0;
      bucket.male += r.male ?? 0;
      bucket.total += (r.female ?? 0) + (r.male ?? 0);
    }

    for (const r of demo.disabilities ?? []) {
      const bucket = r.type ? disabilityByKey.get(r.type) : undefined;
      if (!bucket) continue;
      const under = sumSex(r.under18 ? [r.under18] : []);
      const over = sumSex(r.over18 ? [r.over18] : []);
      bucket.female += under.female + over.female;
      bucket.male += under.male + over.male;
      bucket.total += under.total + over.total;
    }

    const foreign = sumSex(demo.foreignNationals ? [demo.foreignNationals] : []);
    agg.foreignNationals.female += foreign.female;
    agg.foreignNationals.male += foreign.male;
    agg.foreignNationals.total += foreign.total;

    const voters = sumSex(demo.registeredVoters ? [demo.registeredVoters] : []);
    agg.registeredVoters.female += voters.female;
    agg.registeredVoters.male += voters.male;
    agg.registeredVoters.total += voters.total;

    if (demo.households) {
      agg.households.total += demo.households.total ?? 0;
      agg.households.femaleHeaded += demo.households.femaleHeaded ?? 0;
      agg.households.displaced += demo.households.displaced ?? 0;
    }
  }

  const ageTotals = sumSex(agg.populationByAge);
  agg.female = ageTotals.female;
  agg.male = ageTotals.male;
  agg.totalPopulation = ageTotals.total;
  agg.femalePercentage = agg.totalPopulation > 0 ? Math.round((agg.female / agg.totalPopulation) * 1000) / 10 : null;
  agg.disabilitiesTotal = agg.disabilities.reduce((sum, d) => sum + d.total, 0);

  return agg;
}
