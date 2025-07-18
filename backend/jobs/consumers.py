import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
import os
import asyncio
from django.conf import settings

logger = logging.getLogger(__name__)

class STTConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.audio_chunks = []
        logger.info("STT WebSocket connected.")

    async def disconnect(self, close_code):
        logger.info(f"STT WebSocket disconnected: {close_code}")
        self.audio_chunks = []

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            self.audio_chunks.append(bytes_data)
            await self.send(text_data=json.dumps({"status": "chunk_received", "size": len(bytes_data)}))
        elif text_data:
            data = json.loads(text_data)
            if data.get("action") == "end":
                await self.send(text_data=json.dumps({"status": "processing", "chunks": len(self.audio_chunks)}))
                transcript, error = await self.stream_to_google_stt()
                if error:
                    await self.send(text_data=json.dumps({"status": "error", "error": error}))
                else:
                    await self.send(text_data=json.dumps({"status": "transcript", "transcript": transcript}))
            else:
                await self.send(text_data=json.dumps({"status": "unknown_action"}))

    async def stream_to_google_stt(self):
        try:
            from google.cloud import speech
            import io
            # Combine all audio chunks into a single bytes object
            audio_bytes = b"".join(self.audio_chunks)
            if not audio_bytes:
                return (None, "No audio data received.")

            # Google expects a generator of requests for streaming
            def request_generator():
                yield speech.StreamingRecognizeRequest(
                    audio_content=audio_bytes
                )

            client = speech.SpeechClient()
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.OGG_OPUS,
                sample_rate_hertz=48000,
                language_code="en-US",
                enable_automatic_punctuation=True,
                enable_word_time_offsets=False,
                model="latest_long",
                use_enhanced=True,
            )
            streaming_config = speech.StreamingRecognitionConfig(
                config=config,
                interim_results=False,
                single_utterance=True,
            )

            # Run the blocking Google call in a thread executor
            loop = asyncio.get_event_loop()
            responses = await loop.run_in_executor(
                None,
                lambda: list(client.streaming_recognize(streaming_config, request_generator()))
            )

            transcript = ""
            for response in responses:
                for result in response.results:
                    if result.is_final and result.alternatives:
                        transcript += result.alternatives[0].transcript + " "
            transcript = transcript.strip()
            if not transcript:
                return (None, "No speech detected in audio.")
            return (transcript, None)
        except Exception as e:
            logger.error(f"Google STT streaming error: {e}", exc_info=True)
            return (None, str(e)) 