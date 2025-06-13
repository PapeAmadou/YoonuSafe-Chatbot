import { format, isToday, isYesterday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { WebAsset } from "@mui/icons-material";
import { FaPlusCircle } from "react-icons/fa";

interface ApiMessage {
  sender: string;
  message: string;
  timestamp: string;
}

interface Conversation {
  conversation_id: number;
  start_time: string;
  messages: ApiMessage[];
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onSelectConversation: (id: number) => void;
  onAddNew: () => void;
}

const formatDateLabel = (isoDate: string) => {
  const date = parseISO(isoDate);
  if (isToday(date)) return "Aujourd’hui";
  if (isYesterday(date)) return "Hier";
  return format(date, "EEEE d MMMM", { locale: fr }); 
};

const fetchConversations = async (
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://172.20.10.10:5000/conversations", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (response.ok) {
    const data = await response.json();
    setConversations(data);
  }
};


const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  onSelectConversation,
  onAddNew,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations(setConversations);
  }, []);
  
  const handleAddNew = () => {
    onAddNew(); // déclenche la création d’une nouvelle conversation
    fetchConversations(setConversations); // recharge la liste depuis l’API
  };
  

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={isOpen}
        sx={{
          width: isOpen ? 250 : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 267,
            boxSizing: "border-box",
            p: 2,
            backgroundColor: "#F5F2EF",
            borderRight: "2px solid #f0f0f0"
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <img src="/logo.png" alt="Logo" style={{ height: 50 }} />
          <Box>
            <IconButton onClick={() => setIsOpen(false)}>
              <WebAsset />
            </IconButton>
            <IconButton onClick={handleAddNew}>
              <FaPlusCircle />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" color="gray" mb={1}>
          Historique
        </Typography>
        <List>
        {Object.entries(
          conversations
            .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
            .reduce((groups: { [key: string]: Conversation[] }, conv) => {
              if (conv.messages.length === 0) return groups; 
              const date = formatDateLabel(conv.start_time);
              if (!groups[date]) groups[date] = [];
              groups[date].push(conv);
              return groups;
            }, {})            
        ).map(([label, group]) => (
          <Box key={label} mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight="bold" mb={0.5}>
              {label}
            </Typography>
            {group.map((conv) => {
              const preview = conv.messages.find((m) => m.sender === "user")?.message || "(vide)";
              return (
                <ListItem
                  component="button"
                  key={conv.conversation_id}
                  onClick={() => onSelectConversation(conv.conversation_id)}
                  sx={{
                    px: 1.2,
                    py: 1,
                    mt: 0.5,
                    borderRadius: 1,
                    backgroundColor: "#F5F2EF", 
                    border: "0px solid #F5F2EF", 
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#e4e4e4", 
                      borderColor: "#9e9e9e",     
                    },
                  }}
                >
                  <ListItemText
                    primary={preview}
                    primaryTypographyProps={{
                      fontSize: 14,
                      color: "text.primary",
                      noWrap: true,             
                      overflow: "hidden",
                      textOverflow: "ellipsis",  
                    }}
                    
                  />
                </ListItem>

              );
            })}
          </Box>
        ))}
      </List>
      </Drawer>

      {!isOpen && (
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            gap: 1,
            zIndex: 10,
          }}
        >
          <IconButton onClick={() => setIsOpen(true)}>
            <WebAsset />
          </IconButton>
          <IconButton onClick={handleAddNew}>
            <FaPlusCircle />
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default Sidebar;
