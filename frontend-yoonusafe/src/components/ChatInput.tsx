import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { FiTrash2 } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { LuSendHorizontal } from "react-icons/lu";

interface ChatInputProps {
  onSend: (data: { text: string; files: File[] }) => void;
  isThinking?: boolean;
  onCancel?: () => void;
}



const ChatInput: React.FC<ChatInputProps> = ({ onSend, isThinking, onCancel }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
 
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();
  

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && files.length === 0) return;
  
    onSend({ text: trimmed, files });
  
    setMessage("");
    setFiles([]);
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const allowed = selected.filter((file) => /\.(pdf|txt)$/i.test(file.name));
  
    const alreadyPresent = new Set(files.map(f => f.name + f.size));
  
    const uniques = allowed.filter(
      (file) => !alreadyPresent.has(file.name + file.size)
    );
  
    const limited = [...files, ...uniques].slice(0, 5);
    setFiles(limited);
  };

  const toggleSpeechToText = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("La reconnaissance vocale n’est pas supportée par ce navigateur.");
      return;
    }
  
    if (!listening) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "fr-FR" });
    } else {
      SpeechRecognition.stopListening();
      setMessage((prev) => prev + transcript + " ");
      resetTranscript();
    }
  };
  

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "700px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        borderRadius: 4,
        boxShadow: 2,
        px: 2,
        py: 2,
      }}
    >
      {files.length > 0 && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mb: 1,
          }}
        >
          {files.map((file, idx) => (
            <Box
              key={idx}
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: "#f0f0f0",
                borderRadius: 2,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2">{file.name}</Typography>
              <IconButton
                size="small"
                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                sx={{ color: "#ffffff" }} 
              >
                <FiTrash2 fontSize={14} />
              </IconButton>

            </Box>
          ))}
        </Box>
      )}

    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      {/* 📎 Bouton pour joindre un fichier */}
      <Tooltip title="Joindre fichier .pdf ou .txt">
        <IconButton
          component="label"
          sx={{
            height: 40,
            width: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 1,
            p: 0,
            color: "#1976d2",
          }}
        >
          <FaPlus />
          <input
            hidden
            type="file"
            accept=".pdf,.txt"
            multiple
            onChange={handleFileChange}
          />
        </IconButton>
      </Tooltip>

      {/* 📝 Champ de saisie */}
      <TextField
        fullWidth
        multiline
        maxRows={20}
        placeholder="Écris un message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          sx: {
            border: "none",
            outline: "none",
            boxShadow: "none",
            padding: 0,
          },
        }}
        sx={{
          fontSize: 16,
          resize: "none",
          overflow: "auto",
          backgroundColor: "transparent",
        }}
      />

      {/* 🎤 Microphone */}
      <IconButton
        onClick={toggleSpeechToText}
        sx={{
          height: 40,
          width: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0,
          mr: 1,
          color: listening ? "red" : "#1976d2",
        }}
      >
        {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
      </IconButton>

      {/* ⏸️ Pause ou Send ➡️ */}
      <IconButton
        onClick={isThinking ? onCancel : handleSend}
        sx={{
          height: 40,
          width: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0,
          color: "#1976d2",
        }}
      >
        {isThinking ? (
          <PauseCircleOutlineIcon fontSize="inherit" />
        ) : (
          <LuSendHorizontal />
        )}
      </IconButton>
    </Box>

    </Box>
  );
};

export default ChatInput;
