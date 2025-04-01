import { MessageParameters } from "@/app/types/api";
import { logger } from "../utils/logger";

export async function NoOrderNumberOrEmail(language: string): Promise<string> {
  const prompt =
    language === "Spanish"
      ? "Perfecto! Necesito el número de pedido (tipo #12345) y tu email para poder ayudarte 😊"
      : "Hey! I need your order number (like #12345) and email to help you out 😊";
  return prompt;
}

export async function InvalidCredentials(
  language: string,
  error?: string
): Promise<string> {
  let prompt = "";
  logger.warn("Invalid credentials", { error });

  if (error === "InvalidOrderNumber") {
    prompt =
      language === "Spanish"
        ? "¡Vaya! No encuentro ningún pedido con ese número 😅 ¿Puedes revisarlo y volver a intentarlo?"
        : "Oops! Can't find any order with that number 😅 Can you check and try again?";
  }

  if (error === "EmailMismatch") {
    prompt =
      language === "Spanish"
        ? "¡Ups! El email no coincide con el del pedido 🤔 ¿Puedes revisar si es el correcto?"
        : "Oops! The email doesn't match the order 🤔 Can you check if it's the right one?";
  }
  return prompt;
}

export function validateOrderParameters(
  parameters: MessageParameters
): boolean {
  return !!(parameters.order_number && parameters.email);
}

export function getLanguageSpecificResponse(
  spanish: string,
  english: string,
  language: string
): string {
  return language === "Spanish" ? spanish : english;
}
