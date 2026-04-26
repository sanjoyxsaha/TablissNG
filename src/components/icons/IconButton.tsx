import type { FC } from "react";

import Icon from "./Icon";
import { type IconName, icons } from "./map";

interface Props {
  icon: IconName;
  onClick?: () => void;
  primary?: boolean;
  title?: string;
}

interface PropsRaw {
  icon: string;
  onClick: () => void;
  primary?: boolean;
  title?: string;
}

const IconButton: FC<Props> = ({ icon, onClick, primary, title }) => (
  <Icon
    icon={icons[icon]}
    type="button"
    onClick={onClick}
    primary={primary}
    title={title}
  />
);

const IconButtonRaw: FC<PropsRaw> = ({ icon, onClick, primary, title }) => (
  <Icon
    icon={icon}
    type="button"
    onClick={onClick}
    primary={primary}
    title={title}
  />
);

export { IconButton, IconButtonRaw };
export default IconButton;
