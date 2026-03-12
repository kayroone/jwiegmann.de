Feature: Spring Theme Feature Toggle
  As a site owner
  I want to enable or disable the spring theme independently of other visual effects
  So that I can switch between seasonal themes without code changes

  Background:
    Given the file "app/components/hero-animation.tsx" contains a boolean constant "ENABLE_SPRING_THEME"
    And the file "app/components/hero-animation.tsx" contains a boolean constant "ENABLE_VINES"
    And the file "app/components/hero-animation.tsx" contains a boolean constant "ENABLE_STARS"

  Scenario: Spring theme activates PixelSun and PixelGrass
    Given ENABLE_SPRING_THEME is set to true
    And ENABLE_STARS is set to false
    When the Stars component mounts and the animation loop runs
    Then the canvas renders PixelSun elements
    And the canvas renders PixelGrass elements
    And no PixelVine elements are rendered
    And no Particle (star) elements are rendered

  Scenario: Spring theme implicitly disables vines regardless of ENABLE_VINES
    Given ENABLE_SPRING_THEME is set to true
    And ENABLE_VINES is set to true
    When the Stars component mounts and the animation loop runs
    Then no PixelVine elements are rendered
    And the canvas renders PixelGrass elements
    And the canvas renders PixelSun elements
    # Reason: Both PixelGrass and PixelVine render at the bottom of the canvas,
    # causing visual collision. Spring theme takes precedence.

  Scenario: Spring theme disabled falls back to previous theme
    Given ENABLE_SPRING_THEME is set to false
    And ENABLE_VINES is set to true
    When the Stars component mounts and the animation loop runs
    Then no PixelSun elements are rendered
    And no PixelGrass elements are rendered
    And PixelVine elements are rendered

  Scenario: All themes can be disabled simultaneously
    Given ENABLE_SPRING_THEME is set to false
    And ENABLE_VINES is set to false
    And ENABLE_STARS is set to false
    When the Stars component mounts and the animation loop runs
    Then the canvas is cleared every frame via ctx.clearRect
    And no visual elements are drawn

  Scenario: Spring theme coexists with stars if both enabled
    Given ENABLE_SPRING_THEME is set to true
    And ENABLE_STARS is set to true
    When the Stars component mounts and the animation loop runs
    Then the canvas renders PixelSun elements
    And the canvas renders PixelGrass elements
    And Particle (star) elements are rendered
    And no PixelVine elements are rendered
