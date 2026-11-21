// Panel vlastnosti editora schemy: vybrane prvky (zarovnanie, poloha, text, farby, zariadenie), bez vyberu nazov a
// rozmer platna. Pri viacerych prvkoch s roznou hodnotou pole ukaze "Rozne" a zmena plati pre vsetky.
import { Fragment, useRef } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceAround,
  Expand,
  ImageUp,
  Layers,
  Lock,
  LockOpen,
  Move,
  Scaling,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { SchemaElementDto, StationSchemaRequest } from "@/api";
import { FormField } from "@/components/common/form-field";
import { OptionSelect } from "@/components/common/option-select";
import { ALIGN_OPS, canAlign, type AlignOp } from "@/components/editor/align";
import { NumberField, PanelSection } from "@/components/editor/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";
import { backgroundBox, deviceCandidates, deviceKey, elementLabel, isDevice, isPolyline, type SchemaBackground, type SchemaLive } from "./schema";
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
  /** Obrazok pozadia, ako ho editor prave ukazuje (aj vybrany a este neulozeny). */
  background: SchemaBackground | null;
  /** Preco sa vybrany obrazok neda pouzit; null = v poriadku. */
  imageError: string | null;
  /** Plocha obrazka pozadia sa prave upravuje mysou na platne. */
  pictureEdit: boolean;
  onPictureEdit: (edit: boolean) => void;
  /** Novy obrazok pozadia zo suboru (ulozi sa so schemou). */
  onImage: (file: File) => void;
  onRemoveImage: () => void;
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

type FieldsProps = Pick<Props, "schema" | "background" | "imageError" | "pictureEdit" | "onSchema" | "onImage" | "onRemoveImage" | "onPictureEdit">;

/** Obrazok pozadia na cele platno (bez vlastnej polohy a rozmeru). */
const WHOLE_CANVAS = { backgroundX: 0, backgroundY: 0, backgroundWidth: 0, backgroundHeight: 0 };

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

function SchemaFields({ schema, background, imageError, pictureEdit, onSchema, onImage, onRemoveImage, onPictureEdit }: FieldsProps) {
  const input = useRef<HTMLInputElement>(null);
  const box = backgroundBox(schema);
  /** Vyska platna podla pomeru stran obrazka (sirka ostava), obrazok na cele platno. */
  const fitCanvas = async () => {
    if (!background) return;
    const size = await imageSize(background.href);
    if (size) onSchema({ height: Math.max(100, Math.round((schema.width * size.height) / size.width)), ...WHOLE_CANVAS });
  };
  /** Zmena plochy obrazka - od tej chvile ma vlastnu polohu a rozmer. */
  const place = (key: "x" | "y" | "width" | "height", value: number, transient?: boolean) => {
    const next = { ...box, [key]: key === "width" || key === "height" ? Math.max(1, value) : value };
    onSchema({ backgroundX: next.x, backgroundY: next.y, backgroundWidth: next.width, backgroundHeight: next.height }, transient);
  };
  const placed = schema.backgroundWidth > 0 && schema.backgroundHeight > 0;
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
            if (file) onImage(file);
            e.target.value = "";
          }}
        />
        <div className="col-span-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
            <ImageUp />
            {t(background ? "schema.background.replace" : "schema.background.upload")}
          </Button>
          {background && (
            <Button type="button" variant="outline" size="sm" onClick={onRemoveImage}>
              <Trash2 />
              {t("common.delete")}
            </Button>
          )}
        </div>
        {background && (
          <>
            <NumberField label="X" value={Math.round(box.x * 100) / 100} step={1} disabled={false} onChange={(v, tr) => place("x", v, tr)} />
            <NumberField label="Y" value={Math.round(box.y * 100) / 100} step={1} disabled={false} onChange={(v, tr) => place("y", v, tr)} />
            <NumberField label={t("schema.field.width")} value={box.width} step={10} min={1} disabled={false} onChange={(v, tr) => place("width", v, tr)} />
            <NumberField label={t("schema.field.height")} value={box.height} step={10} min={1} disabled={false} onChange={(v, tr) => place("height", v, tr)} />
            <NumberField
              label={t("schema.background.opacity")}
              value={Math.round(schema.backgroundOpacity * 100)}
              step={5}
              min={0}
              disabled={false}
              onChange={(v, tr) => onSchema({ backgroundOpacity: Math.min(100, Math.max(0, v)) / 100 }, tr)}
            />
            <div className="col-span-2 flex flex-wrap gap-1">
              <Button
                type="button"
                variant={pictureEdit ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={pictureEdit}
                title={t("schema.background.move.hint")}
                onClick={() => onPictureEdit(!pictureEdit)}
              >
                <Move />
                {t("schema.background.move")}
              </Button>
              <Button type="button" variant="ghost" size="sm" disabled={!placed} onClick={() => onSchema(WHOLE_CANVAS)}>
                <Expand />
                {t("schema.background.whole")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => void fitCanvas()}>
                <Scaling />
                {t("schema.background.fit")}
              </Button>
            </div>
          </>
        )}
        <p className={cn("col-span-2 text-xs", imageError ? "text-destructive" : "text-muted-foreground")}>{imageError ?? t("schema.background.hint")}</p>
      </PanelSection>
      <p className="text-xs text-muted-foreground">{t("schema.properties.hint")}</p>
    </div>
  );
}

export function SchemaProperties(props: Props) {
  const { schema, background, imageError, pictureEdit, elements, live, onPatch, onSchema, onImage, onRemoveImage, onPictureEdit, onAlign, onRemove } = props;
  if (elements.length === 0)
    return (
      <SchemaFields
        schema={schema}
        background={background}
        imageError={imageError}
        pictureEdit={pictureEdit}
        onSchema={onSchema}
        onImage={onImage}
        onRemoveImage={onRemoveImage}
        onPictureEdit={onPictureEdit}
      />
    );

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
