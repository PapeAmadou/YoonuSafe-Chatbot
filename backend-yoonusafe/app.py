# Importation des librairies
import json
import jwt 
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Conversation, Message
import re
from datetime import timedelta
from flask_cors import CORS
from flask import abort
from flask_mail import Mail
from flask_mail import Message as MailMessage
from flask import redirect
from model_ia import call_model_api, calculate_similarity, generate_prompt_from_files

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_limiter.errors import RateLimitExceeded

from werkzeug.utils import secure_filename
import os
import tempfile

# Récupération du chemin 
UPLOAD_FOLDER = tempfile.gettempdir()
# Chargement du fichier de  config qui c
with open('config.json') as f:
    config = json.load(f)

app = Flask(__name__)

# Fonction pour récupérer la vraie IP utile pour blocker un utilisateur #
#  qui tente de se connecter à plusieurs reprises avec un mauvais mot de passe
def real_ip():
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    return request.remote_addr

limiter = Limiter(key_func=real_ip)
limiter.init_app(app)



CORS(app, origins=["http://localhost:5173"], supports_credentials=True)


# Connexion à la base de données
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{config['DB_USER']}:{config['DB_PASSWORD']}@{config['DB_HOST']}/{config['DB_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = config['JWT_SECRET_KEY']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
db.init_app(app)
jwt_manager = JWTManager(app)

# Création des tables
with app.app_context():
    db.create_all()

##### Partie envoie de lien pour la vérification de l'adresse email de l'utilisateur
##########Configuration MAIL###################

# Config SMTP (exemple avec Gmail)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'          # serveur SMTP
app.config['MAIL_PORT'] = 587                         # port TLS
app.config['MAIL_USE_TLS'] = True                     # activation TLS
app.config['MAIL_USE_SSL'] = False                    # désactiver SSL si TLS utilisé
app.config['MAIL_USERNAME'] = 'clientjava01@gmail.com'  # ton adresse email SMTP
app.config['MAIL_PASSWORD'] = 'bvzd boii eugg oaal'       # mot de passe/app password
app.config['MAIL_DEFAULT_SENDER'] = 'clientjava01@gmail.com'  # expéditeur par défaut
mail = Mail(app)

### Fonction pour générer un token de vérification
def generate_confirmation_token(email, secret_key, expires_in=600):
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(seconds=expires_in),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token

# Fonction pour  envoyer le mail de confirmation
def send_confirmation_email(user_email, confirmation_url):
    msg = MailMessage(subject="Confirmez votre adresse email",
                  sender=app.config['MAIL_USERNAME'],
                  recipients=[user_email])
    msg.body = f"Merci de vous être inscrit. Cliquez sur ce lien pour confirmer votre email : {confirmation_url}"
    mail.send(msg)
 
# Fonction pour vérifier le format de l'adresse mail
def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

# Fonction pour exiger la robustesse du mot de passe de l'utilisateur
def is_strong_password(pwd):
    # Au moins 8 caractères
    if len(pwd) < 8:
        return False

    # Au moins une majuscule
    if not re.search(r"[A-Z]", pwd):
        return False

    # Au moins une minuscule
    if not re.search(r"[a-z]", pwd):
        return False

    # Au moins un chiffre
    if not re.search(r"[0-9]", pwd):
        return False

    # Au moins un caractère spécial
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", pwd):
        return False

    return True
# Fonction pour limiter le nombre de tentatives de connexions 
@app.errorhandler(RateLimitExceeded)
def ratelimit_handler(e):
    return jsonify({"msg": "Trop de tentatives. Réessaye plus tard."}), 429
  
# Route register pour gérer l'endpoint d'inscription
@app.route('/register', methods=['POST'])
def register():

    data = request.get_json()

    username = data.get('username', '').strip()
    name = data.get('name', '').strip()
    password = data.get('password', '').strip()

    if not username or not password or not name:
        return jsonify({"msg": "Username, name  and password required"}), 400
    if not is_valid_email(username):
        return jsonify({"msg": "Invalid email format"}), 400
    if not is_strong_password(password):
        return jsonify({"msg": "Please put a stong password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "User already exists"}), 409

    hashed_pwd = generate_password_hash(password)

    new_user = User(username=username, name=name, password=hashed_pwd, is_verified = 0)
    db.session.add(new_user)
    db.session.commit()
    # Envoie du token
    # Génération du  token de confirmation
    token = generate_confirmation_token(new_user.username, app.config['JWT_SECRET_KEY'])

    # Construction de l' URL de confirmation 
    confirmation_url = f"http://localhost:5000/verify-email/{token}"
    # Envoyer le mail de confirmation
    send_confirmation_email(new_user.username, confirmation_url)

    return jsonify({"msg": "User created successfully"}), 201

# Route login pour gérer l'endpoint de connexion
@app.route('/login', methods=['POST'])
@limiter.limit("5 per 15 minutes")
def login():

    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400
    
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid username or password"}), 401
    if user.is_verified == 0:
        return jsonify({"msg": "Unverified email"}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "username": user.username,
        "name": user.name
    }), 200

# Route pour l'envoie de message
@app.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    # Récupération de l'identifiant de l'utilisateur
    user_id =int(get_jwt_identity())
    # Récupération du message et de l'identifiant de la conversation 
    data = request.get_json()
    user_message = data.get('message', '').strip()
    conversation_id = data.get("conversation_id")
    # Cas création nouvelle conversation sans message
    if not user_message and not conversation_id:
        conversation = Conversation(user_id=user_id)
        db.session.add(conversation)
        db.session.commit()
        return jsonify({
            "response": None,  # Pas de message bot
            "conversation_id": conversation.id
        }), 200

    # Si conversation_id fourni -> continuer la conversation existante
    if conversation_id:
        conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conversation:
            return jsonify({"msg": "Conversation not found"}), 404
    else:
        # Sinon créer nouvelle conversation si pas d'id (et message non vide)
        conversation = Conversation(user_id=user_id)
        db.session.add(conversation)
        db.session.commit()

    # Stocker le message utilisateur uniquement s'il y en a un
    if user_message:
        if len(user_message) > 1000:
            return jsonify({"msg": "Message trop long"}), 400

        messages = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp.asc()).all()
        # Construire contexte formaté
        full_context = ""
        for msg in messages:
            prefix = "User: " if msg.sender == "user" else "Bot: "
            full_context += prefix + msg.message + "\n"
        full_context += "User: " + user_message + "\nBot:"
        user_msg = Message(
            conversation_id=conversation.id,
            sender="user",
            message=user_message,
        )
        db.session.add(user_msg)

        # Réponse du bot (exemple bidon ici)
        bot_response = call_model_api(full_context)
        bot_msg = Message(
            conversation_id=conversation.id,
            sender="bot",
            message=bot_response,
        )
        db.session.add(bot_msg)
        db.session.commit()

        return jsonify({
            "response": bot_response,
            "conversation_id": conversation.id
        }), 200
    else:
        # Pas de message utilisateur à stocker, on commit juste la conversation
        db.session.commit()
        return jsonify({
            "response": None,
            "conversation_id": conversation.id
        }), 200
    
# Pour récupérer l'historique de conversation de l'utilisateur
@app.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    user_id = int(user_id)
    conversations = Conversation.query.filter_by(user_id=user_id).all()
    result = []
    # Liste uniquement les ids récupérés
    conv_ids = [conv.id for conv in conversations]
    print(f"Conversation IDs: {conv_ids}")
    for c in conversations:
        print(f"[DEBUG] JWT user_id: {user_id} ({type(user_id)}), conversation user_id: {c.user_id} ({type(c.user_id)})")

        if c.user_id != user_id:
            print(f" Anomalie : conversation {c.id} appartient à user {c.user_id} ≠ {user_id}")

    for conv in conversations:
        messages = [{
            "sender": msg.sender,
            "message": msg.message,
            "timestamp": msg.timestamp.isoformat()
        } for msg in conv.messages]

        result.append({
            "conversation_id": conv.id,
            "start_time": conv.start_time.isoformat(),
            "messages": messages
        })

    return jsonify(result), 200

# Route utilisée pour afficher une conversatio avec son id 
@app.route('/conversations/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation_by_id(conversation_id):
    user_id = get_jwt_identity()
    conv = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
    if not conv:
        return jsonify({"msg": "Conversation not found"}), 404

    messages = Message.query.filter_by(conversation_id=conv.id).order_by(Message.timestamp.asc()).all()
    msg_list = [{
        "sender": msg.sender,
        "message": msg.message,
        "timestamp": msg.timestamp.isoformat()
    } for msg in messages]

    return jsonify({
        "conversation_id": conv.id,
        "start_time": conv.start_time.isoformat(),
        "messages": msg_list
    }), 200

# Route pour gérer la vérification de l'adresse mail
@app.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    try:
        # Décodage normal avec vérification d'expiration
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        email = payload.get('email')
        if not email:
            return jsonify({"msg": "Token invalide : email manquant"}), 400

    except jwt.ExpiredSignatureError:
        # Token expiré : on décode quand même sans vérifier la date d'expiration pour récupérer l'email
        try:
            payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"], options={"verify_exp": False})
            email = payload.get('email')
            if not email:
                return jsonify({"msg": "Token invalide : email manquant"}), 400

            # Regénérer un nouveau token
            new_token = generate_confirmation_token(email, app.config['JWT_SECRET_KEY'])
            confirmation_url = f"http://localhost:5000/verify-email/{new_token}"

            # Envoi automatique du mail
            send_confirmation_email(email, confirmation_url)

            return jsonify({
                "msg": "Le lien a expiré. Un nouveau mail de confirmation vient de vous être envoyé.",
                "new_confirmation_url": confirmation_url
            }), 200

        except Exception as e:
            return jsonify({"msg": "Erreur lors de la régénération du token."}), 500

    except jwt.InvalidTokenError:
        return jsonify({"msg": "Lien de confirmation invalide."}), 400

    user = User.query.filter_by(username=email).first()
    if not user:
        return jsonify({"msg": "Utilisateur non trouvé."}), 404

    if user.is_verified:
        return jsonify({"msg": "Compte déjà vérifié."}), 200

    user.is_verified = 1
    db.session.commit()

    return jsonify({"msg": "Email vérifié avec succès !"}), 200

# Route pour les fichiers appload
@app.route('/chat-with-files', methods=['POST'])
@jwt_required()
def chat_with_files():
    user_id = int(get_jwt_identity())
    files = request.files.getlist('documents')
    user_message = request.form.get('message', '').strip()
    conversation_id = request.form.get('conversation_id', None)

    if not user_message or not files:
        return jsonify({"msg": "Fichiers et message requis"}), 400

    # Gérer conversation (création ou récupération)
    if conversation_id:
        conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conversation:
            return jsonify({"msg": "Conversation not found"}), 404
    else:
        conversation = Conversation(user_id=user_id)
        db.session.add(conversation)
        db.session.commit()

    # Sauvegarde temporaire des fichiers
    saved_paths = []
    for file in files:
        filename = secure_filename(file.filename)
        if not filename.lower().endswith((".pdf", ".txt")):
            continue
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        saved_paths.append(file_path)

    if not saved_paths:
        return jsonify({"msg": "Aucun fichier valide fourni"}), 400

    # Génération du prompt enrichi
    try:
        enriched_prompt = generate_prompt_from_files(saved_paths, user_message)
        bot_response = call_model_api(enriched_prompt)

        # Enregistrer le message utilisateur
        user_msg = Message(
            conversation_id=conversation.id,
            sender="user",
            message=user_message,
        )
        db.session.add(user_msg)

        # Enregistrer la réponse du bot
        bot_msg = Message(
            conversation_id=conversation.id,
            sender="bot",
            message=bot_response,
        )
        db.session.add(bot_msg)
        db.session.commit()

    finally:
        # Nettoyage fichiers
        for path in saved_paths:
            try:
                os.remove(path)
            except Exception:
                pass

    return jsonify({
        "response": bot_response,
        "conversation_id": conversation.id
    }), 200


# Main
if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)
