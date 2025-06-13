import React, { useState, useEffect } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";

const pastelColors = ["#A7C7E7", "#D3D3D3", "#F8C8DC"]; // bleu clair, gris, rose clair

const getInitials = (fullName: string): string => {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const UserAvatar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [name, setName] = useState("Utilisateur");
  const [username, setUsername] = useState("email@example.com");

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    const storedUsername = localStorage.getItem("user_username");
  
    if (storedName) setName(storedName);
    if (storedUsername) setUsername(storedUsername);
  }, []);
  

  const avatarColor =
    pastelColors[
      (name.charCodeAt(0) + name.length) % pastelColors.length
    ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  return (
    <Box sx={{ position: "absolute", top: 5, right: 5 }}>
      <IconButton onClick={handleClick}>
        <Avatar sx={{ bgcolor: avatarColor }}>
          {getInitials(name)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: "white",
            borderRadius: 4,
            width: 250,
            p: 1.5,
            justifyContent: "center",  
            alignItems: "center",      
            height: 200  
          },
        }}
      >
        <Box
          sx={{
            bgcolor: "#fafafa",
            borderRadius: 4, 
            p: 1.5,
            width: 220,
            height: 170,
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" align="left">
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="left">
              {username}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "#f5f5f5",
              borderRadius: 8,
              mt: 4,
            }}
          >
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "blue",
                fontWeight: "bold",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              Se déconnecter
            </MenuItem>
          </Box>
        </Box>
      </Menu>

    </Box>
  );
};

export default UserAvatar;
