## 2025-04-13 - Universal Tooltip Affordance for Icon-Only Actions
**Learning:** Icon-only buttons (like ThemeToggle) in the Command Center lack visual textual affordance despite having accessibility labels. Enabling TooltipProvider at the RootLayout level allows for high-density userExperience hints that follow the "NicePod" industrial aesthetic without breaking visual minimalist constraints.
**Action:** Always wrap high-level providers in TooltipProvider and add TooltipContent to all top-level Navigation/Command icon buttons.

## 2025-04-14 - Industrial Tooltip Affordance for Global Command Interfaces
**Learning:** Critical operational triggers such as the Notification Inbox, User identification Gateway, and Playback Controls in the Mini-Player lack immediate visual affordance, relying solely on icon recognition. This increases cognitive load during high-frequency interactions.
**Action:** Implement tactical tooltips for NotificationBell, UserDropdown, and MiniPlayerBar using the industrial design tokens (uppercase, tracking-widest, backdrop-blur) to ensure universal accessibility and ergonomic precision.
