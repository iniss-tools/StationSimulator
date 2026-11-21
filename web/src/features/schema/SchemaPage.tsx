// Schema stanice: vyber schemy, platno so zivym stavom zariadeni, hrajuce hlasenia a detail zariadenia po kliknuti.
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Download, Ellipsis, Map as MapIcon, Maximize, Pencil, Plus, Trash2, Upload, Volume2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteStationSchema,
  errorText,
  getStationSchemasOptions,
  getStationSchemasQueryKey,
  PERMISSIONS,
  queryClient,
  useCan,
  useSimulatorState,
} from "@/api";
import { confirmAction } from "@/components/common/confirm";
import { OptionSelect } from "@/components/common/option-select";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/i18n";
import { NewSchemaDialog } from "./NewSchemaDialog";
import { SchemaCanvas } from "./SchemaCanvas";
import { SchemaDetail } from "./SchemaDetail";
import { SchemaEditor } from "./SchemaEditor";
import { announcementText, backgroundOf, elementLabel, elementState } from "./schema";
import { exportSchema, importSchema } from "./schema-transfer";
import { loadSchemaChoice, saveSchemaChoice } from "./view";

export function SchemaPage() {
  const state = useSimulatorState();
  const can = useCan();
  const edit = can(PERMISSIONS.schemas);
  const schemas = useQuery(getStationSchemasOptions()).data;
  const [choice, setChoice] = useState(loadSchemaChoice);
  const [selected, setSelected] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  const schema = schemas?.find((s) => s.id === choice) ?? schemas?.[0];
  const live = { lines: state.lines, boards: state.boards };
  const element = schema?.elements.find((e) => e.id === selected);
  const playing = (schema?.elements ?? []).flatMap((e) => {
    const announcement = e.kind === "audio" ? elementState(e, live).playing : undefined;
    return announcement ? [{ id: e.id, label: elementLabel(e, live), text: announcementText(announcement) }] : [];
  });

  const choose = (id: number) => {
    setChoice(id);
    saveSchemaChoice(id);
    setSelected(null);
  };
  const fileInput = useRef<HTMLInputElement>(null);
  const failed = (e: unknown) => toast.error(errorText(e));
  const importFile = async (file: File) => {
    const created = await importSchema(file);
    if (!created) {
      toast.error(t("schema.import.invalid"));
      return;
    }
    await queryClient.invalidateQueries({ queryKey: getStationSchemasQueryKey() });
    choose(created.id);
    toast.success(t("schema.import.done", { name: created.name }));
  };
  const remove = async () => {
    if (!schema || !(await confirmAction({ title: t("schema.delete.confirm", { name: schema.name }), destructive: true }))) return;
    deleteStationSchema({ path: { id: schema.id }, throwOnError: true }).catch((e: unknown) => toast.error(errorText(e)));
  };

  if (editing && edit && schema) return <SchemaEditor key={schema.id} schema={schema} live={live} onClose={() => setEditing(false)} />;

  return (
    <>
      <PageHeader description={t("schema.description")}>
        {schemas && schemas.length > 0 && (
          <OptionSelect
            value={schema?.id ?? null}
            onValueChange={choose}
            options={schemas.map((s) => ({ value: s.id, label: s.name }))}
            ariaLabel={t("schema.select")}
            className="min-w-48"
          />
        )}
        {edit && schema && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil />
            {t("common.edit")}
          </Button>
        )}
        {edit && schema && (
          <Button variant="outline" onClick={() => void remove()}>
            <Trash2 />
            {t("common.delete")}
          </Button>
        )}
        {(schema || edit) && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" title={t("schema.more")} aria-label={t("schema.more")} />}>
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              {schema && (
                <DropdownMenuItem onClick={() => window.open(`#/plan/${schema.id}`, "_blank")}>
                  <Maximize />
                  {t("schema.kiosk.open")}
                </DropdownMenuItem>
              )}
              {schema && (
                <DropdownMenuItem onClick={() => void exportSchema(schema).catch(failed)}>
                  <Download />
                  {t("schema.export")}
                </DropdownMenuItem>
              )}
              {edit && (
                <DropdownMenuItem onClick={() => fileInput.current?.click()}>
                  <Upload />
                  {t("schema.import")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {edit && (
          <Button onClick={() => setCreating(true)}>
            <Plus />
            {t("schema.new")}
          </Button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label={t("schema.import")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importFile(file).catch(failed);
            e.target.value = "";
          }}
        />
      </PageHeader>

      {!schemas || !state.loaded ? (
        <Skeleton className="h-96 w-full" />
      ) : !schema ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapIcon />
            </EmptyMedia>
            <EmptyTitle>{t("schema.empty.title")}</EmptyTitle>
            <EmptyDescription>{t(edit ? "schema.empty.text" : "schema.empty.readonly")}</EmptyDescription>
          </EmptyHeader>
          {edit && (
            <EmptyContent>
              <Button onClick={() => setCreating(true)}>
                <Plus />
                {t("schema.new")}
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <>
          <SchemaCanvas
            schema={schema}
            live={live}
            background={backgroundOf(schema, schema.backgroundOpacity)}
            selected={selected}
            onSelect={(e) => setSelected(e.id)}
          />
          <div className="mt-3 flex min-h-6 flex-col gap-1 text-sm" aria-live="polite">
            {playing.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Volume2 className="size-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{p.label}</span>
                <span className="min-w-0 truncate text-muted-foreground">{p.text}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {element && <SchemaDetail element={element} live={live} onClose={() => setSelected(null)} />}
      {creating && (
        <NewSchemaDialog
          live={live}
          onClose={() => setCreating(false)}
          onCreated={(s) => {
            choose(s.id);
            setEditing(true);
          }}
        />
      )}
    </>
  );
}
