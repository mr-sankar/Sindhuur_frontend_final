// src/hooks/useChat.js
"use client";

import { useState, useEffect } from "react";
import { io, type Socket } from "socket.io-client";

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  time: string;
  edited?: boolean;
}

interface Profile {
  subscription: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const useChat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Load unread message count from localStorage
    const savedCount = localStorage.getItem("unreadMessageCount");
    if (savedCount) {
      setUnreadCount(Number.parseInt(savedCount, 10));
    }
  }, []);

  useEffect(() => {
    // Save unread message count to localStorage
    localStorage.setItem("unreadMessageCount", unreadCount.toString());
  }, [unreadCount]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const userId = userData.profileId;

    if (!userId) {
      console.warn("No userId found in localStorage");
      setConnectionError("User not logged in");
      return;
    }

    // Fetch user subscription from API
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/profiles?userId=${userId}`
        );
        const data = await response.json();
        if (response.ok) {
          const userProfile = data.find(
            (profile: Profile) => profile.id === userId
          );
          if (userProfile) {
            const userSubscription = userProfile.subscription || "free";
            setSubscription(userSubscription);

            if (userSubscription !== "free") {
              setupSocket(userId);
            } else {
              setConnectionError(
                "Upgrade to Premium or Premium Plus to use chat features."
              );
            }
          } else {
            setConnectionError("User profile not found");
          }
        } else {
          console.error("Failed to fetch profile:", data.error);
          setConnectionError(data.error || "Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setConnectionError("Failed to fetch profile");
      }
    };

    const setupSocket = (userId: string) => {
      if (!API_URL) {
        console.error("API_URL is not defined");
        setConnectionError("Server URL is not configured");
        return;
      }

      // Initialize Socket.IO connection
      const newSocket = io(API_URL, {
        query: { userId },
        transports: ["websocket", "polling"],
      });

      setSocket(newSocket);

      // Handle connection
      newSocket.on("connect", () => {
        console.log("Connected to Socket.IO server with userId:", userId);
        setConnectionError(null);
        newSocket.emit("register", userId); // Register user with server
      });

      // Handle connection errors
      newSocket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error.message);
        setConnectionError(error.message);
      });

      // Handle online users
      newSocket.on("onlineUsers", (users: string[]) => {
        console.log("Online users updated:", users);
        setOnlineUsers(users);
      });

      // Handle incoming messages
      newSocket.on("receiveMessage", (message: Message) => {
        console.log("Received message:", message);
        setMessages((prev) => {
          // Avoid duplicates by checking if message ID already exists
          if (prev.some((msg) => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        const userData = JSON.parse(
          localStorage.getItem("loggedInUser") || "{}"
        );
        const currentUserId = userData.profileId;

        // Increment unread count for messages not sent by the user
        const currentPath = window.location.pathname;
        if (
          currentPath !== "/messages" &&
          message.receiverId === currentUserId &&
          message.senderId !== currentUserId
        ) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      // Handle server confirmation of sent messages
      newSocket.on("messageSaved", (savedMessage: Message & { tempId?: string }) => {
        console.log("Message saved:", savedMessage);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === savedMessage.tempId ? { ...savedMessage, id: savedMessage.id } : msg
          )
        );
      });

      // Handle edited messages
      newSocket.on("messageEdited", (updatedMessage: Message) => {
        console.log("Message edited:", updatedMessage);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      });

      // Handle deleted messages
      newSocket.on("messageDeleted", (messageId: string) => {
        console.log("Message deleted:", messageId);
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      });

      // Fetch existing messages
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/messages?userId=${userId}`
          );
          const data = await response.json();
          if (response.ok) {
            console.log("Fetched messages:", data.messages);
            setMessages(data.messages || []);
          } else {
            console.error("Failed to fetch messages:", data.error);
            setConnectionError(data.error || "Failed to fetch messages");
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          setConnectionError("Failed to fetch messages");
        }
      };

      fetchMessages();

      // Cleanup socket connection
      return () => {
        newSocket.disconnect();
        console.log("Socket.IO connection closed");
      };
    };

    fetchSubscription();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const sendMessage = (text: string) => {
    if (subscription === "free") {
      console.warn("Cannot send message: Free subscription");
      return;
    }

    if (!socket || !receiverId) {
      console.warn("Cannot send message: socket or receiverId missing");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const senderId = userData.profileId;

    const message: Message = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      text,
      senderId,
      receiverId,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Optimistically add the message to the state
    setMessages((prev) => [...prev, message]);

    // Emit the message with a temporary ID
    socket.emit("sendMessage", { ...message, tempId: message.id });
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  return {
    messages,
    sendMessage,
    setReceiverId,
    onlineUsers,
    connectionError,
    socket,
    setMessages,
    unreadCount,
    clearUnreadCount,
  };
};