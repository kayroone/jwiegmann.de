Feature: Configurable Background
  As a site owner
  I want to choose between a black background and a pixelated sky gradient
  So that the spring theme can have a matching atmosphere while keeping the option to revert

  Background:
    Given ENABLE_SPRING_THEME is set to true
    And the file "app/components/hero-animation.tsx" contains a boolean constant "ENABLE_PIXEL_BACKGROUND"
    And the canvas is initialized to window.innerWidth x window.innerHeight

  # --- Mode: Black Background (default / disabled) ---

  Scenario: Black background when pixel background is disabled
    Given ENABLE_PIXEL_BACKGROUND is set to false
    When the animation loop clears the canvas
    Then the canvas is cleared via ctx.clearRect
    And the page container retains its CSS class "bg-black"
    And no gradient is drawn on the canvas

  # --- Mode: Pixel Gradient Background ---

  Scenario: Pixel gradient is rendered when enabled
    Given ENABLE_PIXEL_BACKGROUND is set to true
    When the animation loop renders a frame
    Then a gradient is drawn on the canvas before other spring elements
    And the gradient spans the full canvas height from y=0 to y=canvas.height
    And the gradient spans the full canvas width from x=0 to x=canvas.width

  Scenario: Gradient color at the bottom of the canvas is white
    Given ENABLE_PIXEL_BACKGROUND is set to true
    When the gradient is drawn
    Then pixels at y=canvas.height have the color rgba(255, 255, 255, 1)

  Scenario: Gradient color at the top of the canvas is light blue
    Given ENABLE_PIXEL_BACKGROUND is set to true
    When the gradient is drawn
    Then pixels at y=0 have the color rgba(135, 206, 235, 1)

  Scenario: Gradient transitions from light blue (top) to white (bottom)
    Given ENABLE_PIXEL_BACKGROUND is set to true
    When the gradient is drawn
    Then the color at y=0 is rgba(135, 206, 235, 1) (light blue)
    And the color at y=canvas.height is rgba(255, 255, 255, 1) (white)
    And at y=canvas.height/2 the color is an interpolation between light blue and white

  # --- Pixel-Art Style ---

  Scenario: Gradient is rendered in discrete pixel steps, not smooth
    Given ENABLE_PIXEL_BACKGROUND is set to true
    When the gradient is drawn
    Then the gradient is composed of horizontal bands
    And each band has a height of pixelSize (4px)
    And all pixels within a single band share the same fill color
    And adjacent bands have slightly different colors creating a stepped transition

  Scenario: Gradient is rendered on the canvas, not via CSS
    Given ENABLE_PIXEL_BACKGROUND is set to true
    When the gradient is drawn
    Then the gradient is drawn using ctx.fillRect calls on the canvas 2D context
    And no CSS gradient (linear-gradient, etc.) is applied to the canvas or its container

  # --- Render Order ---

  Scenario: Gradient is drawn before all other spring elements
    Given ENABLE_PIXEL_BACKGROUND is set to true
    When a single animation frame executes
    Then the operations happen in this order:
      | Step | Operation                                         |
      | 1    | ctx.clearRect(0, 0, canvas.width, canvas.height)  |
      | 2    | Pixel gradient background fill                     |
      | 3    | PixelGrass update and draw                         |
      | 4    | PixelSun update and draw                           |

  # --- Responsiveness ---

  Scenario: Gradient covers full canvas after resize
    Given ENABLE_PIXEL_BACKGROUND is set to true
    And the spring theme is rendering
    When the window resizes
    Then the gradient is redrawn to cover the new canvas dimensions
    And the bottom color remains rgba(255, 255, 255, 1)
    And the top color remains rgba(135, 206, 235, 1)

  # --- Toggle Behavior ---

  Scenario: Pixel background toggle is independent of spring theme toggle
    Given ENABLE_SPRING_THEME is set to false
    And ENABLE_PIXEL_BACKGROUND is set to true
    When the Stars component mounts and the animation loop runs
    Then no pixel gradient is rendered
    # Reason: ENABLE_PIXEL_BACKGROUND only takes effect when ENABLE_SPRING_THEME is true

  # --- Performance ---

  Scenario: Gradient rendering stays within pixel budget
    Given ENABLE_PIXEL_BACKGROUND is set to true
    And the canvas height is 1080px
    When the gradient is drawn
    Then the total number of ctx.fillRect calls for the gradient does not exceed 270
    # Calculation: 1080px / 4px pixelSize = 270 horizontal bands
