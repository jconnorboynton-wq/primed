import { home } from "./home";
import { sellForCash } from "./sell-for-cash";
import { calculatorPage } from "./calculator";
import { howItWorks } from "./how-it-works";
import { serviceAreas } from "./service-areas";
import { washington } from "./washington";
import { inherited } from "./inherited";
import { repairs } from "./repairs";
import { foreclosure } from "./foreclosure";
import { rental } from "./rental";
import { relocation } from "./relocation";
import { investors } from "./investors";
import { resources } from "./resources";
import { about } from "./about";
import { contact } from "./contact";

/** The fifteen core pages. Order = sitemap and admin order. */
export const PAGES = {
  home,
  "sell-for-cash": sellForCash,
  calculator: calculatorPage,
  "how-it-works": howItWorks,
  "service-areas": serviceAreas,
  washington,
  inherited,
  repairs,
  foreclosure,
  rental,
  relocation,
  investors,
  resources,
  about,
  contact,
} as const;
