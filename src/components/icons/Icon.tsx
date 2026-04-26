import { type CSSProperties, type FC, memo, useEffect, useState } from "react";

import { getIcon, loadIcon, onIconLoaded } from "./loader";

let idCounter = 0;

function replaceIDs(body: string): string {
  const regex = /\sid="(\S+)"/g;
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(body))) ids.push(match[1]);
  if (!ids.length) return body;

  const suffix = "s" + ((Math.random() * 0x1000000) | 0).toString(16);
  ids.forEach((id) => {
    const newID = "iconify" + (idCounter++).toString();
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body.replace(
      new RegExp('([#;"])(' + escaped + ')([")]|\\.[a-z])', "g"),
      "$1" + newID + suffix + "$3",
    );
  });
  body = body.replace(new RegExp(suffix, "g"), "");
  return body;
}

interface IconProps {
  icon?: string;
  width?: number | string;
  height?: number | string;
  color?: string;
  style?: CSSProperties;
  className?: string;
  id?: string;
  cache?: boolean;
  inline?: boolean;
  type?: "icon" | "button";
  onClick?: () => void;
  primary?: boolean;
  title?: string;
  /** @deprecated Use icon="feather:name" instead */
  name?: string;
  /** @deprecated Use width/height */
  size?: number | string;
  /** @deprecated Use color */
  colour?: string;
}

const Icon: FC<IconProps> = memo(
  ({
    icon: iconProp,
    name,
    width,
    height,
    size,
    color,
    colour,
    style,
    className,
    id,
    cache: shouldCache = true,
    inline = false,
    type = "icon",
    onClick,
    primary,
    title,
  }) => {
    const rawIcon = iconProp ?? name ?? "";
    const icon = rawIcon.includes(":") ? rawIcon : `feather:${rawIcon}`;

    const [, rerender] = useState(0);

    const data = getIcon(icon);

    useEffect(() => {
      if (data) return;
      const unsub = onIconLoaded(icon, () => rerender((n) => n + 1));
      loadIcon(icon, shouldCache);
      return unsub;
    }, [icon, shouldCache, data]);

    const iconWidth = data?.width ?? 24;
    const iconHeight = data?.height ?? 24;
    const left = data?.left ?? 0;
    const top = data?.top ?? 0;
    const viewBox = `${left} ${top} ${iconWidth} ${iconHeight}`;

    const resolvedWidth = width ?? size ?? "1em";
    const resolvedHeight = height ?? size ?? "1em";
    const resolvedColor = color ?? colour;

    const prefix = icon.includes(":") ? icon.split(":")[0] : "";
    const classes = ["iconify", prefix ? `iconify--${prefix}` : "", className]
      .filter(Boolean)
      .join(" ");

    const svgStyle: CSSProperties = {
      ...(resolvedColor ? { color: resolvedColor } : {}),
      ...(inline ? { verticalAlign: "-0.125em" } : {}),
      ...style,
    };

    const iconComponent = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        aria-hidden={true}
        role="img"
        id={id}
        className={classes}
        width={resolvedWidth}
        height={resolvedHeight}
        viewBox={viewBox}
        style={svgStyle}
        dangerouslySetInnerHTML={
          data ? { __html: replaceIDs(data.body) } : { __html: "" }
        }
      />
    );

    if (type === "button") {
      return (
        <button
          className={`button--icon ${primary ? "button--primary" : ""}`}
          onClick={onClick}
          title={title}
          type="button"
        >
          {iconComponent}
        </button>
      );
    }

    return iconComponent;
  },
);

Icon.displayName = "Icon";

export default Icon;
export type { IconProps };
