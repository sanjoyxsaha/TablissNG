export const icons = {
  remove: "trash-2",
  up: "arrow-up",
  down: "arrow-down",
  settings: "settings",
  expand: "plus",
  check: "check-circle",
  more: "more-vertical",
  alert: "alert-triangle",
  eye: "eye",
  search: "search",
} as const;

export type IconName = keyof typeof icons;
