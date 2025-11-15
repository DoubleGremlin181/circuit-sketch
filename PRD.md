# Planning Guide

A web application that challenges users to draw shapes that match Formula 1 circuit layouts, using shape recognition algorithms to find the best matches.

**Experience Qualities**:
1. **Playful** - The core mechanic of drawing shapes to match race circuits creates a fun, game-like experience that rewards creativity and circuit knowledge
2. **Immediate** - Shape matching happens instantly as users complete their drawing, providing rapid feedback and encouraging multiple attempts
3. **Informative** - Each match reveals interesting facts about the circuit, turning a simple game into an educational experience about F1 history

**Complexity Level**: Light Application (multiple features with basic state)
  - Core drawing mechanic, shape matching algorithm, settings panel, and circuit database make this more than a micro tool, but the focused scope keeps it from being complex

## Essential Features

### Drawing Canvas
- **Functionality**: Touch and mouse-enabled drawing surface where users create closed shapes with live circuit overlay
- **Purpose**: Primary interaction mechanism that needs to feel natural on both mobile and desktop
- **Trigger**: User touches/clicks canvas and begins drawing
- **Progression**: Touch canvas → drag to draw path → release to complete shape → shape automatically closes → matching algorithm runs → matched circuit overlays on canvas
- **Success criteria**: Smooth drawing on mobile and desktop with no lag, clear visual feedback of the drawn path, semi-transparent overlay of matched circuit for comparison

### Shape Matching Engine
- **Functionality**: Compares user's drawn shape against real F1 circuit layouts stored locally in the repository using configurable similarity algorithms
- **Purpose**: Core game mechanic that determines which circuit best matches the user's drawing using authentic track data
- **Trigger**: User completes a closed shape on canvas
- **Progression**: Shape completed → normalize both shapes → apply selected algorithm (Hausdorff distance, Frechet distance, or turning angle) → rank circuits by similarity → display top match with percentage → show circuit overlay → fetch Wikipedia data with progress indicator
- **Success criteria**: Returns results instantly (circuits pre-loaded), shows match percentage, displays top match with overlay visualization, loads Wikipedia facts with visible progress bar

### Circuit Information Display
- **Functionality**: Shows detailed information and facts about matched circuits with data dynamically fetched from Wikipedia with visible loading progress
- **Purpose**: Educational component that rewards users with current and accurate F1 knowledge
- **Trigger**: Matching algorithm completes or user selects a circuit in browse mode
- **Progression**: Match found → show loading progress bar → fetch Wikipedia summary via API → display circuit name, location, and layout → show live facts from Wikipedia → display circuit statistics
- **Success criteria**: Each circuit displays Wikipedia-sourced information with visible progress indicator, graceful fallback if Wikipedia unavailable, information is easily readable with accurate data

### Circuit Browser
- **Functionality**: Browse all available F1 circuits with interactive selection and detailed Wikipedia information
- **Purpose**: Allows users to explore and learn about all circuits without needing to draw
- **Trigger**: User clicks "Browse" button in header
- **Progression**: Click browse → view list of all circuits → select circuit → see loading progress bar → display circuit layout on canvas → show Wikipedia facts and stats below
- **Success criteria**: All circuits visible in scrollable list, circuit layout renders correctly on canvas, Wikipedia data loads with progress indicator, smooth navigation back to drawing mode

### Dark Mode Toggle
- **Functionality**: Switches between light and dark themes with persistent preference
- **Purpose**: Provides comfortable viewing in different lighting conditions and user preference
- **Trigger**: User clicks theme toggle button
- **Progression**: Click toggle → theme switches → preference saves to localStorage → canvas colors update dynamically
- **Success criteria**: Instant theme switching, smooth color transitions, proper contrast in both modes, respects system preference on first load

