import { describe, it, expect } from "vitest";
import { SECTION_KEYS } from "@/lib/types/submission";
import {
  parseSectionReviews,
  getSectionReviewState,
  deriveSubmissionStatus,
  isUnderReview,
  getSectionEditability,
  countSectionReviews,
  type SectionReviews,
} from "@/lib/submission-review";

const APPROVED_ENTRY = { status: "APPROVED" as const, note: null, reviewedById: "u1", reviewedAt: "2026-01-01T00:00:00.000Z" };
const REVISION_ENTRY = { status: "REVISION_NEEDED" as const, note: "Fix the count", reviewedById: "u1", reviewedAt: "2026-01-01T00:00:00.000Z" };

function allApproved(): SectionReviews {
  return Object.fromEntries(SECTION_KEYS.map((key) => [key, APPROVED_ENTRY])) as SectionReviews;
}

describe("parseSectionReviews", () => {
  it("returns {} for null", () => {
    expect(parseSectionReviews(null)).toEqual({});
  });

  it("returns {} for a non-object", () => {
    expect(parseSectionReviews("garbage")).toEqual({});
  });

  it("keeps a well-formed entry", () => {
    const result = parseSectionReviews({ education: APPROVED_ENTRY });
    expect(result.education).toEqual(APPROVED_ENTRY);
  });

  it("drops an entry with an invalid status", () => {
    const result = parseSectionReviews({ education: { status: "MAYBE", note: null, reviewedById: "u1", reviewedAt: "x" } });
    expect(result.education).toBeUndefined();
  });

  it("drops an entry missing reviewedById", () => {
    const result = parseSectionReviews({ education: { status: "APPROVED", note: null, reviewedAt: "x" } });
    expect(result.education).toBeUndefined();
  });

  it("drops a stale key not in SECTION_KEYS", () => {
    const result = parseSectionReviews({ notARealSection: APPROVED_ENTRY });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("coerces a missing note to null", () => {
    const result = parseSectionReviews({ education: { status: "APPROVED", reviewedById: "u1", reviewedAt: "x" } });
    expect(result.education?.note).toBeNull();
  });
});

describe("getSectionReviewState", () => {
  it("returns PENDING for an absent entry", () => {
    expect(getSectionReviewState({}, "education")).toBe("PENDING");
  });

  it("returns the entry's status when present", () => {
    expect(getSectionReviewState({ education: REVISION_ENTRY }, "education")).toBe("REVISION_NEEDED");
  });
});

describe("deriveSubmissionStatus", () => {
  it("returns SUBMITTED for an empty review set", () => {
    expect(deriveSubmissionStatus({})).toBe("SUBMITTED");
  });

  it("returns SUBMITTED when some sections are approved and the rest are pending", () => {
    const reviews: SectionReviews = { education: APPROVED_ENTRY, health: APPROVED_ENTRY };
    expect(deriveSubmissionStatus(reviews)).toBe("SUBMITTED");
  });

  it("returns REVISION_NEEDED when any section is flagged, regardless of the rest", () => {
    const reviews: SectionReviews = { ...allApproved(), education: REVISION_ENTRY };
    expect(deriveSubmissionStatus(reviews)).toBe("REVISION_NEEDED");
  });

  it("returns APPROVED only when every one of SECTION_KEYS is approved", () => {
    expect(deriveSubmissionStatus(allApproved())).toBe("APPROVED");
  });

  it("does not return APPROVED when all-but-one sections are approved", () => {
    const reviews = allApproved();
    delete reviews[SECTION_KEYS[0]];
    expect(deriveSubmissionStatus(reviews)).toBe("SUBMITTED");
  });

  it("ignores a stale key outside SECTION_KEYS when checking for full approval", () => {
    const reviews = { ...allApproved(), notARealSection: APPROVED_ENTRY } as SectionReviews;
    // Still APPROVED because every real SECTION_KEYS entry is approved — the stale key is inert.
    expect(deriveSubmissionStatus(reviews)).toBe("APPROVED");
  });
});

describe("isUnderReview", () => {
  it.each(["SUBMITTED", "REVISION_NEEDED"] as const)("returns true for %s", (status) => {
    expect(isUnderReview(status)).toBe(true);
  });

  it.each(["DRAFT", "APPROVED", "REJECTED"] as const)("returns false for %s", (status) => {
    expect(isUnderReview(status)).toBe(false);
  });
});

describe("getSectionEditability", () => {
  it("is editable for any section while DRAFT, regardless of stored reviews", () => {
    expect(getSectionEditability("DRAFT", { education: REVISION_ENTRY }, "education")).toBe("editable");
  });

  it("is editable for any section while REJECTED", () => {
    expect(getSectionEditability("REJECTED", {}, "education")).toBe("editable");
  });

  it("is locked-approved for every section once the whole submission is APPROVED", () => {
    expect(getSectionEditability("APPROVED", {}, "education")).toBe("locked-approved");
  });

  it("is locked-submitted for a pending section while under review", () => {
    expect(getSectionEditability("SUBMITTED", {}, "education")).toBe("locked-submitted");
  });

  it("is locked-approved for a section the DS already approved, even while others are still pending", () => {
    const reviews: SectionReviews = { education: APPROVED_ENTRY };
    expect(getSectionEditability("SUBMITTED", reviews, "education")).toBe("locked-approved");
  });

  it("does NOT unlock an approved section just because a different section needs revision", () => {
    // This is the critical case the per-section guard exists for: flagging one section must
    // never re-open an already-approved one.
    const reviews: SectionReviews = { education: APPROVED_ENTRY, health: REVISION_ENTRY };
    expect(getSectionEditability("REVISION_NEEDED", reviews, "education")).toBe("locked-approved");
  });

  it("does NOT unlock a still-pending section just because a different section needs revision", () => {
    const reviews: SectionReviews = { health: REVISION_ENTRY };
    expect(getSectionEditability("REVISION_NEEDED", reviews, "education")).toBe("locked-submitted");
  });

  it("is revision-needed only for the specific section the DS flagged", () => {
    const reviews: SectionReviews = { education: REVISION_ENTRY };
    expect(getSectionEditability("REVISION_NEEDED", reviews, "education")).toBe("revision-needed");
  });
});

describe("countSectionReviews", () => {
  it("counts an empty review set as all pending", () => {
    expect(countSectionReviews({})).toEqual({ approved: 0, revisionNeeded: 0, pending: SECTION_KEYS.length, total: SECTION_KEYS.length });
  });

  it("counts a mix of approved, revision-needed, and pending", () => {
    const reviews: SectionReviews = { education: APPROVED_ENTRY, health: APPROVED_ENTRY, tourism: REVISION_ENTRY };
    expect(countSectionReviews(reviews)).toEqual({
      approved: 2,
      revisionNeeded: 1,
      pending: SECTION_KEYS.length - 3,
      total: SECTION_KEYS.length,
    });
  });

  it("counts all approved with none pending or flagged", () => {
    expect(countSectionReviews(allApproved())).toEqual({ approved: SECTION_KEYS.length, revisionNeeded: 0, pending: 0, total: SECTION_KEYS.length });
  });
});
