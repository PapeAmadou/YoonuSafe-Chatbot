# Projet YoonuSafe

Ce dépôt regroupe les deux parties principales du projet **YoonuSafe** : le backend (API, base de données, RAG chatbot) et le frontend (interface utilisateur React).

Le backend est une API Flask Python qui gère la logique métier, l’authentification, la sécurité, la base de données MariaDB, ainsi que la partie RAG (Retrieval-Augmented Generation) du chatbot spécialisé en cybersécurité mais aussi capable de répondre à des questions sur la  SSI de UPHF.

Le frontend est une application React avec Vite, TypeScript, Material UI, optimisée pour Docker.

---

## Backend - backend-yoonusafe

Technologies : Python 3.10, Flask, MariaDB, RAG, Docker Compose.

Pour lancer le backend :  
1. Aller dans le dossier backend :  
   cd YoonuSafe-Chatbot/backend-yoonusafe  
2. Construire et lancer les services Docker :  
   docker-compose up -d --build  
3. Vérifier que les conteneurs tournent :  
   docker ps

Pour arrêter le backend :  
- Arrêter et supprimer conteneurs et réseau :  
  docker-compose down  
- Arrêter uniquement :  
  docker-compose stop

---

## Frontend - frontend-yoonusafe

Technologies : ReactJS, Vite, TypeScript, Material UI, Docker.

Pour lancer le frontend en mode développement Docker :  
1. Aller dans le dossier frontend :  
   cd YoonuSafe-Chatbot/frontend-yoonusafe  
2. Construire et lancer le conteneur :  
   sudo docker compose up --build

Pour arrêter le frontend :  
- Arrêter et supprimer :  
  docker-compose down  
- Arrêter uniquement :  
  docker-compose stop

---

## Fonctionnalités principales

- Chatbot spécialisé dans la cybersécurité et SSI de l’UPHF basé sur RAG dans le backend  
- Gestion complète de l’authentification (inscription, connexion, email de vérification)  
- Sécurité renforcée côté backend avec validation des tokens

---

## Conseils

- Avoir Docker et Docker Compose installés  
- Toujours reconstruire avec --build après modification  
- Utiliser docker-compose logs pour debug  
- Pour arrêter tous les services, faire docker-compose down dans chaque dossier

---

*Fin du README*
