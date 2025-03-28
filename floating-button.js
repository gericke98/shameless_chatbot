// Floating Chat Button Implementation
(function () {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeChat);
  } else {
    initializeChat();
  }

  function initializeChat() {
    // Check if we're on the homepage
    if (
      window.location.pathname !== "/" &&
      !window.location.pathname.endsWith("/index.html")
    ) {
      return;
    }

    // API base URL
    const API_BASE_URL = "https://shameless-chatbot.vercel.app";

    // Logo URL - Using Shopify CDN URL
    const LOGO_URL =
      window.SHAMELESS_CHAT_CONFIG?.logoUrl ||
      "https://cdn.shopify.com/s/files/1/1304/8617/files/LOGONEGRO.png?v=1732289384";

    // Create and inject styles
    const styles = `
            .chat-widget-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            .chat-button {
                background: linear-gradient(to right, #3b82f6, #2563eb);
                color: white;
                border: none;
                border-radius: 9999px;
                padding: 12px;
                cursor: pointer;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                transition: all 0.3s ease-in-out;
                position: relative;
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chat-button:hover {
                transform: scale(1.05);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }

            .chat-button::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
                border-radius: 9999px;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }

            .chat-button-inner {
                width: 56px;
                height: 56px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease-in-out;
                position: relative;
                z-index: 1;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .chat-button:hover .chat-button-inner {
                transform: scale(0.9);
            }

            .chat-button img {
                width: 48px;
                height: 48px;
                object-fit: contain;
                padding: 4px;
            }

            .chat-window {
                position: fixed;
                bottom: 80px;
                right: 24px;
                width: 400px;
                height: 600px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 9998;
            }

            .chat-header {
                background: linear-gradient(to right, #3b82f6, #2563eb);
                padding: 16px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
            }

            .chat-header::before {
                content: '';
                position: absolute;
                inset: 0;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(4px);
            }

            .chat-header-content {
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
                z-index: 1;
            }

            .chat-header-avatar {
                width: 40px;
                height: 40px;
                border-radius: 9999px;
                background: white;
                padding: 2px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .chat-header-avatar img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .chat-header-info h2 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .chat-header-info .status {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                opacity: 0.9;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                background: #22c55e;
                border-radius: 9999px;
                animation: pulse 2s infinite;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                background: linear-gradient(to bottom, #f9fafb, #ffffff);
                scroll-behavior: smooth;
            }

            .message {
                display: flex;
                align-items: flex-end;
                gap: 8px;
                max-width: 85%;
                position: relative;
                transition: all 0.2s ease-in-out;
            }

            .message.user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }

            .message-avatar {
                width: 24px;
                height: 24px;
                border-radius: 9999px;
                overflow: hidden;
                flex-shrink: 0;
                background: white;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }

            .message-avatar img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                padding: 2px;
            }

            .message-content {
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.5;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            .message.bot .message-content {
                background: white;
                color: #1f2937;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }

            .message.user .message-content {
                background: linear-gradient(to right, #3b82f6, #2563eb);
                color: white;
            }

            .message-time {
                font-size: 11px;
                opacity: 0.7;
                margin-top: 4px;
                text-align: right;
            }

            .chat-input {
                padding: 16px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 8px;
                background: white;
                position: relative;
            }

            .chat-input::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(to bottom, transparent, rgba(249, 250, 251, 0.5));
                pointer-events: none;
            }

            .chat-input textarea {
                flex: 1;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 12px;
                font-size: 14px;
                resize: none;
                min-height: 44px;
                max-height: 120px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(4px);
                transition: all 0.2s ease-in-out;
            }

            .chat-input textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }

            .chat-input button {
                background: linear-gradient(to right, #3b82f6, #2563eb);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease-in-out;
                height: 44px;
                width: 44px;
            }

            .chat-input button:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
            }

            .chat-input button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .close-button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease-in-out;
                position: relative;
                z-index: 1;
            }

            .close-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .unread-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ef4444;
                color: white;
                font-size: 12px;
                font-weight: 600;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                display: none;
                box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
                animation: bounce 1s infinite;
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
            }

            .loading-indicator {
                display: flex;
                align-items: flex-end;
                gap: 8px;
                padding: 12px 16px;
                background: white;
                border-radius: 12px;
                border: 1px solid rgba(0, 0, 0, 0.05);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                align-self: flex-start;
            }

            .loading-dot {
                width: 6px;
                height: 6px;
                background: #3b82f6;
                border-radius: 50%;
                animation: bounce 1.4s infinite ease-in-out;
            }

            .loading-dot:nth-child(1) { animation-delay: -0.32s; }
            .loading-dot:nth-child(2) { animation-delay: -0.16s; }

            @media (max-width: 640px) {
                .chat-widget-container {
                    position: fixed;
                    inset: 0;
                    height: 100vh;
                    height: -webkit-fill-available;
                    display: flex;
                    flex-direction: column;
                    pointer-events: none;
                    z-index: 99999;
                    background-color: transparent;
                }

                .chat-window {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 20px 20px 0 0;
                    margin: 0;
                    z-index: 99998;
                    pointer-events: auto;
                    display: none;
                    flex-direction: column;
                    background-color: white;
                    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
                }

                .chat-header {
                    position: sticky;
                    top: 0;
                    border-radius: 20px 20px 0 0;
                    height: 60px;
                    background: linear-gradient(to right, #3b82f6, #2563eb);
                    z-index: 99999;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    padding-bottom: 100px;
                    -webkit-overflow-scrolling: touch;
                    z-index: 1;
                    background: #f9fafb;
                    gap: 12px;
                }

                .message {
                    max-width: 85%;
                    margin-bottom: 4px;
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .message.user {
                    align-self: flex-end;
                }

                .message.user .message-avatar {
                    display: none;
                }

                .message.user .message-content {
                    background: #3b82f6;
                    color: white;
                    border-radius: 18px 4px 18px 18px;
                    margin-left: 40px;
                }

                .message.bot .message-content {
                    background: white;
                    color: black;
                    border-radius: 4px 18px 18px 18px;
                    border: none;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    margin-right: 40px;
                }

                .message-time {
                    font-size: 10px;
                    opacity: 0.6;
                    margin-top: 2px;
                    padding: 0 4px;
                }

                .chat-input {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 12px 16px;
                    border-top: 1px solid rgba(0, 0, 0, 0.1);
                    z-index: 99999;
                    pointer-events: auto;
                    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
                    height: auto;
                    min-height: 70px;
                }

                .chat-input textarea {
                    font-size: 16px;
                    line-height: 1.5;
                    padding: 12px 16px;
                    max-height: 100px;
                    width: 100%;
                    box-sizing: border-box;
                    border-radius: 24px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    margin: 0;
                    min-height: 44px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .chat-input button {
                    background: #3b82f6;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    padding: 0;
                    flex-shrink: 0;
                    margin-bottom: 2px;
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
                }

                .chat-input button:active {
                    transform: scale(0.95);
                }

                .chat-button {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 80px;
                    height: 80px;
                    z-index: 99996;
                    pointer-events: auto;
                    display: flex !important;
                    opacity: 1 !important;
                }

                .chat-button-inner {
                    width: 56px;
                    height: 56px;
                    background: rgba(255, 255, 255, 0.9);
                }

                .chat-button img {
                    width: 48px;
                    height: 48px;
                    padding: 4px;
                }

                .loading-indicator {
                    background: white;
                    border: none;
                    border-radius: 4px 18px 18px 18px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    margin-right: 40px;
                    animation: fadeIn 0.3s ease-out;
                }

                .loading-dot {
                    width: 4px;
                    height: 4px;
                    background: #3b82f6;
                    opacity: 0.7;
                }

                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 3px;
                }
            }
        `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create chat container
    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-widget-container";
    document.body.appendChild(chatContainer);

    // Create chat button
    const chatButton = document.createElement("button");
    chatButton.className = "chat-button";
    chatButton.innerHTML = `
            <div class="chat-button-inner">
                <img src="${LOGO_URL}" alt="Chat with us" width="48" height="48">
            </div>
            <div class="unread-badge"></div>
        `;
    chatContainer.appendChild(chatButton);

    // Create chat window
    const chatWindow = document.createElement("div");
    chatWindow.className = "chat-window";
    chatWindow.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-content">
                    <div class="chat-header-avatar">
                        <img src="${LOGO_URL}" alt="Shameless Support" width="40" height="40" style="object-fit: contain; padding: 4px;">
                    </div>
                    <div class="chat-header-info">
                        <h2>Shameless Support</h2>
                        <div class="status">
                            <div class="status-dot"></div>
                            <span>Online now</span>
                        </div>
                    </div>
                </div>
                <button class="close-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type a message..." rows="1"></textarea>
                <button type="submit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        `;
    chatContainer.appendChild(chatWindow);

    // State management
    let isOpen = false;
    let currentTicket = null;
    let messages = [];
    let isLoading = false;
    const messagesContainer = chatWindow.querySelector(".chat-messages");
    const inputTextarea = chatWindow.querySelector("textarea");
    const submitButton = chatWindow.querySelector(".chat-input button");
    const unreadBadge = chatButton.querySelector(".unread-badge");

    // Helper functions
    function formatDate(date) {
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    function createMessageElement(message) {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${message.sender}`;
      messageDiv.innerHTML = `
        <div class="message-avatar">
            ${
              message.sender === "user"
                ? `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            `
                : `
                <img src="${LOGO_URL}" alt="Bot avatar" width="24" height="24" style="object-fit: contain; padding: 2px;">
            `
            }
        </div>
        <div class="message-content">
            <div class="message-text">${message.text}</div>
            <div class="message-time">${formatDate(message.timestamp)}</div>
        </div>
      `;
      return messageDiv;
    }

    function createLoadingIndicator() {
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "loading-indicator";
      loadingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${LOGO_URL}" alt="Bot avatar" width="24" height="24" style="object-fit: contain; padding: 2px;">
        </div>
        <div class="message-content">
            <div class="flex gap-1">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
      `;
      return loadingDiv;
    }

    function scrollToBottom() {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 100);
    }

    function showUnreadBadge() {
      unreadBadge.style.display = "flex";
    }

    function hideUnreadBadge() {
      unreadBadge.style.display = "none";
    }

    // API functions
    async function createTicket(message) {
      try {
        console.log("Creating ticket with message:", message);
        const response = await fetch(`${API_BASE_URL}/api/tickets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          credentials: "omit",
          body: JSON.stringify({
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp,
          }),
        });
        console.log("Create ticket response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error creating ticket:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(
            `HTTP error! status: ${response.status}\n${errorText}`
          );
        }
        const data = await response.json();
        console.log("Create ticket response data:", data);
        return data;
      } catch (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }
    }

    async function addMessageToTicket(ticketId, message) {
      try {
        console.log("Adding message to ticket:", { ticketId, message });
        const response = await fetch(`${API_BASE_URL}/api/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          credentials: "omit",
          body: JSON.stringify({
            ticketId,
            message: {
              sender: message.sender,
              text: message.text,
              timestamp: message.timestamp,
              ticketId: ticketId,
            },
          }),
        });
        console.log("Add message response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error adding message:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(
            `HTTP error! status: ${response.status}\n${errorText}`
          );
        }
        const data = await response.json();
        console.log("Add message response data:", data);
        return data;
      } catch (error) {
        console.error("Error adding message:", error);
        throw error;
      }
    }

    async function getBotResponse(message) {
      try {
        console.log("Getting bot response for message:", message);
        const response = await fetch(`${API_BASE_URL}/api`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          credentials: "omit",
          body: JSON.stringify({
            message,
            context: messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            currentTicket,
          }),
        });
        console.log("Get bot response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error getting bot response:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(
            `HTTP error! status: ${response.status}\n${errorText}`
          );
        }
        const data = await response.json();
        console.log("Get bot response data:", data);
        return data;
      } catch (error) {
        console.error("Error getting bot response:", error);
        throw error;
      }
    }

    // Event handlers
    chatButton.addEventListener("click", async () => {
      if (!isOpen) {
        if (!currentTicket) {
          isLoading = true;
          submitButton.disabled = true;
          try {
            console.log("Initializing chat...");
            const initialMessage = {
              sender: "bot",
              text: "👋 Qué pasa crack? En qué te puedo ayudar?",
              timestamp: new Date().toISOString(),
            };
            const ticket = await createTicket(initialMessage);
            console.log("Ticket created:", ticket);
            if (ticket && ticket.data) {
              currentTicket = ticket.data;
              messages = [initialMessage];
              messagesContainer.innerHTML = "";
              messages.forEach((msg) => {
                messagesContainer.appendChild(createMessageElement(msg));
              });
              scrollToBottom();
            } else {
              throw new Error("Invalid ticket response");
            }
          } catch (error) {
            console.error("Error initializing chat:", error);
          } finally {
            isLoading = false;
            submitButton.disabled = false;
          }
        }
        chatWindow.style.display = "flex";
        isOpen = true;
        hideUnreadBadge();
      } else {
        chatWindow.style.display = "none";
        isOpen = false;
      }
    });

    chatWindow.querySelector(".close-button").addEventListener("click", () => {
      chatWindow.style.display = "none";
      isOpen = false;
    });

    inputTextarea.addEventListener("input", () => {
      inputTextarea.style.height = "auto";
      inputTextarea.style.height =
        Math.min(inputTextarea.scrollHeight, 120) + "px";
    });

    inputTextarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitButton.click();
      }
    });

    submitButton.addEventListener("click", async () => {
      const message = inputTextarea.value.trim();
      if (!message || !currentTicket || isLoading) return;

      console.log("Sending message:", message);
      const userMessage = {
        sender: "user",
        text: message,
        timestamp: new Date().toISOString(),
      };

      try {
        isLoading = true;
        submitButton.disabled = true;
        inputTextarea.value = "";
        inputTextarea.style.height = "auto";

        // Add user message to UI
        messages.push(userMessage);
        messagesContainer.appendChild(createMessageElement(userMessage));
        scrollToBottom();

        // Add loading indicator
        const loadingIndicator = createLoadingIndicator();
        messagesContainer.appendChild(loadingIndicator);
        scrollToBottom();

        // Save message to database
        console.log("Adding message to ticket:", currentTicket.id);
        await addMessageToTicket(currentTicket.id, userMessage);

        // Get bot response
        console.log("Getting bot response");
        const response = await getBotResponse(message);
        console.log("Bot response received:", response);
        if (response && response.data && response.data.response) {
          const botMessage = {
            sender: "bot",
            text: response.data.response,
            timestamp: new Date().toISOString(),
          };
          await addMessageToTicket(currentTicket.id, botMessage);
          messages.push(botMessage);
          messagesContainer.removeChild(loadingIndicator);
          messagesContainer.appendChild(createMessageElement(botMessage));
          scrollToBottom();
        } else {
          throw new Error("Invalid bot response");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        if (!isOpen) {
          showUnreadBadge();
        }
      } finally {
        isLoading = false;
        submitButton.disabled = false;
      }
    });

    // Update the meta viewport tag
    const metaViewport = document.createElement("meta");
    metaViewport.name = "viewport";
    metaViewport.content =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    document.head.appendChild(metaViewport);

    // Add this to the initializeChat function, after creating the chat window
    function preventIOSScrolling() {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        let originalHeight;
        let originalScrollPos;

        inputTextarea.addEventListener("focus", () => {
          originalHeight = window.visualViewport.height;
          originalScrollPos = window.scrollY;

          // Add a small delay to account for keyboard animation
          setTimeout(() => {
            const keyboardHeight =
              originalHeight - window.visualViewport.height;
            chatWindow.style.height = `${window.visualViewport.height}px`;

            // Ensure the input is visible
            const inputRect = inputTextarea.getBoundingClientRect();
            const scrollAmount =
              inputRect.top -
              window.visualViewport.height +
              inputRect.height +
              keyboardHeight;

            if (scrollAmount > 0) {
              messagesContainer.scrollTop += scrollAmount;
            }
          }, 100);
        });

        inputTextarea.addEventListener("blur", () => {
          chatWindow.style.height = "100%";
          window.scrollTo(0, originalScrollPos);
        });

        // Prevent bounce scrolling
        document.body.style.overflow = "hidden";
        messagesContainer.style.overscrollBehavior = "none";
      }
    }

    // Call this function after creating the chat window
    preventIOSScrolling();
  }
})();
