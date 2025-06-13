import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer, CrossEncoder
import faiss
import numpy as np
import nltk
nltk.download('punkt')
nltk.download('punkt_tab') # Added download for the missing resource
from nltk.tokenize import sent_tokenize
from together import Together
import fitz

embedder = SentenceTransformer("all-MiniLM-L6-v2")
######################
# Partie uphf        #
####################
# récupération des infos dans le ssi de uphf
url = "https://numerique.uphf.fr/organisation/s%C3%A9curit%C3%A9%20des%20syst%C3%A8mes%20d%27information"
response = requests.get(url)
soup = BeautifulSoup(response.content, "lxml")

# Extraire tous les blocs contenant le texte principal
text_blocks = soup.find_all("div", class_="clearfix text-formatted field field--name-bp-text field--type-text-long field--label-hidden field__item")

all_text = []
for block in text_blocks:
    # Extraire tout le texte, avec des sauts de ligne pour les éléments imbriqués
    block_text = block.get_text(separator="\n", strip=True)
    all_text.append(block_text)

texte_complet = "\n\n".join(all_text)

#print(texte_complet)

# 1. Découpage amélioré du texte en chunks
def chunk_text(text, max_words=100):
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = []
    current_len = 0

    for sentence in sentences:
        words = sentence.split()
        if current_len + len(words) > max_words:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_len = 0
        current_chunk.extend(words)
        current_len += len(words)

    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

chunks = chunk_text(texte_complet)

# 2. Vectorisation
embedder = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = embedder.encode(chunks, show_progress_bar=True)

# 3. Indexation FAISS
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

# 4. Reranker
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

# 5. Fonction RAG – retourne uniquement un prompt
def rag_reponse(question, top_k=5):
    question_embedding = embedder.encode([question])
    _, indices = index.search(np.array(question_embedding), k=top_k)
    candidate_chunks = [chunks[i] for i in indices[0]]
    candidate_chunks = list(dict.fromkeys(candidate_chunks))  # retirer doublons

    # Reranking
    pairs = [[question, chunk] for chunk in candidate_chunks]
    scores = reranker.predict(pairs)
    top_chunks = [chunk for _, chunk in sorted(zip(scores, candidate_chunks), reverse=True)]

    # Construire le prompt
    context = "\n".join(top_chunks[:3])
    prompt = f"""Voici des informations :\n{context}\n\nRéponds à la question : {question}"""
    return prompt

def lily_repond(question, top_k):
    # Déclenche le RAG si le mot-clé est détecté
    if "uphf" in question.lower():
      prompt = rag_reponse(question,top_k)

    else:
      prompt = question

    return prompt

######Partie IA 
 
#API_URL = "http://172.20.10.2:11435/api/chat"

client = Together(api_key="dfa99859140c27543a57d08dc16614533cfc96ab331c9f0b134195497b4b15c3")

def call_model_api(prompt):
    prompt = lily_repond(prompt, 3)
    prompt = f"{prompt} Important : Réponds uniquement en HTML, utilise uniquement les balises suivantes : <p>, <b>, <i>, <ul>, <li>, <code>, <pre> SI BESOIN. Ne mets aucun autre texte hors de ces balises. Pas besoin de repeter dans ta reponse que t'as suivi ces indicatiion."

    try:
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Erreur lors de l'appel à Together AI : {str(e)}"

# Fonction pour calculer la similarité des messages    
def calculate_similarity(text1, text2):
   
    embeddings = embedder.encode([text1, text2])
    sim_score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return sim_score
###############################################################################################
# Fonction pour extraire le texte du fichier joint
def extract_text_from_file(filepath):
    if filepath.lower().endswith(".pdf"):
        text = ""
        doc = fitz.open(filepath)
        for page in doc:
            text += page.get_text()
        return text
    elif filepath.lower().endswith(".txt"):
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    return ""

# Fonction pour préparer le prompt
def generate_prompt_from_files(file_paths, question, top_k=10):
    full_text = ""

    # 1. Extraire le contenu de chaque fichier
    for path in file_paths:
        text = extract_text_from_file(path)
        full_text += "\n" + text

    if not full_text.strip():
        return f"Aucun contenu exploitable dans les fichiers pour répondre à : {question}"

    # 2. Chunking
    chunks = chunk_text(full_text, max_words=100)

    # 3. Embedding + FAISS
    embeddings = embedder.encode(chunks, show_progress_bar=False)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings))

    # 4. Similarité
    question_embedding = embedder.encode([question])
    _, indices = index.search(np.array(question_embedding), k=top_k)
    candidate_chunks = [chunks[i] for i in indices[0]]

    # 5. Reranking
    pairs = [[question, chunk] for chunk in candidate_chunks]
    scores = reranker.predict(pairs)
    top_chunks = [chunk for _, chunk in sorted(zip(scores, candidate_chunks), reverse=True)]

    # 6. Prompt final
    context = "\n".join(top_chunks[:3])
    prompt = f"Voici des informations :\n{context}\n\nRéponds à la question : {question}"

    return prompt