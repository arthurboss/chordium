import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect } from "vitest";
import SearchResultsSection from "../SearchResultsSection";

// The component is controlled (no state of its own), since a parent
// coordinating several sections needs to be able to close one the moment
// another opens. This wrapper supplies that state for the tests, the same way
// SearchResultsLayout does in the app.
function renderSection({
  defaultOpen = false,
  ...props
}: Partial<React.ComponentProps<typeof SearchResultsSection>> & { defaultOpen?: boolean } = {}) {
  function Wrapper() {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
      <SearchResultsSection title="Songs" count={3} open={open} onOpenChange={setOpen} {...props}>
        <p>the results</p>
      </SearchResultsSection>
    );
  }
  return render(<Wrapper />);
}

describe("SearchResultsSection", () => {
  // This project does not clear the DOM between tests, so renders stack up.
  afterEach(cleanup);

  it("starts closed, so three long lists arrive as three headings", () => {
    renderSection();

    const heading = screen.getByRole("button", { name: /Songs/ });
    expect(heading).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("the results")).not.toBeInTheDocument();
  });

  it("opens when the heading is pressed, and closes again", async () => {
    const user = userEvent.setup();
    renderSection();
    const heading = screen.getByRole("button", { name: /Songs/ });

    await user.click(heading);
    expect(heading).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("the results")).toBeInTheDocument();

    await user.click(heading);
    expect(heading).toHaveAttribute("aria-expanded", "false");
  });

  it("can be asked to start open, as one artist's own song list is", () => {
    renderSection({ defaultOpen: true });

    expect(screen.getByRole("button", { name: /Songs/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("the results")).toBeInTheDocument();
  });

  it("is reachable by keyboard alone", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.tab();
    const heading = screen.getByRole("button", { name: /Songs/ });
    expect(heading).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(heading).toHaveAttribute("aria-expanded", "true");
  });

  it("counts what it holds, as a number needing no translation", () => {
    renderSection({ count: 3 });
    expect(screen.getByRole("button", { name: /Songs.*3/ })).toBeInTheDocument();
  });

  it("caps an overflowing count instead of growing to fit it", () => {
    renderSection({ count: 12345 });
    expect(screen.getByRole("button", { name: /Songs.*999\+/ })).toBeInTheDocument();
  });


  it("keeps the action out of the toggle, so the sort control does not open the section", async () => {
    const user = userEvent.setup();
    renderSection({ action: <button type="button">Relevance</button> });

    await user.click(screen.getByRole("button", { name: "Relevance" }));

    expect(screen.getByRole("button", { name: /Songs/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("defers to the parent's toggle rather than flipping its own state", async () => {
    const user = userEvent.setup();
    const onOpenChange = () => {};
    render(
      <SearchResultsSection title="Songs" count={3} open={false} onOpenChange={onOpenChange}>
        <p>the results</p>
      </SearchResultsSection>
    );
    const heading = screen.getByRole("button", { name: /Songs/ });

    await user.click(heading);

    // A no-op handler means a controlling parent chose not to open it - the
    // section itself has no state left to fall back on.
    expect(heading).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("the results")).not.toBeInTheDocument();
  });
});
