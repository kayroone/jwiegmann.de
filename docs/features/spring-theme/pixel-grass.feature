Feature: Pixel Grass
  As a visitor of jwiegmann.de
  I want to see green pixel grass blades at the bottom of the page
  So that the landing page feels grounded with a natural spring landscape

  Background:
    Given ENABLE_SPRING_THEME is set to true
    And the canvas is initialized to window.innerWidth x window.innerHeight

  # --- Positioning & Distribution ---

  Scenario: Grass blades span the full width of the canvas
    When the PixelGrass instances are created
    Then grass blades are distributed across the entire canvas width from x=0 to x=canvas.width
    And there are no visible gaps wider than 20px between adjacent blade base positions

  Scenario: Grass blades are anchored at the bottom of the canvas
    When the PixelGrass draws its blades
    Then every blade base Y coordinate equals canvas.height (the very bottom edge)
    And blades grow upward (toward lower Y values)

  Scenario: Grass blades have varying heights
    When the PixelGrass instances are created
    Then not all blades have the same height
    And blade heights range between a minimum of approximately 20px and a maximum of approximately 80px
    And at least 3 distinct height values exist among the blades

  # --- Blade Shape ---

  Scenario: Grass blades are vertical pixel columns
    When the PixelGrass draws a blade with no wind displacement
    Then the blade is a straight vertical column of filled pixel rectangles
    And each segment is pixelSize (4px) wide or 2*pixelSize (8px) wide
    And the segments are vertically stacked without horizontal offset

  Scenario: Grass blades have mixed widths
    When the PixelGrass instances are created
    Then some blades have a width of 1*pixelSize (4px)
    And some blades have a width of 2*pixelSize (8px)
    And no blade has a width greater than 8px
    And both width variants are present among the rendered blades

  # --- Initialization ---

  Scenario: Grass is visible immediately on mount
    When the Stars component mounts
    Then PixelGrass blades are drawn on the very first animation frame
    And there is no fade-in or delayed appearance

  # --- Color ---

  Scenario: Grass blades are green
    When the PixelGrass draws a blade
    Then the blade pixels use a green fill color with r=0-80, g=140-220, b=0-60
    And there is color variation between blades (not all identical green)

  Scenario: Grass color may vary by height for depth effect
    When the PixelGrass draws a blade
    Then pixels at the base of the blade may use a darker green (g=140-170)
    And pixels at the tip of the blade may use a lighter green (g=180-220)

  # --- Wind Animation ---

  Scenario: Wind displaces only the tip of the blade
    Given the animation loop has been running
    When the wind animation displaces a blade
    Then the tip pixels are offset horizontally
    And the base pixel of the blade (at canvas.height) does not move horizontally
    And the displacement increases gradually from base (0px) to tip (maximum displacement)

  Scenario: Grass blades sway in the wind from right to left
    Given the animation loop has been running
    When two frames are compared at time T and T+100ms
    Then the tip X positions of grass blades differ between the two frames
    And the predominant sway direction is from right to left (tip X offset is biased negative)

  Scenario: Wind animation uses sine-based oscillation
    When the animation loop runs
    Then blade tip displacement is calculated using Math.sin() with a time-based parameter
    And each blade has a unique phase offset so they do not all sway in unison
    And the sway amount increases from base (no displacement) to tip (maximum displacement)

  Scenario: Wind animation is continuous and smooth
    Given the animation loop is running at 60fps
    When 60 consecutive frames are rendered
    Then no blade tip position jumps more than 3px between consecutive frames

  # --- Rendering ---

  Scenario: Grass is rendered using pixel-art fillRect
    When the PixelGrass draws a blade
    Then each blade segment is drawn using ctx.fillRect
    And segment size matches the established pixelSize (4px)

  Scenario: Grass renders behind the text layer
    When the full page is rendered
    Then grass blades are drawn on the canvas element which has CSS class "absolute inset-0"
    And the text content has CSS class "relative z-10"
    And therefore grass appears visually behind the text

  # --- Responsiveness ---

  Scenario: Grass count adapts to screen width
    Given the canvas width is 1920px
    When the PixelGrass instances are created
    Then approximately 100-300 blades are instantiated
    And if the window resizes to 375px width, the blade density (blades per 100px) remains similar

  Scenario: Grass blade array is fully regenerated on resize
    Given the spring theme is rendering with blades on a canvas of width 1920px
    When the window resizes to 1024px
    Then the entire blade array is discarded and regenerated for the new width
    And the new blade array covers x=0 to x=1024 without gaps wider than 20px

  # --- Performance ---

  Scenario: Grass rendering stays within pixel budget
    When the PixelGrass draws all blades in a single frame
    Then the total number of ctx.fillRect calls for all grass blades does not exceed 3000

  # --- Edge Cases ---

  Scenario: Grass handles very narrow viewport
    Given the canvas width is 320px
    When the PixelGrass instances are created
    Then at least 10 blades are rendered
    And blades do not extend beyond canvas.width

  Scenario: Grass handles very wide viewport
    Given the canvas width is 3840px
    When the PixelGrass instances are created
    Then blades still cover the full width without visible gaps wider than 20px
