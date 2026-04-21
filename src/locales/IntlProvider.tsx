import { type FC, type PropsWithChildren, useEffect, useState } from "react";
import { IntlProvider as ReactIntlProvider } from "react-intl";

import { db } from "../db/state";
import { useValue } from "../lib/db/react";
import {
  baseMessages,
  loadMessages,
  type LocaleMessages,
  resolveLocale,
} from "./locales";

const defaultMessages: LocaleMessages = DEV ? {} : baseMessages;

const IntlProvider: FC<PropsWithChildren> = ({ children }) => {
  const locale = useValue(db, "locale");
  const [messages, setMessages] = useState<LocaleMessages>(defaultMessages);

  useEffect(() => {
    let cancelled = false;
    void loadMessages(locale).then((nextMessages) => {
      if (!cancelled) {
        setMessages(DEV ? nextMessages : { ...baseMessages, ...nextMessages });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <ReactIntlProvider
      locale={resolveLocale(locale)}
      defaultLocale="en"
      messages={messages}
    >
      {children}
    </ReactIntlProvider>
  );
};

export default IntlProvider;
