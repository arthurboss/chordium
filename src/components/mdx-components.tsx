import React from 'react';
import { ChordSheet } from './ChordDisplay/ChordSheet';

// This object defines the components that will be available in MDX files
export const components = {
  // Override default HTML elements with custom styling
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-semibold mt-6 mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-medium mt-4 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-2" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 space-y-2 list-disc pl-5" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-2" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="px-1 py-0.5 bg-muted rounded text-sm font-mono" {...props} />
  ),
  
  // Map 'pre' to our ChordSheet component for chord notation
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <ChordSheet {...props}>{children}</ChordSheet>
  ),
  
  // Export custom components for use in MDX
  ChordSheet
};