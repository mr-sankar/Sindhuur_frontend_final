import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Heart,
  Mail,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash,
} from "lucide-react";
import Header from "@/components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Messages = () => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const {
    messages,
    sendMessage,
    setReceiverId,
    onlineUsers,
    connectionError,
    socket,
  } = useChat();

  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileId, setProfileId] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatListRef = useRef(null);

  // Edit/Delete state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const subscription = localStorage.getItem("subscription");

  useEffect(() => {

    if (!isLoggedIn) return;

    const userData = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const currentProfileId = userData.profileId;
    setProfileId(currentProfileId);

    if (!currentProfileId) {
      toast({
        title: "Error",
        description: "User not logged in.",
        variant: "destructive",
      });
      return;
    }

    fetchChatList(currentProfileId);

    const params = new URLSearchParams(location.search);
    const chatId = params.get("chatId");
    if (chatId) {
      setSelectedChat(chatId);
      setReceiverId(chatId);
    }
  }, [location, setReceiverId, isLoggedIn, toast]);

  useEffect(() => {
    if (!profileId || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const otherId =
      lastMessage.senderId === profileId
        ? lastMessage.receiverId
        : lastMessage.senderId;

    if (!chatList.some((c) => c.id === otherId)) {
      fetchChatList(profileId);
    }
  }, [messages, chatList, profileId]);

  const fetchChatList = async (currentProfileId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/chat-contacts?profileId=${currentProfileId}`
      );
      const data = await response.json();
      if (response.ok) {
        setChatList(data.contacts || []);
      } else {
        throw new Error(data.error || "Failed to fetch chat list");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (subscription === "Free") {
      toast({
        title: "Upgrade Required",
        description: "You need Premium or Premium Plus to send messages.",
        variant: "destructive",
      });
      return;
    }

    if (!newMessage.trim() || !selectedChat) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  const filteredConversations = chatList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = chatList.find((c) => c.id === selectedChat);

  const handleScroll = () => {
    if (chatListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatListRef.current;
      setShowScrollToTop(scrollTop > 0);
      setShowScrollToBottom(scrollTop + clientHeight < scrollHeight);
    }
  };

  const scrollToTop = () => {
    if (chatListRef.current) {
      chatListRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (chatListRef.current) {
      chatListRef.current.scrollTo({
        top: chatListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Edit/Delete functions
  const toggleMenu = (id) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const startEdit = (message) => {
    setEditingMessageId(message.id);
    setEditText(message.text);
    setActiveMenuId(null);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    socket.emit("editMessage", { messageId: id, newText: editText });
    setEditingMessageId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const deleteMessage = (id) => {
    socket.emit("deleteMessage", id);
    setActiveMenuId(null);
  };

  return (
    <>
      <Header />
      <div className="flex-1 w-full px-2 sm:px-4 py-4 max-w-7xl mx-auto">
        {connectionError && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
            <p>
              {" "}
              {connectionError}{" "}
              <a
                href=""
                onClick={() => navigate("/membership")}
                className="text-blue-500 underline"
              >
                Upgrade
              </a>
            </p>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4 md:h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <Card className="md:w-1/3 w-full relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Messages</span>
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 pl-10 border border-gray-300 rounded-md bg-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    searchFocused ? "text-left" : "text-center"
                  }`}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={(e) => !e.target.value && setSearchFocused(false)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
             <div
  ref={chatListRef}
  className="space-y-1 overflow-y-auto max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-400px)]"
  onScroll={handleScroll}
>
  {filteredConversations.length === 0 ? (
    <p className="p-4 text-gray-500 text-sm">
      No conversations yet. Start a chat from a profile!
    </p>
  ) : (
    filteredConversations.map((conversation) => {
      // Filter messages for this conversation
      const conversationMessages = messages.filter(
        (m) =>
          (m.senderId === conversation.id && m.receiverId === profileId) ||
          (m.receiverId === conversation.id && m.senderId === profileId)
      );
      // Get the most recent message (last in the array)
      const latestMessage = conversationMessages[conversationMessages.length - 1];

      return (
        <div
          key={conversation.id}
          className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
            selectedChat === conversation.id
              ? "bg-yellow-50 border-l-4 border-yellow-500"
              : ""
          }`}
          onClick={() => {
            setSelectedChat(conversation.id);
            setReceiverId(conversation.id);
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={`${BASE_URL}${conversation.avatar}`}
                alt={conversation.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {onlineUsers.includes(conversation.id) && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {conversation.name}
                </h3>
                <span className="text-xs text-gray-500">
                  {latestMessage?.time || ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 truncate">
                  {latestMessage?.text || "No messages yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    })
  )}
</div>
            </CardContent>
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              {showScrollToTop && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full w-8 h-8 p-0"
                  onClick={scrollToTop}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
              {showScrollToBottom && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full w-8 h-8 p-0"
                  onClick={scrollToBottom}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="md:w-2/3 w-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-3">
                  {selectedConversation && (
                    <img
                      src={`${BASE_URL}${selectedConversation?.avatar}`}
                      alt={selectedConversation?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation?.name || "Select a conversation"}
                    </h3>
                    {selectedConversation && (
                      <p
                        className={`text-sm ${
                          onlineUsers.includes(selectedConversation.id)
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {onlineUsers.includes(selectedConversation.id)
                          ? "Online"
                          : "Offline"}
                      </p>
                    )}
                  </div>
                </div>
                {/* {selectedConversation && (
                  <div className="flex items-center flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                )} */}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation ? (
                messages
                  .filter(
                    (m) =>
                      (m.senderId === selectedChat &&
                        m.receiverId === profileId) ||
                      (m.receiverId === selectedChat &&
                        m.senderId === profileId)
                  )
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === profileId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`relative max-w-xs sm:max-w-sm md:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === profileId
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {editingMessageId === message.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="text-sm text-black  px-2 py-1 rounded"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveEdit(message.id)}
                              className="text-black"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="text-danger"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm break-words">
                            {message.text}{" "}
                            {message.edited && (
                              <span className="text-xs italic">(edited)</span>
                            )}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <p
                            className={`text-xs ${
                              message.senderId === profileId
                                ? "text-yellow-100"
                                : "text-gray-500"
                            }`}
                          >
                            {message.time}
                          </p>
                          {message.senderId === profileId && (
                            <div className="relative">
                              <MoreVertical
                                className="cursor-pointer w-4 h-4"
                                onClick={() => toggleMenu(message.id)}
                              />
                              {activeMenuId === message.id && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                                  <button
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                                    onClick={() => startEdit(message)}
                                  >
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                  </button>
                                  <button
                                    className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 w-full text-left flex items-center"
                                    onClick={() => deleteMessage(message.id)}
                                  >
                                    <Trash className="w-4 h-4 mr-2" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center">
                  Select a conversation to start chatting
                </p>
              )}
            </CardContent>

            {selectedConversation && (
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-yellow-500 hover:bg-yellow-600"
                    disabled={!!connectionError}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <footer className="bg-[#101626] text-white p-6 sm:p-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-yellow-500 p-2 rounded-full">
                <Heart className="text-white w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Sindhuura</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-300">
              India's most trusted matrimonial platform connecting hearts across
              the globe. With over 5 million verified profiles and 50,000+
              success stories, we help you find your perfect life partner with
              complete privacy and security.
            </p>
          </div>
          <div className="text-sm sm:text-base space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-yellow-500" />
              <span>+91 80-4567-8900</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-yellow-500" />
              <span>support@publicmatrimony.com</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Messages;