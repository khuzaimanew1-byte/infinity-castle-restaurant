// ─── Infinity Castle Dining · Characters Mock Data ───

export type BreathingStyle =
  | "flame"
  | "water"
  | "mist"
  | "insect"
  | "wind"
  | "stone"
  | "serpent"
  | "sound"
  | "love"
  | "demon"; // Upper Moons use "demon"

export type Affiliation = "Hashira" | "Upper Moon";

export interface Character {
  id: string;
  name: string;
  title: string;
  affiliation: Affiliation;
  breathingStyle: BreathingStyle;
  element: string;
  themeColor: string; // hex
  glowClass: string;  // maps to globals.css glow-* utility
  linkedDishName: string;
  image: string; // URL sourced from web
  japaneseTitle: string;
}

export const characters: Character[] = [
  // ─── Nine Hashira ───
  {
    id: "giyu-tomioka",
    name: "Giyu Tomioka",
    title: "Water Hashira",
    affiliation: "Hashira",
    breathingStyle: "water",
    element: "Water",
    themeColor: "#4A8FBF",
    glowClass: "glow-water",
    linkedDishName: "Water Breathing Almond Gravy",
    japaneseTitle: "水柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/1/1b/Giyu_anime_profile.png",
  },
  {
    id: "kyojuro-rengoku",
    name: "Kyojuro Rengoku",
    title: "Flame Hashira",
    affiliation: "Hashira",
    breathingStyle: "flame",
    element: "Flame",
    themeColor: "#E8753A",
    glowClass: "glow-flame",
    linkedDishName: "Rengoku Bornfire Pizza",
    japaneseTitle: "炎柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/a/a9/Kyojuro_anime_profile.png",
  },
  {
    id: "obanai-iguro",
    name: "Obanai Iguro",
    title: "Serpent Hashira",
    affiliation: "Hashira",
    breathingStyle: "serpent",
    element: "Serpent",
    themeColor: "#B4D264",
    glowClass: "glow-serpent",
    linkedDishName: "Obanai Chicken Wrap",
    japaneseTitle: "蛇柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/c/cf/Obanai_anime_profile.png",
  },
  {
    id: "muichiro-tokito",
    name: "Muichiro Tokito",
    title: "Mist Hashira",
    affiliation: "Hashira",
    breathingStyle: "mist",
    element: "Mist",
    themeColor: "#7EC8D4",
    glowClass: "glow-mist",
    linkedDishName: "Tokito Cold Coffee",
    japaneseTitle: "霞柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/6/6b/Muichiro_anime_profile.png",
  },
  {
    id: "shinobu-kocho",
    name: "Shinobu Kocho",
    title: "Insect Hashira",
    affiliation: "Hashira",
    breathingStyle: "insect",
    element: "Insect",
    themeColor: "#B478C8",
    glowClass: "glow-insect",
    linkedDishName: "Shinobu Peri Peri Pizza",
    japaneseTitle: "蟲柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/3/3a/Shinobu_anime_profile.png",
  },
  {
    id: "sanemi-shinazugawa",
    name: "Sanemi Shinazugawa",
    title: "Wind Hashira",
    affiliation: "Hashira",
    breathingStyle: "wind",
    element: "Wind",
    themeColor: "#A0DCB4",
    glowClass: "glow-wind",
    linkedDishName: "Sanemi Kabab Crust Pizza",
    japaneseTitle: "風柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/d/d0/Sanemi_anime_profile.png",
  },
  {
    id: "gyomei-himejima",
    name: "Gyomei Himejima",
    title: "Stone Hashira",
    affiliation: "Hashira",
    breathingStyle: "stone",
    element: "Stone",
    themeColor: "#B4A08C",
    glowClass: "glow-stone",
    linkedDishName: "Gyomei Crown Crust Pizza",
    japaneseTitle: "岩柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/9/9a/Gyomei_anime_profile.png",
  },
  {
    id: "tengen-uzui",
    name: "Tengen Uzui",
    title: "Sound Hashira",
    affiliation: "Hashira",
    breathingStyle: "sound",
    element: "Sound",
    themeColor: "#DCC050",
    glowClass: "glow-sound",
    linkedDishName: "Tengen Turkish Wrap",
    japaneseTitle: "音柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/6/68/Tengen_anime_profile.png",
  },
  {
    id: "mitsuri-kanroji",
    name: "Mitsuri Kanroji",
    title: "Love Hashira",
    affiliation: "Hashira",
    breathingStyle: "love",
    element: "Love",
    themeColor: "#E6648C",
    glowClass: "glow-love",
    linkedDishName: "Mitsuri Love Wings",
    japaneseTitle: "恋柱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/4/4e/Mitsuri_anime_profile.png",
  },
  // ─── Upper Moons ───
  {
    id: "kokushibo",
    name: "Kokushibo",
    title: "Upper Moon One",
    affiliation: "Upper Moon",
    breathingStyle: "demon",
    element: "Moon",
    themeColor: "#8961D9",
    glowClass: "glow-wisteria",
    linkedDishName: "Kokushibo Bornfire",
    japaneseTitle: "上弦の壱",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/e/e0/Kokushibo_anime_profile.png",
  },
  {
    id: "douma",
    name: "Douma",
    title: "Upper Moon Two",
    affiliation: "Upper Moon",
    breathingStyle: "demon",
    element: "Ice",
    themeColor: "#7EC8D4",
    glowClass: "glow-mist",
    linkedDishName: "Douma Peri Peri",
    japaneseTitle: "上弦の弐",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/6/68/Doma_anime_profile.png",
  },
  {
    id: "akaza",
    name: "Akaza",
    title: "Upper Moon Three",
    affiliation: "Upper Moon",
    breathingStyle: "demon",
    element: "Destruction",
    themeColor: "#E8753A",
    glowClass: "glow-flame",
    linkedDishName: "Akaza Crispy",
    japaneseTitle: "上弦の参",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/c/c3/Akaza_anime_profile.png",
  },
  {
    id: "muzan-kibutsuji",
    name: "Muzan Kibutsuji",
    title: "Demon King",
    affiliation: "Upper Moon",
    breathingStyle: "demon",
    element: "Blood",
    themeColor: "#B41428",
    glowClass: "glow-demon",
    linkedDishName: "Muzan Special Soup",
    japaneseTitle: "鬼舞辻無惨",
    image:
      "https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/e/e8/Muzan_anime_profile.png",
  },
];
