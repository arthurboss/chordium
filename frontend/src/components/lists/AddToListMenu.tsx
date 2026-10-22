import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ListPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cyAttr } from "@/utils/test-utils";
import type { StoredList } from "@/storage/stores/lists";

interface AddToListMenuProps {
  /** Chord sheet path, used only to keep test ids stable per card */
  id: string;
  title: string;
  lists: StoredList[];
  selectedListIds: string[];
  onToggleList: (listId: string) => void;
  onCreateList: (name: string) => Promise<StoredList | void> | void;
}

/**
 * Per-card picker for custom lists: a checkbox per existing list, toggling
 * membership, plus an inline "+ new list" option so a card can be filed
 * into a brand new list without leaving the picker.
 */
export default function AddToListMenu({
  id,
  title,
  lists,
  selectedListIds,
  onToggleList,
  onCreateList,
}: AddToListMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleCreate = async () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;
    const created = await onCreateList(trimmed);
    setNewListName("");
    if (created && "id" in created) onToggleList(created.id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          aria-label={t("lists.addToListAriaLabel", { title })}
          onClick={(e) => e.stopPropagation()}
          {...cyAttr(`add-to-list-btn-${id}`)}
        >
          <ListPlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-56 p-2"
        onClick={(e) => e.stopPropagation()}
        {...cyAttr("add-to-list-popover")}
      >
        <p className="text-xs font-semibold text-muted-foreground px-1 pb-1">
          {t("lists.addToList")}
        </p>
        {lists.length === 0 && (
          <p className="text-xs text-muted-foreground px-1 py-1">{t("lists.noLists")}</p>
        )}
        <ul className="max-h-48 overflow-y-auto">
          {lists.map((list) => {
            const checked = selectedListIds.includes(list.id);
            return (
              <li key={list.id}>
                <label className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-accent cursor-pointer text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggleList(list.id)}
                    {...cyAttr(`add-to-list-checkbox-${list.id}`)}
                  />
                  <span className="truncate">{list.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-1 pt-2 border-t border-border mt-1">
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder={t("lists.createListInline")}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreate();
              }
            }}
            {...cyAttr("add-to-list-new-name")}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={!newListName.trim()}
            onClick={() => void handleCreate()}
            aria-label={t("lists.createListInline")}
            {...cyAttr("add-to-list-new-confirm")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
