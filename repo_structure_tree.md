.
├── actions
│   ├── collection-actions.ts
│   ├── draft-actions.ts
│   ├── geo-actions.ts
│   ├── profile-actions.ts
│   ├── search-actions.ts
│   ├── social-actions.ts
│   └── vault-actions.ts
├── app
│   ├── (auth)
│   │   ├── auth
│   │   │   └── callback
│   │   ├── forgot-password
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── login
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── signup
│   │       └── page.tsx
│   ├── (marketing)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (platform)
│   │   ├── (admin)
│   │   │   └── admin
│   │   ├── collection
│   │   │   └── [id]
│   │   ├── compass
│   │   │   └── page.tsx
│   │   ├── create
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── map
│   │   │   └── poi
│   │   ├── notifications
│   │   │   ├── notification-history-client.tsx
│   │   │   └── page.tsx
│   │   ├── offline
│   │   │   └── page.tsx
│   │   ├── podcast
│   │   │   └── [id]
│   │   ├── podcasts
│   │   │   ├── library-tabs.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── pricing
│   │   │   └── page.tsx
│   │   ├── profile
│   │   │   ├── [username]
│   │   │   └── page.tsx
│   │   └── theme-test
│   │       └── page.tsx
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── global-error.tsx
│   ├── globals.css
│   ├── icon.png
│   ├── icon.svg
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── map
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── sitemap.ts
├── components
│   ├── admin
│   │   ├── admin-nav.tsx
│   │   ├── debug-theme.tsx
│   │   ├── failed-jobs-dialog.tsx
│   │   ├── manual-ingestion-modal.tsx
│   │   ├── recent-podcasts-list.tsx
│   │   ├── resonance-simulator.tsx
│   │   ├── theme-test-panel.tsx
│   │   ├── users-table.tsx
│   │   ├── vault-dashboard-client.tsx
│   │   └── vault-manager.tsx
│   ├── auth
│   │   └── auth-guard.tsx
│   ├── create-flow
│   │   ├── hooks
│   │   │   ├── use-flow-actions.tsx
│   │   │   └── use-flow-navigation.ts
│   │   ├── index.tsx
│   │   ├── layout-shell.tsx
│   │   ├── shared
│   │   │   ├── config.ts
│   │   │   ├── context.tsx
│   │   │   ├── types.ts
│   │   │   └── vocal-director-map.ts
│   │   ├── step-renderer.tsx
│   │   └── steps
│   │       ├── audio-studio.tsx
│   │       ├── details-step.tsx
│   │       ├── discovery-result-step.tsx
│   │       ├── dna-interview-step.tsx
│   │       ├── draft-generation-loader.tsx
│   │       ├── final-step.tsx
│   │       ├── inspire-sub-step.tsx
│   │       ├── learn-sub-step.tsx
│   │       ├── legacy-step.tsx
│   │       ├── link-points.tsx
│   │       ├── local-discovery-step.tsx
│   │       ├── narrative-selection-step.tsx
│   │       ├── pulse-radar-step.tsx
│   │       ├── purpose-selection-step.tsx
│   │       ├── question-step.tsx
│   │       ├── script-editor-step.tsx
│   │       ├── solo-talk-step.tsx
│   │       ├── style-selection.tsx
│   │       └── tone-selection-step.tsx
│   ├── feed
│   │   ├── compass-controls.tsx
│   │   ├── compass-desktop-view.tsx
│   │   ├── compass-filter-bar.tsx
│   │   ├── compass-mobile-view.tsx
│   │   ├── insight-panel.tsx
│   │   ├── intelligence-feed.tsx
│   │   ├── library-view-switcher.tsx
│   │   ├── podcast-shelf.tsx
│   │   ├── pulse-pill-card.tsx
│   │   ├── pulse-pill-view.tsx
│   │   ├── resonance-compass.tsx
│   │   └── universe-card.tsx
│   ├── geo
│   │   ├── SpatialEngine.tsx
│   │   ├── forge-context.tsx
│   │   ├── geo-creator-overlay.tsx
│   │   ├── geo-recorder.tsx
│   │   ├── map-marker-custom.tsx
│   │   ├── map-preview-frame.tsx
│   │   ├── mapbox-env.d.ts
│   │   ├── poi-detail-view.tsx
│   │   ├── poi-preview-card.tsx
│   │   ├── radar-hud.tsx
│   │   ├── scanner-ui.tsx
│   │   └── steps
│   │       ├── step-1-anchoring.tsx
│   │       ├── step-2-sensory-capture.tsx
│   │       ├── step-3-dossier-review.tsx
│   │       └── step-4-narrative-forge.tsx
│   ├── leave-testimonial-dialog.tsx
│   ├── navigation
│   │   ├── desktop-nav.tsx
│   │   ├── mobile-nav.tsx
│   │   └── shared
│   │       ├── create-button.tsx
│   │       ├── nav-brand.tsx
│   │       ├── nav-config.ts
│   │       ├── nav-styles.ts
│   │       └── user-dropdown.tsx
│   ├── navigation.tsx
│   ├── player
│   │   ├── downloads-manager.tsx
│   │   ├── full-screen-player.tsx
│   │   ├── mini-player-bar.tsx
│   │   └── player-orchestrator.tsx
│   ├── podcast
│   │   ├── audio-console.tsx
│   │   ├── compact-podcast-card.tsx
│   │   ├── content-vault.tsx
│   │   ├── creation-metadata.tsx
│   │   ├── curator-aside.tsx
│   │   ├── dynamic-script-viewer.tsx
│   │   ├── integrity-shield.tsx
│   │   ├── media-stage.tsx
│   │   ├── podcast-card.tsx
│   │   ├── script-viewer.tsx
│   │   ├── smart-job-card.tsx
│   │   ├── source-evidence-board.tsx
│   │   ├── sovereign-publish-tool.tsx
│   │   ├── stacked-podcast-card.tsx
│   │   └── tag-curation-canvas.tsx
│   ├── podcast-view.tsx
│   ├── profile
│   │   ├── cognitive-dna-map.tsx
│   │   ├── private
│   │   │   ├── identity-settings-form.tsx
│   │   │   ├── subscription-status-card.tsx
│   │   │   └── testimonial-moderator.tsx
│   │   ├── private-profile-dashboard.tsx
│   │   ├── profile-action-hub.tsx
│   │   ├── profile-audio-console.tsx
│   │   ├── profile-content-vault.tsx
│   │   ├── profile-curator-fiche.tsx
│   │   ├── profile-hydration-guard.tsx
│   │   ├── profile-media-stage.tsx
│   │   ├── profile-podcast-orchestrator.tsx
│   │   ├── public
│   │   │   ├── public-content-tabs.tsx
│   │   │   └── public-hero-section.tsx
│   │   ├── public-profile-page.tsx
│   │   └── shared
│   │       └── collection-card.tsx
│   ├── profile-view.tsx
│   ├── providers
│   │   └── posthog-provider.tsx
│   ├── remix-dialog.tsx
│   ├── social
│   │   ├── add-to-collection-dialog.tsx
│   │   ├── collection-card.tsx
│   │   ├── collection-journey-view.tsx
│   │   ├── create-collection-modal.tsx
│   │   ├── profile-header.tsx
│   │   └── reputation-explainer.tsx
│   ├── system
│   │   ├── analytics-provider.tsx
│   │   ├── error-boundary.tsx
│   │   ├── install-pwa-button.tsx
│   │   ├── notification-bell.tsx
│   │   ├── offline-indicator.tsx
│   │   ├── page-transition.tsx
│   │   ├── platform-info-dialog.tsx
│   │   ├── pwa-lifecycle.tsx
│   │   ├── scroll-to-top.tsx
│   │   ├── smooth-scroll-wrapper.tsx
│   │   └── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── ui
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
│   └── visuals
│       └── background-engine.tsx
├── components.json
├── contexts
│   └── audio-context.tsx
├── hooks
│   ├── use-auth.tsx
│   ├── use-debounce.ts
│   ├── use-geo-engine.tsx
│   ├── use-mobile-viewport.ts
│   ├── use-offline-audio.ts
│   ├── use-persistent-form.ts
│   ├── use-podcast-sync.ts
│   ├── use-pulse-engine.ts
│   ├── use-search-radar.ts
│   └── use-toast.ts
├── instrumentation-client.ts
├── instrumentation.ts
├── lib
│   ├── admin
│   │   └── actions.ts
│   ├── agent-config.ts
│   ├── arcjet.ts
│   ├── podcast-utils.ts
│   ├── supabase
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils.ts
│   └── validation
│       ├── podcast-schema.ts
│       ├── poi-schema.ts
│       └── social-schema.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── posthog.ts
├── public
│   ├── fallback-ce627215c0e4a9af.js
│   ├── fallback-ce627215c0e4a9af.js.map
│   ├── images
│   │   └── universes
│   │       ├── deep-thought.png
│   │       ├── narrative.png
│   │       ├── practical-tools.png
│   │       ├── resonant.png
│   │       ├── tech.png
│   │       └── wellness.png
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
├── repo_structure_tree.md
├── schema.sql
├── schema_core.sql
├── scripts
│   └── create-profiles-table.sql
├── sentry.edge.config.ts
├── sentry.server.config.ts
├── supabase
│   ├── config.toml
│   ├── functions
│   │   ├── _shared
│   │   │   ├── ai.ts
│   │   │   ├── cors.ts
│   │   │   ├── google-auth.ts
│   │   │   ├── guard.ts
│   │   │   ├── location.ts
│   │   │   ├── pulse-utils.ts
│   │   │   ├── sentry.ts
│   │   │   ├── vault-utils.ts
│   │   │   └── vocal-director-map.ts
│   │   ├── admin-backfill-embeddings
│   │   │   └── index.ts
│   │   ├── admin-backfill-images
│   │   │   └── index.ts
│   │   ├── admin-segment-existing-podcasts
│   │   │   └── index.ts
│   │   ├── assemble-final-audio
│   │   │   └── index.ts
│   │   ├── deno.json
│   │   ├── generate-audio-from-script
│   │   │   └── index.ts
│   │   ├── generate-briefing-pill
│   │   │   └── index.ts
│   │   ├── generate-cover-image
│   │   │   └── index.ts
│   │   ├── generate-embedding
│   │   │   └── index.ts
│   │   ├── generate-narratives
│   │   │   └── index.ts
│   │   ├── generate-script-draft
│   │   │   └── index.ts
│   │   ├── geo-narrative-creator
│   │   │   └── index.ts
│   │   ├── geo-resolve-location
│   │   │   └── index.ts
│   │   ├── geo-sensor-ingestor
│   │   │   └── index.ts
│   │   ├── geo-shared
│   │   │   ├── open-meteo.ts
│   │   │   └── types.ts
│   │   ├── geo-transcribe-intent
│   │   │   └── index.ts
│   │   ├── get-local-discovery
│   │   │   └── index.ts
│   │   ├── pulse-harvester
│   │   │   └── index.ts
│   │   ├── pulse-janitor
│   │   │   └── index.ts
│   │   ├── pulse-matcher
│   │   │   └── index.ts
│   │   ├── queue-podcast-job
│   │   │   └── index.ts
│   │   ├── research-intelligence
│   │   │   └── index.ts
│   │   ├── search-pro
│   │   │   └── index.ts
│   │   ├── start-draft-process
│   │   │   └── index.ts
│   │   ├── transcribe-idea
│   │   │   └── index.ts
│   │   ├── update-resonance-profile
│   │   │   └── index.ts
│   │   ├── update-user-dna
│   │   │   └── index.ts
│   │   └── vault-refinery
│   │       └── index.ts
│   ├── migrations
│   │   ├── 20251221000000_initial_schema.sql
│   │   ├── 20260227_poi_deep_immersion.sql
│   │   ├── 20260301_poi_multimodal.sql
│   │   └── 20260305_poi_sovereign_schema.sql
│   └── service-account.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.tsbuildinfo
└── types
    ├── database.types.ts
    ├── geo-sovereignty.ts
    ├── podcast.ts
    ├── profile.ts
    ├── pulse.ts
    └── supabase.ts

95 directories, 337 files
