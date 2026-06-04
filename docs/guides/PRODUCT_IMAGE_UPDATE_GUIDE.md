# 🖼️ Product Image Update Guide
**Mwanainchi Butchery & Fast Food — Complete Asset Reference**

> Last Updated: June 4, 2026  
> File edited to update images: `src/lib/products.ts`

---

## 📋 Overview

All product images are managed in a single file:

```
src/lib/products.ts
```

Images are **imported at the top** of that file (lines 1–56) and then **referenced by each product** in the `products` and `fastFood` arrays below.

### Asset Directory Structure

```
src/assets/
├── logo-header.png              ← Site header logo
├── logo-footer.png              ← Site footer logo
├── butcher.jpg                  ← General butchery photo
├── butcher-at-work.jpg          ← About section (home page)
├── butcher_stock_image.png      ← Stock photo
├── butchery-interior.jpg        ← Interior photo
├── fastfood_stock_image.png     ← Fast food stock photo
│
└── products/
    ├── ButcheryProducts/
    │   ├── Beef/                ← 37 images
    │   ├── Chicken/             ← 9 images
    │   ├── Fish/                ← 2 images
    │   ├── GoatLamb/            ← 18 images
    │   └── Pork/                ← 3 images
    └── FastfoodProducts/        ← 48 images (mixed)
```

---

## ⚠️ Bugs Found & Fixed

The following 6 broken imports were identified and fixed on June 4, 2026. The site was returning **HTTP 500** errors because Vite could not resolve the missing paths.

| # | Import Variable | Old (Broken) Path | Fixed Path | Status |
|---|---|---|---|---|
| 1 | `goatFull` + 7 others | `@/assets/products/GoatLamb/goat-full.jpg` | `@/assets/products/ButcheryProducts/GoatLamb/goat-full.jpg` | ✅ Fixed |
| 2 | `goatCurry` | `@/assets/products/GoatLamb/Rich Goat Curry Cut.jpg` | `@/assets/products/ButcheryProducts/GoatLamb/Rich Goat Curry Cut.jpg` | ✅ Fixed |
| 3 | `porkShoulder` | `@/assets/products/Pork/up-pork-shoulder.jpg` | `@/assets/products/ButcheryProducts/Pork/up-pork-shoulder.jpg` | ✅ Fixed |
| 4 | `porkRack` | `@/assets/products/Pork/up-pork-rack.jpg` | `@/assets/products/ButcheryProducts/Pork/up-pork-rack.jpg` | ✅ Fixed |
| 5 | `porkCuts` + `porkTrotters` | `@/assets/products/Pork/pork-cuts.jpg` | `@/assets/products/ButcheryProducts/Pork/pork-cuts.jpg` | ✅ Fixed |
| 6 | `chickenWholeAlt` | `@/assets/products/ButcheryProducts/Chicken/chicken-whole.jpg` (**FILE MISSING**) | Remapped to existing `up-whole-chicken.jpg` | ✅ Fixed |

---

## 🔧 How to Update a Product Image — Step-by-Step

### Method A: Swap with an existing asset image

1. **Find your new image** in `src/assets/products/...` (see tables below)
2. **Open** `src/lib/products.ts`
3. **Find the import block** at the top (lines 1–56) for that category
4. **Change the file path** in the import to point to your new image

**Example — changing Goat Fillet image:**
```typescript
// BEFORE
import goatSteak from "@/assets/products/ButcheryProducts/GoatLamb/goat-full.jpg";

// AFTER (use a dedicated steak image)
import goatSteak from "@/assets/products/ButcheryProducts/GoatLamb/goat steak.png";
```

5. **Save the file** — Vite hot-reloads automatically, no restart needed.

---

### Method B: Add a brand new image file

1. **Copy your image** into the correct folder under `src/assets/products/`
   - Use simple filenames without spaces where possible (use hyphens: `beef-steak.jpg`)
2. **Open** `src/lib/products.ts`
3. **Add a new import** in the correct section:
```typescript
import myNewImage from "@/assets/products/ButcheryProducts/Beef/my-new-image.jpg";
```
4. **Update the product** to use `myNewImage`:
```typescript
{ id: "beef-sirloin", ..., image: myNewImage, ... }
```
5. **Save** — done.

---

