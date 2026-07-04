import { API } from "../../types";
import { bundledQuotes } from "./bundled";
import { Cache, MyQuote, Source } from "./types";

export function parsePersonal(raw: string): MyQuote[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [quote, author = ""] = line.split("|").map((part) => part.trim());
      return { quote, author: author || undefined };
    })
    .filter((entry) => entry.quote);
}

export function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Deterministic "quote of the day" index so every tab shows the same quote
// all day; offset lets a manual refresh step to the next one.
function dailyIndex(length: number, offset: number): number {
  const key = dayKey();
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (hash + offset) % length;
}

function pickFromList(
  list: MyQuote[],
  daily: boolean,
  offset: number,
): MyQuote | undefined {
  if (list.length === 0) return undefined;
  const index = daily
    ? dailyIndex(list.length, offset)
    : Math.floor(Math.random() * list.length);
  return list[index];
}

// Walks a dot-separated path ("quote", "0.q", "data.content") through JSON.
function extractPath(body: unknown, path: string): unknown {
  return path
    .split(".")
    .filter(Boolean)
    .reduce<unknown>(
      (value, segment) =>
        value != null && typeof value === "object"
          ? (value as Record<string, unknown>)[segment]
          : undefined,
      body,
    );
}

async function fromCustomApi(
  apiUrl: string,
  quotePath: string,
  authorPath: string,
): Promise<MyQuote> {
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Custom API responded ${res.status}`);
  const body = await res.json();
  const quote = extractPath(body, quotePath);
  if (typeof quote !== "string" || !quote) {
    throw new Error("Quote path did not match a text field");
  }
  const author = authorPath ? extractPath(body, authorPath) : undefined;
  return { quote, author: typeof author === "string" ? author : undefined };
}

type GetOptions = {
  source: Source;
  daily: boolean;
  personalRaw: string;
  apiUrl: string;
  quotePath: string;
  authorPath: string;
  offset: number;
};

export async function getMyQuote(
  loader: API["loader"],
  options: GetOptions,
): Promise<Cache> {
  loader.push();

  let quote: MyQuote | undefined;
  try {
    if (options.source === "personal") {
      quote = pickFromList(
        parsePersonal(options.personalRaw),
        options.daily,
        options.offset,
      );
    } else if (options.source === "customApi" && options.apiUrl) {
      try {
        quote = await fromCustomApi(
          options.apiUrl,
          options.quotePath,
          options.authorPath,
        );
      } catch {
        // Dead or misconfigured API: fall through to the offline bundle.
      }
    }

    if (!quote) {
      quote = pickFromList(bundledQuotes, options.daily, options.offset);
    }
  } finally {
    loader.pop();
  }

  return {
    ...(quote as MyQuote),
    timestamp: Date.now(),
    dayKey: dayKey(),
  };
}
