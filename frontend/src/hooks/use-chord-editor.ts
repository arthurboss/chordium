import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

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

  // Update edit content when initial content changes
  const updateEditContent = (content: string) => {
    setEditContent(content);
  };
  
  // Handle saving edits
  const handleSaveEdits = () => {
    if (onSave) {
      onSave(editContent);
    }
    setIsEditing(false);
    toast({
      title: "Changes saved",
      description: "Your chord sheet has been updated"
    });
  };

  return {
    isEditing,
    setIsEditing,
    editContent,
    setEditContent,
    updateEditContent,
    handleSaveEdits
  };
};
