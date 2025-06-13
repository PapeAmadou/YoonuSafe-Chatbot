import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";


async function register(username: string, name: string, password: string) {
  try {
    const response = await fetch("http://172.20.10.10:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, name, password })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Inscription réussie");
      return true;
    } else {
      console.error("Erreur inscription :", data.msg || data.error);
      return false;
    }
  } catch (err) {
    console.error("Erreur réseau inscription:", err);
    return false;
  }
}

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const success = await register(email, fullName, password);

    if (success) {
      const confirmation = window.confirm(
        "Votre compte a bien été créé. Veuillez consulter votre boîte mail pour valider votre inscription.\n"
      );
      if (confirmation) {
        navigate("/");
      }
    } else {
      alert("Erreur lors de l'inscription. Veuillez vérifier vos informations.");
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
        mt={8}
        px={2}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Créez votre compte
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
            label="Nom complet"
            fullWidth
            variant="outlined"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            InputProps={{ style: { borderRadius: 12 } }}
          />
          <TextField
            label="Adresse courriel"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ style: { borderRadius: 12 } }}
          />
          <TextField
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              style: { borderRadius: 12 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirmer mot de passe"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              style: { borderRadius: 12 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            onClick={handleRegister}
          >
            Continuer
          </Button>
        </Box>

        <Typography variant="body2" mt={2}>
          Vous avez déjà un compte ?{" "}
          <MuiLink component={Link} to="/" color="primary" fontWeight="bold">
            Se connecter
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
