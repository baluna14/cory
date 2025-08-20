// server.js
// 이 파일은 개발 환경에서 API 키를 안전하게 제공하는 로컬 서버입니다.

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// .env 파일 로드
dotenv.config();

const app = express();
const port = 3000;

// CORS 활성화 (클라이언트 측에서 서버에 접근할 수 있도록 허용)
app.use(cors());

// 정적 파일 제공 (예: index.html, llm-api.js 등)
// 개발 편의를 위해 웹사이트 파일도 서빙하도록 설정
app.use(express.static(path.join(__dirname, 'public')));

// API 키를 제공하는 엔드포인트
app.get('/api/get-key', (req, res) => {
    // .env 파일에서 API_KEY 변수를 읽어옴
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).send('API Key not found in environment variables.');
    }

    // JSON 형태로 API 키 반환
    res.json({ apiKey: apiKey });
});

// 서버 시작
app.listen(port, () => {
    console.log(`Local API Key server running at http://localhost:${port}`);
    console.log('To get the API key, make a request to http://localhost:3000/api/get-key');
});
