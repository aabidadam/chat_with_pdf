# ChatwithPDF App

## Introduction
------------
The ChatwithPDF App is a Python application that allows you to chat with multiple PDF documents. You can ask questions about the PDFs using natural language, and the application will provide relevant responses based on the content of the documents. This app utilizes a language model to generate accurate answers to your queries. Please note that the app will only respond to questions related to the loaded PDFs.

## How It Works
------------

The application follows these steps to provide responses to your questions:

1. PDF Loading: The app reads multiple PDF documents and extracts their text content.

2. File Filtering: Users can select specific PDF files to include in their query, allowing for more focused and relevant responses.

3. Text Chunking: The extracted text is divided into smaller chunks that can be processed effectively.

4. Language Model: The application utilizes a language model to generate vector representations (embeddings) of the text chunks.

5. Similarity Matching: When you ask a question, the app compares it with the text chunks and identifies the most semantically similar ones.

6. Response Generation: The selected chunks are passed to the language model, which generates a response based on the relevant content of the PDFs.

## Dependencies and Installation
----------------------------
To install the ChatwithPDF App, please follow these steps:

### Backend Setup (FastAPI)

1. Clone the repository to your local machine.

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the backend directory and add your groq API key and qdrant API key :
   ```
   GROQ_API_KEY=your_secret_api_key
   QDRANT_API_KEY=your_secret_api_key
   ```

6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm run dev
   ```

The application should now be running with:
- Backend API at: http://localhost:8000
- Frontend at: http://localhost:3000


## Contact
------------
For support or queries:
- Create an issue on GitHub
- Email: abidansari.iitkgp@gmail.com
- LinkedIn: https://www.linkedin.com/in/abidansari/
