# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Cory" is a single-page vanilla JavaScript web application - a virtual pet/companion game where users collect and interact with AI-powered creatures called "Corys". The application features a retro pixel-art aesthetic and is built entirely with HTML, CSS, and vanilla JavaScript (no build tools or frameworks).

## Architecture

### Core Structure
- **Main HTML file**: `index.html` - App shell with header, navigation, and main content container
- **View HTML files**: `views/` directory contains separate HTML files for each view
  - `views/home.html` - Home view with representative Cory and talk dialog
  - `views/pocket.html` - Pocket grid view
  - `views/journey.html` - Journey exploration view
  - `views/profile.html` - User profile view
  - `views/talk.html` - Chat interface view
  - `views/dialogs.html` - Shared dialog components (representative, exploration, photo upload)
- **Single JavaScript class**: `scripts/app.js` - `CoryApp` class manages entire application state and logic
- **Modular CSS**: Split into four files for organization:
  - `styles/base.css` - CSS variables, resets, app container, view backgrounds
  - `styles/layout.css` - Header, navigation, main content positioning
  - `styles/components.css` - Reusable components (buttons, dialogs, cards)
  - `styles/views.css` - View-specific styles (home, pocket, journey, profile, talk)

### State Management
All application state is managed within the `CoryApp` class instance (`window.coryApp`):
- `currentView`: Tracks active view ('home', 'pocket', 'journey', 'profile', 'talk')
- `representativeCory`: The currently selected main Cory displayed on home screen
- `coryCollection`: Array of all collected Cory objects
- `explorationState`: Journey exploration status ('idle', 'exploring')
- `chatMessages`: Chat history with current Cory
- `userProfile`: User data (nickname, playerId, profileImage, playTime)

### View System
The application uses a dynamic view loading system with tab-based navigation:
- Views are loaded asynchronously from separate HTML files on app initialization (`loadAllViews()` in app.js)
- All views are fetched in parallel using `Promise.all()` for optimal performance
- Views are inserted into the main content container, dialogs are inserted after it
- Active views are toggled by adding/removing 'active' and 'hidden' CSS classes
- Background images change via class names on `#main-container` (e.g., 'home-view', 'talk-view')
- The talk view is special - it hides the header and bottom nav, shows a custom header with back button
- Loaded view HTML is cached in `this.loadedViews` object

### Navigation Flow
1. **Home View**: Main screen showing representative Cory and alarm notifications
2. **Pocket View**: Grid of collected Corys (3 per row), click to set as representative
3. **Journey View**: Exploration interface - upload photo → timer → generate new Cory
4. **Profile View**: User stats, editable nickname, changeable profile image
5. **Talk View**: Chat interface with representative Cory (separate from tab navigation)

## Key Features

### Cory System
- Each Cory has: `id`, `name`, `imageUrl`, `story` (summary + lines), `createdAt`, `isRepresentative`
- Representative Cory appears on home screen and in talk view
- Corys are generated from uploaded photos during Journey explorations

### Chat System
- Simple keyword-based response generation (see `generateCoryResponse()` method)
- Messages stored in `chatMessages` array with sender ('user' or 'cory'), text, timestamp
- Currently uses mock responses - **LLM integration point**: Replace `generateCoryResponse()` with API calls

### Exploration/Journey
- User uploads photo → confirmation dialog → progress timer (15-60s random) → new Cory generated
- New Corys added to collection and trigger alarm notification
- Timer can be cancelled mid-exploration

### Dialog System
Multiple confirmation dialogs:
- `talkDialogOverlay`: Confirm before entering chat
- `representativeDialogOverlay`: Confirm changing representative Cory
- `explorationDialogOverlay`: Confirm starting exploration
- `photoUploadDialogOverlay`: Confirm photo selection
All dialogs use same visual style, clickable overlays to close

## Development Workflow

### Running Locally
**IMPORTANT**: Due to the dynamic view loading system using `fetch()`, you **must** use a local web server. Opening `index.html` directly in a browser will cause CORS errors.

Use any static server:
```bash
# Python
python -m http.server 8000

# Node.js (http-server)
npx http-server

# VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then navigate to `http://localhost:8000` (or the port shown).

### Making Changes

**Adding a new view:**
1. Create new HTML file in `views/` directory (e.g., `views/newview.html`)
2. Add view HTML with class `view view-{name}` as the root element
3. Add view name to the `views` array in `loadAllViews()` method in `app.js`
4. Add navigation item in `index.html` bottom nav with `data-tab="{name}"`
5. Add background style in `styles/base.css` as `#main-container.{name}-view`
6. Add view-specific styles in `styles/views.css`
7. Update `switchTab()` method in `app.js` to handle new view
8. Add render method if view needs dynamic content

**Modifying an existing view:**
1. Edit the corresponding HTML file in `views/` directory
2. Changes will be loaded on next page refresh (views are loaded during app initialization)
3. For development, use a local server to avoid CORS issues with `fetch()`

**Modifying chat/AI behavior:**
- Edit `generateCoryResponse()` in `app.js` (currently keyword-based)
- For LLM integration: Replace method with API calls to your AI service
- Message structure: `{sender: 'user'|'cory', text: string, timestamp: number}`

**Styling conventions:**
- Use CSS variables from `:root` in `base.css` for colors, fonts, dimensions
- Pixel font: `var(--font-pixel)` ('Press Start 2P')
- Main color: `var(--primary-pink)` (#E395A4)
- Shadows: `var(--text-shadow)` for text, `var(--box-shadow)` for boxes

**Asset paths:**
- All images in `assets/images/`
- Referenced from CSS with `url('../assets/images/{filename}')`
- Referenced from HTML/JS with `assets/images/{filename}`

## Code Patterns

### Event Binding
All events bound in `bindEvents()` method during initialization. Pattern:
```javascript
const element = document.getElementById('elementId');
if (element) {
    element.addEventListener('click', () => this.handleMethod());
}
```

### UI Updates
1. Update state in class property
2. Call render/update method to sync DOM with state
3. Common pattern: `this.someState = newValue; this.updateDisplay();`

### Dialog Pattern
```javascript
// Show: Remove 'hidden' class from overlay
showDialog() {
    document.getElementById('dialogOverlay').classList.remove('hidden');
}

// Hide: Add 'hidden' class back
closeDialog() {
    document.getElementById('dialogOverlay').classList.add('hidden');
}
```

### View Switching
Always use `switchTab(tabName)` method - handles:
- Updating nav active states
- Showing/hiding views
- Updating header title
- Changing background
- Rendering view-specific content

## Important Notes

- **No TypeScript, no transpilation** - Plain ES6+ JavaScript only
- **No package.json** - No dependencies, no npm commands
- **Local server required** - Must use local web server for development (fetch API requirement)
- **Async initialization** - `init()` method is async to await view loading before binding events
- **State persistence**: Currently none - all state lost on refresh. Add localStorage if needed.
- **Responsive design**: Fixed dimensions (513x770px) - designed for mobile viewport
- **Browser support**: Modern browsers with ES6 class, async/await, and fetch API support required
- **Image generation**: Currently uses mock images. For real photo-to-Cory generation, integrate image processing API in `generateCoryFromPhoto()` method
