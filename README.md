# Workflow n8n: Full-Stack AI-Powered Automation Project

## Overview
This project is a full-stack automation system that uses:
- **React.js** frontend (user message form)
- **n8n** as the workflow orchestrator
- **Python Flask** service for sentiment analysis
- **Node.js (Express)** backend for sending emails

**Workflow:**
1. User submits a message via the React form.
2. The message is sent to n8n via a webhook.
3. n8n sends the message to the Python service for sentiment analysis.
4. n8n sends the sentiment result to the Node.js backend, which sends an email.

---

## File Structure
```
workflow-n8n/
├── frontend/                # React.js app
├── backend/                 # Node.js Express API (email sender)
│   └── python-service/      # Python Flask API (sentiment analysis)
├── .gitignore
├── README.md
```

---

## Setup Instructions

### 1. Backend (Node.js Email Sender)
```bash
cd backend
cp .env.example .env  # Fill in your real email credentials
npm install
node index.js
```
- Runs at [http://localhost:3001](http://localhost:3001)

### 2. Python Service (Flask Sentiment Analysis)
```bash
cd backend/python-service
cp .env.example .env
pip install -r requirements.txt
python -m textblob.download_corpora
python app.py
```
- Runs at [http://localhost:5000](http://localhost:5000)

### 3. Frontend (React)
```bash
cd frontend
npm install
npm start
```
- Runs at [http://localhost:3000](http://localhost:3000)
- Make sure the webhook URL in your React code matches your n8n webhook endpoint.

### 4. n8n (Workflow Orchestrator)
- Install n8n globally: `npm install -g n8n` or use Docker.
- Start n8n: `n8n`
- Access at [http://localhost:5678](http://localhost:5678)
- Import or create the workflow as described below.

---

## n8n Workflow Example
1. **Webhook Node:** Receives POST from frontend (`/webhook/message`)
2. **HTTP Request Node:** Calls Python API (`http://localhost:5000/analyze`)
3. **HTTP Request Node:** Calls Node.js backend to send email (`http://localhost:3001/send-email`)

---

## How the Workflow Works
- User submits a message in the React app.
- n8n receives the message and sends it to the Python service for sentiment analysis.
- n8n then sends the sentiment result to the Node.js backend, which sends an email to the recipient.

---

## Notes
- Make sure all services are running for the workflow to function end-to-end.
- Use environment variables for sensitive data (see `.env.example` files).
- For CORS issues, set `N8N_CORS_ALLOW_ORIGIN` to your frontend URL before starting n8n.

---

## License
MIT