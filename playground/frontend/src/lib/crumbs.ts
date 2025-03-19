import { CrumbsHolder } from "./helpers/crumbs_holder";

export const homeCrumbs = new CrumbsHolder([
  {
    label: "Home",
    href: "app",
  },
]);

export const noteCrumbs = homeCrumbs.extend([
  {
    label: "Notes",
    href: "notes",
  },
]);

export const tagCrumbs = noteCrumbs.extend([
  {
    label: "Tags",
    href: "",
  },
]);

export const settingCrumbs = homeCrumbs.extend([
  {
    label: "Settings",
    href: "settings",
  },
]);
