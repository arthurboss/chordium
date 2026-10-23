import { useState } from "react";
import { useTranslation } from "react-i18next";
import { List, Pencil, Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { cyAttr } from "@/utils/test-utils";
import type { StoredList } from "@/storage/stores/lists";

const ROW_CLASS = "flex-1 truncate px-4 py-3 text-left text-sm hover:bg-accent";
/** Same round chip as ClearInputButton (the search field's clear button), minus its absolute positioning. */
const ICON_BUTTON_CLASS =
  "text-muted-foreground hover:text-foreground focus:outline-hidden bg-muted/60 hover:bg-muted px-0.5 py-0.5 rounded-full border shadow-xs focus:border-ring focus:ring-1 focus:ring-ring";

type Step = "list" | "create" | "rename";

interface ListsModalProps {
  lists: StoredList[];
  activeListId: string | null;
  onSelectList: (listId: string | null) => void;
  onCreateList: (name: string) => Promise<StoredList> | Promise<void>;
  onRenameList: (id: string, name: string) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
}

/**
 * Picking and managing custom lists follows the same responsive shell as
 * HeaderMenu and LanguageSwitcher: a bottom sheet on phones, a popover on
 * bigger screens, so this reads as the same menu system rather than a
 * one-off dialog. Creating and renaming are a second step inside that same
 * sheet/popover rather than a nested dialog on top of it. A row list
 * scrolls instead of wrapping like a chip row would, so it scales to any
 * number of lists.
 */
export default function ListsModal({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onRenameList,
  onDeleteList,
}: ListsModalProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("list");
  const [nameInput, setNameInput] = useState("");
  const [editingList, setEditingList] = useState<StoredList | null>(null);
  const [deletingList, setDeletingList] = useState<StoredList | null>(null);

  const activeList = lists.find((list) => list.id === activeListId) ?? null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setStep("list");
      setEditingList(null);
      setNameInput("");
    }
  };

  const startCreate = () => {
    setNameInput("");
    setStep("create");
  };

  const startRename = (list: StoredList) => {
    setEditingList(list);
    setNameInput(list.name);
    setStep("rename");
  };

  const cancelForm = () => {
    setStep("list");
    setEditingList(null);
    setNameInput("");
  };

  const submitForm = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (step === "create") await onCreateList(trimmed);
    else if (step === "rename" && editingList) await onRenameList(editingList.id, trimmed);
    cancelForm();
  };

  const handleConfirmDelete = async () => {
    if (!deletingList) return;
    if (activeListId === deletingList.id) onSelectList(null);
    await onDeleteList(deletingList.id);
    setDeletingList(null);
  };

  const selectList = (listId: string | null) => {
    onSelectList(listId);
    setOpen(false);
  };

  const trigger = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 w-26 md:w-30 justify-between gap-1 rounded-md bg-background px-2 text-xs font-normal"
      {...cyAttr("lists-modal-trigger")}
    >
      <List className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{activeList ? activeList.name : t("lists.manageLists")}</span>
    </Button>
  );

  const title =
    step === "create" ? t("lists.newListTitle")
    : step === "rename" ? t("lists.renameListTitle")
    : t("lists.manageLists");

  const listView = (
    <div className="flex flex-col divide-y">
      <button
        type="button"
        onClick={() => selectList(null)}
        className={cn(ROW_CLASS, "w-full", activeListId === null && "text-primary")}
        {...cyAttr("list-filter-all")}
      >
        {t("lists.all")}
      </button>

      {lists.map((list) => (
        <div key={list.id} className="flex items-center gap-1.5 pr-3">
          <button
            type="button"
            onClick={() => selectList(list.id)}
            className={cn(ROW_CLASS, activeListId === list.id && "text-primary")}
            {...cyAttr(`list-filter-${list.id}`)}
          >
            {list.name}
          </button>
          <button
            type="button"
            aria-label={t("lists.renameListAriaLabel", { name: list.name })}
            onClick={() => startRename(list)}
            className={ICON_BUTTON_CLASS}
            {...cyAttr(`list-rename-${list.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("lists.deleteListAriaLabel", { name: list.name })}
            onClick={() => setDeletingList(list)}
            className={cn(ICON_BUTTON_CLASS, "hover:text-destructive")}
            {...cyAttr(`list-delete-${list.id}`)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={startCreate}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent"
        {...cyAttr("list-new-trigger")}
      >
        <Plus className="h-4 w-4" />
        {t("lists.newList")}
      </button>
    </div>
  );

  const formView = (
    <div className="flex flex-col gap-3 p-4">
      <Input
        autoFocus
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        placeholder={t("lists.namePlaceholder")}
        aria-label={t("lists.namePlaceholder")}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void submitForm();
          }
        }}
        {...cyAttr("list-dialog-name-input")}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={cancelForm}>
          {t("lists.cancel")}
        </Button>
        <Button
          type="button"
          onClick={() => void submitForm()}
          disabled={!nameInput.trim()}
          {...cyAttr("list-dialog-confirm")}
        >
          {step === "create" ? t("lists.create") : t("lists.save")}
        </Button>
      </div>
    </div>
  );

  const content = step === "list" ? listView : formView;

  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent
            side="bottom"
            className="flex max-h-[92dvh] flex-col gap-0 rounded-t-xl px-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
          >
            <SheetHeader className="shrink-0 px-4 text-left">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription className="sr-only">{title}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 overflow-y-auto overscroll-contain">{content}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-max overflow-hidden p-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 data-[side=bottom]:slide-in-from-top-0 data-[side=left]:slide-in-from-right-0 data-[side=right]:slide-in-from-left-0 data-[side=top]:slide-in-from-bottom-0"
          >
            {content}
          </PopoverContent>
        </Popover>
      )}

      {/* Deleting a list only drops its membership rows - the chord sheets in it
          stay saved - so the confirmation body says exactly that rather than
          implying a destructive bulk delete. Sheet on mobile, dialog on desktop,
          matching the search-history clear confirmation. */}
      {isMobile ? (
        <Sheet
          open={deletingList !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingList(null);
          }}
        >
          <SheetContent
            side="bottom"
            className="gap-0 rounded-t-xl pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="text-left">
              <SheetTitle>{t("lists.deleteListTitle")}</SheetTitle>
              <SheetDescription>{t("lists.deleteListBody")}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" onClick={() => setDeletingList(null)}>
                {t("lists.cancel")}
              </Button>
              <Button variant="destructive" onClick={() => void handleConfirmDelete()}>
                {t("lists.deleteListConfirm")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog
          open={deletingList !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingList(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("lists.deleteListTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("lists.deleteListBody")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("lists.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleConfirmDelete()}
                className={cn(buttonVariants({ variant: "destructive" }))}
              >
                {t("lists.deleteListConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
