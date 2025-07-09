// Modular, UI-focused tab navigation hook for TabContainer
export function useTabNavigation(setActiveTab: (tab: string) => void, setSelectedSong: (song: any) => void) {
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedSong(null);
    if (value === "upload") navigate("/upload");
    else if (value === "search") navigate("/search");
    else if (value === "my-chord-sheets") navigate("/my-chord-sheets");
  };

  const handleKeyDown = (event: React.KeyboardEvent, value: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabChange(value);
    }
  };

  return { handleTabChange, handleKeyDown };
}
