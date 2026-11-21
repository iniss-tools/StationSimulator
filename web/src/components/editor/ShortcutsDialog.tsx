// Prehlad klaves a mysi v editore platna (cela tabul, schema stanice) - tlacidlo v nastrojoch alebo klaves ?.
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { t, type TextKey } from "@/i18n";

/** Slova v skratkach, ktore sa prekladaju (ostatne su nazvy klaves). */
const WORDS: Record<string, TextKey> = {
  click: "faces.keys.click",
  dblclick: "faces.keys.dblclick",
  drag: "faces.keys.drag",
  empty: "faces.keys.empty",
  label: "faces.keys.label",
  wheel: "faces.keys.wheel",
  space: "faces.keys.space",
  hover: "faces.keys.hover",
  arrows: "faces.keys.arrows",
};

/** Skupina skratiek: nadpis a riadky - kombinacie klaves (alternativy) a co robia. */
export interface ShortcutGroup {
  title: TextKey;
  rows: { keys: string[][]; text: TextKey }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  hint: string;
  groups: ShortcutGroup[];
}

export function ShortcutsDialog({ open, onClose, title, hint, groups }: Props) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{hint}</DialogDescription>
        </DialogHeader>
        <div className="gap-8 sm:columns-2">
          {groups.map((group) => (
            <section key={group.title} className="mb-4 flex break-inside-avoid flex-col gap-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">{t(group.title)}</h3>
              <dl className="flex flex-col gap-1.5">
                {group.rows.map((row) => (
                  <div key={row.text} className="flex items-start justify-between gap-3 text-sm">
                    <dt className="min-w-0">{t(row.text)}</dt>
                    <dd className="flex max-w-[55%] shrink-0 flex-wrap justify-end gap-x-2 gap-y-1">
                      {row.keys.map((combo) => (
                        <KbdGroup key={combo.join("+")}>
                          {combo.map((key) => (
                            <Kbd key={key}>{key in WORDS ? t(WORDS[key]) : key}</Kbd>
                          ))}
                        </KbdGroup>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
