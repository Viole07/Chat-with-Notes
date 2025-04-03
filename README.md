# Chat with Your Notes 📚🤖

A smart and intuitive chat-based AI assistant that enables you to effortlessly interact with the content from your uploaded notes (PDF or text files). Built with React and Node.js, powered by OpenAI's GPT-3.5-turbo.

---

## 🚀 Features

- **PDF & Text File Upload**: Easily upload your notes.
- **AI-Powered Chat**: Ask questions and get intelligent answers based strictly on your notes.
- **Instant Responses**: Fast and accurate embedding-based search and chat generation.
- **Dark/Light Mode**: Automatically adapt UI to your system preferences or manually toggle.
- **Markdown Rendering**: Supports markdown formatting in answers.

---

## 🛠️ Tech Stack

- **Frontend**: React, Axios, React Markdown
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-3.5-turbo, OpenAI Embeddings
- **Deployment**: Render

---

## 📦 Project Structure

```
Chat-with-Notes
├── backend
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env (API keys)
└── frontend
    ├── src
    │   ├── App.js
    │   └── index.js
    ├── public
    │   ├── logo.png
    │   └── upload-file.png
    ├── package.json
    └── yarn.lock
```

---

## 💻 Setup & Installation

### Backend

Navigate to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Run the backend server:

```bash
node index.js
```

### Frontend

Navigate to the frontend folder:

```bash
cd frontend
yarn install
```

Run the frontend app:

```bash
yarn start
```

---

## 🚀 Deployment

The backend and frontend are deployed separately:

- **Backend**: Hosted on [Render](https://render.com/).
- **Frontend**: Recommended to host on platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

Connect your GitHub repository to Render and Vercel/Netlify for continuous deployment upon code updates.
