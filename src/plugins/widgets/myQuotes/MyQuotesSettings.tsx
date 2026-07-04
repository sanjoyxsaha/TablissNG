import type { FC } from "react";
import { FormattedMessage } from "react-intl";

import { timingMessages } from "../../../locales/messages";
import { HOURS, MINUTES } from "../../../utils";
import { parsePersonal } from "./api";
import { defaultData, Props } from "./types";

const PRESETS = [
  {
    name: "DummyJSON",
    apiUrl: "https://dummyjson.com/quotes/random",
    quotePath: "quote",
    authorPath: "author",
  },
  {
    name: "ZenQuotes",
    apiUrl: "https://zenquotes.io/api/random",
    quotePath: "0.q",
    authorPath: "0.a",
  },
];

const MyQuotesSettings: FC<Props> = ({ data = defaultData, setData }) => {
  const personalCount = parsePersonal(data.personalRaw).length;

  return (
    <div className="MyQuotesSettings">
      <label>
        <input
          type="radio"
          checked={data.source === "personal"}
          onChange={() => setData({ ...data, source: "personal" })}
        />{" "}
        <FormattedMessage
          id="plugins.myQuotes.personalSource"
          defaultMessage="My quote list"
          description="Personal quote list option"
        />
      </label>
      {data.source === "personal" && (
        <>
          <textarea
            rows={8}
            value={data.personalRaw}
            placeholder={
              "One per line, format: quote | author\n\nWell begun is half done. | Aristotle"
            }
            onChange={(event) =>
              setData({ ...data, personalRaw: event.target.value })
            }
          />
          <p>
            <FormattedMessage
              id="plugins.myQuotes.personalCount"
              defaultMessage="{count} quote(s) saved. Keep the list under ~8 KB (roughly 60 quotes) to stay within the widget storage limit."
              description="Personal quote count and size hint"
              values={{ count: personalCount }}
            />
          </p>
        </>
      )}

      <label>
        <input
          type="radio"
          checked={data.source === "customApi"}
          onChange={() => setData({ ...data, source: "customApi" })}
        />{" "}
        <FormattedMessage
          id="plugins.myQuotes.customApiSource"
          defaultMessage="Custom quote API"
          description="Custom API option"
        />
      </label>
      {data.source === "customApi" && (
        <>
          <label>
            <FormattedMessage
              id="plugins.myQuotes.apiUrl"
              defaultMessage="API URL"
              description="API URL field label"
            />
            <input
              type="url"
              value={data.apiUrl}
              placeholder="https://dummyjson.com/quotes/random"
              onChange={(event) =>
                setData({ ...data, apiUrl: event.target.value })
              }
            />
          </label>
          <label>
            <FormattedMessage
              id="plugins.myQuotes.quotePath"
              defaultMessage="Quote field (dot path into the JSON, e.g. 'quote' or '0.q')"
              description="Quote path field label"
            />
            <input
              type="text"
              value={data.quotePath}
              placeholder="quote"
              onChange={(event) =>
                setData({ ...data, quotePath: event.target.value })
              }
            />
          </label>
          <label>
            <FormattedMessage
              id="plugins.myQuotes.authorPath"
              defaultMessage="Author field (optional)"
              description="Author path field label"
            />
            <input
              type="text"
              value={data.authorPath}
              placeholder="author"
              onChange={(event) =>
                setData({ ...data, authorPath: event.target.value })
              }
            />
          </label>
          <p>
            <FormattedMessage
              id="plugins.myQuotes.presets"
              defaultMessage="Presets:"
              description="Preset buttons label"
            />{" "}
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    apiUrl: preset.apiUrl,
                    quotePath: preset.quotePath,
                    authorPath: preset.authorPath,
                  })
                }
              >
                {preset.name}
              </button>
            ))}
          </p>
          <p>
            <FormattedMessage
              id="plugins.myQuotes.fallbackNote"
              defaultMessage="If the API is unreachable, an offline quote is shown instead — the widget never goes blank."
              description="Fallback behaviour note"
            />
          </p>
        </>
      )}

      <label>
        <input
          type="radio"
          checked={data.source === "bundled"}
          onChange={() => setData({ ...data, source: "bundled" })}
        />{" "}
        <FormattedMessage
          id="plugins.myQuotes.bundledSource"
          defaultMessage="Offline collection (50 quotes, no internet needed)"
          description="Bundled quotes option"
        />
      </label>

      <hr />

      <label>
        <input
          type="checkbox"
          checked={data.daily}
          onChange={(event) =>
            setData({ ...data, daily: event.target.checked })
          }
        />{" "}
        <FormattedMessage
          id="plugins.myQuotes.daily"
          defaultMessage="One quote per day (hover over the quote for a refresh button)"
          description="Daily quote mode option"
        />
      </label>

      {!data.daily && (
        <label>
          <FormattedMessage
            id="plugins.myQuotes.showANewQuote"
            defaultMessage="Show a new quote"
            description="New quote interval label"
          />
          <select
            value={data.timeout}
            onChange={(event) =>
              setData({ ...data, timeout: Number(event.target.value) })
            }
          >
            <option value={0}>
              <FormattedMessage
                id="plugins.myQuotes.everyTab"
                defaultMessage="Every new tab"
                description="Every tab interval option"
              />
            </option>
            <option value={5 * MINUTES}>
              <FormattedMessage {...timingMessages.every5min} />
            </option>
            <option value={15 * MINUTES}>
              <FormattedMessage {...timingMessages.every15min} />
            </option>
            <option value={HOURS}>
              <FormattedMessage {...timingMessages.everyHour} />
            </option>
            <option value={24 * HOURS}>
              <FormattedMessage {...timingMessages.everyDay} />
            </option>
          </select>
        </label>
      )}
    </div>
  );
};

export default MyQuotesSettings;
