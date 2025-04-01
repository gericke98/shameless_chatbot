import { MessageParameters } from "@/app/types/api";
import { trackOrder } from "../../queries/order";
import { aiService } from "../ai";
import { logger } from "../utils/logger";
import {
  NoOrderNumberOrEmail,
  InvalidCredentials,
  validateOrderParameters,
} from "./utils";
import { sendEmail } from "../mail";

interface ChatMessage {
  role: string;
  content: string;
}

export async function handleOrderTracking(
  parameters: MessageParameters,
  context: ChatMessage[],
  language: string
): Promise<string> {
  const { order_number, email } = parameters;

  if (!validateOrderParameters(parameters)) {
    return await NoOrderNumberOrEmail(language);
  }

  const shopifyData = await trackOrder(order_number, email);
  if (!shopifyData.success) {
    return await InvalidCredentials(language, shopifyData.error);
  }

  return await aiService.generateFinalAnswer(
    "order_tracking",
    parameters,
    shopifyData,
    "",
    context,
    language
  );
}

export async function handleDeliveryIssue(
  parameters: MessageParameters,
  message: string,
  context: ChatMessage[],
  language: string
): Promise<string> {
  try {
    if (!validateOrderParameters(parameters)) {
      return await NoOrderNumberOrEmail(language);
    }

    const shopifyData = await trackOrder(
      parameters.order_number,
      parameters.email
    );
    if (!shopifyData.success) {
      return await InvalidCredentials(language, shopifyData.error);
    }

    if (parameters.order_number && parameters.email) {
      await sendEmail(
        "hello@shamelesscollective.com",
        parameters.order_number,
        parameters.email
      );
    } else {
      logger.warn(
        "Missing order number or email for delivery issue notification"
      );
    }

    return await aiService.generateFinalAnswer(
      "delivery_issue",
      parameters,
      shopifyData,
      message,
      context,
      language
    );
  } catch (error) {
    logger.error("Error handling delivery issue", error as Error);
    throw error;
  }
}

export async function handleChangeDelivery(
  parameters: MessageParameters,
  message: string,
  context: ChatMessage[],
  language: string
): Promise<string> {
  try {
    if (!validateOrderParameters(parameters)) {
      return await NoOrderNumberOrEmail(language);
    }

    const shopifyData = await trackOrder(
      parameters.order_number,
      parameters.email
    );
    if (!shopifyData.success) {
      return await InvalidCredentials(language, shopifyData.error);
    }

    return await aiService.generateFinalAnswer(
      "change_delivery",
      parameters,
      shopifyData,
      message,
      context,
      language
    );
  } catch (error) {
    logger.error("Error handling delivery change", error as Error);
    throw error;
  }
}

export async function handleUpdateOrder(
  parameters: MessageParameters,
  message: string,
  context: ChatMessage[],
  language: string
): Promise<string> {
  try {
    if (!validateOrderParameters(parameters)) {
      return await NoOrderNumberOrEmail(language);
    }

    const shopifyData = await trackOrder(
      parameters.order_number,
      parameters.email
    );
    if (!shopifyData.success) {
      return await InvalidCredentials(language, shopifyData.error);
    }

    return await aiService.generateFinalAnswer(
      "update_order",
      parameters,
      shopifyData,
      message,
      context,
      language
    );
  } catch (error) {
    logger.error("Error handling order update", error as Error);
    throw error;
  }
}