### Method C: Update via the product object directly (advanced)

Each product in the `products[]` or `fastFood[]` array has an `image:` property. You can point it to any already-imported variable. Example:

```typescript
{ 
  id: "beef-sirloin", 
  name: "Sirloin Steak",
  ...
  image: beefRibEye,     // ← change this variable name to swap image
  ...
}
```

---

## 🥩 BEEF Products — Image Map

**Current Imports (`src/lib/products.ts` lines 1–13):**

| Import Variable | Current File | Correct? |
|---|---|---|
| `beefSirloin` | `Beef/Beef Rump Steak.jpg` | ⚠️ Using wrong image (Rump for Sirloin) |
| `beefRibEye` | `Beef/Beef Rump Steak.jpg` | ⚠️ Using wrong image (Rump for Rib Eye) |
| `beefTBone` | `Beef/Beef Rump Steak.jpg` | ⚠️ Using wrong image (Rump for T-Bone) |
| `beefTopRump` | `Beef/Beef Rump Steak.jpg` | ✅ Correct |
| `beefShank` | `Beef/beef-cube.jpg` | ⚠️ Using cube for shank |
| `beefBrisket` | `Beef/beef-cube.jpg` | ⚠️ Using cube for brisket |
| `beefRibs` | `Beef/beef-cube.jpg` | ⚠️ Using cube for ribs |
| `beefCube` | `Beef/beef-cube.jpg` | ✅ Correct |
| `beefMince` | `Beef/Beef-Mince-500g.jpg` | ✅ Correct |
| `beefMincePng` | `Beef/Beef-Mince-500g.jpg` | ✅ Correct |
| `oxLiver` | `Beef/beef-cube.jpg` | ⚠️ Using cube for liver |
| `oxKidney` | `Beef/beef-cube.jpg` | ⚠️ Using cube for kidney |

**Product → Image assignments:**

| Product ID | Product Name | Import Used | Suggested Better Image |
|---|---|---|---|
| `beef-fillet` | Beef Fillet | `beefRibEye` → Rump Steak | `BEEF FILET WELLINGTON.jpg` |
| `beef-sirloin` | Sirloin Steak | `beefSirloin` → Rump Steak | `Beef Rump Steak.jpg` (ok for now) |
| `beef-rump` | Rump Steak | `beefTopRump` → Rump Steak | ✅ Already correct |
| `beef-chuck` | Chuck | `beefCube` | `Chuck-off-bone.png` or `Chuck-on-bone-2.png` |
| `beef-shoulder` | Beef Shoulder | `beefCube` | `beef-preview.png` |
| `beef-round` | Round | `beefCube` | `Silverside.png` |
| `beef-mince` | Beef Mince | `beefMince` | ✅ `Beef-Mince-500g.jpg` |
| `beef-shank` | Beef Shank | `beefShank` → cube | `Beef Shank.jpg` |
| `beef-oxtail` | Oxtail | `beefRibs` → cube | `Ox-Lung.png` or `beef-cube.jpg` |
| `beef-brisket` | Brisket | `beefBrisket` → cube | `Beef-Brisket.png` |
| `beef-ribs` | Beef Ribs | `beefRibs` → cube | `Beef-Ribs.png` |
| `beef-leg-roast` | Whole Beef Leg | `beefBrisket` → cube | `beef-live-product-display.jpg` |
| `beef-loin-roast` | Beef Loin Roast | `beefTBone` → Rump | `T-Bone-Steak 1500.png` |
| `beef-soup-bones` | Soup Bones | `beefRibs` → cube | `Beef-Bones.png` or `Bones-for-soup-product.jpg` |
| `beef-marrow` | Marrow Bones | `beefRibs` → cube | `Smoked Bone Marrow Recipe.jpg` |
| `beef-neck` | Beef Neck | `beefShank` → cube | `Beef Neck.jpg` |
| `beef-liver` | Beef Liver | `oxLiver` → cube | `Ox-Liver.png` |
| `ox-kidney` | Ox Kidney | `oxKidney` → cube | `Matumbo-liver-beef;meat-product.jpg` |
| `beef-tripe` | Beef Tripe (Matumbo) | `beefCube` | `matumbo.jpg` |

**Available Beef Images in `src/assets/products/ButcheryProducts/Beef/`:**

