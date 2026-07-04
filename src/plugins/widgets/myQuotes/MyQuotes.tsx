import "./MyQuotes.sass";

import { FC, useState } from "react";

import { useCachedEffect } from "../../../hooks";
import { getMyQuote } from "./api";
import { defaultData, Props } from "./types";

function nextMidnight(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

const MyQuotes: FC<Props> = ({
  cache,
  data = defaultData,
  setCache,
  loader,
}) => {
  // Incremented by the refresh button to force a new quote (deps change).
  const [offset, setOffset] = useState(0);

  const expires = cache
    ? data.daily
      ? nextMidnight(cache.timestamp)
      : cache.timestamp + data.timeout
    : 0;

  useCachedEffect(
    () => {
      getMyQuote(loader, {
        source: data.source,
        daily: data.daily,
        personalRaw: data.personalRaw,
        apiUrl: data.apiUrl,
        quotePath: data.quotePath,
        authorPath: data.authorPath,
        offset,
      }).then(setCache);
    },
    expires,
    [
      data.source,
      data.daily,
      data.personalRaw,
      data.apiUrl,
      data.quotePath,
      data.authorPath,
      offset,
    ],
  );

  if (!cache) return null;

  return (
    <div className="MyQuotes">
      <h4 className="MyQuotesContent">
        “{cache.quote}”
        {cache.author && (
          <sub>
            <br />
            &mdash; {cache.author}
          </sub>
        )}
      </h4>
      <button
        className="MyQuotesRefresh"
        title="New quote"
        onClick={() => setOffset(offset + 1)}
      >
        &#x21bb;
      </button>
    </div>
  );
};

export default MyQuotes;
