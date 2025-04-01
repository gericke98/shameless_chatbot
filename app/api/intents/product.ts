import { MessageParameters } from "@/app/types/api";
import { aiService } from "../ai";
import { logger } from "../utils/logger";
import { getLanguageSpecificResponse } from "./utils";

interface ChatMessage {
  role: string;
  content: string;
}

export async function handleProductInquiry(
  parameters: MessageParameters,
  message: string,
  context: ChatMessage[],
  language: string
): Promise<string> {
  try {
    return await aiService.generateFinalAnswer(
      "product_sizing",
      parameters,
      null,
      message,
      context,
      language
    );
  } catch (error) {
    logger.error("Error handling product inquiry", error as Error);
    throw error;
  }
}

export async function handleProductInquiryRestock(
  parameters: MessageParameters,
  language: string
): Promise<string> {
  try {
    const { product_name, product_size } = parameters;

    if (!product_name || product_name === "not_found") {
      return getLanguageSpecificResponse(
        "¿De qué producto te gustaría saber la disponibilidad? 😊",
        "Which product would you like to know about? 😊",
        language
      );
    }

    if (!product_size || product_size === "not_found") {
      return getLanguageSpecificResponse(
        `¿Qué talla del ${product_name} te interesa? 😊`,
        `What size of ${product_name} are you interested in? 😊`,
        language
      );
    }

    return await aiService.generateFinalAnswer(
      "restock",
      parameters,
      null,
      "",
      [],
      language
    );
  } catch (error) {
    logger.error("Error handling product restock inquiry", error as Error);
    throw error;
  }
}
