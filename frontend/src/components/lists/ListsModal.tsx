import { Fragment, useState } from "react";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { DuplicateListNameError, type StoredList } from "@/storage/stores/lists";

const ROW_CLASS =
  "flex-1 truncate py-1.5 pl-2 pr-2 text-left text-sm outline-hidden hover:bg-accent focus:bg-accent focus:text-accent-foreground";
/** Same trailing segment the search field's voice/submit buttons use: full-height, divided by a border-l, not a floating chip. */
const ICON_BUTTON_CLASS =
  "flex w-8 shrink-0 items-center justify-center border-l text-muted-foreground outline-hidden hover:bg-accent hover:text-foreground focus:bg-accent";
/** Same fading line ChordSheetCard uses between title/artist and metadata, instead of a hard divide-y rule. */
const FADE_DIVIDER_CLASS = "h-px bg-linear-to-r from-transparent via-border/60 to-transparent";

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
 * Picking a list follows the same responsive shell as HeaderMenu and
 * LanguageSwitcher: a bottom sheet on phones, a popover on bigger screens.
 * On phones, creating and renaming are a second step inside that same
 * sheet; on bigger screens they open as a proper modal instead, since a
 * form swapped into a popover reads as cramped once there is room for a
 * real dialog. A row list scrolls instead of wrapping like a chip row
 * would, so it scales to any number of lists.
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
  const [formError, setFormError] = useState<string | null>(null);

  const activeList = lists.find((list) => list.id === activeListId) ?? null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setStep("list");
      setEditingList(null);
      setNameInput("");
      setFormError(null);
    }
  };

  const startCreate = () => {
    setNameInput("");
    setFormError(null);
    setStep("create");
    if (!isMobile) setOpen(false);
  };

  const startRename = (list: StoredList) => {
    setEditingList(list);
    setNameInput(list.name);
    setFormError(null);
    setStep("rename");
    if (!isMobile) setOpen(false);
  };

  const cancelForm = () => {
    setStep("list");
    setEditingList(null);
    setNameInput("");
    setFormError(null);
  };

  const submitForm = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    try {
      if (step === "create") await onCreateList(trimmed);
      else if (step === "rename" && editingList) await onRenameList(editingList.id, trimmed);
      cancelForm();
    } catch (err) {
      if (!(err instanceof DuplicateListNameError)) throw err;
      setFormError(t("lists.duplicateName"));
    }
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
      <span className="truncate">{activeList ? activeList.name : t("lists.manageLists")}</span>
      <List className="h-3.5 w-3.5 shrink-0" />
    </Button>
  );

  const title =
    step === "create" ? t("lists.newListTitle")
    : step === "rename" ? t("lists.renameListTitle")
    : t("lists.manageLists");

  const listView = (
    <div className={cn("flex flex-col overflow-hidden rounded-xs", isMobile ? "border-x" : "border")}>
      <button
        type="button"
        onClick={() => selectList(null)}
        className={cn(ROW_CLASS, "w-full", activeListId === null && "text-primary")}
        {...cyAttr("list-filter-all")}
      >
        {t("lists.all")}
      </button>

      {lists.map((list) => (
        <Fragment key={list.id}>
          <div className={FADE_DIVIDER_CLASS} />
          <div className="flex items-stretch">
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
        </Fragment>
      ))}

      <div className={FADE_DIVIDER_CLASS} />
      <button
        type="button"
        onClick={startCreate}
        className="flex w-full items-center justify-between py-1.5 pl-2 pr-2 text-left text-sm outline-hidden hover:bg-accent focus:bg-accent focus:text-accent-foreground"
        {...cyAttr("list-new-trigger")}
      >
        {t("lists.newList")}
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );

  const formView = (
    <div className="flex flex-col gap-3 p-4">
      <Input
        autoFocus
        value={nameInput}
        onChange={(e) => {
          setNameInput(e.target.value);
          setFormError(null);
        }}
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
      {formError && (
        <p className="text-xs text-destructive" {...cyAttr("list-dialog-error")}>
          {formError}
        </p>
      )}
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
            className="flex max-h-[92dvh] flex-col gap-0 px-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
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
          <PopoverContent align="start" sideOffset={0} className="w-max min-w-[8rem] overflow-hidden p-0">
            {listView}
          </PopoverContent>
        </Popover>
      )}

      {/* Create/rename is a step inside the same sheet on mobile, but a proper
          modal on bigger screens rather than a form swapped into a popover. */}
      {!isMobile && (
        <Dialog
          open={step !== "list"}
          onOpenChange={(open) => {
            if (!open) cancelForm();
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setFormError(null);
              }}
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
            {formError && (
              <p className="text-xs text-destructive" {...cyAttr("list-dialog-error")}>
                {formError}
              </p>
            )}
            <DialogFooter>
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            className="gap-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
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
