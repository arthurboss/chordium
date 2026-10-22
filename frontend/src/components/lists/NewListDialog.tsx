import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cyAttr } from "@/utils/test-utils";

interface NewListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-filled name, used when renaming an existing list */
  initialName?: string;
  title: string;
  confirmLabel: string;
  onSubmit: (name: string) => void | Promise<void>;
}

/**
 * Shared name-only dialog for both creating a new list and renaming an
 * existing one, following the same create/rename-via-one-form pattern the
 * rest of the app uses for its other dialogs.
 */
export default function NewListDialog({
  open,
  onOpenChange,
  initialName = "",
  title,
  confirmLabel,
  onSubmit,
}: NewListDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...cyAttr("list-dialog")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("lists.namePlaceholder")}
          aria-label={t("lists.namePlaceholder")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSubmit();
            }
          }}
          {...cyAttr("list-dialog-name-input")}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("lists.cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!name.trim()}
            {...cyAttr("list-dialog-confirm")}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
