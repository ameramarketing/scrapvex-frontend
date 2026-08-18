// ScrapVex - Official 3D Scrap Item Realistic Illustrations
// Matches industry standard 3D illustrations for accurate scrap item visual recognition

const SCRAP_3D_IMAGES = {
  // Paper & Cardboard
  clothes:               "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011367526802287.png?alt=media",
  newspaper:             "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011200784124698.png?alt=media",
  office_paper:          "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011653636959338.png?alt=media",
  book:                  "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011515491136252.png?alt=media",
  cardboard:             "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774026057614643325.png?alt=media",

  // Plastics, Rubber & Glass
  plastic:               "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011577291840388.png?alt=media",
  mix_plastic:           "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Bucket/3D/bucket_3d.png",
  rubber_shoes:          "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Running%20shoe/3D/running_shoe_3d.png",
  tyre:                  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wheel/3D/wheel_3d.png",
  glass:                 "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011451213957731.png?alt=media",

  // Metals
  iron:                  "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774026230932117325.png?alt=media",
  steel:                 "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774946668951374498.png?alt=media",
  aluminum_can:          "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Canned%20food/3D/canned_food_3d.png",
  aluminum:              "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774692613048045928.png?alt=media",
  brass:                 "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774946957580843945.png?alt=media",
  copper:                "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774026436574343077.png?alt=media",

  // Large Appliances
  split_ac:              "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774943960326598944.png?alt=media",
  window_ac:             "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774026810689620195.png?alt=media",
  fridge_side_by_side:   "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F01c9e8bc-ded1-431f-913f-34afa695f5df_1781013110.png?alt=media",
  fridge_double_door:    "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774027350118535521.png?alt=media",
  fridge_single_door:    "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774027212453405996.png?alt=media",
  washing_front:         "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774026895545664683.png?alt=media",
  washing_top:           "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774027034556132247.png?alt=media",
  washing_semi:          "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774027131664797653.png?alt=media",
  microwave:             "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073197587493114.png?alt=media",
  fan_motor:             "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073112127227325.png?alt=media",
  cooler:                "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774027409091897303.png?alt=media",
  geyser:                "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774027368321434669.png?alt=media",

  // Small Appliances / E-Waste
  inverter:              "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073229020860513.png?alt=media",
  dvd_player:            "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Dvd/3D/dvd_3d.png",
  ups:                   "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073159759392848.png?alt=media",
  battery:               "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073296925281212.png?alt=media",
  gym_equipment:         "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Person%20lifting%20weights/Default/3D/person_lifting_weights_3d_default.png",
  laptop:                "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073405237128898.png?alt=media",
  cpu:                   "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073637546677937.png?alt=media",
  printer_tv:            "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774027510172307816.png?alt=media",
  crt_tv:                "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073068422953748.png?alt=media",
  android_phone:         "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Mobile%20phone/3D/mobile_phone_3d.png",
  simple_phone:          "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Telephone/3D/telephone_3d.png",
  tablet_phone:          "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1764049926724411440.png?alt=media",

  // Vehicles
  scooty:                "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1764049827441630287.png?alt=media",
  bike:                  "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073675871384639.png?alt=media",
  car:                   "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073720925830206.png?alt=media",

  // Default fallback
  default:               "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774026057614643325.png?alt=media"
};

