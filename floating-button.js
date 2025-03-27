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
                padding: 16px 32px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                transition: all 0.2s ease-in-out;
                display: flex;
                align-items: center;
                gap: 8px;
                position: relative;
            }

            .chat-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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

            .chat-header h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                position: relative;
                z-index: 1;
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
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.5;
                position: relative;
                transition: all 0.2s ease-in-out;
            }

            .message:hover {
                transform: scale(1.01);
            }

            .message.bot {
                background: white;
                color: #1f2937;
                align-self: flex-start;
                border: 1px solid rgba(0, 0, 0, 0.05);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            .message.user {
                background: linear-gradient(to right, #3b82f6, #2563eb);
                color: white;
                align-self: flex-end;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
            }

            .message-content {
                white-space: pre-wrap;
                word-break: break-word;
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
            }

            .loading-indicator {
                display: flex;
                gap: 4px;
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

            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Chat Now
            <div class="unread-badge"></div>
        `;
    chatContainer.appendChild(chatButton);

    // Create chat window
    const chatWindow = document.createElement("div");
    chatWindow.className = "chat-window";
    chatWindow.innerHTML = `
            <div class="chat-header">
                <h2>Shameless Support</h2>
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
        <div class="message-content">${message.text}</div>
        <div class="message-time">${formatDate(message.timestamp)}</div>
      `;
      return messageDiv;
    }

    function createLoadingIndicator() {
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "loading-indicator";
      loadingDiv.innerHTML = `
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
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
        const response = await fetch("/api/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp,
            status: "open",
            admin: false,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }
    }

    async function addMessageToTicket(ticketId, message) {
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error adding message:", error);
        throw error;
      }
    }

    async function getBotResponse(message) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            context: messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
