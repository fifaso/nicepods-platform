./
├── .devcontainer/
│   ├── devcontainer.json
│   └── setup.sh*
├── actions/
│   ├── collection-actions.ts
│   ├── draft-actions.ts
│   ├── geo-actions.ts
│   ├── profile-actions.ts
│   ├── search-actions.ts
│   ├── social-actions.ts
│   └── vault-actions.ts
├── app/
│   ├── (auth)/
│   │   ├── auth/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (platform)/
│   │   ├── (admin)/
│   │   ├── (geo-mode)/
│   │   ├── collection/
│   │   ├── compass/
│   │   ├── create/
│   │   ├── dashboard/
│   │   ├── map/
│   │   ├── notifications/
│   │   ├── offline/
│   │   ├── podcast/
│   │   ├── podcasts/
│   │   ├── pricing/
│   │   ├── profile/
│   │   ├── theme-test/
│   │   └── layout.tsx
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── global-error.tsx
│   ├── globals.css
│   ├── icon.png
│   ├── icon.svg
│   ├── layout.tsx
│   ├── loading.tsx
│   └── sitemap.ts
├── components/
│   ├── _legacy/
│   │   ├── archetype-input.tsx
│   │   └── archetype-step.tsx
│   ├── admin/
│   │   ├── admin-nav.tsx
│   │   ├── failed-jobs-dialog.tsx
│   │   ├── manual-ingestion-modal.tsx
│   │   ├── recent-podcasts-list.tsx
│   │   ├── resonance-simulator.tsx
│   │   ├── users-table.tsx
│   │   ├── vault-dashboard-client.tsx
│   │   └── vault-manager.tsx
│   ├── create-flow/
│   │   ├── hooks/
│   │   ├── shared/
│   │   ├── steps/
│   │   ├── index.tsx
│   │   ├── layout-shell.tsx
│   │   └── step-renderer.tsx
│   ├── geo/
│   │   ├── steps/
│   │   ├── forge-context.tsx
│   │   ├── geo-recorder.tsx
│   │   ├── immersive-map.tsx
│   │   ├── live-location-map.tsx
│   │   ├── map-inner.tsx
│   │   ├── map-marker-custom.tsx
│   │   ├── map-preview-frame.tsx
│   │   ├── mapbox-env.d.ts
│   │   ├── poi-detail-view.tsx
│   │   ├── poi-preview-card.tsx
│   │   ├── radar-hud.tsx
│   │   ├── scanner-ui.tsx
│   │   └── use-geo-engine.ts
│   ├── navigation/
│   │   ├── shared/
│   │   ├── desktop-nav.tsx
│   │   └── mobile-nav.tsx
│   ├── podcast/
│   │   ├── audio-console.tsx
│   │   ├── content-vault.tsx
│   │   ├── curator-aside.tsx
│   │   ├── integrity-shield.tsx
│   │   ├── media-stage.tsx
│   │   ├── source-evidence-board.tsx
│   │   └── sovereign-publish-tool.tsx
│   ├── profile/
│   │   ├── private/
│   │   ├── public/
│   │   ├── shared/
│   │   ├── cognitive-dna-map.tsx
│   │   ├── private-profile-dashboard.tsx
│   │   ├── profile-action-hub.tsx
│   │   ├── profile-audio-console.tsx
│   │   ├── profile-content-vault.tsx
│   │   ├── profile-curator-fiche.tsx
│   │   ├── profile-hydration-guard.tsx
│   │   ├── profile-media-stage.tsx
│   │   ├── profile-podcast-orchestrator.tsx
│   │   └── public-profile-page.tsx
│   ├── providers/
│   │   └── posthog-provider.tsx
│   ├── social/
│   │   ├── add-to-collection-dialog.tsx
│   │   ├── collection-card.tsx
│   │   ├── collection-journey-view.tsx
│   │   ├── create-collection-modal.tsx
│   │   ├── profile-header.tsx
│   │   └── reputation-explainer.tsx
│   ├── ui/
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── aurora-card.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── floating-action-button.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── poi-action-card.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── pulse-source-card.tsx
│   │   ├── quadrant-card.tsx
│   │   ├── radio-group.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── selection-card.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   ├── unified-search-bar.tsx
│   │   ├── use-toast.ts
│   │   └── voice-input.tsx
│   ├── visuals/
│   │   └── background-engine.tsx
│   ├── analytics-provider.tsx
│   ├── auth-guard.tsx
│   ├── compact-podcast-card.tsx
│   ├── compass-controls.tsx
│   ├── compass-desktop-view.tsx
│   ├── compass-filter-bar.tsx
│   ├── compass-mobile-view.tsx
│   ├── creation-metadata.tsx
│   ├── debug-theme.tsx
│   ├── downloads-manager.tsx
│   ├── dynamic-script-viewer.tsx
│   ├── error-boundary.tsx
│   ├── full-screen-player.tsx
│   ├── insight-panel.tsx
│   ├── install-pwa-button.tsx
│   ├── intelligence-feed.tsx
│   ├── leave-testimonial-dialog.tsx
│   ├── library-view-switcher.tsx
│   ├── mini-player-bar.tsx
│   ├── navigation.tsx
│   ├── notification-bell.tsx
│   ├── offline-indicator.tsx
│   ├── page-transition.tsx
│   ├── platform-info-dialog.tsx
│   ├── player-orchestrator.tsx
│   ├── podcast-card.tsx
│   ├── podcast-shelf.tsx
│   ├── podcast-view.tsx
│   ├── profile-view.tsx
│   ├── pulse-pill-card.tsx
│   ├── pulse-pill-view.tsx
│   ├── pwa-lifecycle.tsx
│   ├── remix-dialog.tsx
│   ├── resonance-compass.tsx
│   ├── script-viewer.tsx
│   ├── scroll-to-top.tsx
│   ├── smart-job-card.tsx
│   ├── smooth-scroll-wrapper.tsx
│   ├── stacked-podcast-card.tsx
│   ├── tag-curation-canvas.tsx
│   ├── theme-provider.tsx
│   ├── theme-test-panel.tsx
│   ├── theme-toggle.tsx
│   └── universe-card.tsx
├── contexts/
│   └── audio-context.tsx
├── hooks/
│   ├── use-auth.tsx
│   ├── use-debounce.ts
│   ├── use-geo-engine.ts
│   ├── use-mobile-viewport.ts
│   ├── use-offline-audio.ts
│   ├── use-persistent-form.ts
│   ├── use-podcast-sync.ts
│   ├── use-pulse-engine.ts
│   ├── use-search-radar.ts
│   └── use-toast.ts
├── lib/
│   ├── admin/
│   │   └── actions.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── validation/
│   │   ├── podcast-schema.ts
│   │   └── social-schema.ts
│   ├── agent-config.ts
│   ├── arcjet.ts
│   ├── podcast-utils.ts
│   └── utils.ts
├── public/
│   ├── images/
│   │   └── universes/
│   ├── fallback-ce627215c0e4a9af.js
│   ├── fallback-ce627215c0e4a9af.js.map
│   ├── manifest.json
│   ├── nicepod-logo.png
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   ├── placeholder.svg
│   ├── sw.js
│   ├── sw.js.map
│   ├── web-app-manifest-512x512.png
│   ├── workbox-f1770938.js
│   └── workbox-f1770938.js.map
├── scripts/
│   └── create-profiles-table.sql
├── supabase/
│   ├── .temp/
│   │   ├── cli-latest
│   │   ├── gotrue-version
│   │   ├── pooler-url
│   │   ├── postgres-version
│   │   ├── project-ref
│   │   ├── rest-version
│   │   └── storage-version
│   ├── functions/
│   │   ├── _shared/
│   │   ├── admin-backfill-embeddings/
│   │   ├── admin-backfill-images/
│   │   ├── admin-segment-existing-podcasts/
│   │   ├── assemble-final-audio/
│   │   ├── cognitive-core-orchestrator/
│   │   ├── generate-audio-from-script/
│   │   ├── generate-briefing-pill/
│   │   ├── generate-cover-image/
│   │   ├── generate-embedding/
│   │   ├── generate-narratives/
│   │   ├── generate-script-draft/
│   │   ├── geo-analyze-multimodal/
│   │   ├── geo-generate-content/
│   │   ├── geo-ingest-context/
│   │   ├── geo-publish-content/
│   │   ├── geo-resolve-location/
│   │   ├── geo-semantic-router/
│   │   ├── geo-shared/
│   │   ├── get-local-discovery/
│   │   ├── process-podcast-job/
│   │   ├── pulse-harvester/
│   │   ├── pulse-janitor/
│   │   ├── pulse-matcher/
│   │   ├── queue-podcast-job/
│   │   ├── research-intelligence/
│   │   ├── search-pro/
│   │   ├── start-draft-process/
│   │   ├── transcribe-idea/
│   │   ├── update-resonance-profile/
│   │   ├── update-user-dna/
│   │   ├── vault-refinery/
│   │   └── deno.json
│   ├── migrations/
│   │   ├── 20251221000000_initial_schema.sql
│   │   ├── 20260227_poi_deep_immersion.sql
│   │   └── 20260301_poi_multimodal.sql
│   ├── .env.local
│   ├── .gitignore
│   ├── config.toml
│   └── service-account.json
├── types/
│   ├── database.types.ts
│   ├── podcast.ts
│   ├── profile.ts
│   ├── pulse.ts
│   └── supabase.ts
├── .env.local
├── .env.sentry-build-plugin
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .gitpod.yml
├── .npmrc
├── components.json
├── instrumentation-client.ts
├── instrumentation.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── nicepod_diagnostic.sql
├── package.json
├── postcss.config.mjs
├── posthog.ts
├── repo_structure_tree.md
├── schema.sql
├── schema_core.sql
├── sentry.edge.config.ts
├── sentry.server.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo

92 directories, 255 files
