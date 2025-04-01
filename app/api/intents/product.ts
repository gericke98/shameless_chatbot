import { MessageParameters } from "@/app/types/api";
import { aiService } from "../ai";
import { SizeChart } from "@/types";
import { extractProduct, insertCustomer } from "@/app/queries/order";
import { logger } from "../utils/logger";

// Example size chart for different product types
const sizeCharts: Record<string, SizeChart> = {
  CREWNECK: {
    sizes: ["XS", "S", "M", "L", "XL"],
    measurements: [
      {
        name: "Chest",
        unit: "cm",
        values: {
          XS: 64,
          S: 67,
          M: 70,
          L: 73,
          XL: 76,
        },
      },
      {
        name: "Length",
        unit: "cm",
        values: {
          XS: 65,
          S: 68,
          M: 71,
          L: 74,
          XL: 77,
        },
      },
      {
        name: "Sleeve",
        unit: "cm",
        values: {
          XS: 47,
          S: 48,
          M: 49,
          L: 50,
          XL: 51,
        },
      },
    ],
    productType: "Crewneck",
  },
  SWEATSHIRT: {
    sizes: ["S", "M", "L", "XL"],
    measurements: [
      {
        name: "Chest",
        unit: "cm",
        values: {
          S: 67,
          M: 69,
          L: 71,
          XL: 73,
        },
      },
      {
        name: "Length",
        unit: "cm",
        values: {
          S: 65,
          M: 68,
          L: 71,
          XL: 74,
        },
      },
      {
        name: "Sleeve",
        unit: "cm",
        values: {
          S: 58,
          M: 60,
          L: 62,
          XL: 64,
        },
      },
    ],
    productType: "Sweatshirt",
  },
  HOODIE: {
    sizes: ["S", "M", "L", "XL"],
    measurements: [
      {
        name: "Chest",
        unit: "cm",
        values: {
          S: 67,
          M: 69,
          L: 71,
          XL: 73,
        },
      },
      {
        name: "Length",
        unit: "cm",
        values: {
          S: 65,
          M: 68,
          L: 71,
          XL: 74,
        },
      },
      {
        name: "Sleeve",
        unit: "cm",
        values: {
          S: 58,
          M: 60,
          L: 62,
          XL: 64,
        },
      },
    ],
    productType: "Hoodie",
  },
  POLO: {
    sizes: ["XS", "S", "M", "L", "XL"],
    measurements: [
      {
        name: "Chest",
        unit: "cm",
        values: {
          XS: 64,
          S: 66,
          M: 68,
          L: 70,
          XL: 72,
        },
      },
      {
        name: "Length",
        unit: "cm",
        values: {
          XS: 63,
          S: 66,
          M: 69,
          L: 71,
          XL: 74,
        },
      },
      {
        name: "Sleeve",
        unit: "cm",
        values: {
          XS: 48,
          S: 49,
          M: 50,
          L: 51,
          XL: 52,
        },
      },
    ],
    productType: "Polo",
  },
};

interface ChatMessage {
  role: string;
  content: string;
}

interface ProductVariant {
  inventory_quantity: number;
  [key: string]: number | string;
}

interface ShopifyProduct {
  title: string;
  variants?: ProductVariant[];
  success?: boolean;
  product?: ShopifyProduct;
  [key: string]: unknown;
}

