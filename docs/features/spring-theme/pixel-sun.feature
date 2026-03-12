Feature: Pixel Sun
  As a visitor of jwiegmann.de
  I want to see a pixel-art sun above the "JAN WIEGMANN" heading
  So that the landing page has a warm, spring-themed atmosphere

  Background:
    Given ENABLE_SPRING_THEME is set to true
    And the canvas is initialized to window.innerWidth x window.innerHeight
    And the "JAN WIEGMANN" heading is vertically centered on the page (approximately canvas.height / 2)

  # --- Positioning ---

  Scenario: Sun is horizontally centered on the canvas
    When the PixelSun is instantiated
    Then the sun center X coordinate equals Math.floor(canvas.width / 2)

  Scenario: Sun is positioned above the heading
    When the PixelSun is instantiated
    Then the sun center Y coordinate is less than canvas.height / 2
    And the sun (including its longest rays) does not overlap with the heading text area

  # --- Initialization ---

  Scenario: Sun is visible immediately on mount
    When the Stars component mounts
    Then the PixelSun is drawn on the very first animation frame
    And there is no fade-in or delayed appearance

  # --- Core Body Rendering ---

  Scenario: Sun body has a fixed radius
    When the PixelSun is instantiated
    Then the sun body radius is approximately 40px
    And the radius does not change based on viewport size

  Scenario: Sun core is rendered in orange
    When the PixelSun draws its core body
    Then the innermost ring of pixels is filled with an orange color (approximate rgba: r=255, g=140-160, b=0, a=1.0)
    And these pixels are drawn using ctx.fillRect with the established pixelSize (4px)

  Scenario: Sun body transitions from orange center to yellow edge
    When the PixelSun draws its body
    Then pixels at distance 0 from center have the orange core color (r=255, g~=150, b=0)
    And pixels at the outermost body ring have a yellow color (r=255, g=240-255, b=0-50)
    And pixels at intermediate distances have interpolated colors between orange and yellow
    And the transition produces at least 3 distinct color rings

  Scenario: Sun body is circular in pixel art style
    When the PixelSun draws its body
    Then only pixels whose center-point distance to the sun center is less than or equal to the body radius are filled
    And pixels are axis-aligned squares of pixelSize (4px) -- no sub-pixel rendering

  # --- Ray Rendering ---

  Scenario: Sun has exactly 12 rays distributed evenly
    When the PixelSun draws its rays
    Then exactly 12 rays extend outward from the body edge
    And the angular spacing between adjacent rays is 30 degrees (360 / 12)

  Scenario: Rays are composed of pixel rectangles
    When the PixelSun draws its rays
    Then each ray is composed of filled pixel rectangles (ctx.fillRect, pixelSize=4)

  # --- Ray Animation ---

  Scenario: Rays animate using sine-based oscillation
    Given the animation loop has been running
    When two frames are compared at time T and T+100ms
    Then the ray lengths differ between the two frames
    And ray length is computed using a Math.sin() function with a time-based parameter
    And the oscillation is continuous (no sudden jumps)

  Scenario: Ray color matches the outer sun body (yellow)
    When the sun rays are drawn
    Then ray pixels use a yellow fill color (r=255, g=220-255, b=0-80)
    And ray opacity may decrease toward the tip (outermost pixels have lower alpha)

  # --- Performance ---

  Scenario: Sun rendering stays within pixel budget
    When the PixelSun draws a single frame
    Then the total number of ctx.fillRect calls for the sun (body + rays) does not exceed 500
