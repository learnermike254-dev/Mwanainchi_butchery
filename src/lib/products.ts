// ===== BEEF IMAGES =====
import beefFillet from "@/assets/products/ButcheryProducts/Beef/BEEF FILET WELLINGTON.jpg";
import beefSirloin from "@/assets/products/ButcheryProducts/Beef/Beef Rump Steak.jpg";
import beefRump from "@/assets/products/ButcheryProducts/Beef/Beef Rump Steak.jpg";
import beefTopRump from "@/assets/products/ButcheryProducts/Beef/Top-Rump 1500.png";
import beefChuck from "@/assets/products/ButcheryProducts/Beef/Chuck-off-bone.png";
import beefShoulder from "@/assets/products/ButcheryProducts/Beef/beef-preview.png";
import beefRound from "@/assets/products/ButcheryProducts/Beef/Silverside.png";
import beefShank from "@/assets/products/ButcheryProducts/Beef/Beef Shank.jpg";
import beefBrisket from "@/assets/products/ButcheryProducts/Beef/Beef-Brisket.png";
import beefRibs from "@/assets/products/ButcheryProducts/Beef/Beef-Ribs.png";
import beefCube from "@/assets/products/ButcheryProducts/Beef/beef-cube.jpg";
import beefMince from "@/assets/products/ButcheryProducts/Beef/Beef-Mince-500g.jpg";
import beefOxtail from "@/assets/products/ButcheryProducts/Beef/Ox-Heart.png";
import beefLegRoast from "@/assets/products/ButcheryProducts/Beef/beef-live-product-display.jpg";
import beefTBone from "@/assets/products/ButcheryProducts/Beef/T-Bone-Steak 1500.png";
import beefSoupBones from "@/assets/products/ButcheryProducts/Beef/Bones-for-soup-product.jpg";
import beefMarrow from "@/assets/products/ButcheryProducts/Beef/Smoked Bone Marrow Recipe.jpg";
import beefNeck from "@/assets/products/ButcheryProducts/Beef/Beef Neck.jpg";
import oxLiver from "@/assets/products/ButcheryProducts/Beef/Ox-Liver.png";
import oxKidney from "@/assets/products/ButcheryProducts/Beef/Matumbo-liver-beef;meat-product.jpg";
import beefTripe from "@/assets/products/ButcheryProducts/Beef/matumbo.jpg";

// ===== GOAT/MUTTON IMAGES =====
import goatFull from "@/assets/products/ButcheryProducts/GoatLamb/goat-full.jpg";
import goatChops from "@/assets/products/ButcheryProducts/GoatLamb/Goat-Ribs.png";
import goatShoulder from "@/assets/products/ButcheryProducts/GoatLamb/Goat_Shoulder.png";
import goatRibs from "@/assets/products/ButcheryProducts/GoatLamb/Goat-Ribs.png";
import goatSteak from "@/assets/products/ButcheryProducts/GoatLamb/goat steak.png";
import goatRack from "@/assets/products/ButcheryProducts/GoatLamb/Lamb-Loin.png";
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
import chickenBreast from "@/assets/products/ButcheryProducts/Chicken/Chicken  Breast.jpg";
import friedChickenUp from "@/assets/products/ButcheryProducts/Chicken/up-fried-chicken.jpg";

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

export type Category =
  | "beef"
  | "mutton"
  | "pork"
  | "fish"
  | "chicken"
  | "fastfood"
  // legacy / fast-food sub-categories used by FastFood items
  | "burgers"
  | "grills"
  | "sides"
  | "drinks"
  | "sausages"
  | "offal";

export type SubCategory =
  | "more-heat"
  | "medium-heat"
  | "easy"
  | "roast"
  | "soup";

export type ProductKind = "meat" | "fastfood";

export type Product = {
  id: string;
  name: string;
  swahili: string;
  category: Category;
  subCategory?: SubCategory;
  kind?: ProductKind;
  pricePerKg: number;
  priceLabel?: string; // optional override e.g. "Ask for price"
  unit: "kg" | "piece" | "plate" | "cup";
  image: string;
  blurb: string;
  prep: string[];
  badge?: "Best Seller" | "New" | "Low Stock" | "Fresh Today" | "Hot" | "Chef's Pick";
  cuts?: { label: string; swahili: string; price: number }[];
};

