# Utilise une image officielle de Python
FROM python:3.10-slim

# Installer les dépendances système nécessaires à lxml, numpy, etc.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libxml2-dev \
        libxslt1-dev \
        libffi-dev \
        build-essential \
        python3-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Définir le dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers dans le conteneur
COPY . .

# Installer les dépendances Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Exposer le port utilisé par Flask
EXPOSE 5000

# Définir la commande de démarrage
CMD ["python", "app.py"]
