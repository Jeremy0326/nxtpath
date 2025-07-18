// Add full, correct type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Mic, X, Loader2, CheckCircle, AlertCircle, Sparkles, Volume2, MicOff, Play, Pause, ServerCrash, ShieldCheck, Info
} from 'lucide-react';
import { jobService } from '../../services/jobService';

// Types
interface InterviewQuestion {
  question_text: string;
  type: string;
}

interface AIInterviewSession {
  id: string;
  questions: InterviewQuestion[];
}

interface InterviewAnswer {
  text: string;
  audio_url?: string;
  audio?: Blob; // Allow sending audio blob to the backend
}

function PostInterviewModal({ isOpen, onClose, applicationId }: { isOpen: boolean; onClose: () => void; applicationId: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Interview Complete!</h2>
        <p className="mt-2 text-gray-600">Thank you for completing your AI interview. Your responses have been submitted and are being reviewed by the employer. You will be notified of any updates to your application status.</p>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition"
        >
          Back to My Applications
        </button>
      </div>
    </div>
  );
}

// The new, dedicated interview page
export function InterviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>();

  if (!applicationId) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Invalid Interview Link</h2>
        <p>The application ID is missing from the URL.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center p-4">
      <InterviewFlow applicationId={applicationId} />
    </div>
  );
}

