# Background images: replacing them with AI photos

The site ships with seven computer-rendered, silver-on-black background images in `public/images/`. They are abstract art, not photos. Replace any of them with your own AI-generated (or licensed) photo whenever you like.

## Where each image appears

| File | Used on |
| --- | --- |
| `bg-roofline.webp` | Home hero, How it works, Selling a house that needs work, seller status page |
| `bg-skyline.webp` | About, Investors, Rental property, "Which path fits?" section |
| `bg-topo.webp` | Service areas, Washington, Relocating, the map section |
| `bg-silk.webp` | Resources, Calculator, Contact, offer checker, net proceeds, call-to-action panels |
| `bg-beams.webp`, `bg-arcs.webp` | Section backgrounds (searchlight beams, machined arcs). Every section below the hero rotates through the designs (see `SECTION_DESIGNS` in `src/components/PageRenderer.tsx`; patterns in `.sec-bg-*` in `globals.css`) |
| `bg-brushed.webp` | Sell for cash, Inherited, Foreclosure, "Our role" sections, policies, footer |

## Option 1: swap the file (simplest, changes it everywhere)

1. Generate a photo with one of the prompts below.
2. Make it **16:9, at least 2400 × 1350 px, and dark overall**. Keep the **left side darker**; that's where headlines sit.
3. Convert it to WebP (for example at squoosh.app, quality about 80, under 300 KB).
4. Save it over the file with the **same name** in `public/images/`, then redeploy.

## Option 2: a different photo for one page

1. In `/admin/settings`, upload the image. Copy the `/media/...` path it gives you.
2. In `/admin/content`, open the page and add `"image": "/media/your-file.webp"` to its hero section, then save.

## Prompts (black and silver, no white)

Add to every prompt: *"monochrome black and silver color palette, deep blacks, no white areas, no text, no logos, no people, 16:9, photorealistic"*.

- **bg-roofline:** "Cinematic night photograph of a modern home's gabled roofline silhouetted against a deep black sky, cool silver moonlight rim-lighting the roof edges, light mist, empty dark space on the left side of the frame, high-end architectural photography."
- **bg-skyline:** "Night photograph of a city skyline from a distance in thick haze, buildings in black silhouette with silver edge light and a few soft window lights, dark sky, empty dark space on the left."
- **bg-topo:** "Aerial view of mountain terrain at night rendered in black and brushed silver, low raking light revealing ridgelines, very dark and subtle."
- **bg-silk:** "Macro studio photograph of flowing liquid-silver ribbons on a pure black background, soft gradient lighting, minimal and elegant."
- **bg-brushed:** "Close-up of a brushed stainless steel surface in near darkness with one soft diagonal streak of light, fine horizontal brushed texture."

## Rules worth keeping

- Check that your image tool's terms allow commercial use.
- Use houses as mood, never as proof. Don't caption or present an AI image as a property you bought or sold.
- No recognizable real people, addresses or landmarks.
- Re-render the abstract set at any time: `python3 scripts/render-backgrounds.py public/images` (needs numpy, scipy, Pillow).
