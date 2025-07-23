import api from '../lib/axios';

export interface WhisperResponse {
  transcript: string;
  confidence?: number;
  language?: string;
}

export class WhisperService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    console.log('WhisperService initialized, API key available:', !!this.apiKey);
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   * @param audioBlob - Audio blob from MediaRecorder
   * @returns Promise with transcript
   */
  async transcribeAudio(audioBlob: Blob): Promise<WhisperResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Whisper transcribeAudio called:', {
      audioSize: audioBlob.size,
      audioType: audioBlob.type,
      apiKeyLength: this.apiKey.length
    });

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('language', 'en');
      formData.append('prompt', 'This is a technical interview about software development, programming, and technology. Common terms include: React, Django, Python, JavaScript, TypeScript, Node.js, Next.js, Vue.js, Angular, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Scala, HTML, CSS, SQL, MongoDB, PostgreSQL, MySQL, Redis, GraphQL, REST API, AWS, Azure, Google Cloud, Docker, Kubernetes, Jenkins, GitHub, GitLab, CI/CD, Microservices, API Gateway, Load Balancer, Auto Scaling, Serverless, Lambda, Machine Learning, Deep Learning, Neural Networks, TensorFlow, PyTorch, Scikit-learn, Computer Vision, Natural Language Processing, NLP, OpenAI, GPT, Gemini, Claude, MediaPipe, OpenCV, Pandas, NumPy, Matplotlib, Jupyter, HTTP, HTTPS, WebSocket, WebRTC, Progressive Web App, PWA, Service Worker, Local Storage, Session Storage, IndexedDB, WebAssembly, WebGL, Canvas, Database, Data Warehouse, ETL, Data Pipeline, Big Data, Hadoop, Spark, Data Analytics, Business Intelligence, BI, Data Visualization, Tableau, Power BI, Agile, Scrum, Kanban, Waterfall, Test-Driven Development, TDD, BDD, Code Review, Pair Programming, Refactoring, Design Patterns, SOLID Principles, Object-Oriented Programming, OOP, Functional Programming, FP, Event-Driven Architecture, API, SDK, IDE, CLI, GUI, UI, UX, Frontend, Backend, Full-stack, Mobile App, Web App, Desktop App, Cross-platform, Native, Hybrid, Performance, Scalability, Security, Authentication, Authorization, Encryption, Backup, Recovery, Monitoring, Logging, Debugging, Testing, Deployment, Hilti, HR System, Hiring System, Recruitment, Candidate, Interview, Resume, CV, Portfolio, Project, Team, Collaboration, Leadership, Problem Solving, Critical Thinking, Communication, Presentation, Documentation.');
      formData.append('temperature', '0.0');

      console.log('Sending Whisper API request...');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      console.log('Whisper API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Whisper API error response:', errorData);
        throw new Error(`Whisper API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Whisper API success response:', data);
      
      return {
        transcript: data.text,
        confidence: data.segments?.[0]?.avg_logprob || 0,
        language: data.language,
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Check if Whisper service is available
   */
  isAvailable(): boolean {
    const available = !!this.apiKey;
    console.log('WhisperService.isAvailable() called, API key length:', this.apiKey.length, 'Available:', available);
    return available;
  }
}

export const whisperService = new WhisperService(); 