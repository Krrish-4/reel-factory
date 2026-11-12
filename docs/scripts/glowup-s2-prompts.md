# GlowupS2 still prompts (Rahul generates; we never do)

## What failed first (2026-11-12)
v1 prompts ("edit only her nose into a button nose...") barely moved the nose.
Two reasons: (1) they were run on the FRONT photo, where Greek / dorsal /
sloped noses look almost identical - those shapes live in the profile line;
(2) "only the nose" makes the model play safe. v2 below fixed both: turn the
head first, describe hard geometry, demand a thumbnail-visible change, mask
the nose if the tool can.

## v2 (worked: all 8 stills passed the lock check, drift 2-5 levels)

Run A first; run 1-6 on A's result; 7 on the main front photo. Re-run a
prompt on its own output if the change is weak.

Suffix for 1-7: "Keep her eyes, brows, lips, chin, skin, hair, makeup, top,
background, head angle and framing pixel-identical. Only the nose changes -
and the nose change must be LARGE and unmistakable even as a small
thumbnail. This is a different nose shape, not a filter, retouch or FaceTune."

A. 3q_base: "Rotate this exact woman's head about 60 degrees to her left into a strong three-quarter profile, so her nose is seen almost from the side and its full outline - bridge, tip and nostril - is silhouetted cleanly against the plain background. ... no hair crossing it."
1. button: low short bridge (~2/3 length), small round tip turned UP ~115 deg, nostrils visible, tip above nostrils.
2. greek: one perfectly STRAIGHT line from forehead to tip, no dip at the top, no hump, ruler-straight silhouette.
3. dorsal: ROMAN nose, clearly visible convex DORSAL HUMP partway down the bridge.
4. narrow: thin NARROW SKI-SLOPE, concave scoop then a small pointed up-flicked tip.
5. downward: TIP DROOPS below the nostrils, ~80 deg to the lip, nostrils hidden.
6. philtrum (on the button result): OVER-ROTATED tip ~125 deg, nostrils fully on show, nose-to-lip gap clearly LONGER; lips unchanged.
7. front round (main front photo): full round BULBOUS tip, lower third ~30% wider, flared rounded nostril wings; bridge unchanged.

Fallback: generate the nose shape alone as a close-up, attach it as image 2:
"Give the woman in image 1 exactly the nose shape from image 2. Change nothing else."

## What came back and how it is named (public-glowup/s2/portraits/src/)
3q_base, 3q_2_greek, 3q_3_dorsal, 3q_4_round (3/4, not front), 3q_5_narrow,
3q_6_downward, 3q_philtrum, front_1_button (FRONT view), front_base (main photo).
Then: python gen/glowup/portraits.py --reel s2 --sheet && python gen/glowup/emit.py --reel s2