export const getScrapItemImage = (name = "", category = "", itemImageUrl = null) => {
  // If a valid custom image URL is passed, return it
  if (itemImageUrl && typeof itemImageUrl === "string" && itemImageUrl.startsWith("http") && !itemImageUrl.includes("unsplash")) {
    return itemImageUrl;
  }

  const n = (name || "").toLowerCase().trim();
  const c = (category || "").toLowerCase().trim();

  // 1. Footwear & Shoes
  if (n.includes("shoe") || n.includes("joot") || n.includes("chappal") || n.includes("footwear")) {
    return SCRAP_3D_IMAGES.rubber_shoes;
  }

  // 2. Tyres / Wheels
  if (n.includes("tyre") || n.includes("tire") || n.includes("wheel")) {
    return SCRAP_3D_IMAGES.tyre;
  }

  // 3. Gym Equipment
  if (n.includes("gym") || n.includes("dumbbell") || n.includes("fitness") || n.includes("weight")) {
    return SCRAP_3D_IMAGES.gym_equipment;
  }

  // 4. Phones, Tablets & Mobiles
  if (n.includes("simple phone") || n.includes("basic phone") || n.includes("keypad") || n.includes("telephone") || n.includes("landline")) {
    return SCRAP_3D_IMAGES.simple_phone;
  }
  if (n.includes("android") || n.includes("smartphone")) {
    return SCRAP_3D_IMAGES.android_phone;
  }
  if (n.includes("tablet") || n.includes("ipad") || /\btab\b/.test(n)) {
    return SCRAP_3D_IMAGES.tablet_phone;
  }
  if (n.includes("phone") || n.includes("mobile")) {
    return SCRAP_3D_IMAGES.android_phone;
  }

  // 5. Paper & Cardboard
  if (n.includes("newspaper") || n.includes("raddi") || n.includes("akhbar")) return SCRAP_3D_IMAGES.newspaper;
  if (n.includes("cardboard") || n.includes("gatta") || n.includes("carton") || n.includes("card board")) return SCRAP_3D_IMAGES.cardboard;
  if (n.includes("book") || n.includes("copy") || n.includes("notebook") || n.includes("magazine")) return SCRAP_3D_IMAGES.book;
  if (n.includes("office paper") || n.includes("white paper") || n.includes("a4 paper") || n.includes("a3 paper") || (n.includes("paper") && !n.includes("newspaper"))) return SCRAP_3D_IMAGES.office_paper;

  // 6. Clothes & Garments (avoid matching 'clothes press')
  if ((n.includes("cloth") || n.includes("kapda") || n.includes("garment") || n.includes("textile") || n.includes("shirt")) && !n.includes("press") && !n.includes("iron")) return SCRAP_3D_IMAGES.clothes;

  // 7. Glass
  if (n.includes("glass") || n.includes("shisha")) return SCRAP_3D_IMAGES.glass;

  // 8. Aluminium Can / Tin Can / Soda Can
  if (n.includes("aluminium can") || n.includes("aluminum can") || n.includes("tin can") || n.includes("soda can") || n.includes("cold drink can") || (/\bcan\b/.test(n) && (n.includes("aluminium") || n.includes("aluminum") || n.includes("tin") || n.includes("drink")))) {
    return SCRAP_3D_IMAGES.aluminum_can;
  }

  // 9. Washing Machines (BEFORE any AC check)
  if (n.includes("front load") || n.includes("front-load")) return SCRAP_3D_IMAGES.washing_front;
  if (n.includes("top load") || n.includes("top-load")) return SCRAP_3D_IMAGES.washing_top;
  if (n.includes("semi auto") || n.includes("semi automatic") || n.includes("double drum")) return SCRAP_3D_IMAGES.washing_semi;
  if (n.includes("fully auto") || n.includes("fully automatic")) return SCRAP_3D_IMAGES.washing_top;
  if (n.includes("washing machine") || n.includes("washer") || n.includes("laundry")) return SCRAP_3D_IMAGES.washing_top;

  // 10. Large Appliances - AC, Fridge, Microwave
  if (n.includes("window ac") || n.includes("window / split") || n.includes("window ac / split") || n.includes("inverter window")) return SCRAP_3D_IMAGES.window_ac;
  if (/\bac\b/.test(n) || n.includes("air conditioner") || n.includes("split ac") || n.includes("indoor")) return SCRAP_3D_IMAGES.split_ac;

  if (n.includes("side by side") || n.includes("double door fridge") || n.includes("double door")) return SCRAP_3D_IMAGES.fridge_double_door;
  if (n.includes("single door") || n.includes("fridge") || n.includes("refrigerator") || n.includes("freezer")) return SCRAP_3D_IMAGES.fridge_single_door;

  if (n.includes("microwave") || n.includes("oven") || n.includes("otg")) return SCRAP_3D_IMAGES.microwave;

  // 11. Coolers & Desert Coolers (BEFORE generic motor check)
  if (n.includes("cooler")) return SCRAP_3D_IMAGES.cooler;

  // 12. Small Appliances
  if (n.includes("metal appliances heavy") || (n.includes("heavy") && n.includes("appliances")) || n.includes("stabiliser") || n.includes("stabilizer")) return SCRAP_3D_IMAGES.inverter;
  if (n.includes("metal appliances light") || n.includes("dvd") || n.includes("vcr") || n.includes("bluray") || n.includes("clothes press") || n.includes("set top box")) return SCRAP_3D_IMAGES.dvd_player;
  if (n.includes("metal appliances medium") || n.includes("ceiling fan") || n.includes("fan") || n.includes("motor") || n.includes("pump")) return SCRAP_3D_IMAGES.fan_motor;
  if (n.includes("plastic appliances") || n.includes("mixer") || n.includes("vaccum") || n.includes("induction")) return SCRAP_3D_IMAGES.cooler;
  if (n.includes("geyser") || n.includes("water heater")) return SCRAP_3D_IMAGES.geyser;
  if (/\bups\b/.test(n)) return SCRAP_3D_IMAGES.ups;

  // 13. Metals
  if (n.includes("copper") || n.includes("tamba") || n.includes("taamba")) return SCRAP_3D_IMAGES.copper;
  if (n.includes("brass") || n.includes("peetal") || n.includes("pital")) return SCRAP_3D_IMAGES.brass;
  if (n.includes("aluminium") || n.includes("aluminum")) return SCRAP_3D_IMAGES.aluminum;
  if (n.includes("steel") || n.includes("stainless") || n.includes("bartan")) return SCRAP_3D_IMAGES.steel;
  if (n.includes("iron")) return SCRAP_3D_IMAGES.iron;
  if (n.includes("tin") || n.includes("lead") || n.includes("zinc")) return SCRAP_3D_IMAGES.iron;

  // 14. Plastics & Buckets
  if (n.includes("mix plastic") || n.includes("bucket") || n.includes("balti")) return SCRAP_3D_IMAGES.mix_plastic;
  if (n.includes("pet bottle") || n.includes("pet bottles") || n.includes("plastic") || n.includes("bottle") || n.includes("drum") || n.includes("poly") || n.includes("fiber")) return SCRAP_3D_IMAGES.plastic;

  // 15. Electronics & E-Waste
  if (n.includes("battery") || n.includes("inverter battery") || n.includes("car battery")) return SCRAP_3D_IMAGES.battery;
  if (n.includes("inverter")) return SCRAP_3D_IMAGES.inverter;
  if (n.includes("laptop") || n.includes("macbook") || n.includes("notebook")) return SCRAP_3D_IMAGES.laptop;
  if (n.includes("cpu") || n.includes("computer cpu") || n.includes("desktop tower")) return SCRAP_3D_IMAGES.cpu;
  if (n.includes("crt tv") || n.includes("old tv") || n.includes("box tv")) return SCRAP_3D_IMAGES.crt_tv;
  if (n.includes("crt monitor") || (n.includes("monitor") && n.includes("crt"))) return SCRAP_3D_IMAGES.crt_tv;
  if (n.includes("tv") || n.includes("television") || n.includes("led") || n.includes("lcd") || n.includes("monitor") || n.includes("printer") || n.includes("scanner") || n.includes("fax")) return SCRAP_3D_IMAGES.printer_tv;

  // 16. Vehicles
  if (n.includes("scooty") || n.includes("scooter") || n.includes("activa") || n.includes("jupiter")) return SCRAP_3D_IMAGES.scooty;
  if (n.includes("bike") || n.includes("motorcycle") || n.includes("splendor") || n.includes("pulsar") || n.includes("bullet")) return SCRAP_3D_IMAGES.bike;
  if (n.includes("car") || n.includes("gaddi") || n.includes("vehicle") || n.includes("auto") || n.includes("truck") || n.includes("van") || n.includes("jeeto")) return SCRAP_3D_IMAGES.car;

  // Category fallback
  if (c.includes("paper")) return SCRAP_3D_IMAGES.office_paper;
  if (c.includes("plastic")) return SCRAP_3D_IMAGES.plastic;
  if (c.includes("metal")) return SCRAP_3D_IMAGES.iron;
  if (c.includes("vehicle")) return SCRAP_3D_IMAGES.car;
  if (c.includes("ewaste") || c.includes("e-waste") || c.includes("it")) return SCRAP_3D_IMAGES.printer_tv;
  if (c.includes("appliance")) return SCRAP_3D_IMAGES.cooler;

  return SCRAP_3D_IMAGES.default;
};
