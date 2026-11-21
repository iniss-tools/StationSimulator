// Hlavne menu: skupiny a polozky s ikonou. Polozka ma jednu alebo viac stranok - viac stranok su karty v zahlavi
// (napr. Archiv: Tabule, Hlasenia, Monitor). Kazda stranka ma vlastnu adresu a opravnenie; ram podla neho stranku
// ukaze alebo odmietne a polozku menu ukaze, ked pouzivatel smie aspon jednu jej stranku.
import {
  Activity,
  Archive,
  Cable,
  Disc3,
  History,
  LayoutGrid,
  Lightbulb,
  Map as MapIcon,
  Monitor,
  MonitorPlay,
  Palette,
  Settings,
  ShieldUser,
  Siren,
  type LucideIcon,
} from "lucide-react";
import { PERMISSIONS, type Permission } from "@/api";
import type { TextKey } from "@/i18n";

/** Stranky v rame (adresy za # - rovnake ako pred prestavbou, aby ulozene odkazy platili). */
export type NavPath =
  | "/devices"
  | "/schema"
  | "/designs"
  | "/faces"
  | "/lines"
  | "/lights"
  | "/scenarios"
  | "/log"
  | "/statistics"
  | "/recordings"
  | "/recordings/compare"
  | "/virtual"
  | "/archive/tables"
  | "/archive/reports"
  | "/archive/reports/live"
  | "/signage/panels"
  | "/signage/groups"
  | "/signage/playlists"
  | "/signage/messages"
  | "/users"
  | "/roles"
  | "/keys"
  | "/audit"
  | "/settings";

/** Opravnenie stranky; pri zozname staci jedno z nich. */
type Access = Permission | readonly Permission[];

/** Stranka polozky menu: adresa, nazov karty a opravnenie. */
export interface NavPage {
  to: NavPath;
  /** Nazov karty v zahlavi (pri polozke s jedinou strankou sa nepouzije). */
  label: TextKey;
  permission: Access;
}

export interface NavItem {
  label: TextKey;
  icon: LucideIcon;
  /** Stranky polozky v poradi kariet; prva dostupna sa otvori z menu. */
  pages: NavPage[];
}

export interface NavGroup {
  label: TextKey;
  items: NavItem[];
}

const single = (to: NavPath, label: TextKey, icon: LucideIcon, permission: Access): NavItem => ({ label, icon, pages: [{ to, label, permission }] });

export const NAV: NavGroup[] = [
  {
    label: "nav.group.simulation",
    items: [
      single("/devices", "nav.boards", LayoutGrid, PERMISSIONS.view),
      single("/schema", "nav.schema", MapIcon, PERMISSIONS.view),
      single("/lines", "nav.lines", Cable, PERMISSIONS.view),
      single("/lights", "nav.lights", Lightbulb, PERMISSIONS.view),
      single("/scenarios", "nav.scenarios", Siren, PERMISSIONS.view),
      {
        label: "nav.appearance",
        icon: Palette,
        pages: [
          { to: "/designs", label: "nav.designs", permission: PERMISSIONS.designs },
          { to: "/faces", label: "nav.tab.faces", permission: PERMISSIONS.designs },
        ],
      },
      {
        label: "nav.log",
        icon: Activity,
        pages: [
          { to: "/log", label: "nav.tab.log", permission: PERMISSIONS.log },
          { to: "/statistics", label: "nav.statistics", permission: PERMISSIONS.statistics },
        ],
      },
      {
        label: "nav.recordings",
        icon: Disc3,
        pages: [
          { to: "/recordings", label: "nav.recordings", permission: PERMISSIONS.view },
          { to: "/recordings/compare", label: "nav.tab.compare", permission: PERMISSIONS.view },
        ],
      },
    ],
  },
  {
    label: "nav.group.inissview",
    items: [
      single("/virtual", "nav.virtual", MonitorPlay, PERMISSIONS.view),
      {
        label: "nav.archive",
        icon: Archive,
        pages: [
          { to: "/archive/tables", label: "nav.tab.archiveTables", permission: PERMISSIONS.archive },
          { to: "/archive/reports", label: "nav.tab.archiveReports", permission: PERMISSIONS.archive },
          { to: "/archive/reports/live", label: "nav.tab.reportMonitor", permission: PERMISSIONS.archive },
        ],
      },
      {
        label: "nav.group.signage",
        icon: Monitor,
        pages: [
          { to: "/signage/panels", label: "nav.signagePanels", permission: PERMISSIONS.view },
          { to: "/signage/groups", label: "nav.tab.signageGroups", permission: PERMISSIONS.view },
          { to: "/signage/playlists", label: "nav.signagePlaylists", permission: PERMISSIONS.view },
          { to: "/signage/messages", label: "nav.signageMessages", permission: PERMISSIONS.view },
        ],
      },
    ],
  },
  {
    label: "nav.group.admin",
    items: [
      {
        label: "nav.access",
        icon: ShieldUser,
        pages: [
          { to: "/users", label: "nav.users", permission: PERMISSIONS.users },
          { to: "/roles", label: "nav.roles", permission: PERMISSIONS.users },
          { to: "/keys", label: "nav.tab.keys", permission: PERMISSIONS.keys },
        ],
      },
      single("/audit", "nav.audit", History, PERMISSIONS.audit),
      single("/settings", "nav.settings", Settings, [PERMISSIONS.settings, PERMISSIONS.server]),
    ],
  },
];

/** Stranky polozky, ktore pouzivatel smie otvorit (allowed = ma opravnenie stranky). */
export function allowedPages(item: NavItem, allowed: (permission: Access) => boolean): NavPage[] {
  return item.pages.filter((page) => allowed(page.permission));
}

/** Polozka menu a jej stranka na adrese; undefined = adresa mimo menu. */
export function navPage(pathname: string): { item: NavItem; page: NavPage } | undefined {
  for (const group of NAV)
    for (const item of group.items) {
      const page = item.pages.find((p) => p.to === pathname);
      if (page) return { item, page };
    }
  return undefined;
}