### Settings Panel
- **Functionality**: Allows users to select different shape matching algorithms
- **Purpose**: Gives users control over matching sensitivity and method, enabling experimentation
- **Trigger**: User clicks settings icon
- **Progression**: Click settings → drawer/dialog opens → select algorithm (Hausdorff/Frechet/Turning Angle) → selection saves automatically → close panel
- **Success criteria**: Settings persist between sessions, clear explanation of each algorithm's characteristics

### Clear/Reset Function
- **Functionality**: Clears the canvas and overlay to start a new drawing
- **Purpose**: Allows users to quickly try again without page reload
- **Trigger**: User clicks clear button
- **Progression**: Click clear → canvas resets → overlay clears → previous results fade out → ready for new drawing
- **Success criteria**: Instant canvas clear, smooth transition

## Edge Case Handling

- **Incomplete shapes**: If user draws a line that doesn't close, automatically connect endpoints when they lift finger/mouse
- **Tiny drawings**: Reject shapes smaller than minimum threshold with helpful tooltip
- **Scribbles**: Very chaotic drawings still produce a match but may show low confidence percentage
- **No match found**: Show "No close match" message with encouragement to try again
- **Touch palm rejection**: Prevent accidental touches from registering as drawing input
- **Rapid redrawing**: Debounce matching algorithm to prevent performance issues
- **Data storage**: Circuit layouts stored locally in repository, no external loading required
- **Wikipedia loading**: Show progress bar while fetching facts from Wikipedia API
- **API failures**: Graceful fallback to minimal circuit info if Wikipedia API fails
- **Network errors**: Handle Wikipedia API timeouts with user-friendly messages and progress indication

## Design Direction

The design should feel playful yet sophisticated, like a racing simulation meets a creative toy. A minimal, focused interface that puts the drawing canvas front and center, with racing-inspired accent colors that evoke the speed and precision of Formula 1 without becoming overwhelming or garish.

## Color Selection

Analogous scheme using racing-inspired reds and oranges with neutral grays for a focused, energetic feel, with full dark mode support

- **Primary Color**: Racing Red (oklch(0.55 0.22 25)) - Communicates F1's iconic Ferrari red, energy, and competition
- **Secondary Colors**: Charcoal Gray (oklch(0.25 0.01 270)) for backgrounds and Carbon Fiber Gray (oklch(0.35 0.01 270)) for secondary elements, evoking the technical precision of F1
- **Accent Color**: Bright Orange (oklch(0.70 0.18 45)) - Attention-grabbing highlight for CTAs and match results
- **Foreground/Background Pairings (Light Mode)**:
  - Background (Light Gray oklch(0.98 0 0)): Charcoal text (oklch(0.20 0.01 270)) - Ratio 13.2:1 ✓
  - Card (White oklch(1 0 0)): Charcoal text (oklch(0.20 0.01 270)) - Ratio 15.1:1 ✓
  - Primary (Racing Red oklch(0.55 0.22 25)): White text (oklch(1 0 0)) - Ratio 5.8:1 ✓
  - Secondary (Dark Gray oklch(0.35 0.01 270)): White text (oklch(1 0 0)) - Ratio 8.9:1 ✓
  - Accent (Bright Orange oklch(0.70 0.18 45)): Charcoal text (oklch(0.20 0.01 270)) - Ratio 6.2:1 ✓
  - Muted (Light Neutral oklch(0.95 0.005 270)): Dark Gray text (oklch(0.45 0.01 270)) - Ratio 8.1:1 ✓
- **Foreground/Background Pairings (Dark Mode)**:
  - Background (Dark Gray oklch(0.15 0.01 270)): Light text (oklch(0.95 0.005 270)) - Ratio 12.8:1 ✓
  - Card (Dark Card oklch(0.18 0.01 270)): Light text (oklch(0.95 0.005 270)) - Ratio 11.5:1 ✓
  - Primary (Brighter Red oklch(0.65 0.22 25)): Near-white text (oklch(0.98 0 0)) - Ratio 6.1:1 ✓
  - Secondary (Darker Gray oklch(0.25 0.01 270)): Light text (oklch(0.95 0.005 270)) - Ratio 9.2:1 ✓
  - Accent (Brighter Orange oklch(0.75 0.18 45)): Dark text (oklch(0.15 0.01 270)) - Ratio 7.8:1 ✓

