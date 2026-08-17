// ScrapVex - Official 3D Scrap Item Realistic Illustrations
// Matches industry standard 3D illustrations for accurate scrap item visual recognition

const SCRAP_3D_IMAGES = {
  // Paper & Cardboard
  clothes:               "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011367526802287.png?alt=media",
  newspaper:             "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011200784124698.png?alt=media",
  office_paper:          "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011653636959338.png?alt=media",
  book:                  "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011515491136252.png?alt=media",
  cardboard:             "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774026057614643325.png?alt=media",

  // Plastics & Glass
  plastic:               "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774011577291840388.png?alt=media",
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
  laptop:                "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073405237128898.png?alt=media",
  cpu:                   "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073637546677937.png?alt=media",
  printer_tv:            "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774027510172307816.png?alt=media",
  crt_tv:                "https://firebasestorage.googleapis.com/v0/b/scrapuncle-452708.firebasestorage.app/o/products%2F1774073068422953748.png?alt=media",
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

  const str = `${name} ${category}`.toLowerCase();

  // Paper & Cardboard
  if (str.includes("newspaper") || str.includes("raddi") || str.includes("news")) return SCRAP_3D_IMAGES.newspaper;
  if (str.includes("cardboard") || str.includes("gatta") || str.includes("box") || str.includes("dabba")) return SCRAP_3D_IMAGES.cardboard;
  if (str.includes("book") || str.includes("copy") || str.includes("notebook") || str.includes("magazine")) return SCRAP_3D_IMAGES.book;
  if (str.includes("paper") || str.includes("office") || str.includes("a4") || str.includes("a3") || str.includes("white paper")) return SCRAP_3D_IMAGES.office_paper;

  // Clothes & Garments
  if (str.includes("cloth") || str.includes("kapda") || str.includes("garment") || str.includes("textile") || str.includes("shirt")) return SCRAP_3D_IMAGES.clothes;

  // Glass
  if (str.includes("glass") || str.includes("shisha") || str.includes("bottle glass")) return SCRAP_3D_IMAGES.glass;

  // Plastics
  if (str.includes("plastic") || str.includes("bottle") || str.includes("pet") || str.includes("fiber") || str.includes("poly") || str.includes("drum") || str.includes("jar") || str.includes("can")) return SCRAP_3D_IMAGES.plastic;

  // Metals - specific matches first
  if (str.includes("can") && (str.includes("tin") || str.includes("aluminium") || str.includes("aluminum") || str.includes("cold drink") || str.includes("soda"))) return SCRAP_3D_IMAGES.aluminum_can;
  if (str.includes("copper") || str.includes("tamba") || str.includes("taamba") || str.includes("wire copper")) return SCRAP_3D_IMAGES.copper;
  if (str.includes("brass") || str.includes("peetal") || str.includes("pital")) return SCRAP_3D_IMAGES.brass;
  if (str.includes("aluminium") || str.includes("aluminum") || str.includes("cooker") || str.includes("kadhai") || str.includes("alumnium")) return SCRAP_3D_IMAGES.aluminum;
  if (str.includes("steel") || str.includes("stainless") || str.includes("bartan") || str.includes("sink")) return SCRAP_3D_IMAGES.steel;
  if (str.includes("iron") || str.includes("loha") || str.includes("girder") || str.includes("sariya") || str.includes("tmt") || str.includes("metal")) return SCRAP_3D_IMAGES.iron;
  if (str.includes("tin") || str.includes("lead") || str.includes("zinc")) return SCRAP_3D_IMAGES.iron;

  // Large Appliances
  if (str.includes("window ac") || str.includes("window / split")) return SCRAP_3D_IMAGES.window_ac;
  if (str.includes("ac") || str.includes("air conditioner") || str.includes("split ac") || str.includes("inverter ac") || str.includes("indoor")) return SCRAP_3D_IMAGES.split_ac;

  if (str.includes("side by side") || str.includes("double door fridge")) return SCRAP_3D_IMAGES.fridge_double_door;
  if (str.includes("fridge") || str.includes("refrigerator") || str.includes("freezer") || str.includes("single door")) return SCRAP_3D_IMAGES.fridge_single_door;

  if (str.includes("front load") || str.includes("front-load")) return SCRAP_3D_IMAGES.washing_front;
  if (str.includes("top load") || str.includes("top-load")) return SCRAP_3D_IMAGES.washing_top;
  if (str.includes("semi automatic") || str.includes("double drum")) return SCRAP_3D_IMAGES.washing_semi;
  if (str.includes("washing") || str.includes("washer") || str.includes("laundry")) return SCRAP_3D_IMAGES.washing_top;

  if (str.includes("microwave") || str.includes("oven") || str.includes("otg")) return SCRAP_3D_IMAGES.microwave;
  if (str.includes("fan") || str.includes("motor") || str.includes("pump") || str.includes("ceiling fan") || str.includes("exhaust")) return SCRAP_3D_IMAGES.fan_motor;
  if (str.includes("cooler")) return SCRAP_3D_IMAGES.cooler;
  if (str.includes("geyser") || str.includes("water heater")) return SCRAP_3D_IMAGES.geyser;

  // Electronics & E-Waste
  if (str.includes("battery") || str.includes("inverter battery") || str.includes("car battery") || str.includes("lead battery")) return SCRAP_3D_IMAGES.battery;
  if (str.includes("inverter") || str.includes("stabilizer") || str.includes("stabiliser")) return SCRAP_3D_IMAGES.inverter;
  if (str.includes("ups")) return SCRAP_3D_IMAGES.ups;
  if (str.includes("laptop") || str.includes("macbook") || str.includes("notebook")) return SCRAP_3D_IMAGES.laptop;
  if (str.includes("cpu") || str.includes("computer") || str.includes("desktop") || str.includes("tower")) return SCRAP_3D_IMAGES.cpu;
  if (str.includes("crt tv") || str.includes("old tv") || str.includes("box tv")) return SCRAP_3D_IMAGES.crt_tv;
  if (str.includes("tv") || str.includes("television") || str.includes("led") || str.includes("lcd") || str.includes("monitor") || str.includes("printer") || str.includes("scanner") || str.includes("e-waste") || str.includes("electronic")) return SCRAP_3D_IMAGES.printer_tv;
  if (str.includes("mobile") || str.includes("phone") || str.includes("smartphone") || str.includes("tablet") || str.includes("ipad")) return SCRAP_3D_IMAGES.tablet_phone;

  // Vehicles
  if (str.includes("scooty") || str.includes("scooter") || str.includes("activa") || str.includes("jupiter")) return SCRAP_3D_IMAGES.scooty;
  if (str.includes("bike") || str.includes("motorcycle") || str.includes("splendor") || str.includes("pulsar") || str.includes("bullet")) return SCRAP_3D_IMAGES.bike;
  if (str.includes("car") || str.includes("gaddi") || str.includes("vehicle") || str.includes("auto") || str.includes("truck") || str.includes("van") || str.includes("jeeto")) return SCRAP_3D_IMAGES.car;

  return SCRAP_3D_IMAGES.default;
};
