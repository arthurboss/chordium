import React from "react";

/**
 * A component with test attributes that should be stripped in production
 */
const TestComponent: React.FC = () => {
  return (
    <div data-testid="test-component-root">
      <h1 data-testid="test-component-title">Test Component</h1>
      <button data-testid="test-component-button">Click Me</button>
      <input data-test="test-input" placeholder="Type here" />
      <div data-cy="cypress-element" className="test-class">
        Cypress Test Element
      </div>
      <span data-qa="qa-element">QA Element</span>
      <a data-e2e="e2e-link" href="#">E2E Test Link</a>
    </div>
  );
};

export { TestComponent };
export default TestComponent;
