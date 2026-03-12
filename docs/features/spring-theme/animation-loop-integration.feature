Feature: Animation Loop Integration
  As a developer
  I want the spring theme elements integrated into the existing animation loop
  So that all visual elements share a single requestAnimationFrame cycle

  Background:
    Given ENABLE_SPRING_THEME is set to true
    And the Stars component has mounted
    And the animation loop is running via requestAnimationFrame

  # --- Render Order ---

  Scenario: Spring elements render in correct order within the loop
    When a single animation frame executes
    Then the operations happen in this order:
      | Step | Operation                                      |
      | 1    | ctx.clearRect(0, 0, canvas.width, canvas.height) |
      | 2    | PixelGrass update and draw (all blades)          |
      | 3    | PixelSun update and draw                         |
    And PixelSun is drawn after PixelGrass so sun rays appear above grass

  Scenario: Stars render before spring elements if both enabled
    Given ENABLE_STARS is set to true
    When a single animation frame executes
    Then Particle update/draw happens before PixelGrass and PixelSun

  # --- Lifecycle ---

  Scenario: Spring elements are instantiated once on mount
    When the Stars component mounts
    Then exactly one PixelSun instance is created
    And the PixelGrass blade array is populated once
    And no new instances are created on subsequent animation frames

  Scenario: All spring elements are visible on the first frame
    When the Stars component mounts and the first animation frame executes
    Then PixelSun is drawn with full opacity (no fade-in)
    And PixelGrass blades are drawn with full opacity (no fade-in)

  Scenario: Sun is repositioned on window resize
    Given the spring theme is rendering
    When the window resize event fires
    Then canvas.width and canvas.height are updated
    And the PixelSun recalculates its center X to Math.floor(canvas.width / 2)
    And the PixelSun recalculates its center Y to remain above the heading

  Scenario: Grass blade array is regenerated on window resize
    Given the spring theme is rendering
    When the window resize event fires
    Then canvas.width and canvas.height are updated
    And the PixelGrass blade array is discarded and regenerated for the new canvas width
    And the new blades cover the full width without gaps wider than 20px

  Scenario: Cleanup on unmount
    Given the spring theme is rendering
    When the Stars component unmounts
    Then the window resize event listener is removed
    And the requestAnimationFrame loop stops (no further draw calls)

  # --- Class Architecture ---

  Scenario: PixelSun follows existing class pattern
    When the PixelSun class is defined
    Then it has a constructor that accepts canvas dimensions
    And it has an update() method for animation state changes
    And it has a draw() method that accepts a CanvasRenderingContext2D
    And it is defined inside the useEffect callback, consistent with Particle and PixelVine

  Scenario: PixelGrass follows existing class pattern
    When the PixelGrass class is defined
    Then it has a constructor that initializes blade properties (position, height, width, phase offset)
    And it has an update() method for wind animation state
    And it has a draw() method that accepts a CanvasRenderingContext2D
    And it is defined inside the useEffect callback, consistent with Particle and PixelVine

  # --- Performance ---

  Scenario: Animation maintains 60fps with spring theme
    Given the spring theme is rendering on a standard desktop browser
    When 100 consecutive frames are measured
    Then the average frame time is below 16.7ms (60fps target)
    And no single frame exceeds 33ms (never drops below 30fps)
