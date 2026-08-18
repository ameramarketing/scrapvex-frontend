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
  aluminum_can:          "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2Fe401bcd4-5d9e-4344-9f0c-2144cf251c31_1777451511.jpeg?alt=media",
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

  // 1. SPECIFIC ITEM NAME MATCHES (Priority over category)

  // Footwear & Shoes
  if (n.includes("shoe") || n.includes("joot") || n.includes("chappal") || n.includes("footwear") || n.includes("rubber shoes") || n.includes("rubber / shoes")) {
    return SCRAP_3D_IMAGES.rubber_shoes;
  }

  // Tyres / Wheels
  if (n.includes("tyre") || n.includes("tire") || n.includes("wheel")) {
    return SCRAP_3D_IMAGES.tyre;
  }

  // Gym Equipment
  if (n.includes("gym") || n.includes("dumbbell") || n.includes("weight") || n.includes("exercise") || n.includes("fitness")) {
    return SCRAP_3D_IMAGES.gym_equipment;
  }

  // Mix Plastic / Bucket
  if (n.includes("mix plastic") || n.includes("bucket") || n.includes("balti")) {
    return SCRAP_3D_IMAGES.mix_plastic;
  }

  // Phones & Mobiles
  if (n.includes("android") || n.includes("smartphone")) {
    return SCRAP_3D_IMAGES.android_phone;
  }
  if (n.includes("simple phone") || n.includes("basic phone") || n.includes("keypad") || n.includes("telephone") || n.includes("landline")) {
    return SCRAP_3D_IMAGES.simple_phone;
  }
  if (n.includes("tablet") || n.includes("ipad") || n.includes("tab")) {
    return SCRAP_3D_IMAGES.tablet_phone;
  }
  if (n.includes("phone") || n.includes("mobile")) {
    return SCRAP_3D_IMAGES.android_phone;
  }

  // Paper & Cardboard
  if (n.includes("newspaper") || n.includes("raddi") || n.includes("news") || n.includes("akhbar")) return SCRAP_3D_IMAGES.newspaper;
  if (n.includes("cardboard") || n.includes("gatta") || n.includes("box") || n.includes("dabba") || n.includes("carton")) return SCRAP_3D_IMAGES.cardboard;
  if (n.includes("book") || n.includes("copy") || n.includes("notebook") || n.includes("magazine")) return SCRAP_3D_IMAGES.book;
  if (n.includes("office paper") || n.includes("paper") || n.includes("a4") || n.includes("a3") || n.includes("white paper")) return SCRAP_3D_IMAGES.office_paper;

  // Clothes & Garments
  if (n.includes("cloth") || n.includes("kapda") || n.includes("garment") || n.includes("textile") || n.includes("shirt")) return SCRAP_3D_IMAGES.clothes;

  // Glass
  if (n.includes("glass") || n.includes("shisha") || n.includes("bottle glass")) return SCRAP_3D_IMAGES.glass;

  // Standard Plastics
  if (n.includes("pet bottle") || n.includes("pet bottles") || n.includes("plastic") || n.includes("bottle") || n.includes("jar") || n.includes("drum") || n.includes("fiber") || n.includes("poly")) {
    return SCRAP_3D_IMAGES.plastic;
  }

  // Metals - Specific matches first
  if (n.includes("can") && (n.includes("tin") || n.includes("aluminium") || n.includes("aluminum") || n.includes("cold drink") || n.includes("soda"))) return SCRAP_3D_IMAGES.aluminum_can;
  if (n.includes("copper") || n.includes("tamba") || n.includes("taamba") || n.includes("wire copper")) return SCRAP_3D_IMAGES.copper;
  if (n.includes("brass") || n.includes("peetal") || n.includes("pital")) return SCRAP_3D_IMAGES.brass;
  if (n.includes("aluminium") || n.includes("aluminum") || n.includes("cooker") || n.includes("kadhai") || n.includes("alumnium")) return SCRAP_3D_IMAGES.aluminum;
  if (n.includes("steel") || n.includes("stainless") || n.includes("bartan") || n.includes("sink")) return SCRAP_3D_IMAGES.steel;

  // Specific appliance matches BEFORE generic metal/iron check
  if (n.includes("metal appliances heavy") || (n.includes("stabiliser") && n.includes("inverter"))) return SCRAP_3D_IMAGES.inverter;
  if (n.includes("metal appliances medium") || n.includes("metal appliances light") || (n.includes("ceiling fan") && n.includes("motor"))) return SCRAP_3D_IMAGES.fan_motor;
  if (n.includes("iron cooler") || (n.includes("cooler") && n.includes("motor"))) return SCRAP_3D_IMAGES.cooler;

  if (n.includes("iron") || n.includes("loha") || n.includes("girder") || n.includes("sariya") || n.includes("tmt") || n.includes("metal")) return SCRAP_3D_IMAGES.iron;
  if (n.includes("tin") || n.includes("lead") || n.includes("zinc")) return SCRAP_3D_IMAGES.iron;

  // Large Appliances
  if (n.includes("window ac") || n.includes("window / split") || n.includes("window ac / split") || n.includes("inverter window") || n.includes("indoor+outdoor") || n.includes("indoor + outdoor")) return SCRAP_3D_IMAGES.window_ac;
  if (n.includes("ac") || n.includes("air conditioner") || n.includes("split ac") || n.includes("inverter ac") || n.includes("indoor")) return SCRAP_3D_IMAGES.split_ac;

  if (n.includes("side by side") || n.includes("double door fridge")) return SCRAP_3D_IMAGES.fridge_double_door;
  if (n.includes("fridge") || n.includes("refrigerator") || n.includes("freezer") || n.includes("single door")) return SCRAP_3D_IMAGES.fridge_single_door;

  if (n.includes("front load") || n.includes("front-load")) return SCRAP_3D_IMAGES.washing_front;
  if (n.includes("top load") || n.includes("top-load")) return SCRAP_3D_IMAGES.washing_top;
  if (n.includes("semi automatic") || n.includes("semi auto") || n.includes("double drum")) return SCRAP_3D_IMAGES.washing_semi;
  if (n.includes("washing") || n.includes("washer") || n.includes("laundry")) return SCRAP_3D_IMAGES.washing_top;

  if (n.includes("microwave") || n.includes("oven") || n.includes("otg")) return SCRAP_3D_IMAGES.microwave;
  if (n.includes("fan") || n.includes("motor") || n.includes("pump") || n.includes("ceiling fan") || n.includes("exhaust")) return SCRAP_3D_IMAGES.fan_motor;
  if (n.includes("cooler")) return SCRAP_3D_IMAGES.cooler;
  if (n.includes("geyser") || n.includes("water heater")) return SCRAP_3D_IMAGES.geyser;

  // Electronics & E-Waste
  if (n.includes("battery") || n.includes("inverter battery") || n.includes("car battery") || n.includes("lead battery")) return SCRAP_3D_IMAGES.battery;
  if (n.includes("inverter") || n.includes("stabilizer") || n.includes("stabiliser")) return SCRAP_3D_IMAGES.inverter;
  if (n.includes("ups")) return SCRAP_3D_IMAGES.ups;
  if (n.includes("laptop") || n.includes("macbook") || n.includes("notebook")) return SCRAP_3D_IMAGES.laptop;
  if (n.includes("cpu") || n.includes("computer") || n.includes("desktop") || n.includes("tower")) return SCRAP_3D_IMAGES.cpu;
  if (n.includes("crt tv") || n.includes("old tv") || n.includes("box tv")) return SCRAP_3D_IMAGES.crt_tv;
  if (n.includes("tv") || n.includes("television") || n.includes("led") || n.includes("lcd") || n.includes("monitor") || n.includes("printer") || n.includes("scanner") || n.includes("e-waste") || n.includes("electronic")) return SCRAP_3D_IMAGES.printer_tv;

  // Vehicles
  if (n.includes("scooty") || n.includes("scooter") || n.includes("activa") || n.includes("jupiter")) return SCRAP_3D_IMAGES.scooty;
  if (n.includes("bike") || n.includes("motorcycle") || n.includes("splendor") || n.includes("pulsar") || n.includes("bullet")) return SCRAP_3D_IMAGES.bike;
  if (n.includes("car") || n.includes("gaddi") || n.includes("vehicle") || n.includes("auto") || n.includes("truck") || n.includes("van") || n.includes("jeeto")) return SCRAP_3D_IMAGES.car;

  // Fallback by Category
  if (c.includes("paper")) return SCRAP_3D_IMAGES.office_paper;
  if (c.includes("plastic")) return SCRAP_3D_IMAGES.plastic;
  if (c.includes("metal")) return SCRAP_3D_IMAGES.iron;
  if (c.includes("vehicle")) return SCRAP_3D_IMAGES.car;
  if (c.includes("ewaste") || c.includes("e-waste") || c.includes("it")) return SCRAP_3D_IMAGES.printer_tv;
  if (c.includes("appliance")) return SCRAP_3D_IMAGES.cooler;

  return SCRAP_3D_IMAGES.default;
};

