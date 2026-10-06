/**
 * Every number, report or output the site shows carries a provenance record with one of five
 * kinds. The build fails if a record is missing or malformed, so nothing can be shown without
 * saying where it came from.
 *
 *   Live       fetched from a live source when the page is viewed
 *   Generated  produced by the actual tool code, from the viewer's input or at build time
 *   Recorded   an artifact from a real earlier execution
 *   Example    a deliberately simplified educational example
 *   Simulated  a visualization or calculation that is not an execution of the real tool
 */
export const KINDS = ['Live', 'Generated', 'Recorded', 'Example', 'Simulated'];

export const KIND_MEANING = {
  Live: 'Fetched from a live source when you view the page.',
  Generated: 'Produced by the actual tool code, from the input shown.',
  Recorded: 'An artifact from a real earlier execution, with its source and date.',
  Example: 'A deliberately simplified example for explanation. Not a result.',
  Simulated: 'A calculation or visualization. It does not execute the real tool.',
};

/** Validates a provenance record and returns a normalized copy. Throws with `where` in the message. */
export function assertProvenance(record, where) {
  if (!record || typeof record !== 'object') {
    throw new Error(`${where}: missing provenance`);
  }
  if (!KINDS.includes(record.kind)) {
    throw new Error(`${where}: provenance kind must be one of ${KINDS.join(', ')} (got ${JSON.stringify(record.kind)})`);
  }
  if (typeof record.source !== 'string' || record.source.trim() === '') {
    throw new Error(`${where}: provenance needs a non-empty source`);
  }
  // Example and Simulated content is not a measurement, so it does not need a capture date.
  const needsDate = record.kind === 'Live' || record.kind === 'Recorded' || record.kind === 'Generated';
  if (needsDate && !record.date) {
    throw new Error(`${where}: ${record.kind} provenance needs a date`);
  }
  return {
    kind: record.kind,
    source: record.source,
    date: record.date ?? null,
    url: record.url ?? null,
    commit: record.commit ?? null,
    note: record.note ?? null,
  };
}

/** From a `*.provenance.json` file kept next to a sample in a tool repository. */
export function fromSampleProvenance(file, where) {
  return assertProvenance(
    {
      kind: file.kind,
      source: file.source,
      date: file.capturedAt,
      url: file.runUrl,
      commit: file.commit,
      note: Array.isArray(file.notes) ? file.notes[0] : null,
    },
    where
  );
}
