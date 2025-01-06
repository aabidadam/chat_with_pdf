import os
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from langchain.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from groq import Groq
from qdrant_client.http.models import Filter, FieldCondition,MatchAny

def extract_text_from_pdfs(pdf_folder):
    all_text = []
    # Check if folder exists
    if not os.path.exists(pdf_folder):
        raise FileNotFoundError(f"The folder {pdf_folder} does not exist")
    
    try:
        for file_name in os.listdir(pdf_folder):
            if file_name.endswith(".pdf"):
                pdf_path = os.path.join(pdf_folder, file_name)
                reader = PdfReader(pdf_path)
                
                # Process each page separately
                for page_number, page in enumerate(reader.pages, 1):
                    text = page.extract_text() or ""
                    all_text.append({
                        "file_name": file_name,
                        "content": text,
                        "page_number": page_number
                    })
    except PermissionError:
        raise PermissionError(f"Permission denied accessing {pdf_folder}")
    except Exception as e:
        raise Exception(f"Error processing PDFs: {str(e)}")
    
    return all_text


def process_documents(documents):
    # Initialize text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    
    processed_chunks = []
    for doc in documents:
        chunks = text_splitter.split_text(doc["content"])
        # Add metadata to each chunk
        for chunk in chunks:
            processed_chunks.append({
                "text": chunk,
                "metadata": {
                    "source": doc["file_name"],
                    "page_number": doc["page_number"]
                }
            })
    return processed_chunks
    

def setup_qdrant_collection(client, collection_name, documents):
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    
    # Get embedding dimension from model config
    vector_size = model.get_sentence_embedding_dimension()
    
    # Delete existing collection if it exists
    if client.collection_exists(collection_name):
        client.delete_collection(collection_name)
        # print(f"Deleted existing collection '{collection_name}'")
    
    # Create new collection with correct dimensions
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

    # Process documents into chunks
    processed_chunks = process_documents(documents)

    # Generate embeddings locally
    texts = [chunk["text"] for chunk in processed_chunks]
    embeddings = model.encode(texts)

    # Upload points with embeddings directly
    points = [
        PointStruct(
            id=idx,
            vector=embedding.tolist(),
            payload={"text": text, "metadata": processed_chunks[idx]["metadata"]}
        )
        for idx, (text, embedding) in enumerate(zip(texts, embeddings))
    ]
    
    # Upload in batches
    batch_size = 100
    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        client.upsert(
            collection_name=collection_name,
            points=batch
        )


def retrieve_documents(query, client, collection_name, file_names, k=5):
    # print("file names:", file_names)    
    if not isinstance(file_names, list) or not file_names:
     raise ValueError("file_names must be a non-empty list of strings")
    filter_conditions = Filter(
    must=[
        FieldCondition(
            key="metadata.source",
            match=MatchAny(any=file_names)
        )
    ]
    )
    # Initialize the model inside the function or pass it as a parameter
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    
    # Generate embedding for the query
    query_embedding = model.encode(query, convert_to_tensor=False)
    
    # Search for similar documents
    search_result = client.search(
        collection_name=collection_name,
        query_vector=query_embedding,
        limit=k,
        query_filter=filter_conditions
    )
    # Return both payload and score to rank relevance
    return [{
        "text": hit.payload["text"],
        "metadata": hit.payload["metadata"],
        "score": hit.score
    } for hit in search_result]


def query_llm(query, context_docs):
    client = Groq()
    
    # Format context with citations
    context_with_citations = ""
    for doc in context_docs:
        context_with_citations += f"{doc['text']} [Source: {doc['metadata']['source']}, Page: {doc['metadata']['page_number']}]\n\n"
    
    prompt = f"""Answer the following question using the context provided. Include citations in your answer using the format [Source: filename, Page: X].
    
    Context: {context_with_citations}
    
    Question: {query}
    
    Answer with citations:"""
    
    try:
        completion = client.chat.completions.create(
            model="gemma2-9b-it",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided context. Always cite your sources using [Source: filename, Page: X] format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,  # Reduced for more focused answers
            max_tokens=1024,
            top_p=1,
            stream=True,
            stop=None
        )
        
        response_text = ""
        for chunk in completion:
            response_text += chunk.choices[0].delta.content or ""
            
        return response_text.strip()
    except Exception as e:
        return f"Error: An unexpected error occurred: {str(e)}"



def main_fn():
    pdf_folder = "/Users/aabid/Desktop/QA/backend/CV"
    # print("Extracting text from PDFs...")
    documents = extract_text_from_pdfs(pdf_folder)

    print("Setting up Qdrant collection...")
    qdrant_client = QdrantClient(
        url="https://9344d353-5942-4521-a6ad-d22c7dbfbe94.eu-west-1-0.aws.cloud.qdrant.io:6333", 
        api_key="dRQkpvNZKLA4NEAP46q61WYY_bJ1M_oH9ywALgCV6UHKJZ80-MZ7NA",
    )

    setup_qdrant_collection(qdrant_client, "cv_collection", documents)

    while True:
        query = input("Enter your question: ")
        # print("Retrieving relevant documents...")
        
        relevant_docs = retrieve_documents(
            query=query,
            client=qdrant_client,
            collection_name="cv_collection",
            k=5
        )
        context = " ".join([doc["text"] for doc in relevant_docs]) 
        # print("Querying the LLM...")
        answer = query_llm(query, context)
        # print("\nAnswer:\n", answer)