import { HOURS } from "../../../utils";
import { API } from "../../types";

export type MyQuote = {
  quote: string;
  author?: string;
};

export type Source = "personal" | "customApi" | "bundled";

type Data = {
  source: Source;
  daily: boolean;
  timeout: number;
  personalRaw: string;
  apiUrl: string;
  quotePath: string;
  authorPath: string;
};

export type Cache = MyQuote & {
  timestamp: number;
  dayKey: string;
};

export type Props = API<Data, Cache>;

export const defaultData: Data = {
  source: "bundled",
  daily: true,
  timeout: 24 * HOURS,
  personalRaw: "",
  apiUrl: "",
  quotePath: "",
  authorPath: "",
};
