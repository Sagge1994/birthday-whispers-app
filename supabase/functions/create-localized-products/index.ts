import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Language to currency mapping
const CURRENCY_MAP = {
  'sv': 'sek',
  'en': 'usd', 
  'es': 'eur',
  'fr': 'eur'
};

// Pricing per currency (amounts in minor units)
const PRICING = {
  'usd': { monthly: 100, yearly: 1000 }, // $1.00, $10.00
  'sek': { monthly: 1100, yearly: 11000 }, // 11 SEK, 110 SEK
  'eur': { monthly: 95, yearly: 950 } // €0.95, €9.50
};

// Localized product names and descriptions
const PRODUCT_TRANSLATIONS = {
  'sv': {
    monthly: {
      name: "Födelsedagspåminnelser Premium Månadsplan",
      description: "Premium månadsplan med obegränsade notifikationer och meddelanden"
    },
    yearly: {
      name: "Födelsedagspåminnelser Premium Årsplan", 
      description: "Premium årsplan med obegränsade notifikationer och meddelanden (17% rabatt)"
    }
  },
  'en': {
    monthly: {
      name: "Birthday Reminders Premium Monthly",
      description: "Premium monthly plan with unlimited notifications and messages"
    },
    yearly: {
      name: "Birthday Reminders Premium Yearly",
      description: "Premium yearly plan with unlimited notifications and messages (17% off)"
    }
  },
  'es': {
    monthly: {
      name: "Recordatorios de Cumpleaños Premium Mensual",
      description: "Plan premium mensual con notificaciones y mensajes ilimitados"
    },
    yearly: {
      name: "Recordatorios de Cumpleaños Premium Anual",
      description: "Plan premium anual con notificaciones y mensajes ilimitados (17% de descuento)"
    }
  },
  'fr': {
    monthly: {
      name: "Rappels d'Anniversaire Premium Mensuel", 
      description: "Plan premium mensuel avec notifications et messages illimités"
    },
    yearly: {
      name: "Rappels d'Anniversaire Premium Annuel",
      description: "Plan premium annuel avec notifications et messages illimités (17% de réduction)"
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language } = await req.json();
    
    if (!language || !CURRENCY_MAP[language as keyof typeof CURRENCY_MAP]) {
      throw new Error("Invalid or missing language parameter");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const currency = CURRENCY_MAP[language as keyof typeof CURRENCY_MAP];
    const pricing = PRICING[currency as keyof typeof PRICING];
    const translations = PRODUCT_TRANSLATIONS[language as keyof typeof PRODUCT_TRANSLATIONS];

    console.log(`Creating products for language: ${language}, currency: ${currency}`);

    // Create monthly product and price
    const monthlyProduct = await stripe.products.create({
      name: translations.monthly.name,
      description: translations.monthly.description,
      metadata: {
        language: language,
        plan_type: 'monthly'
      }
    });

    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: pricing.monthly,
      currency: currency,
      recurring: {
        interval: 'month'
      },
      metadata: {
        language: language,
        plan_type: 'monthly'
      }
    });

    // Create yearly product and price  
    const yearlyProduct = await stripe.products.create({
      name: translations.yearly.name,
      description: translations.yearly.description,
      metadata: {
        language: language,
        plan_type: 'yearly'
      }
    });

    const yearlyPrice = await stripe.prices.create({
      product: yearlyProduct.id,
      unit_amount: pricing.yearly,
      currency: currency,
      recurring: {
        interval: 'year'
      },
      metadata: {
        language: language,
        plan_type: 'yearly'
      }
    });

    console.log(`Created products for ${language}:`, {
      monthly: { product: monthlyProduct.id, price: monthlyPrice.id },
      yearly: { product: yearlyProduct.id, price: yearlyPrice.id }
    });

    return new Response(JSON.stringify({
      success: true,
      language: language,
      currency: currency,
      products: {
        monthly: {
          product_id: monthlyProduct.id,
          price_id: monthlyPrice.id,
          name: translations.monthly.name,
          amount: pricing.monthly,
          currency: currency
        },
        yearly: {
          product_id: yearlyProduct.id,
          price_id: yearlyPrice.id, 
          name: translations.yearly.name,
          amount: pricing.yearly,
          currency: currency
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating localized products:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});