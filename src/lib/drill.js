/**
 * Groups a drill report's timeline into replay frames. The tool polls every node once per
 * observation cycle, always in the same order, so each run of `nodes.length` consecutive rows is
 * one frame. This was checked against all four recorded reports (a cycle spans under 25 ms);
 * a report that breaks the assumption throws instead of being shown wrongly.
 */
export function framesFromTimeline(timeline, nodes) {
  const n = nodes.length;
  if (n === 0 || timeline.length % n !== 0) {
    throw new Error(`timeline of ${timeline.length} rows does not divide into frames of ${n} nodes`);
  }
  const start = timeline[0].timestampMs;
  const frames = [];
  for (let i = 0; i < timeline.length; i += n) {
    const rows = timeline.slice(i, i + n);
    rows.forEach((row, j) => {
      if (row.node !== nodes[j]) throw new Error(`frame ${i / n}: expected ${nodes[j]} but found ${row.node}`);
    });
    frames.push({
      index: frames.length,
      elapsedSeconds: Math.round((rows[0].timestampMs - start) / 1000),
      rows: rows.map((r) => ({
        node: r.node,
        ledgerNum: r.ledgerNum,
        protocolVersion: r.protocolVersion,
        state: r.state,
      })),
    });
  }
  return frames;
}

/** The scenario's one-line `description:` as it reads in the scenario file at the pinned commit.
 * Recorded reports carry the description from when they were captured, which can be older. */
export function descriptionFromYaml(yamlText) {
  const m = /^description:\s*(.+?)\s*$/m.exec(yamlText);
  return m ? m[1] : null;
}

/** The declared expectation from a scenario file, read as text (this is not a YAML parser). */
export function expectationFromYaml(yamlText) {
  const protocol = /^\s*finalProtocolVersion:\s*(\d+)\s*$/m.exec(yamlText);
  const synced = /^\s*nodesShouldStaySynced:\s*\[(.*)\]\s*$/m.exec(yamlText);
  return {
    finalProtocolVersion: protocol ? Number(protocol[1]) : null,
    nodesShouldStaySynced: synced ? synced[1].split(',').map((s) => s.trim()).filter(Boolean) : null,
  };
}

/** How many validators must agree: THRESHOLD_PERCENT rounds up. This is a calculation of that
 * rule, not stellar-core. It matches every real run so far (3 of 3 required at 67% with 3
 * validators; 2 stopped out of 5 stalled the network), but only the 3-validator case was
 * confirmed directly. */
export function quorumRequired(validators, thresholdPercent) {
  return Math.ceil((validators * thresholdPercent) / 100);
}