```
1kg Beef Bones Soup.jpg          Bones-for-soup-product.jpg
BEEF FILET WELLINGTON.jpg        Chuck-off-bone.png
Beef Animalia.jpg                Chuck-on-bone-2.png
Beef Neck.jpg                    Fatty Beef Breast Cut.jpg
Beef Rump Steak.jpg              Matumbo-liver-beef;meat-product.jpg
Beef Shank.jpg                   Meat cut secticon + butcher.jpg
Beef-Bones.png                   Meat-Balls.png
Beef-Brisket.png                 Ox-Heart.png
Beef-Mince-500g.jpg              Ox-Liver.png
Beef-Ribs.png                    Ox-Lung.png
Beef-butchery-live-product.jpg   Raw-Beef-Burger.png
beef cube.jpeg                   Shin-beef-on-the-bone.png
Beef-Mince-500g.jpg              Silverside.png
beef hump.png                    Smoked Bone Marrow Recipe.jpg
beef-cube.jpg                    T-Bone-Steak 1500.png
beef-live-product-display.jpg    Tender Beef Bottom Round Roast recipe with Gravy.jpg
beef-mince.png                   Top-Rump 1500.png
beef-preview.png                 Top-side-1Kg 1500.png
matumbo.jpg
```

---

## 🐐 GOAT / LAMB (Mutton) Products — Image Map

**Current Imports (`src/lib/products.ts` lines 15–24):**

| Import Variable | Current File | Status |
|---|---|---|
| `goatFull` | `GoatLamb/goat-full.jpg` | ✅ Fixed |
| `goatChops` | `GoatLamb/goat-full.jpg` | ⚠️ All sharing same image |
| `goatShoulder` | `GoatLamb/goat-full.jpg` | ⚠️ All sharing same image |
| `goatRibs` | `GoatLamb/goat-full.jpg` | ⚠️ All sharing same image |
| `goatSteak` | `GoatLamb/goat-full.jpg` | ⚠️ All sharing same image |
| `lambLeg` | `GoatLamb/goat-full.jpg` | ⚠️ All sharing same image |
| `lambRibs` | `GoatLamb/goat-full.jpg` | ⚠️ All sharing same image |
| `goatCurry` | `GoatLamb/Rich Goat Curry Cut.jpg` | ✅ Fixed |

**Product → Image assignments:**

| Product ID | Product Name | Suggested Better Image |
|---|---|---|
| `goat-fillet` | Goat Fillet | `goat steak.png` |
| `goat-chops` | Goat Chops | `Goat-Ribs.png` |
| `goat-shoulder` | Goat Shoulder | `Goat_Shoulder.png` or `Goat-Shoulder leg2.png` |
| `goat-stew-cut` | Goat Stew Cubes | `Rich Goat Curry Cut.jpg` ✅ already used |
| `goat-shank` | Goat Shank | `Goat-Ribs.png` |
| `goat-ribs` | Goat Ribs | `Goat-Ribs.png` |
| `goat-leg-roast` | Whole Goat Leg | `Lamb-Leg.png` or `Leg of Lamb Recipe...jpg` |
| `goat-rack-roast` | Goat Rack | `Lamb-Loin.png` |
| `goat-soup-bones` | Goat Soup Bones | `Lamb-Ribs.png` |
| `goat-liver` | Goat Liver | `goat-full.jpg` (placeholder) |
| `goat-matumbo` | Goat Matumbo | `goat-full.jpg` (placeholder) |

**Available GoatLamb Images:**
```
Goat Animalia.jpg        Lamb-Chops.webp
Goat-Ribs.png            Lamb-Cubes.png
Goat-Shoulder leg2.png   Lamb-Leg.png
Goat_Shoulder.png        Lamb-Loin.png
IMG-20260526-WA0009.jpg  Lamb-Mince-2.png
Lamb-Ribs.png            Lamb-Shoulder.png
Leg of Lamb Recipe...jpg Rich Goat Curry Cut.jpg
goat steak.png           goat-full.jpg
lamb-preview.png         product-goat.jpg
```

---

## 🐖 PORK Products — Image Map

**Current Imports (`src/lib/products.ts` lines 26–30) — All Fixed:**

