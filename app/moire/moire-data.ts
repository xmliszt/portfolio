export const MOIRE_URL = "https://www.moire.day";

/**
 * Moiré serves the corpus as JSON here. It is public and unauthenticated — the
 * same records and connections the field already paints at `/` — so it needs no
 * secret and the production URL is just a constant. The env var is an override
 * for pointing a local portfolio at a local Moiré.
 */
const PUBLIC_GRAPH_URL =
  process.env.MOIRE_PUBLIC_GRAPH_URL ?? `${MOIRE_URL}/api/public/graph`;

const REVALIDATE_SECONDS = 3600;

export type MoireRecord = {
  id: string;
  label: string | null;
  host: string | null;
  kind: string | null;
  imageUrl: string | null;
};

export type MoireConnection = {
  id: string;
  relation: string | null;
  records: MoireRecord[];
};

export type MoireGraph = {
  stats: { records: number; connections: number; since: string };
  captures: MoireRecord[];
  connections: MoireConnection[];
};

/** The shape Moiré's GET /api/public/graph hands over. */
type PublicGraph = {
  records: Array<MoireRecord & { capturedAt: string; via: string | null }>;
  links: Array<{
    id: string;
    relation: string | null;
    origin: "user" | "system";
    createdAt: string;
    recordIds: string[];
  }>;
};

const CAPTURE_COUNT = 14;

/*
  Which connections get shown.

  Newest first, but not newest outright. The oracle proposes connections on an
  hourly cron while hand-made ones arrive only when Yuxuan sits down to make
  one, so raw recency drifts toward machine output — and the machine writes
  "shares an emphasis on user-friendly design" where a person writes "the
  funniest possible objection to 'without thought'". The relation phrase is the
  whole reason this section exists, so the filter protects it: a person's
  judgment, long enough to stand on its own away from the graph, and two ends
  that can both be pictured.

  If too few qualify the rest top it up, because a thin section beats an empty
  one — better a plain phrase than a gap where the page promised something.
*/
const FEATURED = {
  count: 3,
  minRelationLength: 15,
};

export function recordUrl(record: MoireRecord) {
  return `${MOIRE_URL}/records/${record.id}`;
}

export function toMoireGraph(graph: PublicGraph): MoireGraph {
  const byId: { [id: string]: PublicGraph["records"][number] } = {};
  for (const record of graph.records) byId[record.id] = record;

  const trim = (record: PublicGraph["records"][number]): MoireRecord => ({
    id: record.id,
    label: record.label,
    host: record.host,
    kind: record.kind,
    imageUrl: record.imageUrl,
  });

  const pairs = graph.links
    .map((link) => ({
      link,
      records: link.recordIds
        .map((id) => byId[id])
        .filter((record) => record !== undefined),
    }))
    .filter((pair) => pair.records.length === 2);

  const qualifies = (pair: (typeof pairs)[number]) =>
    pair.link.origin === "user" &&
    (pair.link.relation?.trim().length ?? 0) >= FEATURED.minRelationLength &&
    pair.records.every((record) => record.imageUrl);

  const featured = [
    ...pairs.filter(qualifies),
    ...pairs.filter((pair) => !qualifies(pair)),
  ].slice(0, FEATURED.count);

  const capturedAts = graph.records
    .map((record) => record.capturedAt)
    .toSorted();

  return {
    stats: {
      records: graph.records.length,
      connections: graph.links.length,
      since: (capturedAts.at(0) ?? new Date().toISOString()).slice(0, 10),
    },
    captures: graph.records
      .filter((record) => record.imageUrl)
      .toSorted((a, b) => b.capturedAt.localeCompare(a.capturedAt))
      .slice(0, CAPTURE_COUNT)
      .map(trim),
    connections: featured.map((pair) => ({
      id: pair.link.id,
      relation: pair.link.relation,
      records: pair.records.map(trim),
    })),
  };
}

/**
 * Null when Moiré cannot be reached. The page drops the sections that describe
 * the corpus and keeps the ones that do not — showing nothing is honest, where
 * a stale copy committed here would quietly claim a corpus that had moved on.
 */
export async function getMoireGraph(): Promise<MoireGraph | null> {
  try {
    const response = await fetch(PUBLIC_GRAPH_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.error("[moire] public graph responded", response.status);
      return null;
    }
    return toMoireGraph(await response.json());
  } catch (error) {
    /* Logged rather than swallowed: the sections simply vanish otherwise,
       which looks identical to an empty corpus. */
    console.error("[moire] public graph unreachable", error);
    return null;
  }
}
