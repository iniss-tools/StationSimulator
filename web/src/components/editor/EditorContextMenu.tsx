// Kontextova ponuka platna editora (cela tabul, schema stanice; prave tlacidlo): schranka, poradie kreslenia, zamok, skrytie, vyber a odstranenie.
// Polozky, ktore sa na vyber nedaju pouzit, su vypnute; skratky ukazuje vpravo.
import type { ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  BringToFront,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Scissors,
  SendToBack,
  SquareDashedMousePointer,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu";
import { t, type TextKey } from "@/i18n";
import type { EditorAction } from "./shortcuts";

interface Props {
  children: ReactNode;
  className?: string;
  /** Pocet vybranych prvkov. */
  count: number;
  readOnly: boolean;
  canPaste: boolean;
  canForward: boolean;
  canBackward: boolean;
  /** Vsetky vybrane prvky su zamknute / skryte v editore. */
  locked: boolean;
  hidden: boolean;
  onAction: (action: EditorAction) => void;
}

export function EditorContextMenu({ children, className, count, readOnly, canPaste, canForward, canBackward, locked, hidden, onAction }: Props) {
  const edit = count > 0 && !readOnly;
  const item = (action: EditorAction, Icon: LucideIcon, label: TextKey, enabled: boolean, shortcut?: string) => (
    <ContextMenuItem disabled={!enabled} variant={action === "remove" ? "destructive" : "default"} onClick={() => onAction(action)}>
      <Icon />
      {t(label)}
      {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
    </ContextMenuItem>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {item("copy", Copy, "faces.action.copy", count > 0, "Ctrl+C")}
        {item("cut", Scissors, "faces.action.cut", edit, "Ctrl+X")}
        {item("paste", ClipboardPaste, "faces.action.paste", canPaste && !readOnly, "Ctrl+V")}
        {item("duplicate", CopyPlus, "faces.action.duplicate", edit, "Ctrl+D")}
        <ContextMenuSeparator />
        {item("front", BringToFront, "faces.action.front", edit && canForward, "Ctrl+Shift+]")}
        {item("forward", ArrowUpToLine, "faces.element.forward", edit && canForward, "Ctrl+]")}
        {item("backward", ArrowDownToLine, "faces.element.backward", edit && canBackward, "Ctrl+[")}
        {item("back", SendToBack, "faces.action.back", edit && canBackward, "Ctrl+Shift+[")}
        <ContextMenuSeparator />
        {item("lock", locked ? LockOpen : Lock, locked ? "faces.element.unlock" : "faces.element.lock", edit)}
        {item("hide", hidden ? Eye : EyeOff, hidden ? "faces.element.show" : "faces.element.hide", count > 0)}
        {item("selectAll", SquareDashedMousePointer, "faces.action.selectAll", true, "Ctrl+A")}
        <ContextMenuSeparator />
        {item("remove", Trash2, "common.delete", edit, "Del")}
      </ContextMenuContent>
    </ContextMenu>
  );
}
