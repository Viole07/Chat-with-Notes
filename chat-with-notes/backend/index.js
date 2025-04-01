require('dotenv').config();

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store embeddings in memory by sessionId
const notesStore = {}; // { sessionId: [ { chunk, embedding } ] }



function splitTextIntoChunks(text, maxChunkSize = 1000) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';
  
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += sentence + ' ';
    }
  
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
  
    return chunks;
  }

  



app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).send('No file uploaded');

  try {
    const fileBuffer = fs.readFileSync(file.path);
    let textContent = '';

    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      textContent = data.text;
    } else if (file.mimetype === 'text/plain') {
      textContent = fileBuffer.toString();
    } else {
      return res.status(400).send('Unsupported file type');
    }

    fs.unlinkSync(file.path); // delete uploaded file

    // ✅ Step: Chunk and embed
    const chunks = splitTextIntoChunks(textContent);
    const sessionId = Date.now().toString();

    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk,
        });
        return {
          chunk,
          embedding: response.data[0].embedding,
        };
      })
    );

    // ✅ Store in memory
    notesStore[sessionId] = embeddings;

    res.json({ sessionId, chunks: chunks.length });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error parsing file');
  }
});


app.post('/chat', async (req, res) => {
    const { sessionId, userMessage } = req.body;
    const stored = notesStore[sessionId];
  
    if (!stored) return res.status(404).send('Session not found');
  
    // Get embedding for user question
    const userEmbeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userMessage,
    });
    const userEmbedding = userEmbeddingResponse.data[0].embedding;
  
    // Function to calculate cosine similarity
    function cosineSimilarity(a, b) {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (normA * normB);
    }
  
    // Rank chunks by similarity
    const ranked = stored
      .map((item) => ({
        ...item,
        score: cosineSimilarity(userEmbedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3 most relevant chunks
  
    const context = ranked.map((r) => r.chunk).join('\n---\n');
  
    // Generate answer using GPT
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that answers questions based on the user’s notes.',
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion:\n${userMessage}`,
        },
      ],
    });
  
    const answer = chatResponse.choices[0].message.content;
    res.json({ answer });
  });

  


app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));