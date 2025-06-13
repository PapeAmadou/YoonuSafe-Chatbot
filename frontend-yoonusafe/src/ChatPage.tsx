import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import UserAvatar from "./user/UserAvatar";
import { motion } from "framer-motion";

type Sender = "user" | "bot";

export interface Message {
  sender: Sender;
  text: string;
  files?: string[]; 
}


interface ApiMessage {
  sender: Sender;
  message: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const cancelRef = useRef(false);
  const [cancelResponse, setCancelResponse] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async ({ text, files }: { text: string; files: File[] }) => {
    const token = localStorage.getItem("access_token");
    if (!text.trim() && files.length === 0) return;
  
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
        files: files.map((f) => f.name),
      },
    ]);
  
    setIsThinking(true);

    setCancelResponse(false); // 🔄 on reset l’ancien cancel

    let response;
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("message", text);
      files.forEach((file) => {
        formData.append("documents", file);
      });
  
      // 🔥 Ajout de l'ID de conversation s'il existe
      if (activeConversationId) {
        formData.append("conversation_id", activeConversationId.toString());
      }
  
      response = await fetch("http://172.20.10.10:5000/chat-with-files", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });
  
      if (cancelResponse) {
        setCancelResponse(false);
        setIsThinking(false);
        return;
      }
  
    } else {
      response = await fetch("http://172.20.10.10:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          message: text,
          conversation_id: activeConversationId,
        }),
      });
      if (cancelRef.current || cancelResponse) {
        setCancelResponse(false);
        return;
      }      
      
    }
  
    const data = await response.json();
  
    if (data.response && data.response !== "Réponse à : Nouvelle conversation") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.response ?? "Une erreur est survenue lors de la réponse.",
        },
      ]);
    }
  
    //  Met à jour l'ID de conversation s'il a été retourné (cas d'une nouvelle)
    if (!activeConversationId && data.conversation_id) {
      setActiveConversationId(data.conversation_id);
    }
  
    setIsThinking(false);
  };

  const loadConversation = async (conversationId: number) => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`http://172.20.10.10:5000/conversations/${conversationId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setMessages(
        (data.messages as ApiMessage[]).map((msg) => ({
          sender: msg.sender,
          text: msg.message,
        }))
      );
      setActiveConversationId(conversationId);
    }
  };

  const handleAddNewConversation = async () => {
    const token = localStorage.getItem("access_token");
  
    const response = await fetch("http://172.20.10.10:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        message: "", // message vide
        conversation_id: null, // on crée une nouvelle conversation
      }),
    });
  
    if (response.ok) {
      const data = await response.json();
      const newConversationId = data.conversation_id;
  
      setMessages([]); 
      setActiveConversationId(newConversationId);
    } else {
      console.error("Erreur lors de la création de la conversation");
    }
  };

  return (
    <Box display="flex" height="100vh" bgcolor="#F5F2EF">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onSelectConversation={loadConversation}
        onAddNew={handleAddNewConversation}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "absolute",
          top: -7,
          bottom: -7,
          padding: "16px",
          left: isSidebarOpen ? 250 : 0,
          right: isSidebarOpen ? -2500 : 0,
          display: "flex",
          justifyContent: isSidebarOpen ? "flex-start" : "center",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            maxWidth: 1150,
            backgroundColor: "#fafafa",
            borderRadius: 4,
            boxShadow: 6,
            overflow: "hidden",
          }}
        >
          {hasMessages ? (
            <>
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  display: "flex",
                  justifyContent: "center",
                  px: 2,
                  pt: 2,
                  pb: 1,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 700,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <ChatWindow messages={messages} isThinking={isThinking} />

                  <div ref={bottomRef} />
                </Box>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  padding: 2,
                  background: "#fafafa",
                }}
              >
                <ChatInput
                  onSend={handleSendMessage}
                  isThinking={isThinking}
                  onCancel={() => {
                    cancelRef.current = true;
                    setCancelResponse(true);
                    setIsThinking(false);
                  }}
                  
                  
                />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                px: 2,
              }}
            >
              <Typography variant="h5" fontWeight="bold" mb={4} textAlign="center">
                Comment puis-je vous aider ?
              </Typography>
              <Box sx={{ width: "100%", maxWidth: 700 }}>
                <ChatInput onSend={handleSendMessage} />
              </Box>
            </Box>
          )}
        </Box>
      </motion.div>

      <UserAvatar />
    </Box>
  );
};

export default ChatPage;