| Import Variable | File | Status |
|---|---|---|
| `porkShoulder` | `Pork/up-pork-shoulder.jpg` | ✅ Fixed |
| `porkRack` | `Pork/up-pork-rack.jpg` | ✅ Fixed |
| `porkCuts` | `Pork/pork-cuts.jpg` | ✅ Fixed |
| `porkTrotters` | `Pork/pork-cuts.jpg` | ⚠️ No dedicated image — using pork-cuts |

**Product → Image assignments:**

| Product ID | Product Name | Image Used | Notes |
|---|---|---|---|
| `pork-loin` | Pork Loin | `porkCuts` | ✅ |
| `pork-chops` | Pork Chops | `porkCuts` | ✅ |
| `pork-shoulder` | Pork Shoulder | `porkShoulder` | ✅ |
| `pork-belly` | Pork Belly | `porkCuts` | ✅ |
| `pork-ribs` | Pork Ribs | `porkRack` | ✅ |
| `pork-trotters` | Pork Trotters | `porkTrotters` → pork-cuts | ⚠️ No trotters image |
| `pork-leg-roast` | Pork Leg Roast | `porkShoulder` | ✅ |
| `pork-loin-roast` | Pork Loin Roast | `porkCuts` | ✅ |
| `pork-soup-bones` | Pork Soup Bones | `porkCuts` | ✅ |
| `pork-sausages` | Pork Sausages | `griledSausages` | ✅ |

**Available Pork Images:**
```
pork-cuts.jpg          up-pork-rack.jpg       up-pork-shoulder.jpg
```
> **Note:** Only 3 pork images exist. To improve variety, add more images to `src/assets/products/ButcheryProducts/Pork/`.

---

## 🐟 FISH Products — Image Map

**Current Imports (`src/lib/products.ts` lines 32–36):**

| Import Variable | File | Status |
|---|---|---|
| `tilapiaWhole` | `Fish/up-tilapia.jpg` | ✅ Correct |
| `fishFillet` | `Fish/up-tilapia.jpg` | ⚠️ Same as whole tilapia |
| `fishProduct` | `Fish/Fish product.jpg` | ✅ Correct |
| `wholeStewFish` | `Fish/Fish product.jpg` | ⚠️ Same as fishProduct |

**Product → Image assignments:**

| Product ID | Product Name | Image Used | Notes |
|---|---|---|---|
| `fish-tilapia-whole` | Whole Tilapia | `tilapiaWhole` | ✅ |
| `fish-tilapia-fillet` | Tilapia Fillet | `fishFillet` → tilapia | ⚠️ No fillet-specific image |
| `fish-nile-perch` | Nile Perch | `fishProduct` | ✅ |
| `fish-omena` | Omena (Dagaa) | `wholeStewFish` | ⚠️ No omena-specific image |

**Available Fish Images:**
```
Fish product.jpg      up-tilapia.jpg
```
> **Note:** Only 2 fish images. Add `up-tilapia-fillet.jpg` and `omena.jpg` for better differentiation.

---

## 🍗 CHICKEN Products — Image Map

**Current Imports (`src/lib/products.ts` lines 38–44) — All Fixed:**

| Import Variable | File | Status |
|---|---|---|
| `chickenWhole` | `Chicken/up-whole-chicken.jpg` | ✅ |
| `chickenRoast` | `Chicken/up-roast-chicken.jpg` | ✅ |
| `chickenWings` | `Chicken/up-chicken-wings.jpg` | ✅ |
| `chickenLegQuarter` | `Chicken/up-chicken-leg-quarter.jpg` | ✅ |
| `friedChickenUp` | `Chicken/up-fried-chicken.jpg` | ✅ |
| `chickenWholeAlt` | `Chicken/up-whole-chicken.jpg` | ✅ Fixed (was `chicken-whole.jpg` — missing file) |

**Product → Image assignments:**

| Product ID | Product Name | Image Used | Notes |
|---|---|---|---|
| `chicken-full-coupon` | Full Coupon | `chickenWhole` | ✅ |
| `chicken-wings` | Chicken Wings | `chickenWings` | ✅ |
| `chicken-thighs` | Chicken Thighs | `chickenLegQuarter` | ✅ |
| `chicken-drumstick` | Drumsticks | `chickenLegQuarter` | ✅ |
| `chicken-breast` | Chicken Breast | `chickenWhole` | ⚠️ Should use `Chicken Breast.jpg` |
| `chicken-boneless` | Boneless Chicken | `chickenRoast` | ✅ |
| `chicken-minced` | Chicken Minced | `chickenWholeAlt` | ⚠️ No minced chicken image |

