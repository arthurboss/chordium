import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import NewListDialog from "./NewListDialog";
import { cyAttr } from "@/utils/test-utils";
import type { StoredList } from "@/storage/stores/lists";

interface ListFilterRowProps {
  lists: StoredList[];
  activeListId: string | null;
  onSelectList: (listId: string | null) => void;
  onCreateList: (name: string) => Promise<StoredList> | Promise<void>;
  onRenameList: (id: string, name: string) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
}

/**
 * "All" + one chip per custom list. Clicking a chip filters the grid;
 * the small pencil/x affordances on each list chip rename or delete it.
 */
export default function ListFilterRow({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onRenameList,
  onDeleteList,
}: ListFilterRowProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingList, setEditingList] = useState<StoredList | null>(null);
  const [deletingList, setDeletingList] = useState<StoredList | null>(null);

  const handleConfirmDelete = async () => {
    if (!deletingList) return;
    if (activeListId === deletingList.id) onSelectList(null);
    await onDeleteList(deletingList.id);
    setDeletingList(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4" {...cyAttr("list-filter-row")}>
      <Button
        type="button"
        variant={activeListId === null ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => onSelectList(null)}
        {...cyAttr("list-filter-all")}
      >
        {t("lists.all")}
      </Button>

      {lists.map((list) => (
        <div
          key={list.id}
          className="flex items-center gap-1 rounded-full border border-border pl-1 pr-1"
        >
          <Button
            type="button"
            variant={activeListId === list.id ? "default" : "ghost"}
            size="sm"
            className="rounded-full h-8 px-3"
            onClick={() => onSelectList(list.id)}
            {...cyAttr(`list-filter-${list.id}`)}
          >
            {list.name}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            aria-label={t("lists.renameListAriaLabel", { name: list.name })}
            onClick={() => setEditingList(list)}
            {...cyAttr(`list-rename-${list.id}`)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            aria-label={t("lists.deleteListAriaLabel", { name: list.name })}
            onClick={() => setDeletingList(list)}
            {...cyAttr(`list-delete-${list.id}`)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => setIsCreateOpen(true)}
        aria-label={t("lists.newList")}
        {...cyAttr("list-new-trigger")}
      >
        <Plus className="h-3.5 w-3.5" />
        {t("lists.newList")}
      </Button>

      <NewListDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title={t("lists.newListTitle")}
        confirmLabel={t("lists.create")}
        onSubmit={async (name) => {
          await onCreateList(name);
        }}
      />

      <NewListDialog
        open={editingList !== null}
        onOpenChange={(open) => {
          if (!open) setEditingList(null);
        }}
        initialName={editingList?.name ?? ""}
        title={t("lists.renameListTitle")}
        confirmLabel={t("lists.save")}
        onSubmit={async (name) => {
          if (editingList) await onRenameList(editingList.id, name);
        }}
      />

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
            <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col sm:space-x-0">
              <Button variant="outline" onClick={() => setDeletingList(null)}>
                {t("lists.cancel")}
              </Button>
              <Button variant="destructive" onClick={() => void handleConfirmDelete()}>
                {t("lists.deleteListConfirm")}
              </Button>
            </SheetFooter>
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
    </div>
  );
}
