import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { createElement, type ComponentProps } from "react";

// next-view-transitions re-exports next/link in a way Vitest's Node ESM
// resolver can't follow (works fine under Next's own Turbopack/webpack
// bundler, which is more lenient about extensionless imports) — see
// next-view-transitions/dist/index.js importing "next/link". Any component
// test that renders something using next-view-transitions' <Link> (directly,
// or transitively through e.g. Button.tsx) fails at import time without
// this. A plain <a> is all these tests need — they're testing component
// behavior, not Next's client-side routing.
vi.mock("next-view-transitions", () => ({
  Link: (props: ComponentProps<"a">) => createElement("a", props),
  ViewTransitions: ({ children }: { children: React.ReactNode }) => children,
  useTransitionRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