**Available Chicken Images:**
```
Chicken  Breast.jpg                 up-chicken-leg-quarter.jpg
Kip goulash...jpg                   up-chicken-wings.jpg
product-chicken.jpg                 up-fried-chicken.jpg
raw chicken drumsticks 2.0.jpeg     up-roast-chicken.jpg
                                    up-whole-chicken.jpg
```

**Recommended Quick Fix for Chicken Breast:**
In `products.ts`, add:
```typescript
import chickenBreast from "@/assets/products/ButcheryProducts/Chicken/Chicken  Breast.jpg";
```
Then change the `chicken-breast` product's `image:` field to `chickenBreast`.

---

## 🍔 FAST FOOD Products — Image Map

**Current Imports (`src/lib/products.ts` lines 46–56):**

| Import Variable | File | Status |
|---|---|---|
| `ffBeefBurger` | `FastfoodProducts/ff-beef-burger.jpg` | ✅ |
| `ffChickenBurger` | `FastfoodProducts/ff-burger-combo.jpg` | ⚠️ Combo image used for chicken burger |
| `ffGrilledChicken` | `FastfoodProducts/ff-grilled-chicken.jpg` | ✅ |
| `ffFriedChicken` | `FastfoodProducts/ff-fried-chicken.jpg` | ✅ |
| `ffSausagesPlate` | `FastfoodProducts/ff-sausages.jpg` | ✅ |
| `ffShawarma` | `FastfoodProducts/ff-shawarma.jpg` | ✅ |
| `ffFries` | `FastfoodProducts/ff-fries.jpg` | ✅ |
| `ffBurgerCombo` | `FastfoodProducts/ff-burger-combo.jpg` | ✅ |
| `upPizza` | `FastfoodProducts/up-pizza.jpg` | ✅ |
| `griledSausages` | `FastfoodProducts/grilled sausages.jpg` | ✅ |

**Product → Image assignments:**

| Product ID | Product Name | Image Used | Notes |
|---|---|---|---|
| `ff-beef-burger` | Mwanainchi Beef Burger | `ffBeefBurger` | ✅ |
| `ff-chicken-burger` | Crispy Chicken Burger | `ffChickenBurger` → combo | ⚠️ No dedicated chicken burger image |
| `ff-burger-combo` | Burger & Chips Combo | `ffBurgerCombo` | ✅ |
| `ff-grilled-quarter` | Grilled Chicken Quarter | `ffGrilledChicken` | ✅ |
| `ff-fried-chicken` | Crispy Fried Chicken | `ffFriedChicken` | ✅ |
| `ff-shawarma` | Chicken Shawarma | `ffShawarma` | ✅ |
| `ff-nyama-platter` | Nyama Choma Platter | `goatFull` | ⚠️ Uses butchery goat image |
| `ff-fish-plate` | Whole Fried Fish | `tilapiaWhole` | ✅ |
| `ff-pizza` | Supreme Pizza | `upPizza` | ✅ |
| `ff-fries` | Masala Fries | `ffFries` | ✅ |
| `ff-sausage-plate` | Sausage & Chips | `ffSausagesPlate` | ✅ |
| `ff-chai` | Masala Chai | `chickenRoast` | ⚠️ Using roast chicken for tea! |
| `ff-dawa` | Hot Dawa | `chickenRoast` | ⚠️ Using roast chicken for dawa! |

