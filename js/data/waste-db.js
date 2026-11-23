/**
 * GreenTrack - Waste Segregation & Classification Database
 * Comprehensive catalog of campus & neighborhood consumer goods & materials
 */

window.WASTE_DATABASE = [
  // ORGANIC / COMPOST
  {
    name: "Apple Core / Fruit Scraps",
    keywords: ["apple", "core", "fruit", "pear", "orange peel", "banana peel", "food scrap", "watermelon", "melon rind"],
    stream: "organic",
    subCategory: "Food Waste",
    binType: "Green Organic / Compost Bin",
    prepGuide: "Place directly into compost bin. Remove any plastic PLU stickers first.",
    co2Savings: 0.38, // kg CO2e diverted per kg
    degradeTime: "2 to 6 weeks",
    tips: "Produces nutrient-rich soil compost for campus organic gardens instead of methane gas in landfill.",
    packagingSplit: null
  },
  {
    name: "Banana Peel",
    keywords: ["banana", "peel", "banana skin"],
    stream: "organic",
    subCategory: "Fruit Waste",
    binType: "Green Organic / Compost Bin",
    prepGuide: "Compostable. Remove small plastic barcode sticker.",
    co2Savings: 0.35,
    degradeTime: "3 to 4 weeks",
    tips: "High in potassium and nitrogen; accelerates campus composting.",
    packagingSplit: null
  },
  {
    name: "Coffee Grounds & Paper Filters",
    keywords: ["coffee", "coffee grounds", "filter", "espresso puck", "used tea bag"],
    stream: "organic",
    subCategory: "Beverage Waste",
    binType: "Green Organic / Compost Bin",
    prepGuide: "100% compostable. Ensure tea bags do not have plastic/nylon staples or synthetic string.",
    co2Savings: 0.52,
    degradeTime: "2 to 3 months",
    tips: "Oakridge Dining diverts over 180 kg of spent coffee grounds weekly to campus landscaping mulch.",
    packagingSplit: null
  },
  {
    name: "Greasy Pizza Box (Bottom Soiled)",
    keywords: ["pizza", "pizza box", "greasy cardboard", "cheese box"],
    stream: "organic",
    subCategory: "Soiled Paper",
    binType: "Green Organic / Compost Bin",
    prepGuide: "Tear box in half! Soiled greasy bottom goes to Green Compost Bin. Clean, oil-free top lid goes to Brown Cardboard Recycling.",
    co2Savings: 0.45,
    degradeTime: "2 to 3 months",
    tips: "Food oils ruin paper recycling mills, but organic compost loves unbleached corrugated fiber.",
    packagingSplit: "Top clean lid -> Paper & Cardboard; Bottom oily base -> Organic Compost."
  },
  {
    name: "Eggshells & Egg Carton (Paper)",
    keywords: ["egg", "eggshell", "egg carton", "cardboard carton"],
    stream: "organic",
    subCategory: "Kitchen Organic",
    binType: "Green Organic / Compost Bin",
    prepGuide: "Crush eggshells. Paper egg cartons can also be composted or recycled if clean.",
    co2Savings: 0.30,
    degradeTime: "1 to 2 months",
    tips: "Calcium in eggshells balances compost acidity.",
    packagingSplit: null
  },
  {
    name: "Bread Crust / Bakery Leftovers",
    keywords: ["bread", "crust", "bagel", "pastry", "croissant", "muffin", "donut"],
    stream: "organic",
    subCategory: "Food Waste",
    binType: "Green Organic / Compost Bin",
    prepGuide: "Deposit in organic bin without plastic bag.",
    co2Savings: 0.42,
    degradeTime: "1 to 2 weeks",
    tips: "Always keep plastic wrapper out of organic bin.",
    packagingSplit: "Plastic bread sleeve -> Recyclables (Soft Plastics depot)."
  },

  // DRY RECYCLABLES (Plastics, Metals, Glass)
  {
    name: "PET Plastic Beverage Bottle (Clear)",
    keywords: ["plastic bottle", "water bottle", "coke bottle", "soda bottle", "dasani", "smartwater", "pet", "pet 1"],
    stream: "recyclable",
    subCategory: "PET #1 Rigid Plastic",
    binType: "Blue Recyclables Bin",
    prepGuide: "Empty all remaining liquid. Rinse lightly. Leave plastic screw cap ON (it is recovered at modern MRF plants). Crush to save bin volume.",
    co2Savings: 1.25,
    degradeTime: "450 years",
    tips: "Recycled PET is spun into recycled polyester yarn, campus fleece jackets, and new bottles.",
    packagingSplit: null
  },
  {
    name: "Aluminum Beverage Can",
    keywords: ["soda can", "coke can", "beer can", "aluminum can", "la croix", "seltzer can", "tin can", "pepsi"],
    stream: "recyclable",
    subCategory: "Aluminum & Non-ferrous Metal",
    binType: "Blue Recyclables Bin",
    prepGuide: "Empty completely. Light crush is acceptable. Do not insert cigarette butts or tissues inside.",
    co2Savings: 2.10,
    degradeTime: "200 to 500 years",
    tips: "Recycling aluminum requires 95% less energy than producing new metal from bauxite ore. Infinite recyclability!",
    packagingSplit: null
  },
  {
    name: "Glass Bottle / Mason Jar",
    keywords: ["glass bottle", "glass jar", "beer bottle", "olive jar", "wine bottle", "jam jar", "pickle jar"],
    stream: "recyclable",
    subCategory: "Container Glass",
    binType: "Blue Recyclables Bin",
    prepGuide: "Empty and rinse food residue. Metal lids can be recycled in the same bin. Do not break.",
    co2Savings: 0.65,
    degradeTime: "1,000,000+ years",
    tips: "Glass is 100% recyclable with zero degradation in purity or quality.",
    packagingSplit: "Metal lid -> Metal recycling; Glass jar -> Glass stream."
  },
  {
    name: "HDPE Milk Jug / Detergent Jug",
    keywords: ["milk jug", "detergent bottle", "shampoo bottle", "hdpe", "hdpe 2", "galloneer"],
    stream: "recyclable",
    subCategory: "HDPE #2 Plastic",
    binType: "Blue Recyclables Bin",
    prepGuide: "Rinse thoroughly to prevent odor. Keep cap secured.",
    co2Savings: 1.40,
    degradeTime: "400 years",
    tips: "High demand polymer; recycled into durable campus benches and drainage pipes.",
    packagingSplit: null
  },
  {
    name: "Tin / Steel Canned Food Container",
    keywords: ["soup can", "tuna can", "beans can", "tin can", "steel can", "canned food"],
    stream: "recyclable",
    subCategory: "Ferrous Steel",
    binType: "Blue Recyclables Bin",
    prepGuide: "Rinse out broth/sauce. Detached steel lids can be placed inside the can and pinched closed.",
    co2Savings: 1.80,
    degradeTime: "50 to 100 years",
    tips: "Steel cans are easily separated via magnetic pulleys at sorting centers.",
    packagingSplit: null
  },

  // PAPER & CARDBOARD
  {
    name: "Amazon / Shipping Cardboard Box",
    keywords: ["cardboard", "box", "shipping box", "amazon box", "corrugated box", "package box"],
    stream: "paper",
    subCategory: "Corrugated Cardboard",
    binType: "Yellow/Brown Cardboard Bin",
    prepGuide: "FLATTEN BOX completely to save 75% bin volume! Remove any bulky styrofoam or plastic bubble mailers inside.",
    co2Savings: 1.15,
    degradeTime: "2 months",
    tips: "Packing tape can remain (pulpers easily filter it), but please remove plastic air pillows.",
    packagingSplit: "Box -> Cardboard; Plastic Air Pillows -> Soft Plastic depot."
  },
  {
    name: "Office Paper / Notebook Pages / Exam Sheets",
    keywords: ["paper", "office paper", "printer paper", "notebook", "exam paper", "looseleaf", "envelope"],
    stream: "paper",
    subCategory: "White & Mixed Paper",
    binType: "Yellow/Brown Paper Bin",
    prepGuide: "Staples and paper clips are okay (magnets catch them). Envelopes with plastic windows are accepted in modern streams.",
    co2Savings: 1.30,
    degradeTime: "2 to 6 weeks",
    tips: "One ton of recycled paper preserves 17 mature trees and 7,000 gallons of water.",
    packagingSplit: null
  },
  {
    name: "Newspaper & Magazines",
    keywords: ["newspaper", "magazine", "glossy catalog", "times", "journal", "periodical"],
    stream: "paper",
    subCategory: "Newsprint & Glossy Paper",
    binType: "Yellow/Brown Paper Bin",
    prepGuide: "Keep dry. Remove plastic polybag wrapping first.",
    co2Savings: 0.95,
    degradeTime: "6 weeks",
    tips: "Glossy clay coatings on magazines are separated during the de-inking process.",
    packagingSplit: null
  },

  // E-WASTE & HAZARDOUS
  {
    name: "Lithium-Ion / Alkaline Batteries (AA, AAA, 9V)",
    keywords: ["battery", "batteries", "aa battery", "aaa", "lithium", "alkaline", "rechargeable", "button cell"],
    stream: "ewaste",
    subCategory: "Hazardous & Electrochemical",
    binType: "Red E-Waste & Battery Depot",
    prepGuide: "NEVER dispose in regular trash or standard recycling! Tape the positive (+) terminals of 9V and lithium batteries with clear scotch tape to prevent short circuits.",
    co2Savings: 3.80,
    degradeTime: "100+ years (Hazardous Leachate)",
    tips: "Contains toxic heavy metals and poses severe compaction fire risk inside waste trucks. Recovers cobalt, nickel, and lithium.",
    packagingSplit: null
  },
  {
    name: "Broken Smartphone / Tablet / Electronics",
    keywords: ["phone", "smartphone", "iphone", "android", "tablet", "ipad", "circuit board", "motherboard", "ram"],
    stream: "ewaste",
    subCategory: "Electronic Hardware",
    binType: "Red E-Waste & Electronics Station",
    prepGuide: "Wipe personal data. Remove SIM/SD card. Drop off at designated e-waste kiosk (BIN-SCI-01 or BIN-MED-01).",
    co2Savings: 12.5,
    degradeTime: "Non-biodegradable (Toxic)",
    tips: "Recovers precious gold, silver, copper, and rare-earth neodymium magnets.",
    packagingSplit: null
  },
  {
    name: "Power Cables, Chargers & USB Cords",
    keywords: ["cable", "charger", "cord", "usb", "lightning cable", "power brick", "hdmi", "adapter"],
    stream: "ewaste",
    subCategory: "Cables & Wiring",
    binType: "Red E-Waste & Electronics Station",
    prepGuide: "Bundle with a twist tie. Do not place in normal recycling as cables jam rotary sorting screens ('tanglers').",
    co2Savings: 2.20,
    degradeTime: "400 years",
    tips: "Copper wiring inside has nearly 100% reclamation yield.",
    packagingSplit: null
  },
  {
    name: "Fluorescent Light Bulb / CFL",
    keywords: ["bulb", "light bulb", "cfl", "fluorescent", "tube", "led bulb"],
    stream: "ewaste",
    subCategory: "Hazardous Lighting",
    binType: "Red E-Waste & Chemical Station",
    prepGuide: "Wrap carefully to avoid glass breakage. Fluorescent bulbs contain mercury vapor and must never be crushed.",
    co2Savings: 1.10,
    degradeTime: "Permanent hazard",
    tips: "Campus facilities handles special lamp recycling units.",
    packagingSplit: null
  },

  // RESIDUAL / LANDFILL (Non-recyclable)
  {
    name: "Takeaway Disposable Coffee Cup (Poly-lined)",
    keywords: ["coffee cup", "starbucks cup", "paper cup", "disposable cup", "peats cup", "latte cup"],
    stream: "landfill",
    subCategory: "Composite Lined Cup",
    binType: "Black/Grey Landfill Bin (or split components)",
    prepGuide: "Tear apart! The paper cup itself has a tight polyethylene plastic lining and goes to Landfill. The plastic sip lid goes to Recyclables. The cardboard heat sleeve goes to Cardboard.",
    co2Savings: 0.10,
    degradeTime: "30 to 50 years",
    tips: "Bring a reusable thermos to campus cafes for a $0.25 discount and zero waste generation!",
    packagingSplit: "Paper cup -> Landfill; Plastic lid -> Recyclables; Cardboard sleeve -> Paper."
  },
  {
    name: "Styrofoam Food Box / Polystyrene Clamshell",
    keywords: ["styrofoam", "polystyrene", "foam cup", "packing peanuts", "takeout box"],
    stream: "landfill",
    subCategory: "Expanded Polystyrene (EPS #6)",
    binType: "Black/Grey Landfill Bin",
    prepGuide: "Throw into general landfill bin unless campus has a specialized EPS densifier collection drive. Clean off food.",
    co2Savings: 0.05,
    degradeTime: "500+ years",
    tips: "Very low density makes municipal transport non-viable. Avoid single-use styrofoam whenever possible.",
    packagingSplit: null
  },
  {
    name: "Plastic Chip Bag / Snack Wrapper (Mylar Film)",
    keywords: ["chip bag", "doritos", "snack wrapper", "candy wrapper", "granola bar wrapper", "mylar", "foil bag"],
    stream: "landfill",
    subCategory: "Multi-layer Metallized Film",
    binType: "Black/Grey Landfill Bin",
    prepGuide: "Cannot be recycled curbside. Place in Landfill bin.",
    co2Savings: 0.05,
    degradeTime: "100+ years",
    tips: "Multi-material sandwich (aluminum vapor deposited on polypropylene) cannot be economically separated at typical facilities.",
    packagingSplit: null
  },
  {
    name: "Single-Use Plastic Cutlery & Straws",
    keywords: ["plastic fork", "plastic spoon", "plastic knife", "cutlery", "straw", "boba straw", "stirrer"],
    stream: "landfill",
    subCategory: "Small Rigid Plastic / Polystyrene",
    binType: "Black/Grey Landfill Bin",
    prepGuide: "Too small and brittle for sorting optical sorters (falls through sorting trommels). Place in Landfill.",
    co2Savings: 0.02,
    degradeTime: "400 years",
    tips: "Opt out of disposable utensils when ordering campus delivery.",
    packagingSplit: null
  },
  {
    name: "Sanitary Wipes / Face Masks",
    keywords: ["wipe", "disinfecting wipe", "clorox wipe", "wet wipe", "mask", "surgical mask", "n95", "gloves", "latex"],
    stream: "landfill",
    subCategory: "Sanitary / Synthetic Non-wovens",
    binType: "Black/Grey Landfill Bin",
    prepGuide: "Never flush wipes (causes fatbergs) and never compost. Place securely in Landfill.",
    co2Savings: 0.0,
    degradeTime: "100 years",
    tips: "Synthetic microfibers do not degrade in municipal composters.",
    packagingSplit: null
  }
];