// ===== TOP-LEVEL CATEGORIES (carousel + menu tabs) =====
export const topCategories: { id: Category; label: string; emoji: string; gradient: string; image: string; tagline: string }[] = [
  { id: "beef", label: "Beef", emoji: "🥩", gradient: "from-[#fde4dc] to-[#f5b8a8]", image: beefSirloin, tagline: "Hand-cut steaks, ribs & mince" },
  { id: "mutton", label: "Goat / Lamb", emoji: "🐐", gradient: "from-[#f1e3d1] to-[#d8b894]", image: goatChops, tagline: "Choma-ready chops & whole legs" },
  { id: "pork", label: "Pork", emoji: "🐖", gradient: "from-[#fde5e5] to-[#f1b8b8]", image: porkRack, tagline: "Belly, ribs, chops & sausages" },
  { id: "fish", label: "Fish", emoji: "🐟", gradient: "from-[#dceffb] to-[#9ec8e8]", image: tilapiaWhole, tagline: "Fresh tilapia, perch & omena" },
  { id: "chicken", label: "Chicken", emoji: "🍗", gradient: "from-[#fff0c2] to-[#f3c873]", image: chickenRoast, tagline: "Whole, wings, drumsticks & more" },
  { id: "fastfood", label: "Fast Food", emoji: "🍔", gradient: "from-[#ffe2c2] to-[#f5a55a]", image: ffBurgerCombo, tagline: "Burgers, choma platters & sides" },
];

// Cooking sub-categories for butchery items
export const cookingSubCategories: { id: SubCategory; label: string; icon: string; blurb: string }[] = [
  { id: "more-heat", label: "More Heat to Cook", icon: "🔥", blurb: "Tougher cuts — slow & low for deep flavour." },
  { id: "medium-heat", label: "Medium Heat", icon: "♨️", blurb: "Versatile cuts for stews, braises & pan-cooks." },
  { id: "easy", label: "Easy to Cook", icon: "⏱", blurb: "Tender, quick-cook cuts for steaks & stir-fry." },
  { id: "roast", label: "Roast", icon: "🍖", blurb: "Oven or open-fire roasting joints." },
  { id: "soup", label: "Chemsha / Soup", icon: "🍲", blurb: "Bones, marrow & offals for soulful broth." },
];

