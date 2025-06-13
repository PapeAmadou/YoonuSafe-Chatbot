# Étape 1 – Image de base à jour
FROM node:20

# Dossier de travail
WORKDIR /app

# Copie uniquement des fichiers de dépendances (caching + rapidité)
COPY package*.json ./

# Nettoyage du cache NPM
RUN npm cache clean --force

# Installation résiliente avec retries et miroir alternatif si besoin
RUN npm install --retry 5 --fetch-retries 5 --fetch-retry-maxtimeout 10000

# Copie du reste de l'application
COPY . .

# Exposition du port utilisé par Vite
EXPOSE 5173

# Lancement du serveur de dev (Vite)
CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]
