// Panel vlastnosti editora schemy: vybrane prvky (zarovnanie, poloha, text, farby, zariadenie), bez vyberu nazov a
// rozmer platna. Pri viacerych prvkoch s roznou hodnotou pole ukaze "Rozne" a zmena plati pre vsetky.
import { Fragment, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceAround,
  ImageUp,
  Layers,
  Lock,
  LockOpen,
  Scaling,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  deleteSchemaBackground,
  errorText,
  getStationSchemasQueryKey,
  queryClient,
  setSchemaBackground,
  type SchemaElementDto,
  type StationSchemaRequest,
} from "@/api";
import { FormField } from "@/components/common/form-field";
import { OptionSelect } from "@/components/common/option-select";
import { ALIGN_OPS, canAlign, type AlignOp } from "@/components/editor/align";
import { NumberField, PanelSection } from "@/components/editor/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { t } from "@/i18n";
import { deviceCandidates, deviceKey, elementLabel, isDevice, isPolyline, type SchemaBackground, type SchemaLive } from "./schema";
import { boxOf, common, MIN_SIZE, moveBy } from "./schema-edit";
import { imageSize } from "./image-size";
import { KIND_ICONS } from "./schema-icons";

const ALIGN_ICONS: Record<AlignOp, LucideIcon> = {
  left: AlignStartVertical,
  hcenter: AlignCenterVertical,
  right: AlignEndVertical,
  top: AlignStartHorizontal,
  vcenter: AlignCenterHorizontal,
  bottom: AlignEndHorizontal,
  hdistribute: AlignHorizontalSpaceAround,
  vdistribute: AlignVerticalSpaceAround,
};

/** Zmena vybranych prvkov: rovnaka pre vsetky, alebo pre kazdy zvlast. */
export type ElementPatch = Partial<SchemaElementDto> | ((element: SchemaElementDto) => SchemaElementDto);

interface Props {
  schema: StationSchemaRequest;
  /** Cislo upravovanej schemy (nahratie obrazka pozadia). */
  schemaId: number;
  background: SchemaBackground | null;
  /** Vybrane prvky. */
  elements: SchemaElementDto[];
  live: SchemaLive;
  onPatch: (patch: ElementPatch, transient?: boolean) => void;
  onSchema: (patch: Partial<StationSchemaRequest>, transient?: boolean) => void;
  onAlign: (op: AlignOp) => void;
  onRemove: () => void;
}

const DEFAULT = "default";
const CUSTOM = "custom";

