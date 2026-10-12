<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Package Android with the retained Capacitor project and a separate TanStack SPA build; the standard web build must keep its existing server entry and deployment behavior.
- Preserve the target TanStack Start bootstrap and dependency pins when importing source; the existing web app already uses compatible file-based routes.
- Keep the imported browser-local study storage and user-configured AI provider for presentation-only requests; this avoids changing existing data ownership or introducing an unrelated backend.
- Playlist domain types and status transitions live in a browser-safe library; manual overrides remain authoritative until explicitly reset to automatic tracking.
- Load the YouTube IFrame API after hydration and scope automatic progress to its playback events; external YouTube viewing cannot be observed.
- Store the complete MIT license at the repository root and serve an identical public copy for the About page.
- Save per-subject question counts with each general exam and fall back to the original distribution for legacy records; historical blank counts must not depend on later form changes.
