import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";


async function login(username: string, password: string) {
  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      const token = data.access_token;
      const name =data.name;
      const username =data.username;
      console.log("Nom utilisateur:",name);
      console.log("Mail:",username);
      localStorage.setItem("user_name", name);
      localStorage.setItem("user_username", username);
      localStorage.removeItem("access_token");
      localStorage.setItem("access_token", token);
      
      console.log("Connexion réussie");
      return token;
    } else {
      console.error("Erreur connexion :", data.msg);
      return null;
    }
  } catch (err) {
    console.error("Erreur réseau connexion:", err);
    return null;
  }
}

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => {
    const token = await login(email, password);

    if (token) {
      navigate("/chat");
    } else {
      alert("Identifiants incorrects ou problème de connexion.");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#ffffff"
    >
      <Box width="100%" display="flex" justifyContent="center" mt={3}>
        <img src="/logo.png" alt="Yoonusafe Logo" style={{ height: 100 }} />
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
        maxWidth="350px"
        mt={18}
        px={2}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Content de te revoir
        </Typography>

        <Box
          component="form"
          display="flex"
          flexDirection="column"
          width="100%"
          gap={2}
          mt={2}
        >
          <TextField
            fullWidth
            label="Adresse courriel"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ style: { borderRadius: 12 } }}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              style: { borderRadius: 12 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#00734c",
              color: "#fff",
              borderRadius: 12,
              mt: 1,
              py: 1.2,
              "&:hover": { bgcolor: "#005e3d" },
            }}
            onClick={handleLogin}
          >
            Continuer
          </Button>
        </Box>

        <Typography variant="body2" mt={2}>
          Vous n'avez pas de compte ?{" "}
          <MuiLink component={Link} to="/register" color="primary" fontWeight="bold">
            S'inscrire
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
