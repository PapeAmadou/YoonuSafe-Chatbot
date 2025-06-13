import React, { useState } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import DOMPurify from "dompurify";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface Message {
  sender: "user" | "bot";
  text: string;
  files?: string[];
}

const ChatWindow: React.FC<{ messages: Message[]; isThinking?: boolean }> = ({
  messages,
  isThinking,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    navigator.clipboard.writeText(plainText).then(() => {
      setCopySuccess(true);
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
      }}
    >
      {messages.map((msg, idx) => {
        const cleanHTML = DOMPurify.sanitize(msg.text, {
          ALLOWED_TAGS: [
            "b",
            "i",
            "em",
            "strong",
            "p",
            "ul",
            "ol",
            "li",
            "code",
            "pre",
            "br",
          ],
          ALLOWED_ATTR: [],
        });

        const hasFiles = Array.isArray(msg.files) && msg.files.length > 0;

        return (
          <Box
            key={idx}
            display="flex"
            justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
          >
            <Box
              sx={{
                position: "relative",
                backgroundColor: msg.sender === "user" ? "#d0eaff" : "#e9fbe4",
                padding: "10px 16px",
                borderRadius: "16px",
                maxWidth: "85%",
                wordBreak: "break-word",
                fontSize: "1rem",
                whiteSpace: "pre-wrap",
              }}
            >
              <Box dangerouslySetInnerHTML={{ __html: cleanHTML }} />

              {hasFiles && (
                <Box mt={1}>
                  {msg.files!.map((fileName, i) => (
                    <Typography
                      key={i}
                      variant="body2"
                      component="div"
                      sx={{ fontSize: "0.85rem", color: "#555" }}
                    >
                      📎{" "}
                      <a
                        href={fileName}
                        download
                        style={{ textDecoration: "none", color: "#0066cc" }}
                      >
                        {fileName.split("/").pop()}
                      </a>
                    </Typography>
                  ))}
                </Box>
              )}

              {msg.sender === "bot" && (
                <Tooltip title="Copier la réponse">
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(msg.text)}
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      p: 0.5,
                    }}
                  >
                    <ContentCopyIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        );
      })}

      {isThinking && (
        <Box display="flex" justifyContent="flex-start">
          <Box
            sx={{
              backgroundColor: "#e9fbe4",
              padding: "10px 16px",
              borderRadius: "16px",
              maxWidth: "60%",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              overflowWrap: "anywhere",
            }}
          >
            <CircularProgress size={16} thickness={4} color="success" />
            L’IA réfléchit...
          </Box>
        </Box>
      )}

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" sx={{ width: "100%" }}>
          Réponse copiée dans le presse-papiers !
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatWindow;