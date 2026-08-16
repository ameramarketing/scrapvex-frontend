// Real Scrap Item High-Definition Images Helper

const REAL_SCRAP_IMAGES = {
  newspaper: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200&auto=format&fit=crop&q=80",
  cardboard: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=200&auto=format&fit=crop&q=80",
  book: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80",
  paper: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=80",

  iron: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80",
  steel: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=200&auto=format&fit=crop&q=80",
  copper: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=200&auto=format&fit=crop&q=80",
  brass: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
  aluminum: "https://images.unsplash.com/photo-1605557202138-097824c3f2c4?w=200&auto=format&fit=crop&q=80",

  ac: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80",
  fridge: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=200&auto=format&fit=crop&q=80",
  washing: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&auto=format&fit=crop&q=80",
  battery: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80",

  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&auto=format&fit=crop&q=80",
  tv: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=200&auto=format&fit=crop&q=80",
  e_waste: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&auto=format&fit=crop&q=80",

  plastic: "https://images.unsplash.com/photo-1604186838347-9faaf0dc6a0c?w=200&auto=format&fit=crop&q=80",
  bottle: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200&auto=format&fit=crop&q=80",

  vehicle: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&auto=format&fit=crop&q=80",
  car: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200&auto=format&fit=crop&q=80",
  bike: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&auto=format&fit=crop&q=80",
  
  default: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&auto=format&fit=crop&q=80"
};

export const getScrapItemImage = (name = "", category = "", itemImageUrl = null) => {
  if (itemImageUrl && typeof itemImageUrl === "string" && itemImageUrl.trim().length > 0) {
    return itemImageUrl;
  }

  const str = `${name} ${category}`.toLowerCase();

  if (str.includes("newspaper") || str.includes("raddi") || str.includes("news")) return REAL_SCRAP_IMAGES.newspaper;
  if (str.includes("cardboard") || str.includes("gatta") || str.includes("box")) return REAL_SCRAP_IMAGES.cardboard;
  if (str.includes("book") || str.includes("copy") || str.includes("notebook")) return REAL_SCRAP_IMAGES.book;
  if (str.includes("paper") || str.includes("office paper")) return REAL_SCRAP_IMAGES.paper;

  if (str.includes("copper") || str.includes("tamba") || str.includes("taamba")) return REAL_SCRAP_IMAGES.copper;
  if (str.includes("brass") || str.includes("peetal") || str.includes("pital")) return REAL_SCRAP_IMAGES.brass;
  if (str.includes("aluminium") || str.includes("aluminum")) return REAL_SCRAP_IMAGES.aluminum;
  if (str.includes("iron") || str.includes("loha") || str.includes("steel")) return REAL_SCRAP_IMAGES.iron;

  if (str.includes("ac") || str.includes("air conditioner") || str.includes("conditioner")) return REAL_SCRAP_IMAGES.ac;
  if (str.includes("fridge") || str.includes("refrigerator")) return REAL_SCRAP_IMAGES.fridge;
  if (str.includes("washing") || str.includes("geyser") || str.includes("microwave")) return REAL_SCRAP_IMAGES.washing;
  if (str.includes("battery") || str.includes("inverter")) return REAL_SCRAP_IMAGES.battery;

  if (str.includes("laptop") || str.includes("computer") || str.includes("cpu")) return REAL_SCRAP_IMAGES.laptop;
  if (str.includes("tv") || str.includes("monitor") || str.includes("led")) return REAL_SCRAP_IMAGES.tv;
  if (str.includes("e-waste") || str.includes("electronic")) return REAL_SCRAP_IMAGES.e_waste;

  if (str.includes("bottle") || str.includes("pet")) return REAL_SCRAP_IMAGES.bottle;
  if (str.includes("plastic") || str.includes("fiber")) return REAL_SCRAP_IMAGES.plastic;

  if (str.includes("car") || str.includes("gaddi")) return REAL_SCRAP_IMAGES.car;
  if (str.includes("bike") || str.includes("scooty") || str.includes("motorcycle")) return REAL_SCRAP_IMAGES.bike;
  if (str.includes("vehicle") || str.includes("auto")) return REAL_SCRAP_IMAGES.vehicle;

  return REAL_SCRAP_IMAGES.default;
};
