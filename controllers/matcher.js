import Fuse from "fuse.js";
import signs from "./data/signs.json" assert { type: "json" };
import markings from "../utils/data/markings.json" assert { type: "json" };

function createFuse(data) {
  return new Fuse(data, {
    keys: ["id", "aliases"],
    threshold: 0.4
  });
}

const fuseSigns = createFuse(signs);
const fuseMarkings = createFuse(markings);

export function findItem(type, query) {
  const data = type === "signs" ? signs : markings;
  const fuse = type === "signs" ? fuseSigns : fuseMarkings;

  query = query.toLowerCase().trim();

  // точное совпадение
  const exact = data.find(
    i => i.id === query || i.aliases.includes(query)
  );
  if (exact) return exact;

  // приблизительное
  const result = fuse.search(query);
  if (result.length) return result[0].item;

  return null;
}
