// Farba prvku cela: predvolena, farba vzhladu alebo vlastna. Pri viacerych vybranych prvkoch s roznou farbou pole
// ukaze "Rozne" (hodnota undefined) a zmena plati pre vsetky.
import { FormField } from "@/components/common/form-field";
import { OptionSelect } from "@/components/common/option-select";
import { t, type TextKey } from "@/i18n";
import { FACE_COLOR_TOKENS } from "./faces";

const HEX = /^#[0-9a-fA-F]{6}$/;
/** Vlastna farba #rrggbb vo vybere farieb. */
const CUSTOM = "#";

/** Farba: predvolena (prazdna), nazov farby vzhladu alebo vlastna #rrggbb. */
export function ColorField({
  label,
  value,
  emptyLabel,
  onChange,
  disabled,
  className = "col-span-2",
}: {
  label: string;
  /** undefined = vybrane prvky maju rozne farby. */
  value: string | undefined;
  emptyLabel: string;
  onChange: (value: string) => void;
  disabled: boolean;
  className?: string;
}) {
  const custom = value?.startsWith("#") ?? false;
  return (
    <FormField label={label} className={className}>
      <div className="flex items-center gap-2">
        <OptionSelect
          value={value === undefined ? null : custom ? CUSTOM : value}
          placeholder={t("faces.mixed")}
          disabled={disabled}
          onValueChange={(v) => onChange(v === CUSTOM ? "#ffffff" : v)}
          options={[
            { value: "", label: emptyLabel },
            ...FACE_COLOR_TOKENS.map((token) => ({ value: token, label: t(`face.color.${token}` as TextKey) })),
            { value: CUSTOM, label: t("face.color.custom") },
          ]}
          className="min-w-0 flex-1"
        />
        {custom && (
          <input
            type="color"
            aria-label={label}
            className="h-8 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
            value={value && HEX.test(value) ? value : "#ffffff"}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </FormField>
  );
}
