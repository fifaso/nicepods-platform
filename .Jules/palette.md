## 2025-04-13 - Universal Tooltip Affordance for Icon-Only Actions
**Learning:** Icon-only buttons (like ThemeToggle) in the Command Center lack visual textual affordance despite having aria-labels. Enabling TooltipProvider at the RootLayout level allows for high-density UX hints that follow the "NicePod" industrial aesthetic without breaking visual minimalist constraints.
**Action:** Always wrap high-level providers in TooltipProvider and add TooltipContent to all top-level Navigation/Command icon buttons.
