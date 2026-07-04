import { defineMessages } from "react-intl";

import { Config } from "../../types";
import MyQuotes from "./MyQuotes";
import MyQuotesSettings from "./MyQuotesSettings";
import { defaultData } from "./types";

const messages = defineMessages({
  name: {
    id: "plugins.myQuotes.name",
    defaultMessage: "My Quotes",
    description: "Name of the My Quotes widget",
  },
  description: {
    id: "plugins.myQuotes.description",
    defaultMessage:
      "Your own quotes: a personal list, any quote API, or an offline collection — with a true daily-quote mode.",
    description: "Description of the My Quotes widget",
  },
});

const config: Config = {
  key: "widget/my-quotes",
  name: messages.name,
  description: messages.description,
  dashboardComponent: MyQuotes,
  settingsComponent: MyQuotesSettings,
  defaultData,
};

export default config;