export const products: Product[] = [
  // ===== BEEF =====
  { id: "beef-fillet", name: "Beef Fillet", swahili: "Fillet ya Ng'ombe", category: "beef", subCategory: "easy", pricePerKg: 1200, unit: "kg", image: beefFillet, blurb: "Premium tender fillet — searing perfection.", prep: ["Sear 2 min/side.", "Rest 5 min."], badge: "Chef's Pick" },
  { id: "beef-sirloin", name: "Sirloin Steak", swahili: "Sirloin ya Ng'ombe", category: "beef", subCategory: "easy", pricePerKg: 950, unit: "kg", image: beefSirloin, blurb: "Juicy, marbled sirloin for the grill.", prep: ["Salt generously.", "Grill 3 min/side."], badge: "Best Seller" },
  { id: "beef-rump", name: "Rump Steak", swahili: "Rump", category: "beef", subCategory: "easy", pricePerKg: 850, unit: "kg", image: beefRump, blurb: "Bold, beefy flavour at a friendly price.", prep: ["Hot pan, 3 min/side."] },
  { id: "beef-chuck", name: "Chuck", swahili: "Chuck", category: "beef", subCategory: "medium-heat", pricePerKg: 750, unit: "kg", image: beefChuck, blurb: "Stew-friendly chuck with rich marbling.", prep: ["Cube, brown, simmer 90 min."] },
  { id: "beef-shoulder", name: "Beef Shoulder", swahili: "Bega ya Ng'ombe", category: "beef", subCategory: "medium-heat", pricePerKg: 720, unit: "kg", image: beefShoulder, blurb: "Great for braises and pot roasts.", prep: ["Brown, braise 2 hrs."] },
  { id: "beef-round", name: "Round", swahili: "Round", category: "beef", subCategory: "medium-heat", pricePerKg: 700, unit: "kg", image: beefRound, blurb: "Lean round cut for slow-cooked dishes.", prep: ["Slow cook 2+ hrs."] },
  { id: "beef-mince", name: "Beef Mince", swahili: "Nyama ya Kusaga", category: "beef", subCategory: "medium-heat", pricePerKg: 700, unit: "kg", image: beefMince, blurb: "Freshly ground lean beef — kima, burgers, samosas.", prep: ["Brown with onions.", "Simmer 12 min."] },
  { id: "beef-shank", name: "Beef Shank", swahili: "Mguu wa Ng'ombe", category: "beef", subCategory: "more-heat", pricePerKg: 600, unit: "kg", image: beefShank, blurb: "Collagen-rich shank — slow cook until falling apart.", prep: ["Braise 3+ hrs."] },
  { id: "beef-oxtail", name: "Oxtail", swahili: "Mkia wa Ng'ombe", category: "beef", subCategory: "more-heat", pricePerKg: 850, unit: "kg", image: beefOxtail, blurb: "Rich, gelatinous oxtail for legendary stews.", prep: ["Brown, braise 3 hrs."], badge: "Chef's Pick" },
  { id: "beef-brisket", name: "Brisket", swahili: "Kifua cha Ng'ombe", category: "beef", subCategory: "more-heat", pricePerKg: 780, unit: "kg", image: beefBrisket, blurb: "BBQ classic — low and slow for smoky tenderness.", prep: ["Smoke or oven 4+ hrs."] },
  { id: "beef-ribs", name: "Beef Ribs", swahili: "Mbavu za Ng'ombe", category: "beef", subCategory: "more-heat", pricePerKg: 750, unit: "kg", image: beefRibs, blurb: "Meaty bone-in ribs for low-and-slow glory.", prep: ["Rub overnight.", "Slow grill 90 min."] },
  { id: "beef-leg-roast", name: "Whole Beef Leg (Roast)", swahili: "Mguu Mzima", category: "beef", subCategory: "roast", pricePerKg: 820, unit: "kg", image: beefLegRoast, blurb: "Showstopper roast for big gatherings.", prep: ["Marinate overnight.", "Roast slow."] },
  { id: "beef-loin-roast", name: "Beef Loin Roast", swahili: "Loin", category: "beef", subCategory: "roast", pricePerKg: 900, unit: "kg", image: beefTBone, blurb: "Premium loin joint for oven roasting.", prep: ["Sear, roast at 180°C."] },
  { id: "beef-soup-bones", name: "Beef Soup Bones", swahili: "Mifupa ya Supu", category: "beef", subCategory: "soup", pricePerKg: 300, unit: "kg", image: beefSoupBones, blurb: "Marrow bones — the soul of a slow Sunday broth.", prep: ["Roast 30 min.", "Simmer 3+ hrs."] },
  { id: "beef-marrow", name: "Beef Marrow Bones", swahili: "Uboho", category: "beef", subCategory: "soup", pricePerKg: 350, unit: "kg", image: beefMarrow, blurb: "Rich marrow — roast or simmer into broth.", prep: ["Roast 25 min.", "Scoop & spread."] },
  { id: "beef-neck", name: "Beef Neck", swahili: "Shingo", category: "beef", subCategory: "soup", pricePerKg: 450, unit: "kg", image: beefNeck, blurb: "Flavour-packed neck for hearty soups.", prep: ["Simmer 2 hrs."] },
  { id: "beef-liver", name: "Beef Liver", swahili: "Ini ya Ng'ombe", category: "beef", subCategory: "soup", pricePerKg: 500, unit: "kg", image: oxLiver, blurb: "Fresh, iron-rich liver — pan-fried in minutes.", prep: ["Slice thin.", "Pan-fry with onion."] },
  { id: "ox-kidney", name: "Ox Kidney", swahili: "Figo ya Ng'ombe", category: "beef", subCategory: "soup", pricePerKg: 450, unit: "kg", image: oxKidney, blurb: "Cleaned, mild-flavoured kidney.", prep: ["Soak in milk.", "Sear hot."], badge: "New" },
  { id: "beef-tripe", name: "Beef Tripe (Matumbo)", swahili: "Matumbo", category: "beef", subCategory: "soup", pricePerKg: 400, unit: "kg", image: beefTripe, blurb: "Cleaned, tender tripe — for legendary matumbo.", prep: ["Boil 90 min.", "Fry with onion."] },

  // ===== GOAT / LAMB =====
  { id: "goat-fillet", name: "Goat Fillet", swahili: "Fillet ya Mbuzi", category: "mutton", subCategory: "easy", pricePerKg: 1100, unit: "kg", image: goatSteak, blurb: "Tender goat fillet — quick to sear.", prep: ["Sear 2 min/side."], badge: "Chef's Pick" },
  { id: "goat-chops", name: "Goat Chops", swahili: "Mbuzi Choma", category: "mutton", subCategory: "easy", pricePerKg: 950, unit: "kg", image: goatChops, blurb: "Hand-cut chops made for open flame.", prep: ["Marinate 2 hrs.", "Grill 5 min/side."] },
  { id: "goat-shoulder", name: "Goat Shoulder", swahili: "Bega ya Mbuzi", category: "mutton", subCategory: "medium-heat", pricePerKg: 850, unit: "kg", image: goatShoulder, blurb: "Braise-ready shoulder with deep flavour.", prep: ["Braise 2 hrs."] },
  { id: "goat-stew-cut", name: "Goat Stew Cubes", swahili: "Mbuzi ya Stew", category: "mutton", subCategory: "medium-heat", pricePerKg: 880, unit: "kg", image: goatCurry, blurb: "Boneless cubes ready for the pot.", prep: ["Brown, simmer 90 min."] },
  { id: "goat-shank", name: "Goat Shank", swahili: "Mguu wa Mbuzi", category: "mutton", subCategory: "more-heat", pricePerKg: 800, unit: "kg", image: goatRibs, blurb: "Slow-braised shank — falls off the bone.", prep: ["Braise 3 hrs."] },
  { id: "goat-ribs", name: "Goat Ribs", swahili: "Mbavu za Mbuzi", category: "mutton", subCategory: "more-heat", pricePerKg: 900, unit: "kg", image: goatRibs, blurb: "Bone-in goat ribs for the choma jiko.", prep: ["Rub & sear hot."], badge: "Best Seller" },
  { id: "goat-leg-roast", name: "Whole Goat Leg", swahili: "Mguu Mzima wa Mbuzi", category: "mutton", subCategory: "roast", pricePerKg: 950, unit: "kg", image: lambLeg, blurb: "Roast-ready whole leg for celebrations.", prep: ["Marinate overnight.", "Roast slow."] },
  { id: "goat-rack-roast", name: "Goat Rack", swahili: "Rack ya Mbuzi", category: "mutton", subCategory: "roast", pricePerKg: 1050, unit: "kg", image: goatRack, blurb: "Frenched rack — restaurant-style.", prep: ["Sear, roast 20 min."] },
  { id: "goat-soup-bones", name: "Goat Soup Bones", swahili: "Mifupa ya Mbuzi", category: "mutton", subCategory: "soup", pricePerKg: 400, unit: "kg", image: lambRibs, blurb: "Flavour-rich bones for a deep broth.", prep: ["Simmer 3 hrs."] },
  { id: "goat-liver", name: "Goat Liver", swahili: "Ini ya Mbuzi", category: "mutton", subCategory: "soup", pricePerKg: 600, unit: "kg", image: goatFull, blurb: "Delicate, mineral-rich goat liver.", prep: ["Slice thin.", "Hot pan 90 sec/side."] },
  { id: "goat-matumbo", name: "Goat Matumbo", swahili: "Matumbo ya Mbuzi", category: "mutton", subCategory: "soup", pricePerKg: 500, unit: "kg", image: goatFull, blurb: "Cleaned goat tripe for the choma side.", prep: ["Boil tender.", "Fry crisp."] },

  // ===== PORK =====
  { id: "pork-loin", name: "Pork Loin", swahili: "Loin ya Nguruwe", category: "pork", subCategory: "easy", pricePerKg: 800, unit: "kg", image: porkCuts, blurb: "Lean, tender loin — quick to cook.", prep: ["Sear 3 min/side."] },
  { id: "pork-chops", name: "Pork Chops", swahili: "Mbavu za Nguruwe", category: "pork", subCategory: "easy", pricePerKg: 750, unit: "kg", image: porkCuts, blurb: "Thick juicy chops with a rim of fat.", prep: ["Brine 1 hr.", "Sear 4 min/side."] },
  { id: "pork-shoulder", name: "Pork Shoulder", swahili: "Bega ya Nguruwe", category: "pork", subCategory: "medium-heat", pricePerKg: 700, unit: "kg", image: porkShoulder, blurb: "Braise-ready shoulder, fork-tender.", prep: ["Braise 3 hrs."] },
  { id: "pork-belly", name: "Pork Belly", swahili: "Tumbo la Nguruwe", category: "pork", subCategory: "medium-heat", pricePerKg: 820, unit: "kg", image: porkCuts, blurb: "Layers of fat & meat — crispy skin perfection.", prep: ["Score skin.", "Roast slow then high."], badge: "Best Seller" },
  { id: "pork-ribs", name: "Pork Ribs", swahili: "Mbavu za Nguruwe", category: "pork", subCategory: "more-heat", pricePerKg: 700, unit: "kg", image: porkRack, blurb: "Meaty pork ribs ready for BBQ glory.", prep: ["Rub overnight.", "Slow roast 2 hrs."] },
  { id: "pork-trotters", name: "Pork Trotters", swahili: "Miguu ya Nguruwe", category: "pork", subCategory: "more-heat", pricePerKg: 500, unit: "kg", image: porkTrotters, blurb: "Collagen-rich trotters — slow braise heaven.", prep: ["Simmer 3 hrs."] },
  { id: "pork-leg-roast", name: "Pork Leg Roast", swahili: "Mguu wa Kuoka", category: "pork", subCategory: "roast", pricePerKg: 780, unit: "kg", image: porkShoulder, blurb: "Whole leg roast with crackling skin.", prep: ["Roast slow, crisp high."] },
  { id: "pork-loin-roast", name: "Pork Loin Roast", swahili: "Loin Roast", category: "pork", subCategory: "roast", pricePerKg: 820, unit: "kg", image: porkCuts, blurb: "Lean loin joint for Sunday roast.", prep: ["Roast at 180°C."] },
  { id: "pork-soup-bones", name: "Pork Soup Bones", swahili: "Mifupa ya Nguruwe", category: "pork", subCategory: "soup", pricePerKg: 280, unit: "kg", image: porkCuts, blurb: "Bones for rich, savoury broths.", prep: ["Simmer 3 hrs."] },
  { id: "pork-sausages", name: "Pork Sausages", swahili: "Soseji za Nguruwe", category: "pork", subCategory: "easy", pricePerKg: 650, unit: "kg", image: griledSausages, blurb: "House-made pork sausages — breakfast champions.", prep: ["Pan-fry 8 min."], badge: "New" },

  // ===== FISH =====
  { id: "fish-tilapia-whole", name: "Whole Tilapia", swahili: "Tilapia Mzima", category: "fish", pricePerKg: 0, unit: "kg", image: tilapiaWhole, blurb: "Fresh whole tilapia from the lake — cleaned & ready.", prep: ["Score, season, fry or grill."], badge: "Fresh Today", cuts: [{ label: "Whole Tilapia", swahili: "Tilapia Mzima", price: 650 }] },
  { id: "fish-tilapia-fillet", name: "Tilapia Fillet", swahili: "Fillet ya Tilapia", category: "fish", pricePerKg: 0, unit: "kg", image: fishFillet, blurb: "Boneless tilapia fillets — quick & easy.", prep: ["Pan-fry 3 min/side."], cuts: [{ label: "Tilapia Fillet", swahili: "Fillet ya Tilapia", price: 850 }] },
  { id: "fish-nile-perch", name: "Nile Perch", swahili: "Mbuta", category: "fish", pricePerKg: 0, unit: "kg", image: fishProduct, blurb: "Firm, meaty nile perch — grilled or fried.", prep: ["Grill or pan-sear."], cuts: [{ label: "Whole Nile Perch", swahili: "Mbuta Mzima", price: 750 }] },
  { id: "fish-omena", name: "Omena (Dagaa)", swahili: "Omena", category: "fish", pricePerKg: 0, unit: "kg", image: wholeStewFish, blurb: "Sun-dried small fish — protein powerhouse.", prep: ["Fry with onion & tomato."], cuts: [{ label: "Omena 500g", swahili: "Omena", price: 200 }] },

  // ===== CHICKEN — cut-based pricing =====
  { id: "chicken-full-coupon", name: "Full Coupon", swahili: "Kuku Nzima", category: "chicken", pricePerKg: 0, unit: "kg", image: chickenWhole, blurb: "Whole dressed chicken — Sunday classic.", prep: ["Marinate overnight.", "Roast or stew."], badge: "Best Seller", cuts: [{ label: "Whole Chicken Coupon", swahili: "Kuku Mzima", price: 1300 }, { label: "Half Chicken", swahili: "Nusu Kuku", price: 680 }] },
  { id: "chicken-wings", name: "Chicken Wings", swahili: "Mabawa ya Kuku", category: "chicken", pricePerKg: 0, unit: "kg", image: chickenWings, blurb: "Sticky, smoky, addictive wings.", prep: ["Bake 25 min.", "Toss in sauce."], cuts: [{ label: "Wings (6 pcs)", swahili: "Mabawa 6", price: 340 }, { label: "Wings (12 pcs)", swahili: "Mabawa 12", price: 650 }] },
  { id: "chicken-thighs", name: "Chicken Thighs", swahili: "Mapaja ya Kuku", category: "chicken", pricePerKg: 0, unit: "kg", image: chickenLegQuarter, blurb: "Juicy bone-in thighs — fool-proof.", prep: ["Score skin.", "Grill 6 min/side."], cuts: [{ label: "Thighs (2 pcs)", swahili: "Mapaja 2", price: 450 }, { label: "Thighs (4 pcs)", swahili: "Mapaja 4", price: 870 }] },
  { id: "chicken-drumstick", name: "Drumsticks", swahili: "Miguu ya Kuku", category: "chicken", pricePerKg: 0, unit: "kg", image: chickenLegQuarter, blurb: "Juicy bone-in drumsticks — kids' favourite.", prep: ["Marinate 1 hr.", "Grill 6 min/side."], cuts: [{ label: "Drumsticks (2 pcs)", swahili: "Miguu 2", price: 380 }, { label: "Drumsticks (4 pcs)", swahili: "Miguu 4", price: 720 }] },
  { id: "chicken-breast", name: "Chicken Breast", swahili: "Kifua cha Kuku", category: "chicken", pricePerKg: 0, unit: "kg", image: chickenBreast, blurb: "Lean, boneless breasts — quick-grilling.", prep: ["Pound even.", "Grill 4 min/side."], badge: "Chef's Pick", cuts: [{ label: "Breast (1 pc)", swahili: "Kifua 1", price: 320 }, { label: "Breast (2 pcs)", swahili: "Vifua 2", price: 600 }] },
  { id: "chicken-boneless", name: "Boneless Chicken", swahili: "Kuku Bila Mifupa", category: "chicken", pricePerKg: 0, unit: "kg", image: chickenRoast, blurb: "All-boneless chicken — stir-fry & curry ready.", prep: ["Cube.", "Stir-fry 6 min."], cuts: [{ label: "500g pack", swahili: "Pakiti 500g", price: 480 }, { label: "1kg pack", swahili: "Pakiti 1kg", price: 900 }] },
  { id: "chicken-minced", name: "Chicken Minced", swahili: "Kuku ya Kusaga", category: "chicken", pricePerKg: 0, priceLabel: "Ask for price", unit: "kg", image: chickenWhole, blurb: "Freshly minced chicken — burgers, kima, samosas.", prep: ["Brown with onions."], cuts: [{ label: "500g", swahili: "Gramu 500", price: 420 }, { label: "1kg", swahili: "Kilo 1", price: 800 }] },
];

