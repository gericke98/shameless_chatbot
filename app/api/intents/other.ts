import { MessageParameters } from "@/app/types/api";
import { aiService } from "../ai";
import { logger } from "../utils/logger";
import { getLanguageSpecificResponse } from "./utils";

export async function handleReturnsExchange(language: string): Promise<string> {
  return getLanguageSpecificResponse(
    "¡Claro! Puedes hacer el cambio o devolución en el siguiente link: https://shameless-returns-web.vercel.app. Recuerda que el número de pedido es algo como #35500 y lo puedes encontrar en el correo de confirmación de pedido.",
    "Sure thing! You can make the change or return in the following link: https://shameless-returns-web.vercel.app. Remember that the order number is of the form #35500 and you can find it in the order confirmation email.",
    language
  );
}

export async function handlePromoCode(
  parameters: MessageParameters,
  language: string
): Promise<string> {
  try {
    return await aiService.generateFinalAnswer(
      "promo_code",
      parameters,
      null,
      "",
      [],
      language
    );
  } catch (error) {
    logger.error("Error handling promo code request", error as Error);
    throw error;
  }
}

export async function handleInvoiceRequest(
  parameters: MessageParameters,
  language: string
): Promise<string> {
  try {
    return await aiService.generateFinalAnswer(
      "invoice_request",
      parameters,
      null,
      "",
      [],
      language
    );
  } catch (error) {
    logger.error("Error handling invoice request", error as Error);
    throw error;
  }
}
