import { bundledIcons } from "./bootstrap";
import { registerIcon } from "./loader";

export function initIcons(): void {
  for (const [id, data] of bundledIcons) {
    registerIcon(id, data);
  }
}
