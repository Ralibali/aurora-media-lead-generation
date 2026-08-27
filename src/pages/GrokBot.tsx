import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { SEO, SITE_URL } from "@/components/SEO";
import { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { trackEvent } from "@/lib/analytics";
import { getSupabase } from "@/lib/getSupabase";
import {
  PRODUCT_STATUS,
  PRODUCT_VERSION,
  PRODUCT_UPDATED,
  PRODUCT_UPDATED_ISO,
  PRODUCT_VERIFIED_ISO,
  PRODUCT_FRESHNESS,
  PRICES,
  FN_LAUNCH_STATUS,
  FN_VERIFY_SESSION,
  FN_CREATE_CHECKOUT,
  LEGAL_ACK_TEXT,
  WAITLIST_PAKET,
  LEGAL_LINKS,
  DIGITAL_DELIVERY_NOTE,
  LEARN_CARDS,
  LESSONS,
  VAULT_BLURB,
  VAULT_METHOD_NOTE,
  VAULT_GROUPS,
  CHAPTERS,
  BONUS_CHAPTER,
  ADVANCED_BONUS,
  USE_CASES,
  WHO_FOR,
  WHO_NOT_FOR,
  FAQ,
  PREVIEW_EXCERPT,
  type AiKontoretProduct,
} from "@/config/aiKontoret";
import "@/styles/grokbot.css";

const IS_LIVE = PRODUCT_STATUS === "live";
const OG_IMAGE = `${SITE_URL}/og-grok-bot.jpg`;

const SEO_TITLE = "AI-KONTORET – Bygg ett AI-drivet företag med Grok Bot | Guide 199 kr";
const SEO_DESC =
  "Svenska guiden till Grok Bot: bygg AI-medarbetare och digitala kollegor med Skills, Routines, Groups och owner gates – ett AI-kontor som jobbar åt dig. 199 kr.";
