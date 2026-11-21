// Editor schemy stanice: hore nastroje (spat, znova, pridat, mierka, zahodit, ulozit), vlavo zariadenia, ktore este na
// scheme nie su, a vrstvy, v strede platno, vpravo vlastnosti. Zmeny sa ulozia az tlacidlom Ulozit (Ctrl+S).
import { useLayoutEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CircleAlert, Plus, Redo, Save, Undo, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import {
  errorText,
  getStationSchemasQueryKey,
  queryClient,
  setStationSchema,
  type SchemaElementDto,
  type SchemaElementKind,
  type StationSchemaDto,
  type StationSchemaRequest,
} from "@/api";
import { confirmAction } from "@/components/common/confirm";
import { alignDeltas, type AlignOp } from "@/components/editor/align";
import { DocumentKeys } from "@/components/editor/DocumentKeys";
import { useHistory } from "@/components/editor/history";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { extremeOrder, stepOrder } from "@/components/editor/order";
import { shortcutAction, type EditorAction } from "@/components/editor/shortcuts";
import { typing, zoomStep } from "@/components/editor/zoom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { t } from "@/i18n";
import { SchemaEditCanvas } from "./SchemaEditCanvas";
import { SchemaProperties, type ElementPatch } from "./SchemaProperties";
import { backgroundOf, elementLabel, type DeviceCandidate, type SchemaLive } from "./schema";
import { copyElements, useClipboard } from "./schema-clipboard";
import { boxOf, cloneElements, DRAWING_KINDS, moveBy, newDevice, newDrawing, nextId, unplacedDevices } from "./schema-edit";
import { KIND_ICONS } from "./schema-icons";

/** Posun vlozenych a duplikovanych prvkov, aby neprekryli povodne. */
const PASTE_OFFSET = 20;

const toRequest = (s: StationSchemaDto): StationSchemaRequest => ({
  name: s.name,
  width: s.width,
  height: s.height,
  elements: s.elements,
  backgroundOpacity: s.backgroundOpacity,
});

export function SchemaEditor({ schema, live, onClose }: { schema: StationSchemaDto; live: SchemaLive; onClose: () => void }) {
  // ulozena podoba - po ulozeni sa nahradi tym, co sa ulozilo
  const [saved, setSaved] = useState(() => toRequest(schema));
  const history = useHistory<StationSchemaRequest>(saved);
  const form = history.value;
  const [selection, setSelection] = useState<number[]>([]);
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());
  const [zoom, setZoom] = useState<number | null>(null);
  const [fit, setFit] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  const clipboard = useClipboard();

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const chosen = selection.filter((i) => i < form.elements.length);
  const scale = zoom ?? fit;

  // mierka, pri ktorej sa cele platno zmesti na sirku miesta
  useLayoutEffect(() => {
    const box = viewport.current;
    if (!box) return;
    const measure = () => setFit(Math.max(0.1, Math.min(4, (box.clientWidth - 36) / form.width)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [form.width]);

  const save = useMutation({
    mutationFn: async (body: StationSchemaRequest) => {
      await setStationSchema({ path: { id: schema.id }, body, throwOnError: true });
      return body;
    },
    onSuccess: async (body) => {
      const stored = { ...body, name: body.name.trim() };
      setSaved(stored);
      history.reset(stored);
      await queryClient.invalidateQueries({ queryKey: getStationSchemasQueryKey() });
      toast.success(t("schema.saved"));
    },
  });
  const saveNow = () => {
    if (dirty && !save.isPending) save.mutate(form);
  };
  const close = async () => {
    if (dirty && !(await confirmAction({ title: t("schema.discard.confirm"), destructive: true }))) return;
    onClose();
  };

  const change = (patch: Partial<StationSchemaRequest>, transient = false) => history.set({ ...form, ...patch }, transient);
  const setElements = (elements: SchemaElementDto[], transient = false) => change({ elements }, transient);
  const updateMany = (changes: ReadonlyMap<number, SchemaElementDto>, transient = false) =>
    setElements(
      form.elements.map((e, i) => changes.get(i) ?? e),
      transient,
    );
  const patchSelected = (patch: ElementPatch, transient = false) =>
    updateMany(new Map(chosen.map((i) => [i, typeof patch === "function" ? patch(form.elements[i]) : { ...form.elements[i], ...patch }])), transient);
  /** Nove prvky navrch, vybrane. */
  const insert = (added: SchemaElementDto[]) => {
    setElements([...form.elements, ...added]);
    setSelection(added.map((_, k) => form.elements.length + k));
  };
  /** Miesto noveho prvku: stred platna, dalsie o kusok nizsie, aby sa neprekryli. */
  const spot = (width: number, height: number): [number, number] => {
    const shift = (form.elements.length % 8) * PASTE_OFFSET;
    return [Math.round(Math.max(0, (form.width - width) / 2) + shift), Math.round(Math.max(0, (form.height - height) / 2) + shift)];
  };
  const addDrawing = (kind: SchemaElementKind) => {
    const text = kind === "text" ? t("schema.kind.text") : "";
    const sample = boxOf(newDrawing(kind, 0, 0, 0, text));
    insert([newDrawing(kind, nextId(form.elements), ...spot(sample.w, sample.h), text)]);
  };
  const addDevice = (device: DeviceCandidate) => insert([newDevice(device, nextId(form.elements), ...spot(device.width, device.height))]);
  const removeMany = (indices: number[]) => {
    const gone = new Set(indices);
    const shift = (i: number) => i - indices.filter((r) => r < i).length;
    setElements(form.elements.filter((_, i) => !gone.has(i)));
    setSelection(chosen.filter((i) => !gone.has(i)).map(shift));
    setHidden(new Set([...hidden].filter((i) => !gone.has(i)).map(shift)));
  };
  /** Nove poradie kreslenia (povodne indexy) - vyber a skrytie idu s prvkami. */
  const reorder = (order: number[]) => {
    if (order.every((old, i) => old === i)) return;
    setElements(order.map((i) => form.elements[i]));
    setSelection(chosen.map((i) => order.indexOf(i)));
    setHidden(new Set(order.flatMap((old, i) => (hidden.has(old) ? [i] : []))));
  };
  const selectLayer = (index: number, mode: "replace" | "toggle" | "range") => {
    if (mode === "toggle") setSelection(chosen.includes(index) ? chosen.filter((i) => i !== index) : [...chosen, index]);
    else if (mode === "range" && chosen.length) {
      const from = chosen[chosen.length - 1];
      const range = Array.from({ length: Math.abs(index - from) + 1 }, (_, k) => (index > from ? from + k : from - k));
      setSelection([...chosen.filter((i) => !range.includes(i)), ...range]);
    } else setSelection([index]);
  };
  /** Zarovnanie vybranych prvkov; jeden prvok sa zarovna k platnu. */
  const align = (op: AlignOp) => {
    const boxes = chosen.map((i) => boxOf(form.elements[i]));
    const deltas = alignDeltas(boxes, op, chosen.length === 1 ? { x: 0, y: 0, w: form.width, h: form.height } : undefined);
    updateMany(new Map(chosen.map((i, k) => [i, moveBy(form.elements[i], deltas[k].dx, deltas[k].dy, 0.01)])));
  };
  const toggleHidden = (index: number) => {
    const next = new Set(hidden);
    if (!next.delete(index)) next.add(index);
    setHidden(next);
  };
  const undo = () => {
    history.undo();
    setSelection([]);
  };
  const redo = () => {
    history.redo();
    setSelection([]);
  };

  /** Prikaz z klaves; false = neda sa pouzit (klavesa ostane prehliadacu). */
  const run = (action: EditorAction): boolean => {
    const picked = chosen.map((i) => form.elements[i]);
    const some = chosen.length > 0;
    switch (action) {
      case "undo":
        undo();
        return true;
      case "redo":
        redo();
        return true;
      case "selectAll":
        setSelection(form.elements.flatMap((e, i) => (e.locked || hidden.has(i) ? [] : [i])));
        return true;
      case "copy":
        if (some) copyElements(picked);
        return some;
      case "cut":
        if (!some) return false;
        copyElements(picked);
        removeMany(chosen);
        return true;
      case "paste":
        if (clipboard.length === 0) return false;
        insert(cloneElements(clipboard, form.elements, PASTE_OFFSET, PASTE_OFFSET));
        return true;
      case "duplicate":
        if (some) insert(cloneElements(picked, form.elements, PASTE_OFFSET, PASTE_OFFSET));
        return some;
      case "remove":
        if (some) removeMany(chosen);
        return some;
      case "forward":
      case "backward":
        if (some) reorder(stepOrder(form.elements.length, chosen, action === "forward" ? 1 : -1));
        return some;
      case "front":
      case "back":
        if (some) reorder(extremeOrder(form.elements.length, chosen, action === "front"));
        return some;
      case "lock":
        if (some) patchSelected({ locked: !picked.every((e) => e.locked) });
        return some;
      case "hide":
        if (some) chosen.forEach(toggleHidden);
        return some;
    }
  };

  // Ctrl+S kdekolvek, ostatne klavesy mimo poli formulara, okien a zoznamov vyberu
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && !e.altKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveNow();
      return;
    }
    if (typing(e.target) || (e.target instanceof Element && e.target.closest('[role="dialog"],[role="alertdialog"],[role="listbox"],[role="menu"]'))) return;
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const arrow = arrows[e.key];
    if (arrow && !mod && chosen.length) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      patchSelected((el) => (el.locked ? el : moveBy(el, arrow[0] * step, arrow[1] * step, 0.001)), e.repeat);
      return;
    }
    if (e.key === "Escape" && chosen.length) {
      setSelection([]);
      return;
    }
    const action = e.key === "Delete" || e.key === "Backspace" ? "remove" : shortcutAction(e);
    if (action && run(action)) e.preventDefault();
  };

  const unplaced = unplacedDevices(live, form.elements);
  // obrazok je ulozeny hned po nahrati (mimo krokov spat), krytie sa uklada so schemou
  const background = backgroundOf(schema, form.backgroundOpacity);
  const label = (e: SchemaElementDto) => elementLabel(e, live) || t(`schema.kind.${e.kind}`);

  return (
    <div className="flex flex-col gap-3 xl:h-[calc(100dvh-5rem)] xl:min-h-[34rem]">
      <DocumentKeys onKeyDown={onKey} />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => void close()}>
          <ArrowLeft />
          {t("schema.edit.back")}
        </Button>
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-6" />
        <Button variant="ghost" size="icon" title={t("faces.undo")} aria-label={t("faces.undo")} disabled={!history.canUndo} onClick={undo}>
          <Undo />
        </Button>
        <Button variant="ghost" size="icon" title={t("faces.redo")} aria-label={t("faces.redo")} disabled={!history.canRedo} onClick={redo}>
          <Redo />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <Plus />
            {t("faces.add")}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            {DRAWING_KINDS.map((kind) => {
              const Icon = KIND_ICONS[kind];
              return (
                <DropdownMenuItem key={kind} onClick={() => addDrawing(kind)}>
                  <Icon />
                  {t(`schema.kind.${kind}`)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-6" />
        <Button variant="ghost" size="icon" title={t("faces.zoom.out")} aria-label={t("faces.zoom.out")} onClick={() => setZoom(zoomStep(scale, -1))}>
          <ZoomOut />
        </Button>
        <Button
          variant="ghost"
          className="min-w-16 tabular-nums"
          title={t("schema.zoom.fit")}
          aria-label={t("faces.zoom", { percent: Math.round(scale * 100) })}
          onClick={() => setZoom(null)}
        >
          {Math.round(scale * 100)} %
        </Button>
        <Button variant="ghost" size="icon" title={t("faces.zoom.in")} aria-label={t("faces.zoom.in")} onClick={() => setZoom(zoomStep(scale, 1))}>
          <ZoomIn />
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {dirty && <span className="text-sm text-muted-foreground">{t("settings.unsaved")}</span>}
          <Button
            variant="outline"
            disabled={!dirty || save.isPending}
            onClick={() => {
              history.reset(saved);
              setSelection([]);
              setHidden(new Set());
              save.reset();
            }}
          >
            <Undo2 />
            {t("settings.discard")}
          </Button>
          <Button title={t("faces.save")} disabled={!dirty || save.isPending} onClick={saveNow}>
            {save.isPending ? <Spinner /> : <Save />}
            {t("common.save")}
          </Button>
        </div>
      </div>

      {save.error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription className="whitespace-pre-line">{errorText(save.error)}</AlertDescription>
        </Alert>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[15rem_minmax(0,1fr)_18rem]">
        <aside className="order-2 flex max-h-[32rem] min-h-0 flex-col gap-4 rounded-xl border bg-card p-3 xl:order-none xl:max-h-none">
          <section className="flex max-h-[40%] min-h-0 shrink-0 flex-col gap-2">
            <h2 className="text-xs font-medium text-muted-foreground">{t("schema.devices")}</h2>
            {unplaced.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("schema.devices.empty")}</p>
            ) : (
              <ul aria-label={t("schema.devices")} className="-mx-1 min-h-0 overflow-y-auto">
                {unplaced.map((device) => {
                  const Icon = KIND_ICONS[device.kind];
                  const name = label(newDevice(device, 0, 0, 0));
                  return (
                    <li key={`${device.kind}|${device.line}|${device.address ?? ""}|${device.circuit}`}>
                      <button
                        type="button"
                        title={t("schema.devices.add", { name })}
                        className="flex h-8 w-full items-center gap-2 rounded-md px-1 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted"
                        onClick={() => addDevice(device)}
                      >
                        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{name}</span>
                        <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="flex min-h-0 flex-1 flex-col gap-2 border-t pt-3">
            <h2 className="text-xs font-medium text-muted-foreground">{t("faces.layers")}</h2>
            <LayersPanel
              elements={form.elements.map((e) => ({ label: label(e), icon: KIND_ICONS[e.kind], locked: e.locked }))}
              empty={t("schema.layers.empty")}
              selection={chosen}
              hidden={hidden}
              readOnly={false}
              onSelect={selectLayer}
              onToggleLock={(i) => updateMany(new Map([[i, { ...form.elements[i], locked: !form.elements[i].locked }]]))}
              onToggleHidden={toggleHidden}
              onReorder={reorder}
            />
          </section>
        </aside>

        <div
          ref={viewport}
          className="order-1 min-h-64 overflow-auto rounded-xl border bg-muted/40 p-4 xl:order-none"
          onPointerDown={(e) => e.target === e.currentTarget && setSelection([])}
        >
          <SchemaEditCanvas
            schema={form}
            live={live}
            background={background}
            scale={scale}
            selection={chosen}
            hidden={hidden}
            onSelect={setSelection}
            onChange={(changes, transient) => updateMany(changes, transient)}
          />
        </div>

        <aside className="order-3 min-h-0 overflow-y-auto rounded-xl border bg-card p-3 xl:order-none">
          <SchemaProperties
            schema={form}
            schemaId={schema.id}
            background={background}
            elements={chosen.map((i) => form.elements[i])}
            live={live}
            onPatch={patchSelected}
            onSchema={change}
            onAlign={align}
            onRemove={() => removeMany(chosen)}
          />
        </aside>
      </div>
    </div>
  );
}
