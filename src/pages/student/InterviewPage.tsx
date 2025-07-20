// Import types from organized type files
import { 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent, 
  SpeechRecognition,
  FrontendInterviewQuestion,
  AIInterviewSession,
  FrontendInterviewAnswer
} from '../../types/interview';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Mic, X, Loader2, CheckCircle, AlertCircle, Sparkles, Volume2, MicOff, Play, Pause, ServerCrash, ShieldCheck, Info
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { whisperService } from '../../services/whisperService';

// Types are now imported from organized type files

// Remove the PostInterviewModal component since it's causing duplicate messages
// The renderComplete function will handle the completion UI

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
  const [answers, setAnswers] = useState<FrontendInterviewAnswer[]>(persisted?.answers || []);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // For TTS or submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- Frontend STT State ---
  const [isWhisperAvailable, setIsWhisperAvailable] = useState(false);
  const [useWhisper, setUseWhisper] = useState(true); // Toggle between Whisper and Web Speech API
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const finalTranscriptRef = useRef<string>('');
  const [isListening, setIsListening] = useState(false);
  
  // --- Web Speech API State (for fallback) ---
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  
  // --- UI State ---
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
    // Check if Whisper is available
    setIsWhisperAvailable(whisperService.isAvailable());
    
    // Check if Web Speech API is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechRecognitionSupported(!!SpeechRecognition);
    
    // Debug environment variables
    console.log('Environment variables check:');
    console.log('VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
    console.log('VITE_OPENAI_API_KEY length:', import.meta.env.VITE_OPENAI_API_KEY?.length || 0);
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
    
    // Set up data available handler
    mediaRecorderRef.current.ondataavailable = (event) => {
      console.log('MediaRecorder ondataavailable:', event.data.size, 'bytes');
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorderRef.current.onstop = () => {
      // When recording stops, get all tracks from the stream and stop them
      stream.getTracks().forEach(track => track.stop());
    };

    // 3. Setup transcription based on selected method
    if (useWhisper && isWhisperAvailable) {
      // Use Whisper API - transcription handled by useEffect
      setIsListening(true);
    } else if (isSpeechRecognitionSupported) {
      // Use Web Speech API as fallback
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
        // Automatically restart if recording is still supposed to be active
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
    
    // 4. Start recording
    mediaRecorderRef.current.start(1000); // Start with 1-second timeslice for regular chunks
    setIsRecording(true);
    startTimer();
    
    // Reset audio tracking for new recording
    lastProcessedAudioSize.current = 0;
  }, [isRecording, useWhisper, isWhisperAvailable, isSpeechRecognitionSupported, answers, currentQuestionIndex]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Clear transcription timeout
    if (transcriptionTimeoutRef.current) {
      clearInterval(transcriptionTimeoutRef.current);
      transcriptionTimeoutRef.current = null;
    }
    
    // Stop Web Speech API if it's running
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    stopTimer();
    setIsRecording(false);
    setIsListening(false);
    setIsTranscribing(false);
    isTranscribingRef.current = false;
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
        // Generate interview report and update application status
        try {
        await jobService.generateInterviewReport(applicationId);
        } catch (reportError) {
          console.error('Failed to generate interview report:', reportError);
          // Continue with completion even if report generation fails
        }
        setStep('complete');
        // Remove the duplicate modal - just use the renderComplete function
      } else {
        setSession(updatedSession);
        setCurrentQuestionIndex((prev: number) => prev + 1);
        setLiveTranscript('');
        finalTranscriptRef.current = '';
        lastProcessedAudioSize.current = 0; // Reset audio tracking for next question
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        // Clear transcription interval for Whisper
        if ((mediaRecorderRef.current as any).transcriptionInterval) {
          clearInterval((mediaRecorderRef.current as any).transcriptionInterval);
        }
      }
    };
  }, []);

  useEffect(() => {
    // Auto-play TTS for new questions
    if (step === 'session') {
      playTTS();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, step]);
  
  // Smart text deduplication function
  const cleanTranscript = (text: string): string => {
    if (!text) return '';
    
    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Remove duplicate consecutive sentences and phrases
    const cleanedSentences: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
      const currentSentence = sentences[i].trim();
      
      // Check if this sentence is too similar to any previous sentence
      const isDuplicate = cleanedSentences.some(prevSentence => {
        const similarity = calculateSimilarity(currentSentence, prevSentence);
        return similarity > 0.8; // 80% similarity threshold
      });
      
      if (!isDuplicate) {
        // Clean word repetitions within the sentence
        const cleanedSentence = removeWordRepetitions(currentSentence);
        cleanedSentences.push(cleanedSentence);
      }
    }
    
    // Join sentences back together
    return cleanedSentences.join('. ').trim();
  };

  // Remove repetitive words within a sentence
  const removeWordRepetitions = (sentence: string): string => {
    const words = sentence.split(/\s+/);
    const cleanedWords: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i].toLowerCase().replace(/[^\w]/g, '');
      
      // Check if this word is repeated too many times in a row
      let repetitionCount = 1;
      for (let j = i + 1; j < words.length; j++) {
        const nextWord = words[j].toLowerCase().replace(/[^\w]/g, '');
        if (currentWord === nextWord) {
          repetitionCount++;
        } else {
          break;
        }
      }
      
      // If word is repeated more than 2 times, only keep it once
      if (repetitionCount > 2) {
        cleanedWords.push(words[i]);
        i += repetitionCount - 1; // Skip the repeated words
      } else {
        cleanedWords.push(words[i]);
      }
    }
    
    return cleanedWords.join(' ');
  };

  // Calculate similarity between two strings
  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  };

  // Transcription logic with cleanup
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTranscribingRef = useRef(false);
  const lastProcessedAudioSize = useRef(0);

  const attemptTranscription = useCallback(async () => {
    if (!isRecording || !useWhisper || !isWhisperAvailable || isTranscribingRef.current) {
      return;
    }

    const chunks = audioChunksRef.current;
    if (chunks.length === 0) {
      console.log('No audio chunks available for transcription');
      return;
    }

    const audioBlob = new Blob(chunks, { type: chunks[0].type });
    
    // Only transcribe if we have new audio data
    if (audioBlob.size <= lastProcessedAudioSize.current) {
      console.log('No new audio data to transcribe');
      return;
    }

    isTranscribingRef.current = true;
    setIsTranscribing(true);

    try {
      console.log('Transcription attempt:', {
        audioSize: audioBlob.size,
        chunksCount: chunks.length,
        mimeType: audioBlob.type,
        lastProcessedSize: lastProcessedAudioSize.current
      });

      const result = await whisperService.transcribeAudio(audioBlob);
      
      if (result && result.transcript) {
        console.log('Whisper transcription result:', result);
        
        // Clean the transcript to remove repetitions
        const cleanedTranscript = cleanTranscript(result.transcript.trim());
        console.log('Cleaned transcript:', cleanedTranscript);
        
        // Update the transcript with the cleaned content
        setLiveTranscript(cleanedTranscript);
        
        // Update the actual answer state
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = { ...updatedAnswers[currentQuestionIndex], text: cleanedTranscript };
        setAnswers(updatedAnswers);
        
        // Mark this audio size as processed
        lastProcessedAudioSize.current = audioBlob.size;
        
        console.log('Updated transcript:', cleanedTranscript);
      } else {
        console.log('No transcript returned from Whisper');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setError('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
      isTranscribingRef.current = false;
    }
  }, [isRecording, useWhisper, isWhisperAvailable, answers, currentQuestionIndex]);

  // Set up periodic transcription
  useEffect(() => {
    // Clear any existing timeout first
    if (transcriptionTimeoutRef.current) {
      clearInterval(transcriptionTimeoutRef.current);
      transcriptionTimeoutRef.current = null;
    }

    if (isRecording && useWhisper && isWhisperAvailable) {
      transcriptionTimeoutRef.current = setInterval(attemptTranscription, 2000);
    }

    return () => {
      if (transcriptionTimeoutRef.current) {
        clearInterval(transcriptionTimeoutRef.current);
        transcriptionTimeoutRef.current = null;
      }
    };
  }, [isRecording, useWhisper, isWhisperAvailable, attemptTranscription]);
  
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
      <p className="mt-2 text-gray-600 mb-4">Thank you for completing your AI interview. Your responses have been submitted and are being reviewed by the employer.</p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
        <p className="text-sm text-green-700">
          <strong>Status Updated:</strong> Your application status has been updated to "Interviewed" and the employer can now view your AI interview report.
        </p>
      </div>
      <button onClick={handleComplete} className="mt-6 w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition">
        Back to My Applications
      </button>
    </div>
  );

  const renderSession = () => {
    if (!session) return renderLoading("Initializing session...");
    const currentQuestion = session.questions[currentQuestionIndex];
    // Show 3 total questions since the backend generates 3 questions total
    const totalQuestions = 3;
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    
    // Debug session data
    // console.log('Session data:', {
    //   totalQuestions,
    //   currentQuestionIndex,
    //   progress,
    //   isLastQuestion,
    //   questions: session.questions?.length || 0
    // });
    
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
          {/* Enhanced Question Header with Progress */}
          <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-purple-700 font-semibold">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
              <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {Math.round(progress)}% Complete
              </div>
            </div>
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
            
            {/* Transcription Method Toggle */}
            {(isWhisperAvailable || isSpeechRecognitionSupported) && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Transcription Method:</span>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transcriptionMethod"
                        checked={useWhisper && isWhisperAvailable}
                        onChange={() => setUseWhisper(true)}
                        disabled={!isWhisperAvailable}
                        className="mr-2"
                      />
                      <span className={`text-sm ${!isWhisperAvailable ? 'text-gray-400' : 'text-gray-700'}`}>
                        Whisper AI {!isWhisperAvailable && '(Not Available)'}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="transcriptionMethod"
                        checked={!useWhisper && isSpeechRecognitionSupported}
                        onChange={() => setUseWhisper(false)}
                        disabled={!isSpeechRecognitionSupported}
                        className="mr-2"
                      />
                      <span className={`text-sm ${!isSpeechRecognitionSupported ? 'text-gray-400' : 'text-gray-700'}`}>
                        Web Speech API {!isSpeechRecognitionSupported && '(Not Available)'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {useWhisper ? 
                    "Whisper AI: Better accuracy for technical terms, uses API credits" :
                    "Web Speech API: Free, browser-based, may have lower accuracy for tech terms"
                  }
                </div>
              </div>
            )}
            
            {/* Helpful Text */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Tip:</strong> Speak clearly and edit the text field to correct any inaccuracies.
                </div>
              </div>
            </div>
            
            {!isWhisperAvailable && !isSpeechRecognitionSupported && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm flex items-center gap-2">
                <Info size={16} /> No transcription methods available. Please type your answer.
              </div>
            )}
            {isWhisperAvailable && useWhisper && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm flex items-center gap-2">
                <Info size={16} /> 
                <div>
                  <strong>Whisper AI Transcription Active:</strong> Speak clearly for best results. Technical terms are optimized for recognition. 
                  {isListening && <span className="text-green-600 font-medium"> • Recording...</span>}
                  {isTranscribing && <span className="text-purple-600 font-medium"> • Transcribing...</span>}
                </div>
              </div>
            )}
            {isSpeechRecognitionSupported && !useWhisper && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm flex items-center gap-2">
                <Info size={16} /> 
                <div>
                  <strong>Web Speech API Active:</strong> Free transcription using your browser. 
                  {isListening && <span className="text-green-600 font-medium"> • Listening...</span>}
                </div>
              </div>
            )}
            <textarea
              className="mt-2 w-full border-gray-300 rounded-lg p-3 h-40 focus:ring-purple-500 focus:border-purple-500"
              placeholder={isListening ? 'Recording...' : (isTranscribing ? 'Transcribing...' : 'Type your answer here or use the voice recording option...')}
              value={answers[currentQuestionIndex]?.text || ''}
              onChange={(e) => {
                const updatedAnswers = [...answers];
                updatedAnswers[currentQuestionIndex] = { text: e.target.value };
                setAnswers(updatedAnswers);
                setLiveTranscript(e.target.value);
              }}
              disabled={isRecording || isSubmitting}
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSubmitting || (!isWhisperAvailable && !isSpeechRecognitionSupported)}
              className={`px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? <><MicOff size={18} />Stop Recording</> : <><Mic size={18} />Record Answer</>}
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={isRecording || isSubmitting || !answers[currentQuestionIndex]?.text?.trim()}
              className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (isLastQuestion ? 'Submit Interview' : 'Next Question')}
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
    </div>
  );
}