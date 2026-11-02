// Validates events.json before it is committed.
// Usage: node scripts/validate.mjs [path/to/events.json]
// Exits with code 1 and a list of problems if anything is wrong.
import { readFileSync } from "node:fs";

const file = process.argv[2] || new URL("../events.json", import.meta.url);
const errors = [];
const warnings = [];

let data;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`events.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const TYPES = new Set(["hackathon", "meetup", "conference", "workshop"]);
const KINDS = new Set(["agenda", "online", "campus"]);
const isDate = (s) => DATE.test(s) && !Number.isNaN(Date.parse(s));

if (!isDate(data.updated)) errors.push(`"updated" must be a YYYY-MM-DD date (got ${JSON.stringify(data.updated)})`);
if (!Array.isArray(data.events)) {
  errors.push(`"events" must be an array`);
} else {
  const ids = new Set();
  data.events.forEach((e, i) => {
    const where = `events[${i}] (${e?.id ?? "no id"})`;
    if (!e || typeof e !== "object") return errors.push(`${where}: not an object`);
    if (!e.id || typeof e.id !== "string") errors.push(`${where}: missing string "id"`);
    else if (ids.has(e.id)) errors.push(`${where}: duplicate id`);
    else ids.add(e.id);
    if (!e.title) errors.push(`${where}: missing "title"`);
    if (!KINDS.has(e.kind)) errors.push(`${where}: "kind" must be one of ${[...KINDS].join(", ")}`);
    if (!TYPES.has(e.type)) errors.push(`${where}: "type" must be one of ${[...TYPES].join(", ")}`);
    if (!/^https:\/\/\S+$/.test(e.url || "")) errors.push(`${where}: "url" must be an https link`);
    if (!e.host) errors.push(`${where}: missing "host"`);
    for (const k of ["start", "end", "deadline"]) {
      if (e[k] != null && !isDate(e[k])) errors.push(`${where}: "${k}" must be YYYY-MM-DD`);
    }
    for (const k of ["time", "endTime"]) {
      if (e[k] != null && !TIME.test(e[k])) errors.push(`${where}: "${k}" must be HH:MM (24h, IST)`);
    }
    if (e.start && e.end && e.end < e.start) errors.push(`${where}: "end" is before "start"`);
    if (e.kind === "agenda") {
      if (!e.start) errors.push(`${where}: agenda events need "start"`);
      if (!e.venue) errors.push(`${where}: agenda events need "venue"`);
    }
    if (e.kind === "online" && !e.deadline && !e.end) errors.push(`${where}: online hackathons need "deadline" or "end"`);
    if (e.kind === "campus" && !e.end) errors.push(`${where}: campus hackathons need "end"`);
    if (e.tags != null && !Array.isArray(e.tags)) errors.push(`${where}: "tags" must be an array`);
    const last = e.end || e.start || e.deadline;
    if (last && Date.parse(last) < Date.now() - 30 * 864e5) warnings.push(`${where}: ended over 30 days ago; consider removing`);
  });
  if (data.events.length < 10) warnings.push(`only ${data.events.length} events; is that expected?`);
}

warnings.forEach((w) => console.warn("warning:", w));
if (errors.length) {
  console.error(`\n${errors.length} problem(s) in events.json:`);
  errors.forEach((e) => console.error(" -", e));
  process.exit(1);
}
console.log(`events.json OK: ${data.events.length} events, updated ${data.updated}`);
