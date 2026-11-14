# Grounded cottage — first transition revision

Asset: `house-grounded.png` (1145 × 1374, transparent PNG).

Created with the built-in image generation tool, editing `house-facade.png`.
The original asset remains available. The edit completes the masonry under the window to the level of the bottom step, preserving the house and its framing.

## Integration

- The house, its contact shadow, terrain and standing traveller share the exterior camera.
- The camera moves towards the lit window, with a maximum 1.2× enlargement and translation clamped to keep the viewport filled.
- A brief warm-light transition replaces the fall into a separate void. The exterior clears before furniture becomes prominent.
- The window, lantern and branch have subtle ambient motion; reduced-motion mode disables it and stacks the environments.
- The first section lasts 3.6 viewport heights on desktop and 3.8 on mobile. Later sections retain their scroll lengths.
- Local visual checks covered the foundation, intermediate frames, small screens, clickable controls and the 02–03 boundary. Scroll reversal and navigation checks run in `scripts/verify.cjs`.

## Final prompt

Use case: precise-object-edit.
Asset type: transparent modular house cutout for an illustrated cinematic scrolling website.
Edit the supplied house image. Fix ONLY the missing load-bearing foundation beneath its right-hand wall, below the large window. Currently that wall tapers off diagonally above the bottom stair, leaving a triangular hole through which the sky shows when the house is placed on level ground. Fill that missing lower-right section with an aged, solid masonry plinth made of the same purple-grey irregular stone as the existing steps. The stone foundation must extend down from the wall under the window, to the SAME ground plane as the bottom of the stairs. The complete building must rest on a continuous, visually level footprint, with a small side face in perspective. No hanging diagonal bottom edge and no unsupported ivy. The stairs stay fully visible in front, exactly in their original location. Add a very narrow, natural moss seam at the foot of the foundation, NOT a floating grassy island or a landscape.
Invariants: preserve the exact crooked house silhouette, angle, roof, antenna, windows, closed green door and brass handle, stairs, amber lamps, ivy, proportions, colors, delicate dark ink outlines and painterly paper grain of the input. Keep everything above the bottom quarter unchanged. Keep the exact framing and aspect ratio of the source, with the full roof and full stair base inside frame. The lower edge of the new foundation should stop at the same image y coordinate as the bottom step, not extend beyond it.
Actual transparent background, no sky, no ground scene, no background shadow, no text, no characters. This is the same existing building with the structural gap filled, not a redesign.