export const fastFood: Product[] = [
  { id: "ff-beef-burger", name: "Mwanainchi Beef Burger", swahili: "Bega ya Ng'ombe", category: "burgers", kind: "fastfood", pricePerKg: 450, unit: "piece", image: ffBeefBurger, blurb: "150g house patty, cheddar, caramelised onions, brioche bun.", prep: ["Served with fries."], badge: "Best Seller" },
  { id: "ff-chicken-burger", name: "Crispy Chicken Burger", swahili: "Bega ya Kuku", category: "burgers", kind: "fastfood", pricePerKg: 420, unit: "piece", image: ffChickenBurger, blurb: "Buttermilk-fried thigh, slaw, spicy mayo, sesame bun.", prep: ["With masala fries."] },
  { id: "ff-burger-combo", name: "Burger & Chips Combo", swahili: "Bega na Chipo", category: "burgers", kind: "fastfood", pricePerKg: 600, unit: "plate", image: ffBurgerCombo, blurb: "House beef burger + golden seasoned fries.", prep: ["Served on a board."], badge: "Chef's Pick" },
  { id: "ff-grilled-quarter", name: "Grilled Chicken Quarter", swahili: "Kuku wa Kuchoma", category: "grills", kind: "fastfood", pricePerKg: 550, unit: "plate", image: ffGrilledChicken, blurb: "Charcoal-grilled with kachumbari & ugali or chips.", prep: ["12-hr marinade."], badge: "Hot" },
  { id: "ff-fried-chicken", name: "Crispy Fried Chicken", swahili: "Kuku wa Kukaanga", category: "grills", kind: "fastfood", pricePerKg: 480, unit: "plate", image: ffFriedChicken, blurb: "Golden shatter-crisp drumsticks — secret batter.", prep: ["With fries & dip."], badge: "Best Seller" },
  { id: "ff-shawarma", name: "Chicken Shawarma Wrap", swahili: "Shawarma ya Kuku", category: "grills", kind: "fastfood", pricePerKg: 380, unit: "piece", image: ffShawarma, blurb: "Spiced chicken, garlic sauce, rocket, soft tortilla.", prep: ["Toasted golden."], badge: "New" },
  { id: "ff-nyama-platter", name: "Nyama Choma Platter", swahili: "Sahani ya Nyama", category: "grills", kind: "fastfood", pricePerKg: 1450, unit: "plate", image: ffNyamaChoma, blurb: "½ kg mixed goat & beef, kachumbari, ugali — feeds two.", prep: ["Hardwood charcoal."], badge: "Best Seller" },
  { id: "ff-fish-plate", name: "Whole Fried Fish", swahili: "Samaki Mzima", category: "grills", kind: "fastfood", pricePerKg: 650, unit: "plate", image: tilapiaWhole, blurb: "Whole tilapia deep-fried crisp, ugali & kachumbari.", prep: ["Fresh daily."] },
  { id: "ff-pizza", name: "Mwanainchi Supreme Pizza", swahili: "Pizza ya Mwanainchi", category: "grills", kind: "fastfood", pricePerKg: 950, unit: "piece", image: upPizza, blurb: "Wood-fired crust, chicken, pepperoni, olives, fresh tomato & mozzarella.", prep: ["Baked to order."], badge: "New" },
  { id: "ff-fries", name: "Masala Fries", swahili: "Chipo Masala", category: "sides", kind: "fastfood", pricePerKg: 200, unit: "plate", image: ffFries, blurb: "Crispy fries with our signature pilau masala.", prep: ["Double-fried."] },
  { id: "ff-sausage-plate", name: "Sausage & Chips", swahili: "Soseji na Chipo", category: "sides", kind: "fastfood", pricePerKg: 350, unit: "plate", image: ffSausagesPlate, blurb: "Two house beef sausages, chips, kachumbari.", prep: ["Pan-grilled."] },
  { id: "ff-chai", name: "Masala Chai", swahili: "Chai ya Masala", category: "drinks", kind: "fastfood", pricePerKg: 80, unit: "cup", image: ffTea, blurb: "Hot spiced tea — ginger, cardamom, creamy milk.", prep: ["Served piping hot."] },
  { id: "ff-dawa", name: "Hot Dawa", swahili: "Dawa Moto", category: "drinks", kind: "fastfood", pricePerKg: 150, unit: "cup", image: ffTea, blurb: "Honey, lemon, ginger — perfect after choma.", prep: ["Brewed fresh."] },
];