// Core interview component, refactored from the old modal
function InterviewFlow({ applicationId }: { applicationId: string }) {
  const navigate = useNavigate();

  // --- State Management ---
  const SESSION_KEY = `ai-interview-session-${applicationId}`;
  const loadPersisted = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const persisted = loadPersisted();
  const initialStep = (persisted && ['session', 'loading', 'error', 'complete'].includes(persisted.step)) ? persisted.step : 'preinterview';
  
  const [step, setStep] = useState(initialStep);
  const [session, setSession] = useState<AIInterviewSession | null>(persisted?.session || null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(persisted?.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>(persisted?.answers || []);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For TTS or submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- Frontend STT State ---
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [liveTranscript, setLiveTranscript] = useState('');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const finalTranscriptRef = useRef<string>('');
  const [isListening, setIsListening] = useState(false); // Add state for listening status
  
  // --- UI State ---
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPostInterviewModal, setShowPostInterviewModal] = useState(false);

  // --- Helper to construct full audio URL ---
  const getAbsoluteAudioUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    const backendHost = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // If the base URL already includes '/api', we need to handle that
    const baseUrl = backendHost.replace('/api', '');
    return `${baseUrl}${relativeUrl}`;
  };

  // --- Event Handlers & Core Logic ---
  const handleExit = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate('/student/applications');
  }, [navigate, SESSION_KEY]);

  const handleComplete = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    navigate('/student/applications');
  }, [navigate, SESSION_KEY]);

  const startInterviewFlow = async () => {
    setStep('loading');
    setError(null);
    try {
      const data = await jobService.startInterview(applicationId);
      setSession(data);
      setAnswers(new Array(data.questions.length).fill({ text: '' }));
      setCurrentQuestionIndex(0);
      setStep('session');
    } catch (err) {
      setError('Failed to start the interview. Please try again later.');
      setStep('error');
    }
  };

  // --- Recording & Transcription Logic ---
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechRecognitionSupported(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    setError(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';

    // 1. Get Audio Stream
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      setError(`Microphone access denied: ${err.message}. Please enable microphone permissions in your browser settings.`);
      return;
    }
    
    // 2. Setup MediaRecorder for audio file capture
    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
    const supportedMimeType = mimeTypes.find(MediaRecorder.isTypeSupported);
    if (!supportedMimeType) {
      setError("Your browser does not support a suitable audio format for recording.");
      return;
    }
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: supportedMimeType });
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    mediaRecorderRef.current.onstop = () => {
      // When recording stops, get all tracks from the stream and stop them
      stream.getTracks().forEach(track => track.stop());
    };

    // 3. Setup Web Speech API for live transcription
    if (isSpeechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Automatically restart if recording is still supposed to be active.
        // This makes the recording resilient to brief pauses or network hiccups.
        if (mediaRecorderRef.current?.state === 'recording') {
          recognitionRef.current?.start();
        }
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        // Update the final transcript ref once a final result is received
        if (final) {
            finalTranscriptRef.current += final;
        }

        const currentFullTranscript = finalTranscriptRef.current + interim;
        setLiveTranscript(currentFullTranscript);

        // Update the actual answer state with the latest full transcript
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = { ...updatedAnswers[currentQuestionIndex], text: currentFullTranscript.trim() };
        setAnswers(updatedAnswers);
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        // The 'no-speech' error is common if the user pauses. We don't want to show a
        // scary error message for that, we just want the `onend` handler to restart it.
        if (event.error !== 'no-speech') {
          setError(`Speech recognition error: ${event.error}. Please type your answer or try again.`);
        }
      };
      
      recognitionRef.current.start();
    }
    
    // 4. Start everything
    mediaRecorderRef.current.start();
    setIsRecording(true);
    startTimer();
  }, [isRecording, isSpeechRecognitionSupported, answers, currentQuestionIndex]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stopTimer();
    setIsRecording(false);
  }, [isRecording]);
  
  // --- Question Flow Logic ---
  
  const handleNextQuestion = async () => {
    stopRecording();
    setIsSubmitting(true);
    setError(null);
    
    const answerText = answers[currentQuestionIndex]?.text?.trim() || '';
    if (!answerText) {
      setError('Please provide an answer before submitting.');
      setIsSubmitting(false);
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

    try {
      // Corrected: Pass arguments in the expected format
      const updatedSession = await jobService.submitAnswerAndGetNext(applicationId, {
        text: answerText,
        audio: audioBlob.size > 0 ? audioBlob : undefined,
      });
      
      if (updatedSession.status === 'COMPLETED') {
        await jobService.generateInterviewReport(applicationId);
        setStep('complete');
        setShowPostInterviewModal(true);
      } else {
        setSession(updatedSession);
        setCurrentQuestionIndex((prev: number) => prev + 1);
        setLiveTranscript('');
        finalTranscriptRef.current = '';
        setStep('session');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const playTTS = async () => {
    if (!session) return;
    setIsProcessing(true);
    try {
      const { audio_url } = await jobService.ttsInterviewText(applicationId, session.questions[currentQuestionIndex].question_text);
      if (ttsAudioRef.current && audio_url) {
        const absoluteUrl = getAbsoluteAudioUrl(audio_url);
        ttsAudioRef.current.src = absoluteUrl;
        await ttsAudioRef.current.play();
      }
    } catch (err) {
      setError('Failed to play question audio. Please read the text.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Timers & Lifecycle ---

  const startTimer = () => {
    stopTimer();
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };
  
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
  
  useEffect(() => {
    // Persist state to sessionStorage on changes
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ step, session, currentQuestionIndex, answers }));
  }, [step, session, currentQuestionIndex, answers, SESSION_KEY]);

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      stopTimer();
      if (ttsAudioRef.current) ttsAudioRef.current.pause();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    };
  }, []);

  useEffect(() => {
    // Auto-play TTS for new questions
    if (step === 'session') {
      playTTS();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, step]);
  
  // --- Render Functions ---

  const renderPreInterview = () => (
    <div className="text-center p-8 max-w-lg mx-auto bg-white rounded-xl shadow-lg">
      <Sparkles className="mx-auto h-12 w-12 text-purple-500" />
      <h2 className="mt-4 text-2xl font-bold text-gray-900">AI Interview Invitation</h2>
      <p className="mt-2 text-gray-600">
        You are about to start an AI-powered interview for a role at {session?.questions?.[0]?.type || 'your prospective company'}.
      </p>
      <div className="mt-6 bg-purple-50 rounded-lg p-4 text-left text-sm space-y-4">
        <div className="flex items-start">
          <ShieldCheck className="h-5 w-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-800">One-Time Attempt</h4>
            <p className="text-gray-600">Ensure you are in a quiet environment with a stable connection.</p>
          </div>
        </div>
        <div className="flex items-start">
          <Mic className="h-5 w-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-800">Audio Recording & Transcription</h4>
            <p className="text-gray-600">This interview uses your microphone to record and transcribe your answers in real-time.</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={handleExit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button onClick={startInterviewFlow} className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700">I Agree & Start</button>
      </div>
    </div>
  );

  const renderLoading = (text: string) => (
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
      <p className="mt-4 text-lg">{text}</p>
    </div>
  );
  
  const renderError = () => (
    <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
      <ServerCrash className="h-12 w-12 text-red-500 mx-auto" />
      <h3 className="mt-4 text-xl font-semibold">An Error Occurred</h3>
      <p className="mt-2 text-gray-600">{error}</p>
      <div className="mt-6 flex gap-4 justify-center">
        <button onClick={handleExit} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Exit</button>
        <button onClick={startInterviewFlow} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Retry</button>
      </div>
    </div>
  );
  
  const renderComplete = () => (
    <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto text-center">
      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
      <h2 className="mt-4 text-2xl font-bold text-gray-900">Interview Complete!</h2>
      <p className="mt-2 text-gray-600">Thank you. The hiring team will review your responses and be in touch.</p>
      <button onClick={handleComplete} className="mt-6 w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition">
        Back to My Applications
      </button>
    </div>
  );

  const renderSession = () => {
    if (!session) return renderLoading("Initializing session...");
    const currentQuestion = session.questions[currentQuestionIndex];
    // Always derive totalQuestions from the session object to prevent data bugs.
    const totalQuestions = session.questions.length;
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
    
    return (
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">AI Interview</h2>
          <button onClick={() => setShowExitConfirm(true)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full" aria-label="Exit interview">
            <X size={20} />
          </button>
        </div>
        <div className="w-full bg-gray-200 h-2"><motion.div className="bg-purple-600 h-2" style={{ width: `${progress}%` }} /></div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 font-semibold">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            <p className="mt-2 text-lg font-medium text-gray-900">{currentQuestion.question_text}</p>
            <button onClick={playTTS} disabled={isProcessing} className="mt-3 text-purple-600 flex items-center gap-2 text-sm font-medium disabled:opacity-50">
              <Volume2 size={16} /> Listen Again
            </button>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Your Answer</h3>
                <div className="font-mono text-sm text-gray-500 flex items-center gap-2"><Clock size={16} /> {new Date(timer * 1000).toISOString().substr(14, 5)}</div>
            </div>
            {!isSpeechRecognitionSupported && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm flex items-center gap-2">
                <Info size={16} /> Live transcription is not supported in your browser. Please type your answer.
              </div>
            )}
            <textarea
              className="mt-2 w-full border-gray-300 rounded-lg p-3 h-40 focus:ring-purple-500 focus:border-purple-500"
              placeholder={isListening ? 'Listening...' : (isRecording ? 'Starting microphone...' : 'Type your answer here or use the voice recording option...')}
              value={answers[currentQuestionIndex]?.text || ''}
              onChange={(e) => {
                const updatedAnswers = [...answers];
                updatedAnswers[currentQuestionIndex] = { text: e.target.value };
                setAnswers(updatedAnswers);
                setLiveTranscript(e.target.value);
              }}
              disabled={isRecording || isSubmitting}
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSubmitting || !isSpeechRecognitionSupported}
              className={`px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? <><MicOff size={18} />Stop Recording</> : <><Mic size={18} />Record Answer</>}
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={isRecording || isSubmitting || !answers[currentQuestionIndex]?.text?.trim()}
              className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (currentQuestionIndex === totalQuestions - 1 ? 'Finish & Submit' : 'Next Question')}
            </button>
          </div>
          {error && <div className="mt-4 text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">{error}</div>}
        </div>
        <audio ref={ttsAudioRef} className="hidden" />
      </div>
    );
  };
  
  const renderExitConfirm = () => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Exit Interview?</h3>
        <p className="text-gray-600 mb-6">Are you sure? Your progress will not be saved and you cannot re-attempt this interview.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => setShowExitConfirm(false)} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleExit} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Exit Anyway</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'preinterview': return renderPreInterview();
      case 'session': return renderSession();
      case 'loading': return renderLoading("Preparing your interview...");
      case 'complete': return renderComplete();
      case 'error': return renderError();
      default: return <div>Unhandled state</div>;
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      {showExitConfirm && renderExitConfirm()}
      {showPostInterviewModal && (
        <PostInterviewModal
          isOpen={showPostInterviewModal}
          onClose={() => {
            setShowPostInterviewModal(false);
            navigate('/student/applications');
          }}
          applicationId={applicationId}
        />
      )}
    </div>
  );
}