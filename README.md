# Projet YoonuSafe

Ce dépôt regroupe les deux parties principales du projet YoonuSafe : le **backend** (API, base de données, RAG chatbot) et le **frontend** (interface utilisateur React).

Le **backend** est une API Flask Python qui gère la logique métier, l’authentification, la sécurité, la base de données MariaDB, ainsi que la partie RAG (Retrieval-Augmented Generation) du chatbot spécialisé en cybersécurité, capable de répondre à des questions sur la SSI de l’UPHF.

Le **frontend** est une application React avec Vite, TypeScript et Material UI, optimisée pour une exécution dans Docker.

## Fonctionnalités principales

### Backend - backend-yoonusafe
- Authentification complète avec JWT (accès limité par token avec expiration)  
- Mots de passe hachés, aucun stockage en clair  
- Protection contre les injections SQL grâce à SQLAlchemy (ORM)  
- Séparation Frontend/Backend sécurisée via une configuration CORS adaptée  

### Frontend - frontend-yoonusafe
- Affichage des messages utilisateur et IA avec historique complet  
- Upload de fichiers (.pdf ou .txt, jusqu’à 5 fichiers maximum)  
- Saisie vocale (Web Speech API)  
- Option “Pause” pour interrompre la génération IA en cours  
- Option “Copier” pour copier facilement une réponse IA  
- Feedback utilisateur via snackbars (toasts) pour :  
  - Confirmer la copie d’un message IA  
  - Afficher la réussite ou l’annulation d’une action  

## Backend - backend-yoonusafe

**Technologies :** Python 3.10, Flask, MariaDB, RAG, Docker Compose

### Lancer le backend :

```bash
cd YoonuSafe-Chatbot/backend-yoonusafe
docker-compose up -d --build
docker ps  # Vérifier que les conteneurs tournent
```

### Arrêter le backend :

```bash
docker-compose down   # Arrêter et supprimer conteneurs et réseau
# ou
docker-compose stop   # Arrêter uniquement les conteneurs
```

## Frontend - frontend-yoonusafe

**Technologies :** ReactJS, Vite, TypeScript, Material UI, Docker

### Lancer le frontend en mode développement Docker :

```bash
cd YoonuSafe-Chatbot/frontend-yoonusafe
sudo docker compose up --build
```

### Arrêter le frontend :

```bash
docker-compose down   # Arrêter et supprimer conteneurs et réseau
# ou
docker-compose stop   # Arrêter uniquement les conteneurs
```

## Conseils d’utilisation

- Assurez-vous d’avoir Docker et Docker Compose installés sur votre machine  
- Après toute modification dans le code, reconstruisez les images avec `--build`  
- Utilisez `docker-compose logs` dans chaque dossier pour déboguer en cas de problème  
- Pour arrêter tous les services, faites `docker-compose down` dans chacun des dossiers backend et frontend  

## Sécurité

- Authentification JWT sécurisée avec expiration de tokens  
- Mots de passe stockés uniquement sous forme hachée  
- Protection contre les injections SQL grâce à SQLAlchemy  
- Configuration CORS stricte pour sécuriser les échanges Frontend/Backend  