## Font Selection

Clean, geometric sans-serif that balances technical precision with approachability - Inter for its excellent readability at all sizes and modern racing aesthetic

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold / 32px / -0.02em letter spacing / 1.1 line height
  - H2 (Circuit Name): Inter SemiBold / 24px / -0.01em letter spacing / 1.2 line height
  - H3 (Section Headers): Inter Medium / 18px / normal letter spacing / 1.3 line height
  - Body (Facts & Info): Inter Regular / 15px / normal letter spacing / 1.5 line height
  - Small (Metadata): Inter Regular / 13px / normal letter spacing / 1.4 line height
  - Button Text: Inter Medium / 15px / normal letter spacing

## Animations

Purposeful and snappy animations that reinforce the speed and precision of Formula 1, with quick transitions (150-250ms) that never delay user actions, and celebratory micro-interactions when good matches are found

- **Purposeful Meaning**: Quick, mechanical transitions evoke pit stop efficiency; celebratory bounces for high-percentage matches mirror podium celebrations
- **Hierarchy of Movement**: Canvas drawing is immediate with no animation; match results slide in with spring physics; circuit facts fade in sequentially to guide reading order; settings drawer slides from side with smooth easing

## Component Selection

- **Components**:
  - Canvas (custom) - HTML5 Canvas with pointer event handlers for cross-device drawing and circuit overlay visualization
  - Card (shadcn) - For circuit information display with subtle border and shadow
  - Sheet (shadcn) - Side drawer for settings panel on mobile, dialog on desktop
  - Button (shadcn) - Clear, settings, and theme toggle actions with icon + text combinations
  - RadioGroup (shadcn) - Algorithm selection in settings
  - Badge (shadcn) - Match percentage display and circuit metadata tags (corners, length, lap record)
  - ScrollArea (shadcn) - For circuit facts list
  - Separator (shadcn) - Visual dividers between sections
  
- **Customizations**:
  - Custom Canvas component with touch event handling, path smoothing, and semi-transparent circuit overlay
  - Custom shape comparison algorithms (Hausdorff, Frechet, Turning Angle)
  - Theme toggle with localStorage persistence and system preference detection
  - Dynamic canvas colors that adapt to current theme
  
- **States**:
  - Buttons: Default with subtle shadow, hover with slight lift and color brighten, active with scale down (95%), disabled with 40% opacity
  - Canvas: Default with dashed border, active (drawing) with solid border and slight glow, completed with success border color, overlay visible when match found
  - Match results: Hidden (0 opacity), loading (skeleton), revealed (fade + slide in)
  - Theme: Light mode (default), dark mode (persisted), system preference respected
  
- **Icon Selection**:
  - Gear (Settings) - Settings panel trigger
  - X (Close/Clear) - Clear canvas and close dialogs  
  - Flag (CheckeredFlag) - Race/circuit theme marker
  - Moon/Sun - Theme toggle for dark/light mode
  - MapPin - Location indicator for circuits
  
- **Spacing**:
  - Page padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)
  - Card padding: p-6
  - Component gaps: gap-4 (default), gap-6 (major sections)
  - Button padding: px-4 py-2
  - Canvas margin: mb-6
  
- **Mobile**:
  - Canvas fills available width with 4:3 aspect ratio on mobile, 16:9 on desktop
  - Settings drawer slides from bottom on mobile, right side on tablet+
  - Circuit facts stack vertically on mobile, grid on tablet+
  - Touch target minimum 44px for all interactive elements
  - Single column layout on mobile, two-column (canvas + results) on desktop
