# README - Installation et configuration du backend Flask avec Docker

## 1. Description

Ce projet contient un backend Flask qui communique avec une base MariaDB via Docker. 
Le backend utilise un fichier `config.json` pour récupérer les informations 
de connexion à la base de données et la clé secrète JWT.


---

## 2. Configuration importante du fichier `config.json`

- Le fichier `config.json` contient des informations sensibles 
  et doit être adapté selon votre environnement.

- **Avant de lancer le backend avec Docker, vous devez modifier la valeur de `DB_HOST`** 
  pour qu'elle corresponde au nom du service MariaDB dans Docker (habituellement `mariadb`).

- Cette modification est obligatoire pour que Flask puisse se connecter 
  correctement à la base de données via Docker.

---

## 3. Adresse IP fixe du serveur backend

- Le backend est déployé sur un serveur Ubuntu avec une IP locale fixe 
  (exemple : `172.20.10.10`).

- Le backend Flask est accessible sur cette IP, par défaut sur le port 5000.

- Exemple d’URL d’API : 
  `http://172.20.10.10:5000/api/endpoint`

---

## 4. Adapter les endpoints API dans le frontend

- Le frontend utilise cette IP fixe pour appeler les endpoints du backend.

- **Si vous exécutez le backend sur une autre machine ou localement,** 
  vous devez modifier les URLs dans le frontend pour remplacer cette IP fixe 
  par celle de votre backend local (par exemple `http://localhost:5000` si backend et frontend sont sur la même machine).

---

## 5. Instructions pour un collègue récupérant le projet

1. **Modifier `config.json`** 
   - Remplacer la valeur `DB_HOST` par le nom du service MariaDB utilisé dans Docker (`mariadb`).

2. **Lancer les services Docker** 
   - Dans le dossier contenant le `docker-compose.yml`, exécuter : 
     ```
     docker-compose up -d
     ```

3. **Modifier les URLs dans le frontend** 
   - Adapter les endpoints API pour pointer vers l’adresse IP ou le nom d’hôte où tourne le backend Flask. 
   - Exemple : remplacer `http://172.20.10.10:5000` par `http://localhost:5000` si le backend tourne localement.

---

## 6. Fichiers à partager avec un collègue

- Tous les fichiers backend : 
  - `app.py` 
  - `models.py` 
  - `model_ia.py` 
  - `config.json` (avec la modification de `DB_HOST` pour Docker) 
  - `requirements.txt` 
  - `Dockerfile` 
  - `docker-compose.yml`

- Le frontend avec une note claire indiquant la nécessité 
  de modifier les URLs des API selon l’environnement local.

---

## 7. Support

Pour toute question ou assistance, merci de contacter l’équipe de développement.

---

Merci pour votre collaboration !
