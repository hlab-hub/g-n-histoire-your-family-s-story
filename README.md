# GénéHistoire: Your Family's Story

Create a modern, full-screen interactive genealogy web application named "GénéHistoire" focused on geographical storytelling and historical context.

DESIGN & THEME:

- Aesthetic: "Vintage Modern / Editorial Academic".

- Palette: Warm off-white parchment background (#FDFBF7), deep slate (#1E293B), rich burgundy, and muted gold/bronze accents.

- Typography: Elegant serif headers (like Playfair or Merriweather) paired with clean sans-serif UI elements (Inter or System UI). Using shadcn/ui components.

LAYOUT STRUCTURE:

1. HEADER:

   - App title ("GénéHistoire - Carte & Histoire Familiale")

   - A drag-and-drop zone / button to upload a .ged (GEDCOM) file.

   - A "Charger un exemple (3 générations)" button to immediately fill the UI with mock data for instant demo.

2. MAIN DISPLAY (MAP & OVERLAY PANELS):

   - Full-screen interactive map (using Leaflet / react-leaflet or Mapbox).

   - Left Sidebar / Floating Card:

     * Focus Individual Selector (dropdown or search).

     * View toggle: "3 Générations autour de [Nom]".

     * Details card of the selected ancestor: Full Name, Birth Date/Place, Death Date/Place, Occupation.

     * Legend of couples color-coding (e.g., Couple A = Blue nuances, Couple B = Amber nuances).

3. MAP INTERACTIVE ELEMENTS:

   - Display color-coded map markers on the birthplaces of ancestors in the active 3 generations.

   - Draw curved trajectory lines (arcs) connecting an individual's birth location to their marriage/residence location, and finally to their death location.

   - Clicking a marker opens a pop-up card with ancestor info and historical context.

4. BOTTOM HORIZONTAL HISTORICAL TIMELINE:

   - A collapsible bottom panel displaying a horizontal timeline synchronized with the time period of the 3 generations currently visible (e.g., 1830 - 1920).

   - Display major regional and national historical events along the timeline (e.g., Revolution of 1848, War of 1870, World War I, Rural Exodus, Industrial Expansion) that coincide with where and when the ancestors lived.

   - Hovering an ancestor highlights their lifespan against these historical events.

TECHNICAL REQUIREMENT:

Include a rich built-in JSON dataset representing a 3-generation French family tree (spanning ~1840 to 1940 across various regions like Brittany, Paris, and Provence) so that clicking "Charger un exemple" renders all markers, trajectory arcs, couple color schemes, and historical timeline events instantly without requiring an external API key.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aad26783-0e06-4774-8c94-617894bfb918).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
