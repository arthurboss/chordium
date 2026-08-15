import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect } from "vitest";
import SearchResultsSection from "../SearchResultsSection";

function renderSection(props: Partial<React.ComponentProps<typeof SearchResultsSection>> = {}) {
  return render(
    <SearchResultsSection title="Songs" count={3} {...props}>
      <p>the results</p>
    </SearchResultsSection>
  );
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

  it("counts what it holds", () => {
    renderSection({ count: 3 });
    expect(screen.getByRole("button", { name: /3 results/ })).toBeInTheDocument();
  });

  it("says one when there is one, rather than one results", () => {
    renderSection({ count: 1 });
    expect(screen.getByRole("button", { name: /1 result\b/ })).toBeInTheDocument();
  });

  it("reports how many were found when it is showing only some", () => {
    renderSection({ count: 25, total: 89 });
    expect(screen.getByRole("button", { name: /25 of 89/ })).toBeInTheDocument();
  });

  it("keeps the action out of the toggle, so the sort control does not open the section", async () => {
    const user = userEvent.setup();
    renderSection({ action: <button type="button">Relevance</button> });

    await user.click(screen.getByRole("button", { name: "Relevance" }));

    expect(screen.getByRole("button", { name: /Songs/ })).toHaveAttribute("aria-expanded", "false");
  });
});
