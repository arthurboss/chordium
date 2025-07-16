/**
 * Test utility functions for managing test-only features in the application
 * 
 * This module provides a centralized way to add test attributes to components
 * while ensuring they are stripped out in production builds.
 */

export { isTestMode } from './is-test-mode';
export { testAttr } from './test-attr';
export { cyAttr } from './cy-attr';
export { e2eAttr } from './e2e-attr';
export { qaAttr } from './qa-attr';