/** Farba: predvolena podla druhu a temy, alebo vlastna #rrggbb. */
function ColorField({ label, value, onChange }: { label: string; value: string | undefined; onChange: (value: string) => void }) {
  return (
    <FormField label={label} className="col-span-2">
      <div className="flex items-center gap-2">
        <OptionSelect
          value={value === undefined ? null : value ? CUSTOM : DEFAULT}
          placeholder={t("faces.mixed")}
          onValueChange={(v) => onChange(v === CUSTOM ? "#808080" : "")}
          options={[
            { value: DEFAULT, label: t("schema.color.default") },
            { value: CUSTOM, label: t("schema.color.custom") },
          ]}
          className="min-w-0 flex-1"
        />
        {value && (
          <input
            type="color"
            aria-label={label}
            className="h-8 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </FormField>
  );
}

function SchemaFields({ schema, schemaId, background, onSchema }: Pick<Props, "schema" | "schemaId" | "background" | "onSchema">) {
  const input = useRef<HTMLInputElement>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: getStationSchemasQueryKey() });
  const upload = useMutation({
    mutationFn: (file: File) => setSchemaBackground({ path: { id: schemaId }, query: { name: file.name }, body: file, throwOnError: true }),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: () => deleteSchemaBackground({ path: { id: schemaId }, throwOnError: true }), onSuccess: refresh });
  /** Vyska platna podla pomeru stran obrazka (sirka ostava). */
  const fitCanvas = async () => {
    if (!background) return;
    const size = await imageSize(background.href);
    if (size) onSchema({ height: Math.max(100, Math.round((schema.width * size.height) / size.width)) });
  };
  const error = upload.error ?? remove.error;
  return (
    <div className="flex flex-col gap-3">
      <PanelSection title={t("schema.section.schema")}>
        <FormField label={t("field.name")} className="col-span-2">
          <Input value={schema.name} maxLength={100} onChange={(e) => onSchema({ name: e.target.value })} />
        </FormField>
        <NumberField
          label={t("schema.field.width")}
          value={schema.width}
          step={10}
          min={100}
          disabled={false}
          onChange={(v, tr) => onSchema({ width: v }, tr)}
        />
        <NumberField
          label={t("schema.field.height")}
          value={schema.height}
          step={10}
          min={100}
          disabled={false}
          onChange={(v, tr) => onSchema({ height: v }, tr)}
        />
      </PanelSection>
      <PanelSection title={t("schema.section.background")}>
        <input
          ref={input}
          type="file"
          accept=".png,.jpg,.jpeg,.gif,.webp"
          className="hidden"
          aria-label={t("schema.background.upload")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate(file);
            e.target.value = "";
          }}
        />
        <div className="col-span-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={upload.isPending} onClick={() => input.current?.click()}>
            {upload.isPending ? <Spinner /> : <ImageUp />}
            {t(background ? "schema.background.replace" : "schema.background.upload")}
          </Button>
          {background && (
            <Button type="button" variant="outline" size="sm" disabled={remove.isPending} onClick={() => remove.mutate()}>
              <Trash2 />
              {t("common.delete")}
            </Button>
          )}
        </div>
        {background && (
          <>
            <NumberField
              label={t("schema.background.opacity")}
              value={Math.round(schema.backgroundOpacity * 100)}
              step={5}
              min={0}
              disabled={false}
              onChange={(v, tr) => onSchema({ backgroundOpacity: Math.min(100, Math.max(0, v)) / 100 }, tr)}
            />
            <Button type="button" variant="ghost" size="sm" className="col-span-2 justify-start" onClick={() => void fitCanvas()}>
              <Scaling />
              {t("schema.background.fit")}
            </Button>
          </>
        )}
        <p className="col-span-2 text-xs text-muted-foreground">{error ? errorText(error) : t("schema.background.hint")}</p>
      </PanelSection>
      <p className="text-xs text-muted-foreground">{t("schema.properties.hint")}</p>
    </div>
  );
}