export const allItems: Product[] = [...products, ...fastFood];

// Legacy exports kept for any other page references
export const categories: { id: Category | "all"; label: string; sw: string }[] = [
  { id: "all", label: "All", sw: "Zote" },
  { id: "beef", label: "Beef", sw: "Ng'ombe" },
  { id: "chicken", label: "Chicken", sw: "Kuku" },
  { id: "pork", label: "Pork", sw: "Nguruwe" },
  { id: "mutton", label: "Goat & Mutton", sw: "Mbuzi" },
  { id: "fish", label: "Fish", sw: "Samaki" },
];

export const fastFoodCategories: { id: Category | "all"; label: string; sw: string }[] = [
  { id: "all", label: "All", sw: "Zote" },
  { id: "burgers", label: "Burgers", sw: "Mabega" },
  { id: "grills", label: "Grills & Platters", sw: "Choma" },
  { id: "sides", label: "Sides", sw: "Vyakula" },
  { id: "drinks", label: "Hot Drinks", sw: "Vinywaji" },
];

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

export const priceDisplay = (p: Product) => {
  if (p.priceLabel) return p.priceLabel;
  if (p.kind === "fastfood") return formatKES(p.pricePerKg);
  return `${formatKES(p.pricePerKg)} / Kg`;
};

export const WHATSAPP_NUMBER = "254748471264";
export const waOrderLink = (itemName?: string) => {
  const msg = itemName
    ? `Hi Mwanainchi! I'd like to place an order for ${itemName}.`
    : `Hi Mwanainchi! I'd like to place an order.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
};