export async function handleProductInquiry(
  parameters: Partial<MessageParameters>,
  message: string,
  context: ChatMessage[],
  language: string
): Promise<string> {
  const { product_name, height, fit } = parameters;
  logger.info("Handling product inquiry", {
    product_name,
    height,
    fit,
    language,
  });

  // First check if we have a product name
  if (!product_name) {
    logger.debug("No product name provided for inquiry");
    return language === "Spanish"
      ? "¿Sobre qué producto te gustaría saber la talla?"
      : "Which product would you like to know the size for?";
  }

  const shopifyData = await extractProduct(product_name);
  logger.debug("Product data retrieved", { success: shopifyData?.success });

  // For size queries, we need both product data and size-related parameters
  if (shopifyData?.success && shopifyData?.product) {
    let product_type = "CREWNECK"; // default type

    // Type guard to ensure we have a valid product with title
    const product = shopifyData.product;
    if (
      typeof product === "object" &&
      product !== null &&
      "title" in product &&
      typeof product.title === "string"
    ) {
      const upperTitle = product.title.toUpperCase();
      if (upperTitle.includes("HOODIE")) {
        product_type = "HOODIE";
      } else if (upperTitle.includes("SWEATSHIRT")) {
        product_type = "SWEATSHIRT";
      } else if (upperTitle.includes("POLO")) {
        product_type = "POLO";
      }
      logger.debug("Product type determined", {
        product_type,
        title: product.title,
      });
    }

    // If asking about sizing, we need height and fit preference
    const productTitle =
      shopifyData?.product && "title" in shopifyData.product
        ? shopifyData.product.title
        : "";
    if (!height || !fit) {
      logger.debug("Missing size parameters", { height, fit });
      const promptMessage =
        language === "Spanish"
          ? `Para recomendarte la mejor talla para el ${productTitle}, necesito saber:\n${!height ? "- Tu altura (en cm)\n" : ""}${!fit ? "- Tu preferencia de ajuste (ajustado, regular, holgado)" : ""}`
          : `To recommend the best size for the ${productTitle}, I need to know:\n${!height ? "- Your height (in cm)\n" : ""}${!fit ? "- Your preferred fit (tight, regular, loose)" : ""}`;
      return promptMessage;
    }

    // Get the size chart for this product type
    const sizeChart = sizeCharts[product_type];
    if (!sizeChart) {
      logger.warn("No size chart found for product type", { product_type });
      return language === "Spanish"
        ? "Lo siento, no tengo información de tallas para este producto específico."
        : "Sorry, I don't have size information for this specific product.";
    }

    const validatedParams: MessageParameters = {
      order_number: "",
      email: "",
      product_handle: "",
      new_delivery_info: "",
      delivery_status: "",
      tracking_number: "",
      delivery_address_confirmed: false,
      return_type: "",
      return_reason: "",
      returns_website_sent: false,
      product_type: "",
      product_name: (productTitle || product_name || "") as string,
      product_size: "",
      fit: "",
      size_query: "",
      update_type: "",
      height: "",
      weight: "",
      usual_size: "",
      ...parameters,
    };

    logger.info("Generating size recommendation", {
      product_type,
      height,
      fit,
    });
    return await aiService.generateFinalAnswer(
      "product_sizing",
      validatedParams,
      null,
      message,
      context,
      language
    );
  }

  logger.warn("Product not found or invalid data", { product_name });
  return language === "Spanish"
    ? "Lo siento, no he podido encontrar información sobre ese producto."
    : "Sorry, I couldn't find information about that product.";
}

export async function handleProductInquiryRestock(
  parameters: Partial<MessageParameters>,
  language: string
): Promise<string> {
  const { product_name, email } = parameters;
  logger.info("Handling product restock inquiry", {
    product_name,
    email,
    language,
  });

  if (!product_name) {
    logger.debug("No product name provided for restock inquiry");
    return language === "Spanish"
      ? "¿De qué producto te gustaría saber la disponibilidad?"
      : "Which product would you like to know the availability of?";
  }

  const shopifyData = await extractProduct(product_name);
  logger.debug("Product data retrieved for restock", {
    success: shopifyData?.success,
  });

  if (shopifyData?.success && shopifyData?.product) {
    const product = shopifyData.product;
    if (
      typeof product === "object" &&
      product !== null &&
      "title" in product &&
      typeof product.title === "string"
    ) {
      const productTitle = product.title;
      const variants =
        "variants" in product ? (product as ShopifyProduct).variants || [] : [];
      const availableVariants = variants.filter(
        (variant: ProductVariant) => variant.inventory_quantity > 0
      );

      if (availableVariants.length > 0) {
        logger.info("Product is in stock", {
          product_name,
          available_variants: availableVariants.length,
        });
        return language === "Spanish"
          ? `¡Sí! El ${productTitle} está disponible en nuestra tienda. ¿Te gustaría que te ayude a comprarlo?`
          : `Yes! The ${productTitle} is available in our store. Would you like help purchasing it?`;
      } else {
        logger.info("Product is out of stock", { product_name });
        if (!email) {
          return language === "Spanish"
            ? `El ${productTitle} está agotado en este momento. Si me dejas tu email, te avisaré cuando vuelva a estar disponible 😊`
            : `The ${productTitle} is currently out of stock. If you share your email with me, I'll notify you when it's back in stock 😊`;
        }

        // Create customer
        const response = await insertCustomer(email);
        if (response.success) {
          logger.info(
            "Successfully added customer to restock notification list",
            { email, product_name }
          );
          return language === "Spanish"
            ? `¡Perfecto! Te avisaré cuando el ${productTitle} vuelva a estar disponible 😊`
            : `Perfect! I'll notify you when the ${productTitle} is back in stock 😊`;
        } else {
          logger.error(
            "Failed to add customer to restock notification list",
            new Error(response.error),
            { email, product_name }
          );
          return language === "Spanish"
            ? "Lo siento, ha ocurrido un error. ¿Podrías intentarlo de nuevo?"
            : "I'm sorry, there was an error. Could you please try again?";
        }
      }
    }
  }

  logger.warn("Product not found or invalid data for restock", {
    product_name,
  });
  return language === "Spanish"
    ? "Lo siento, no he podido encontrar información sobre ese producto."
    : "Sorry, I couldn't find information about that product.";
}