export function SchemaProperties({ schema, schemaId, background, elements, live, onPatch, onSchema, onAlign, onRemove }: Props) {
  if (elements.length === 0) return <SchemaFields schema={schema} schemaId={schemaId} background={background} onSchema={onSchema} />;

  const single = elements.length === 1 ? elements[0] : null;
  const kind = common(elements.map((e) => e.kind));
  const boxes = elements.map(boxOf);
  const locked = elements.every((e) => e.locked);
  const allBoxes = elements.every((e) => !isPolyline(e.kind) && e.kind !== "text");
  const anyText = elements.some((e) => e.kind !== "board" || e.view === "symbol" || e.text !== "");
  const devices = kind && isDevice(kind) ? deviceCandidates(live).filter((d) => d.kind === kind) : [];
  const Icon = kind ? KIND_ICONS[kind] : Layers;
  const round = (value: number) => Math.round(value * 100) / 100;
  const position = (axis: "x" | "y", label: string) => (
    <NumberField
      label={label}
      value={common(boxes.map((b) => round(b[axis])))}
      step={1}
      disabled={false}
      onChange={(value, transient) =>
        onPatch((e) => {
          const box = boxOf(e);
          return moveBy(e, axis === "x" ? value - box.x : 0, axis === "y" ? value - box.y : 0, 0.001);
        }, transient)
      }
    />
  );
  const number = (key: "width" | "height" | "rotation" | "size" | "stroke", label: string, min?: number, step = 1) => (
    <NumberField
      label={label}
      value={common(elements.map((e) => e[key]))}
      step={step}
      min={min}
      disabled={false}
      onChange={(value, transient) => onPatch({ [key]: min === undefined ? value : Math.max(min, value) }, transient)}
    />
  );
  const iconButton = (title: string, onClick: () => void, IconType: LucideIcon, disabled = false) => (
    <Button type="button" variant="ghost" size="icon-sm" title={title} aria-label={title} disabled={disabled} onClick={onClick}>
      <IconType />
    </Button>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {single ? t(`schema.kind.${single.kind}`) : t(elements.length < 5 ? "faces.selection.few" : "faces.selection.many", { count: elements.length })}
        </p>
        {iconButton(t(locked ? "faces.element.unlock" : "faces.element.lock"), () => onPatch({ locked: !locked }), locked ? Lock : LockOpen)}
        {iconButton(t("common.delete"), onRemove, Trash2)}
      </div>

      <PanelSection title={t("faces.section.align")}>
        <div className="col-span-2 flex flex-wrap gap-0.5" role="toolbar" aria-label={t("faces.section.align")}>
          {ALIGN_OPS.map((op) => (
            <Fragment key={op}>{iconButton(t(`faces.align.${op}`), () => onAlign(op), ALIGN_ICONS[op], !canAlign(op, elements.length))}</Fragment>
          ))}
        </div>
        <p className="col-span-2 text-xs text-muted-foreground">{t(single ? "schema.align.hint.single" : "faces.align.hint.many")}</p>
      </PanelSection>

      <PanelSection title={t("faces.section.position")}>
        {position("x", "X")}
        {position("y", "Y")}
        {allBoxes && number("width", t("schema.field.width"), MIN_SIZE)}
        {allBoxes && number("height", t("schema.field.height"), MIN_SIZE)}
        {elements.every((e) => !isPolyline(e.kind)) && number("rotation", t("schema.field.rotation"))}
      </PanelSection>

      {kind && isDevice(kind) && (
        <PanelSection title={t("schema.section.device")}>
          <FormField label={t("schema.detail.device")} className="col-span-2">
            <OptionSelect
              value={common(elements.map(deviceKey)) ?? null}
              placeholder={t("faces.mixed")}
              onValueChange={(key) => {
                const device = devices.find((d) => deviceKey(d) === key);
                if (device) onPatch({ line: device.line, address: device.address, circuit: device.circuit });
              }}
              options={[
                // zariadenie, ktore v simulatore (uz) nie je, ostava v ponuke ako vybrana hodnota
                ...elements
                  .filter((e) => !devices.some((d) => deviceKey(d) === deviceKey(e)))
                  .map((e) => ({ value: deviceKey(e), label: `${elementLabel({ ...e, text: "" }, live)} (${t("schema.state.missing")})` })),
                ...devices.map((d) => ({
                  value: deviceKey(d),
                  label: `${t("field.line")} ${d.line} · ${elementLabel({ ...elements[0], ...d, text: "" }, live)}`,
                })),
              ].filter((option, i, all) => all.findIndex((o) => o.value === option.value) === i)}
              className="w-full min-w-0"
            />
          </FormField>
          {kind === "board" && (
            <FormField label={t("schema.field.view")} className="col-span-2">
              <OptionSelect
                value={common(elements.map((e) => e.view)) ?? null}
                placeholder={t("faces.mixed")}
                onValueChange={(view) => onPatch({ view })}
                options={(["live", "symbol"] as const).map((view) => ({ value: view, label: t(`schema.view.${view}`) }))}
                className="w-full min-w-0"
              />
            </FormField>
          )}
        </PanelSection>
      )}

      <PanelSection title={t("schema.section.look")}>
        {anyText && (
          <FormField label={t(kind && isDevice(kind) ? "schema.field.label" : "schema.field.text")} className="col-span-2">
            <Input
              value={common(elements.map((e) => e.text)) ?? ""}
              placeholder={common(elements.map((e) => e.text)) === undefined ? t("faces.mixed") : undefined}
              maxLength={500}
              onChange={(e) => onPatch({ text: e.target.value })}
            />
          </FormField>
        )}
        {number("size", t("schema.field.size"), 0)}
        {elements.every((e) => !isDevice(e.kind) && e.kind !== "text") && number("stroke", t("schema.field.stroke"), 0, 0.5)}
        {elements.every((e) => !isDevice(e.kind)) && (
          <>
            <ColorField label={t("schema.field.color")} value={common(elements.map((e) => e.color))} onChange={(color) => onPatch({ color })} />
            {allBoxes && <ColorField label={t("schema.field.fill")} value={common(elements.map((e) => e.fill))} onChange={(fill) => onPatch({ fill })} />}
          </>
        )}
        <p className="col-span-2 text-xs text-muted-foreground">{t("schema.field.size.hint")}</p>
      </PanelSection>
    </div>
  );
}
