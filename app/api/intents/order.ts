import { MessageParameters } from "@/app/types/api";
import {
  extractCompleteOrder,
  trackOrder,
  updateShippingAddress,
} from "../../queries/order";
import { aiService } from "../ai";
import { logger } from "../utils/logger";
import {
  NoOrderNumberOrEmail,
  InvalidCredentials,
  validateOrderParameters,
} from "./utils";
import { sendEmail } from "../mail";
import { OpenAIMessage } from "@/types";

export async function handleOrderTracking(
  parameters: MessageParameters,
  context: OpenAIMessage[],
  language: string
): Promise<string> {
  const { order_number, email } = parameters;
  logger.info("Handling order tracking request", {
    order_number,
    email,
    language,
  });

  if (!validateOrderParameters(parameters)) {
    logger.warn("Invalid order parameters for tracking", {
      order_number,
      email,
    });
    return await NoOrderNumberOrEmail(language);
  }

  const shopifyData = await trackOrder(order_number, email);
  if (!shopifyData.success) {
    logger.error("Failed to track order", new Error(shopifyData.error), {
      order_number,
      email,
    });
    return await InvalidCredentials(language, shopifyData.error);
  }

  logger.info("Successfully retrieved order tracking data", {
    order_number,
    email,
  });
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
  context: OpenAIMessage[],
  language: string
): Promise<string> {
  const { order_number, email } = parameters;
  logger.info("Handling delivery issue request", {
    order_number,
    email,
    language,
  });

  try {
    if (!validateOrderParameters(parameters)) {
      logger.warn("Invalid order parameters for delivery issue", {
        order_number,
        email,
      });
      return await NoOrderNumberOrEmail(language);
    }

    const shopifyData = await trackOrder(order_number, email);
    if (!shopifyData.success) {
      logger.error(
        "Failed to track order for delivery issue",
        new Error(shopifyData.error),
        { order_number, email }
      );
      return await InvalidCredentials(language, shopifyData.error);
    }

    if (parameters.order_number && parameters.email) {
      logger.info("Sending delivery issue notification email", {
        order_number,
        email,
      });
      await sendEmail(
        "hello@shamelesscollective.com",
        parameters.order_number,
        parameters.email
      );
      logger.info("Successfully sent delivery issue notification", {
        order_number,
        email,
      });
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
    logger.error("Error handling delivery issue", error as Error, {
      order_number,
      email,
    });
    throw error;
  }
}

export async function handleChangeDelivery(
  parameters: MessageParameters,
  message: string,
  context: OpenAIMessage[],
  language: string
): Promise<string> {
  const { order_number, email, new_delivery_info, delivery_address_confirmed } =
    parameters;
  logger.info("Handling delivery address change request", {
    order_number,
    email,
    language,
  });

  if (!order_number || !email) {
    logger.warn("Missing order number or email for delivery change", {
      order_number,
      email,
    });
    return await NoOrderNumberOrEmail(language);
  }

  const shopifyData = await extractCompleteOrder(order_number, email);
  if (!shopifyData.success) {
    logger.error(
      "Failed to extract order data for delivery change",
      new Error(shopifyData.error),
      { order_number, email }
    );
    return await InvalidCredentials(language, shopifyData.error);
  }

  if (!shopifyData?.success || !shopifyData?.order) {
    logger.warn("Invalid order data for delivery change", {
      order_number,
      email,
    });
    return await aiService.generateFinalAnswer(
      "change_delivery",
      parameters,
      shopifyData,
      message,
      context,
      language
    );
  }

  if (!shopifyData.order.fulfillments?.length) {
    // Order not yet shipped
    if (!new_delivery_info) {
      logger.debug("No new delivery info provided, requesting confirmation", {
        order_number,
        email,
      });
      return await aiService.confirmDeliveryAddress(
        parameters,
        message,
        context,
        language
      );
    }

    const addressValidation =
      await aiService.validateAddress(new_delivery_info);
    if (!addressValidation.formattedAddress) {
      logger.warn("Invalid delivery address format", {
        order_number,
        email,
        new_delivery_info,
      });
      return await aiService.confirmDeliveryAddress(
        parameters,
        message,
        context,
        language
      );
    }

    if (delivery_address_confirmed) {
      logger.info("Updating shipping address", {
        order_number,
        email,
        new_address: addressValidation.formattedAddress,
      });
      await updateShippingAddress(
        shopifyData.order.admin_graphql_api_id,
        addressValidation.formattedAddress,
        {
          first_name: shopifyData.order.shipping_address.first_name || "",
          last_name: shopifyData.order.shipping_address.last_name || "",
          phone: shopifyData.order.shipping_address.phone || "",
        }
      );
      logger.info("Successfully updated shipping address", {
        order_number,
        email,
      });

      const confirmationMessage =
        language === "Spanish"
          ? `¡Perfecto! He actualizado la dirección de envío a:\n\n${addressValidation.formattedAddress}\n\n¡Tu pedido se enviará a esta nueva dirección! 📦✨`
          : `Perfect! I've updated the shipping address to:\n\n${addressValidation.formattedAddress}\n\nYour order will be shipped to this new address! 📦✨`;

      return confirmationMessage;
    }

    return await aiService.confirmDeliveryAddress(
      parameters,
      message,
      context,
      language
    );
  }

  // Order already shipped
  if (!new_delivery_info) {
    logger.debug(
      "No new delivery info provided for shipped order, requesting confirmation",
      { order_number, email }
    );
    return await aiService.confirmDeliveryAddress(
      parameters,
      message,
      context,
      language
    );
  }

  const addressValidation = await aiService.validateAddress(new_delivery_info);
  if (!addressValidation.formattedAddress) {
    logger.warn("Invalid delivery address format for shipped order", {
      order_number,
      email,
      new_delivery_info,
    });
    return await aiService.confirmDeliveryAddress(
      parameters,
      message,
      context,
      language
    );
  }

  if (delivery_address_confirmed) {
    try {
      const phoneNumber = "+34608667749";
      logger.info("Initiating delivery address change call", {
        order_number,
        email,
        new_address: addressValidation.formattedAddress,
      });

      if (phoneNumber) {
        const callPrompt = `Eres una persona llamada Silvia. Estás llamando a una empresa de envíos para modificar la dirección de envío de tu paquete. Responde en 3 a 7 oraciones en la mayoría de los casos.
                Si te pregunta, aquí tienes información adicional sobre el pedido: 
                - Número de seguimiento ${shopifyData.order.fulfillments[0].tracking_number}
              - Nueva dirección de entrega: ${addressValidation.formattedAddress}
                Actúa como el cliente y no como un agente, es decir, la persona a la que llamas te tiene que dar la solución, tú no le tienes que ayudar en resolver sus problemas.`;

        const firstMessage =
          language === "Spanish"
            ? `Hola, soy Silvia. Llamo para cambiar la dirección de envío de mi pedido`
            : `Hello, this is Silvia. I'm calling to change the delivery address of my order.`;

        const callResponse = await fetch(
          `${process.env.OUTBOUND_CALL_URL || "https://c110-81-33-205-107.ngrok-free.app"}/outbound-call`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: callPrompt,
              first_message: firstMessage,
              number: phoneNumber,
            }),
          }
        );

        const callData = await callResponse.json();
        if (!callData.success) {
          throw new Error(callData.error || "Failed to initiate call");
        }

        const callSid = callData.callSid;
        let callCompleted = false;
        const maxWaitTime = 300;
        let waitedTime = 0;

        while (!callCompleted && waitedTime < maxWaitTime) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          waitedTime += 5;

          try {
            const statusResponse = await fetch(
              `${process.env.OUTBOUND_CALL_URL || "https://c110-81-33-205-107.ngrok-free.app"}/call-status/${callSid}`
            );

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (
                statusData.status === "completed" ||
                statusData.status === "failed" ||
                statusData.status === "busy" ||
                statusData.status === "no-answer" ||
                statusData.status === "canceled"
              ) {
                callCompleted = true;
                logger.info("Call completed", {
                  order_number,
                  email,
                  status: statusData.status,
                });
              }
            }
          } catch (error) {
            logger.error("Error checking call status", error as Error, {
              order_number,
              email,
              callSid,
            });
          }
        }

        if (!callCompleted) {
          logger.warn("Call timed out", { order_number, email, callSid });
          return language === "Spanish"
            ? "Lo siento, no pude contactar con la empresa de envíos. Por favor, intenta llamar más tarde."
            : "I'm sorry, I couldn't contact the shipping company. Please try calling later.";
        }

        return language === "Spanish"
          ? "¡Perfecto! He iniciado el proceso de cambio de dirección con la empresa de envíos. Te contactarán pronto para confirmar los detalles."
          : "Perfect! I've initiated the address change process with the shipping company. They'll contact you soon to confirm the details.";
      }
    } catch (error) {
      logger.error(
        "Error initiating delivery address change call",
        error as Error,
        { order_number, email }
      );
      return language === "Spanish"
        ? "Lo siento, ha habido un error al intentar cambiar la dirección de envío. Por favor, intenta llamar más tarde."
        : "I'm sorry, there was an error trying to change the delivery address. Please try calling later.";
    }
  }

  return await aiService.confirmDeliveryAddress(
    parameters,
    message,
    context,
    language
  );
}

export async function handleUpdateOrder(
  parameters: MessageParameters,
  message: string,
  context: OpenAIMessage[],
  language: string
): Promise<string> {
  const { order_number, email, update_type } = parameters;
  logger.info("Handling order update request", {
    order_number,
    email,
    update_type,
    language,
  });

  if (!validateOrderParameters(parameters)) {
    logger.warn("Invalid order parameters for update", { order_number, email });
    return await NoOrderNumberOrEmail(language);
  }

  const shopifyData = await extractCompleteOrder(order_number, email);
  if (!shopifyData.success) {
    logger.error(
      "Failed to extract order data for update",
      new Error(shopifyData.error),
      { order_number, email }
    );
    return await InvalidCredentials(language, shopifyData.error);
  }

  logger.info("Successfully retrieved order data for update", {
    order_number,
    email,
  });
  return await aiService.generateFinalAnswer(
    "update_order",
    parameters,
    shopifyData,
    message,
    context,
    language
  );
}
