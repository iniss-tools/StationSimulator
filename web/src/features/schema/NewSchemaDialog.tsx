// Nova schema stanice: nazov a volitelne navrh rozmiestnenia zariadeni, ktore simulator pozna.
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createStationSchema, errorText, getStationSchemasQueryKey, queryClient, type StationSchemaDto } from "@/api";
import { CheckField, FormField } from "@/components/common/form-field";
import { FormDialog } from "@/components/common/form-dialog";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n";
import { autoLayout, DEFAULT_BACKGROUND, type SchemaLive } from "./schema";

/** Rozmer prazdneho platna. */
const EMPTY_SIZE = { width: 1600, height: 900 };

export function NewSchemaDialog({ live, onClose, onCreated }: { live: SchemaLive; onClose: () => void; onCreated: (schema: StationSchemaDto) => void }) {
  const [name, setName] = useState("");
  const [devices, setDevices] = useState(live.boards.length > 0);
  const create = useMutation({
    mutationFn: async () => {
      const body = devices ? autoLayout(name, live) : { name, ...EMPTY_SIZE, elements: [], ...DEFAULT_BACKGROUND };
      return (await createStationSchema({ body, throwOnError: true })).data;
    },
    onSuccess: async (schema) => {
      await queryClient.invalidateQueries({ queryKey: getStationSchemasQueryKey() });
      onCreated(schema);
      onClose();
    },
  });

  return (
    <FormDialog
      title={t("schema.new.title")}
      onClose={onClose}
      onSubmit={() => create.mutate()}
      busy={create.isPending}
      error={create.error ? errorText(create.error) : null}
      submitLabel={t("schema.new.submit")}
    >
      <FormField label={t("field.name")}>
        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus placeholder={t("schema.new.placeholder")} />
      </FormField>
      <CheckField
        label={t("schema.new.devices")}
        hint={t("schema.new.devices.hint")}
        checked={devices}
        onCheckedChange={setDevices}
        disabled={live.boards.length === 0}
      />
    </FormDialog>
  );
}