**Available FastfoodProducts images:**
```
1kg Beef Bones Soup.jpg        Nyama Choma.jpg
African-Tea masala.png         Roast Pork.jpg
Cooked Beef Neck Bones.jpg     Roasted Pig.jpg
Deli Style Roast Beef...jpg    Samosa-1.png
Doner-Plate.png                Sandwiches.png
Doner-burger.png               Sausages.png
Grilled Beef Skewers...jpg     Shawarma.png
Grilled-Fish-Fillet.png        Tea.png               ← Use for chai/dawa!
How Long To Cook Corned Beef Brisket.jpg
IzzyCooking...jpg              Variety of Sodas.jpg
Mandazi.png                    beef stake choma.jpg
Mineral-water-purified.jpg     beef stew.jpg
black coffee.jpg               chapati.jpg
cock baridi.png                chips- beef.jpg
drinks-Fruity-Juice.jpg        ff-beef-burger.jpg
ff-burger-combo.jpg            ff-fried-chicken.jpg
ff-fries.jpg                   ff-grilled-chicken.jpg
ff-sausages.jpg                ff-shawarma.jpg
fried-drumsticks-kfcstyle.jpg  grilled sausages.jpg
hero-nyama.jpg                 product-sausage.jpg
rice chicken.jpg               roasted-grilled-chicken.jpg
roasted-lamb-goat leg.jpg      rosted-ribs.jpg
scones.jpg                     smoshawarma.jpg
up-pizza.jpg                   white coffee.jpg
whole-stew-fish-1.png
```

**Recommended Fix for Drinks:**
```typescript
// Add these imports in the FAST FOOD IMAGES section:
import ffTea from "@/assets/products/FastfoodProducts/Tea.png";
import ffCoffee from "@/assets/products/FastfoodProducts/black coffee.jpg";

// Then update products:
{ id: "ff-chai", ..., image: ffTea, ... }
{ id: "ff-dawa", ..., image: ffTea, ... }
```

---

## 🚨 Priority Fix List (Recommended)

These are the highest-impact image improvements, in order:

| Priority | Product ID | Current Problem | Fix |
|---|---|---|---|
| 🔴 HIGH | `ff-chai`, `ff-dawa` | Shows roast chicken photo for tea/drinks | Use `Tea.png` |
| 🔴 HIGH | `beef-liver` | Shows beef cube for liver | Use `Ox-Liver.png` |
| 🔴 HIGH | `beef-ribs` | Shows beef cube for ribs | Use `Beef-Ribs.png` |
| 🔴 HIGH | `beef-brisket` | Shows beef cube for brisket | Use `Beef-Brisket.png` |
| 🔴 HIGH | `beef-shank` | Shows beef cube for shank | Use `Beef Shank.jpg` |
| 🟡 MED | `chicken-breast` | Shows whole chicken for breast | Use `Chicken  Breast.jpg` |
| 🟡 MED | `goat-chops` | Uses generic goat-full for all goat | Use `Goat-Ribs.png` |
| 🟡 MED | `goat-shoulder` | Uses generic goat-full | Use `Goat_Shoulder.png` |
| 🟡 MED | `beef-fillet` | Uses rump steak image | Use `BEEF FILET WELLINGTON.jpg` |
| 🟢 LOW | `ff-nyama-platter` | Uses raw goat photo | Use `Nyama Choma.jpg` |
| 🟢 LOW | `beef-tripe` | Uses beef cube | Use `matumbo.jpg` |

---

## 🛠️ Making Multiple Changes at Once

Here's the **complete recommended import block** for `products.ts` (lines 1–56) with all best-match images:

```typescript
// ===== BEEF IMAGES =====
import beefSirloin from "@/assets/products/ButcheryProducts/Beef/Beef Rump Steak.jpg";
import beefRibEye from "@/assets/products/ButcheryProducts/Beef/BEEF FILET WELLINGTON.jpg";
import beefTBone from "@/assets/products/ButcheryProducts/Beef/T-Bone-Steak 1500.png";
import beefTopRump from "@/assets/products/ButcheryProducts/Beef/Beef Rump Steak.jpg";
import beefShank from "@/assets/products/ButcheryProducts/Beef/Beef Shank.jpg";
import beefBrisket from "@/assets/products/ButcheryProducts/Beef/Beef-Brisket.png";
import beefRibs from "@/assets/products/ButcheryProducts/Beef/Beef-Ribs.png";
import beefCube from "@/assets/products/ButcheryProducts/Beef/beef-cube.jpg";
import beefMince from "@/assets/products/ButcheryProducts/Beef/Beef-Mince-500g.jpg";
import beefMincePng from "@/assets/products/ButcheryProducts/Beef/beef-mince.png";
import oxLiver from "@/assets/products/ButcheryProducts/Beef/Ox-Liver.png";
import oxKidney from "@/assets/products/ButcheryProducts/Beef/Matumbo-liver-beef;meat-product.jpg";

// ===== GOAT/MUTTON IMAGES =====
import goatFull from "@/assets/products/ButcheryProducts/GoatLamb/goat-full.jpg";
import goatChops from "@/assets/products/ButcheryProducts/GoatLamb/Goat-Ribs.png";
import goatShoulder from "@/assets/products/ButcheryProducts/GoatLamb/Goat_Shoulder.png";
import goatShoulderLeg from "@/assets/products/ButcheryProducts/GoatLamb/Goat-Shoulder leg2.png";
import goatRibs from "@/assets/products/ButcheryProducts/GoatLamb/Goat-Ribs.png";
import goatSteak from "@/assets/products/ButcheryProducts/GoatLamb/goat steak.png";
import lambLeg from "@/assets/products/ButcheryProducts/GoatLamb/Lamb-Leg.png";
import lambRibs from "@/assets/products/ButcheryProducts/GoatLamb/Lamb-Ribs.png";
import goatCurry from "@/assets/products/ButcheryProducts/GoatLamb/Rich Goat Curry Cut.jpg";

// ===== PORK IMAGES =====
import porkShoulder from "@/assets/products/ButcheryProducts/Pork/up-pork-shoulder.jpg";
import porkRack from "@/assets/products/ButcheryProducts/Pork/up-pork-rack.jpg";
import porkCuts from "@/assets/products/ButcheryProducts/Pork/pork-cuts.jpg";
import porkTrotters from "@/assets/products/ButcheryProducts/Pork/pork-cuts.jpg";

// ===== FISH IMAGES =====
import tilapiaWhole from "@/assets/products/ButcheryProducts/Fish/up-tilapia.jpg";
import fishFillet from "@/assets/products/ButcheryProducts/Fish/up-tilapia.jpg";
import fishProduct from "@/assets/products/ButcheryProducts/Fish/Fish product.jpg";
import wholeStewFish from "@/assets/products/ButcheryProducts/Fish/Fish product.jpg";

// ===== CHICKEN IMAGES =====
import chickenWhole from "@/assets/products/ButcheryProducts/Chicken/up-whole-chicken.jpg";
import chickenRoast from "@/assets/products/ButcheryProducts/Chicken/up-roast-chicken.jpg";
import chickenWings from "@/assets/products/ButcheryProducts/Chicken/up-chicken-wings.jpg";
import chickenLegQuarter from "@/assets/products/ButcheryProducts/Chicken/up-chicken-leg-quarter.jpg";
import friedChickenUp from "@/assets/products/ButcheryProducts/Chicken/up-fried-chicken.jpg";
import chickenBreast from "@/assets/products/ButcheryProducts/Chicken/Chicken  Breast.jpg";

// ===== FAST FOOD IMAGES =====
import ffBeefBurger from "@/assets/products/FastfoodProducts/ff-beef-burger.jpg";
import ffChickenBurger from "@/assets/products/FastfoodProducts/ff-burger-combo.jpg";
import ffGrilledChicken from "@/assets/products/FastfoodProducts/ff-grilled-chicken.jpg";
import ffFriedChicken from "@/assets/products/FastfoodProducts/ff-fried-chicken.jpg";
import ffSausagesPlate from "@/assets/products/FastfoodProducts/ff-sausages.jpg";
import ffShawarma from "@/assets/products/FastfoodProducts/ff-shawarma.jpg";
import ffFries from "@/assets/products/FastfoodProducts/ff-fries.jpg";
import ffBurgerCombo from "@/assets/products/FastfoodProducts/ff-burger-combo.jpg";
import upPizza from "@/assets/products/FastfoodProducts/up-pizza.jpg";
import griledSausages from "@/assets/products/FastfoodProducts/grilled sausages.jpg";
import ffTea from "@/assets/products/FastfoodProducts/Tea.png";
import ffNyamaChoma from "@/assets/products/FastfoodProducts/Nyama Choma.jpg";
```

---

## 🚀 Dev Server

The development server runs with:
```bash
npm run dev
```
Available at: **http://localhost:8080/**

After saving changes to `products.ts`, Vite **auto-reloads** the page — no restart needed.

---

*Guide v1.0 — June 4, 2026*
