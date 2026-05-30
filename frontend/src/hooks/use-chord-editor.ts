import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import i18n from "@/i18n/config";

/**
 * Custom hook to manage chord sheet editing
 * @param initialContent The initial chord sheet content
 * @param onSave Optional callback for saving edited content
 * @returns Editing state and handlers
 */
export const useChordEditor = (
  initialContent: string,
  onSave?: (content: string) => void
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<string>(initialContent);

  const updateEditContent = (content: string) => {
    setEditContent(content);
  };

  const handleSaveEdits = () => {
    if (onSave) {
      onSave(editContent);
    }
    setIsEditing(false);
    toast({
      title: i18n.t("notifications:changesSaved"),
      description: i18n.t("notifications:changesSavedDesc"),
    });
  };

  return {
    isEditing,
    setIsEditing,
    editContent,
    setEditContent,
    updateEditContent,
    handleSaveEdits,
  };
};
