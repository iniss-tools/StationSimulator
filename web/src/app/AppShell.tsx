// Ram aplikacie: bocny panel, zahlavie s nazvom polozky menu, kartami jej stranok a stavom spojenia, nova verzia simulatora, obsah stranky (ak na nu
// ma pouzivatel pravo), nove rozhranie na serveri, upozornenia na vypadky liniek a zvuk hlaseni.
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { can, useConnection, useMe, useSimulatorState } from "@/api";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { t } from "@/i18n";
import { AppSidebar } from "./AppSidebar";
import { useLineAlerts } from "./line-alerts";
import { cn } from "@/lib/utils";
import { allowedPages, navPage } from "./navigation";
import { SoundToggle } from "./sound/SoundToggle";
import { useAnnouncementSound } from "./sound/use-announcement-sound";
import { UpdateBanner } from "./update-banner";
import { WebUpdateBanner } from "./WebUpdateBanner";

export function AppShell() {
  // ram sa ukazuje az po zisteni pouzivatela (Root)
  const me = useMe()!;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { connected } = useConnection();
  const { loaded } = useSimulatorState();
  const current = navPage(pathname);
  const allowed = current === undefined || can(me, current.page.permission);
  // karty: ostatne stranky tej istej polozky menu, ktore pouzivatel smie otvorit
  const tabs = current ? allowedPages(current.item, (permission) => can(me, permission)) : [];
  useLineAlerts();
  useAnnouncementSound();

  return (
    <SidebarProvider>
      <AppSidebar me={me} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <h1 className="shrink-0 truncate text-sm font-medium">{current ? t(current.item.label) : t("app.title")}</h1>
          {current && tabs.length > 1 && (
            <nav aria-label={t(current.item.label)} className="ml-2 flex min-w-0 items-center gap-1 overflow-x-auto">
              {tabs.map((page) => (
                <Link
                  key={page.to}
                  to={page.to}
                  aria-current={page.to === pathname ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1 text-sm whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    page.to === pathname ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {t(page.label)}
                </Link>
              ))}
            </nav>
          )}
          <div className="ml-auto shrink-0">
            <SoundToggle />
          </div>
        </header>
        {!connected && loaded && (
          <div
            role="status"
            className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-sm text-amber-900 dark:text-amber-200"
          >
            <CircleAlert className="size-4 shrink-0" />
            {t("server.offline")}
          </div>
        )}
        <WebUpdateBanner />
        <UpdateBanner />
        <div className="mx-auto w-full max-w-[1600px] flex-1 p-4">
          {allowed ? <Outlet /> : <p className="text-sm text-muted-foreground">{t("nav.forbidden")}</p>}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
