import { Crumbs } from "../types";

export class CrumbsHolder {
  constructor(private crumbs: Crumbs) {}

  extend(crumbs: Crumbs) {
    return new CrumbsHolder([...this.crumbs, ...crumbs]);
  }

  get(crumbs?: Crumbs): Crumbs {
    return [...this.crumbs, ...(crumbs || [])].reduce<Crumbs>(
      (acc, crumb, index) => {
        const lastCrumb = acc[acc.length - 1];

        const href =
          index === 0 ? `/${crumb.href}` : `${lastCrumb.href}/${crumb.href}`;

        acc.push({ ...crumb, href });

        return acc;
      },
      [],
    );
  }
}
