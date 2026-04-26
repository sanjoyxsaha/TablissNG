import "./Notes.sass";

import type { FC } from "react";
import { FormattedMessage } from "react-intl";

import { IconButtonRaw } from "../../../components/icons";
import { API } from "../../types";
import { Data, defaultData } from "./data";

const alignments = [
  {
    value: "left",
    icon: "align-left",
  },
  {
    value: "center",
    icon: "align-center",
  },
  {
    value: "right",
    icon: "align-right",
  },
] as const;

const NotesSettings: FC<API<Data>> = ({ data = defaultData, setData }) => {
  return (
    <div className="NotesSettings">
      <label>
        <input
          type="checkbox"
          checked={data.markdownEnabled}
          onChange={(e) =>
            setData({ ...data, markdownEnabled: e.target.checked })
          }
        />
        <FormattedMessage
          id="plugins.notes.enableMarkdown"
          defaultMessage="Enable Markdown formatting"
          description="Checkbox label to enable Markdown formatting in notes"
        />
      </label>

      <div>
        <label>
          <FormattedMessage
            id="plugins.notes.textAlignment"
            defaultMessage="Text Alignment"
            description="Label for the note text alignment setting"
          />
        </label>
        <div className="alignment">
          {alignments.map((alignment) => (
            <IconButtonRaw
              key={alignment.value}
              icon={alignment.icon}
              onClick={() => setData({ ...data, textAlign: alignment.value })}
              primary={data.textAlign === alignment.value}
            />
          ))}
        </div>
      </div>

      <div>
        <label>
          <FormattedMessage
            id="plugins.notes.iconAlignment"
            defaultMessage="Icon Alignment"
            description="Label for the note icon alignment setting"
          />
        </label>
        <div className="alignment">
          {alignments.map((alignment) => (
            <IconButtonRaw
              key={alignment.value}
              icon={alignment.icon}
              onClick={() => setData({ ...data, iconAlign: alignment.value })}
              primary={data.iconAlign === alignment.value}
            />
          ))}
        </div>
      </div>

      <div>
        <label>
          <FormattedMessage
            id="plugins.notes.placeholderStyle"
            defaultMessage="Placeholder Style"
            description="Label for the note placeholder style setting"
          />
        </label>
        <div className="alignment">
          <IconButtonRaw
            icon="edit"
            onClick={() => setData({ ...data, placeholderStyle: "icon" })}
            primary={data.placeholderStyle === "icon"}
          />
          <IconButtonRaw
            icon="edit-3"
            onClick={() => setData({ ...data, placeholderStyle: "text" })}
            primary={data.placeholderStyle === "text"}
          />
        </div>
      </div>

      <label>
        <FormattedMessage
          id="plugins.notes.keybind"
          defaultMessage="Notes keybind"
          description="Label for setting the keyboard shortcut to open notes"
        />
        <input
          type="text"
          maxLength={1}
          onChange={(event) =>
            setData({ ...data, keyBind: event.target.value })
          }
          value={data.keyBind}
        />
      </label>
    </div>
  );
};

export default NotesSettings;
