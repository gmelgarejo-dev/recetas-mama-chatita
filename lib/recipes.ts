import type { StaticImageData } from "next/image";
import chilesImage from "../Images/chiles-en-nogada-01.jpg";
import enchiladasImage from "../Images/Red-Enchiladas-Suizas.webp";
import moleImage from "../Images/mole_poblano.jpeg";
import pipianImage from "../Images/pipian.jpg";

export type Ingredient = {
  id: string;
  quantity: string;
  unit: string;
  name: string;
};

export type Recipe = {
  id: string;
  title: string;
  author: string;
  date: string;
  image?: string | StaticImageData;
  ingredients: Ingredient[];
  procedureHtml: string;
  keywords: string[];
  published: boolean;
};

export type RecipeDraft = Omit<Recipe, "id" | "published">;

export const parseTags = (value: string) =>
  value
    .split(";")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

export const initialRecipes: Recipe[] = [
  {
    id: "chiles-nogada",
    title: "Chiles en nogada",
    author: "Chatita",
    date: "21 de julio de 2026",
    image: chilesImage,
    published: true,
    keywords: [
      "fiesta",
      "tradicion",
      "temporada",
      "poblano",
      "mexicana",
      "relleno",
      "carne",
      "fruta",
    ],
    ingredients: [
      {
        id: "chiles-1",
        quantity: "6",
        unit: "piezas",
        name: "chiles poblanos asados",
      },
      {
        id: "chiles-2",
        quantity: "500",
        unit: "g",
        name: "picadillo dulce",
      },
    ],
    procedureHtml:
      "<p>Asa y limpia los chiles. Rellena con picadillo, baña con nogada fresca y termina con granada y perejil.</p>",
  },
  {
    id: "mole-poblano",
    title: "Mole poblano",
    author: "Familia Chatita",
    date: "21 de julio de 2026",
    image: moleImage,
    published: true,
    keywords: ["mole", "celebracion", "chocolate", "picante", "base", "salsa", "dulce", "tradicional"],
    ingredients: [
      {
        id: "mole-1",
        quantity: "4",
        unit: "piezas",
        name: "chiles secos",
      },
      {
        id: "mole-2",
        quantity: "80",
        unit: "g",
        name: "chocolate de mesa",
      },
    ],
    procedureHtml:
      "<p>Tuesta los ingredientes por separado, licua con caldo y cocina lentamente hasta lograr una salsa tersa y profunda.</p>",
  },
  {
    id: "pipian-verde",
    title: "Pipián verde",
    author: "Mamá Chatita",
    date: "21 de julio de 2026",
    image: pipianImage,
    published: false,
    keywords: ["pepita", "verde", "salsa", "semillas", "acido", "fresco", "base"],
    ingredients: [
      {
        id: "pipian-1",
        quantity: "1",
        unit: "taza",
        name: "pepita verde",
      },
      {
        id: "pipian-2",
        quantity: "6",
        unit: "piezas",
        name: "tomatillos",
      },
    ],
    procedureHtml:
      "<p>Muele pepitas tostadas con tomatillo, cilantro y chiles. Cocina a fuego bajo hasta que la salsa espese.</p>",
  },
  {
    id: "enchiladas-suizas",
    title: "Enchiladas suizas rojas",
    author: "Chatita",
    date: "21 de julio de 2026",
    image: enchiladasImage,
    published: true,
    keywords: ["horno", "queso", "antojito", "maiz", "base", "salsa", "jitomate"],
    ingredients: [
      {
        id: "enchiladas-1",
        quantity: "12",
        unit: "piezas",
        name: "tortillas de maiz",
      },
      {
        id: "enchiladas-2",
        quantity: "2",
        unit: "tazas",
        name: "salsa roja",
      },
    ],
    procedureHtml:
      "<p>Rellena las tortillas con pollo, cubre con salsa roja, crema y queso. Gratina hasta dorar.</p>",
  },
];
