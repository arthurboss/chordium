import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSearchTabLogic } from "../useSearchTabLogic";

// Mock dependencies
vi.mock("@/hooks/navigation", () => ({
  useNavigation: () => ({
    navigateToArtist: vi.fn(),
    isOnArtistPage: () => false,
    getCurrentArtistPath: () => "",
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/search", search: "" }),
}));

// Mock the effect hooks
vi.mock("../useInitSearchStateEffect", () => ({
  useInitSearchStateEffect: vi.fn(),
}));

vi.mock("../useInitArtistPageEffect", () => ({
  useInitArtistPageEffect: vi.fn(),
}));

describe("useSearchTabLogic", () => {
  const defaultProps = {
    setMySongs: vi.fn(),
    setActiveTab: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    // Simple test to ensure the hook doesn't crash
    expect(() => {
      renderHook(() => useSearchTabLogic(defaultProps));
    }).not.toThrow();
  });
});
