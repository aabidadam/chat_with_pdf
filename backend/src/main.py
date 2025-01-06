from src.helper import extract_text_from_pdfs, setup_qdrant_collection,retrieve_documents,query_llm
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from dotenv import load_dotenv
from pathlib import Path
from qdrant_client import QdrantClient
from pydantic import BaseModel
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

qdrant_client = QdrantClient(
        url="https://9344d353-5942-4521-a6ad-d22c7dbfbe94.eu-west-1-0.aws.cloud.qdrant.io:6333", 
        api_key="dRQkpvNZKLA4NEAP46q61WYY_bJ1M_oH9ywALgCV6UHKJZ80-MZ7NA",
    )
@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI backend!"}


@app.post("/upload_pdfs")
async def upload_pdfs(files: List[UploadFile]):
    for file in files:
        if not file.filename.endswith('.pdf'):
            return {"error": f"File {file.filename} is not a PDF"}
        
        file_path = UPLOAD_DIR / file.filename
        content = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(content)

    
    print("Extracting text from PDFs...")
    documents = extract_text_from_pdfs(UPLOAD_DIR)


    # print("Setting up Qdrant collection...")
    qdrant_client = QdrantClient(
        url="https://9344d353-5942-4521-a6ad-d22c7dbfbe94.eu-west-1-0.aws.cloud.qdrant.io:6333", 
        api_key="dRQkpvNZKLA4NEAP46q61WYY_bJ1M_oH9ywALgCV6UHKJZ80-MZ7NA",
    )

    setup_qdrant_collection(qdrant_client, "cv_collection", documents)
    
    return {"message": "PDFs uploaded successfully"}


class ChatRequest(BaseModel):
    message: str
    file_names: List[str]

@app.post("/chat")
async def chat(request: ChatRequest):
    print("Retrieving relevant documents...")
    relevant_docs = retrieve_documents(
            query=request.message,
            client=qdrant_client,
            collection_name="cv_collection",
            file_names=request.file_names,
            k=5
        )
    
    print("Querying the LLM...")
    # Pass the full document objects instead of just the text
    answer = query_llm(request.message, relevant_docs)
    
    return {
        "message": "Chat message received", 
        "answer": answer,
        "sources": [
            {
                "file_name": doc["metadata"]["source"],
                "page_number": doc["metadata"]["page_number"],
                "relevance_score": doc["score"]
            } for doc in relevant_docs
        ]
    }



