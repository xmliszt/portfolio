# Laundromat themes

Themes live in `lib/laundromat/themes/themes.ts`. The registry supplies the picker, runtime configuration and lab choices. Default (`classic`), Linen (`light`) and Halloween (`halloween`) are shipped themes. Stored IDs are retained for existing preferences. Halloween is scheduled for October 15 through October 31, UTC.

`ThemeDefinition` contains a thumbnail, color scheme, dialog shadows, token, lighting and object-detail overrides, additional scene objects and hamper-room overrides. `applySceneTheme` composes these with `sceneConfig` and `bedroomConfig`. Nested bedroom fields replace that whole field; spread the base field when changing just one property. Additional objects cannot replace existing object IDs, so a theme cannot replace a washer that is running.

The themed entry keeps its React identity when the theme changes. Its laundry, notebook, camera and room state remain mounted. `SceneThemeStyle` applies the resolved tokens to the root, daylight CSS, cursor and browser theme color.

## Visitor preference

The top-right theme button opens a Seasonal switch followed by the theme cards. The active theme is always selected in the cards. Seasonal uses the active supported schedule, or Default when none applies. Missing backend configuration, invalid responses and network failures also use Default.

Turning Seasonal off stores the currently active theme in `laundromat:theme`. Choosing any theme card also turns Seasonal off and stores that choice, including clicking the already selected card. Turning Seasonal on removes the stored choice; its internal preference kind remains `automatic`. It follows annual schedules, never the time of day or system light/dark mode.

Preferences synchronize across tabs. Unrecognized saved IDs use Seasonal. Storage failures leave the current choice usable for the session. Manual choices take precedence over all schedule and backend fallbacks.

## Annual schedules

Apply `supabase/migrations/20261025120000_laundromat_theme_schedules.sql` before configuring schedules. It creates `laundro_cafe.theme_schedules` with RLS and service-role access only. The application uses its existing Supabase server credentials. There is no public write endpoint.

The following migration, `20261025130000_laundromat_halloween_schedule.sql`, seeds Halloween as enabled. Apply it with the Halloween release. It preserves any existing row with the same ID. Manage dates through Supabase SQL or an authenticated administrative script:

```sql
update laundro_cafe.theme_schedules
set enabled = true, start_month = 10, start_day = 15,
    end_month = 11, end_day = 1, time_zone = 'UTC', priority = 10
where id = 'halloween';
```

The start date is inclusive; the end date is exclusive, at midnight in the row's IANA timezone. December–January periods work across years. February 29 and identical start/end dates are rejected. Higher priority wins overlaps; equal priorities use the lexically smaller row ID. Unknown theme IDs and invalid timezones are ignored.

`GET /laundromat/themes` returns enabled schedules, server time, the active supported theme and the next schedule boundary. It is excluded from service-worker caching. Visible tabs refresh every minute and at boundaries; returning to a tab refreshes immediately. The client uses server time to compensate for device-clock differences. Schedule edits need no artwork deployment or cron job.

## Authoring

The development lab has a Theme panel with manual theme selection, Seasonal and a simulated ISO date. Simulation reads the same schedules without changing them or the visitor preference. Use an explicit timezone suffix such as `2026-10-31T12:00:00Z`.

Panels initialize from the resolved theme, with separate DialKit IDs per theme. The Export panel resets their controls or copies theme JSON, including palette, lighting, added-object placements and bedroom settings. The Light panel exposes lamp glow, floor-pool and wall-falloff opacity independently, plus darkness scale for both rooms. `glow` and `glowHi` tokens control emitted light; `accent` is the readable UI accent. Housing, key, well and display tokens cover physical controls and the tip machine. Use the existing full config export for changes to base furniture, camera or sky settings. Switching themes remounts the lab workbench only; production switching does not.

To add a theme, register its definition, add names in all locale copy files and provide a static room thumbnail. Add new object kinds and their renderers when their artwork is introduced. Reusable decorations use the `SceneDecoration` union and `SceneDecorationDrawing`. Put laundromat instances in `objects` and hamper-room instances in `bedroom.decorations`. Draw wall decorations before furniture and floor decorations beside the furniture; check their depth order when moving them. Keep visual seasonal effects separate from measured weather readings. Configure and enable its schedule after the code is deployed.

Halloween adds a pumpkin family, pumpkins on the dryer and coffee machine, a cloth ghost, a jointed skeleton and a web spanning the laundromat’s wall corner. The hamper room has one lantern. The notice board announces Halloween in every language. The lab’s Objects panel controls pumpkin rind, stem, glow strength, flicker duration and each pumpkin’s facing angle, plus cobweb color, opacity and thread width, ghost cloth and sway duration, and skeleton bone colors. Placement moves shop decorations; Hamper room → Decorations moves and resizes bedroom decorations. Theme JSON includes these details and placements. Lantern flicker and ghost sway stop in Lite quality and with reduced motion. Seasonal decorations do not change measured weather.

Decorations can specify `paintAfter` to render after their supporting object, while the remaining room retains its depth order. The ghost paints after the window frame. The shipped placements keep the flying-car corridor clear; a regression test samples its entire path.

A Halloween YouTube station is a follow-up. Show it only for Halloween, while preserving any station already playing when the visitor changes themes.
