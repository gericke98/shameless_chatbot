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
                padding: 16px;
                cursor: pointer;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                transition: all 0.2s ease-in-out;
                position: relative;
                width: 64px;
                height: 64px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chat-button:hover {
                transform: translateY(-2px);
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
                background: white;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s ease-in-out;
                position: relative;
                z-index: 1;
            }

            .chat-button:hover .chat-button-inner {
                transform: scale(0.9);
            }

            .chat-button img {
                width: 32px;
                height: 32px;
                object-fit: contain;
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
                .chat-window {
                    position: fixed;
                    bottom: 0;
                    right: 0;
                    left: 0;
                    width: 100%;
                    height: 85vh;
                    border-radius: 16px 16px 0 0;
                }

                .chat-button {
                    position: fixed;
                    bottom: 16px;
                    right: 16px;
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
                <img src="/logo.png" alt="Chat with us" />
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
                        <img src="/logo.png" alt="Shameless Collective" />
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
            <img src="/logo.png" alt="${message.sender === "user" ? "You" : "Bot"}" />
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
            <img src="/logo.png" alt="Bot" />
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
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
            status: "open",
            admin: false,
          }),
        });
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
        return await response.json();
      } catch (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }
    }

    async function addMessageToTicket(ticketId, message) {
      try {
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
        return await response.json();
      } catch (error) {
        console.error("Error adding message:", error);
        throw error;
      }
    }

    async function getBotResponse(message) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
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
        return await response.json();
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
            const initialMessage = {
              sender: "bot",
              text: "👋 Hi! I'm Santi from Shameless Collective. What can I help you with?",
              timestamp: new Date().toISOString(),
            };
            const ticket = await createTicket(initialMessage);
            if (ticket.status === 200 && ticket.data) {
              currentTicket = ticket.data;
              messages = [initialMessage];
              messagesContainer.innerHTML = "";
              messages.forEach((msg) => {
                messagesContainer.appendChild(createMessageElement(msg));
              });
              scrollToBottom();
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
        await addMessageToTicket(currentTicket.id, userMessage);

        // Get bot response
        const response = await getBotResponse(message);
        if (response.data?.response) {
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
  }
})();
