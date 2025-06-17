import asyncio
import speech_recognition as sr
from gtts import gTTS
from io import BytesIO
import pygame
import threading
import queue
import logging
import time
import re
import signal
import os
import numpy as np
from threading import Event
from langchain_ollama import ChatOllama
import platform
import sys
import traceback

# Debugging and Version Control
DEBUG_MODE = True
VERSION = "1.0.1"

def check_libraries():
    """Verify all required libraries are installed and working"""
    print("\n" + "="*50)
    print(f"Voice Chat System v{VERSION} - Library Check")
    print("="*50)
    
    checks = {
        "Python Version": f"{platform.python_version()} (Expected: 3.10.x)",
        "System": platform.system(),
        "SpeechRecognition": None,
        "gTTS": None,
        "PyGame": None,
        "LangChain-Ollama": None,
        "NumPy": None,
        "PyAudio": None
    }

    try:
        import speech_recognition
        checks["SpeechRecognition"] = f"Working (v{speech_recognition.__version__})"
    except Exception as e:
        checks["SpeechRecognition"] = f"FAILED: {str(e)}"

    try:
        import gtts
        checks["gTTS"] = f"Working (v{gtts.__version__})"
    except Exception as e:
        checks["gTTS"] = f"FAILED: {str(e)}"

    try:
        import pygame
        pygame.mixer.init()
        checks["PyGame"] = f"Working (v{pygame.__version__})"
        pygame.mixer.quit()
    except Exception as e:
        checks["PyGame"] = f"FAILED: {str(e)}"

    try:
        import langchain_ollama
        checks["LangChain-Ollama"] = "Working"
    except Exception as e:
        checks["LangChain-Ollama"] = f"FAILED: {str(e)}"

    try:
        import numpy
        checks["NumPy"] = f"Working (v{numpy.__version__})"
    except Exception as e:
        checks["NumPy"] = f"FAILED: {str(e)}"

    try:
        import pyaudio
        p = pyaudio.PyAudio()
        p.terminate()
        checks["PyAudio"] = "Working"
    except Exception as e:
        checks["PyAudio"] = f"FAILED: {str(e)}"

    # Print results
    max_key_length = max(len(key) for key in checks.keys())
    for lib, status in checks.items():
        print(f"{lib.ljust(max_key_length)}: {status}")

    # Check FFmpeg for PyDub
    try:
        from pydub.utils import which
        ffmpeg_path = which("ffmpeg")
        if ffmpeg_path:
            print(f"\nFFmpeg found at: {ffmpeg_path}")
        else:
            print("\nWARNING: FFmpeg not found in PATH. Audio processing may fail.")
    except:
        print("\nPyDub/FFmpeg check skipped (PyDub not required for core functionality)")

    print("\n" + "="*50)
    print("Initialization Complete")
    print("="*50 + "\n")

class DebugLogger:
    """Enhanced logging system for debugging"""
    def __init__(self):
        self.logger = logging.getLogger('VoiceChatDebug')
        self.logger.setLevel(logging.DEBUG)
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Console handler
        ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)
        
        # File handler
        fh = logging.FileHandler('voice_chat_debug.log')
        fh.setLevel(logging.DEBUG)
        
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        fh.setFormatter(formatter)
        
        self.logger.addHandler(ch)
        self.logger.addHandler(fh)
    
    def log(self, message, level='info'):
        """Log message with specified level"""
        if not DEBUG_MODE and level == 'debug':
            return
            
        if level == 'debug':
            self.logger.debug(message)
        elif level == 'warning':
            self.logger.warning(message)
        elif level == 'error':
            self.logger.error(message)
            self.logger.error(traceback.format_exc())  # Include stack trace
        else:
            self.logger.info(message)

debug_logger = DebugLogger()

class AsyncSentenceQueue:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.current_sentence = ""
        debug_logger.log("AsyncSentenceQueue initialized", 'debug')
        
    async def put(self, text: str):
        """Add text and split into sentences when possible"""
        try:
            self.current_sentence += text
            sentences = re.split(r'([.!?]+)', self.current_sentence)
            
            # Process complete sentences
            while len(sentences) >= 2:
                sentence = sentences.pop(0) + sentences.pop(0)
                if sentence.strip():
                    await self.queue.put(sentence)
                    debug_logger.log(f"Queued sentence: {sentence}", 'debug')
            
            self.current_sentence = ''.join(sentences)
        except Exception as e:
            debug_logger.log(f"Error in put(): {str(e)}", 'error')
            raise
    
    async def get(self):
        """Get next complete sentence from queue"""
        try:
            item = await self.queue.get()
            debug_logger.log(f"Retrieved from queue: {item}", 'debug')
            return item
        except Exception as e:
            debug_logger.log(f"Error in get(): {str(e)}", 'error')
            raise
    
    def task_done(self):
        """Mark a queue item as done"""
        try:
            self.queue.task_done()
            debug_logger.log("Queue task marked done", 'debug')
        except Exception as e:
            debug_logger.log(f"Error in task_done(): {str(e)}", 'error')
            raise
    
    async def finish(self):
        """Put any remaining text into queue"""
        try:
            if self.current_sentence.strip():
                await self.queue.put(self.current_sentence)
                debug_logger.log(f"Final sentence queued: {self.current_sentence}", 'debug')
                self.current_sentence = ""
        except Exception as e:
            debug_logger.log(f"Error in finish(): {str(e)}", 'error')
            raise

async def generate_text(text: str, sentence_queue: AsyncSentenceQueue):
    """Generate text and put sentences into queue"""
    debug_logger.log(f"Starting text generation with prompt: {text}")
    model = ChatOllama(model="llama3.3")
    
    try:
        stream = model.stream(text)
        for chunk in stream:
            if chunk.content:  # Only process non-empty chunks
                await sentence_queue.put(chunk.content)
                await asyncio.sleep(0)  # Yield control
        await sentence_queue.finish()
        debug_logger.log("Text generation completed successfully")
    except asyncio.CancelledError:
        debug_logger.log("Text generation cancelled", 'warning')
        raise
    except Exception as e:
        debug_logger.log(f"Error in generate_text(): {str(e)}", 'error')
        raise

async def display_queue(sentence_queue: AsyncSentenceQueue):
    """Display sentences from queue with delay for effect"""
    debug_logger.log("Starting queue display")
    
    try:
        while True:
            sentence = await sentence_queue.get()
            print(sentence, end='', flush=True)
            debug_logger.log(f"Displayed: {sentence}", 'debug')
            await asyncio.sleep(0.5)
            sentence_queue.task_done()
    except asyncio.CancelledError:
        debug_logger.log("Display task cancelled", 'warning')
        raise
    except Exception as e:
        debug_logger.log(f"Error in display_queue(): {str(e)}", 'error')
        raise

async def async_demo():
    """Async demo function"""
    debug_logger.log("Starting async demo")
    sentence_queue = AsyncSentenceQueue()
    
    try:
        generator_task = asyncio.create_task(generate_text("tell me a short story", sentence_queue))
        display_task = asyncio.create_task(display_queue(sentence_queue))
        
        await asyncio.sleep(10)  # Run for 10 seconds
        debug_logger.log("Demo time elapsed, cancelling tasks")
        
        generator_task.cancel()
        display_task.cancel()
        
        await asyncio.gather(generator_task, display_task, return_exceptions=True)
    except Exception as e:
        debug_logger.log(f"Error in async_demo(): {str(e)}", 'error')
        raise
    finally:
        debug_logger.log("Async demo completed")

class VoiceChatSystem:
    def __init__(self, lang='en', model_name=""):
        debug_logger.log(f"Initializing VoiceChatSystem (lang={lang}, model={model_name})")
        
        # Initialize logging
        self.logger = self._setup_logger()
        
        # Speech recognition settings
        self.recognizer = sr.Recognizer()
        self.lang = lang
        self.energy_threshold = 1000
        self.recognizer.energy_threshold = self.energy_threshold
        debug_logger.log(f"Speech recognizer initialized (energy_threshold={self.energy_threshold})")
        
        # Initialize queues
        self.text_queue = queue.Queue()
        self.sentence_queue = queue.Queue()
        debug_logger.log("Queues initialized")
        
        # Initialize flags and events
        self.is_listening = True
        self.current_task_id = 0
        self.interrupt_event = Event()
        self.speaking_event = Event()
        self.is_system_speaking = False
        debug_logger.log("Flags and events initialized")
        
        # Initialize audio control
        try:
            pygame.mixer.init(frequency=24000)
            debug_logger.log("PyGame mixer initialized (24kHz)")
        except Exception as e:
            debug_logger.log(f"Failed to initialize PyGame mixer: {str(e)}", 'error')
            raise
        
        # Initialize model
        try:
            self.model = ChatOllama(model=model_name)
            debug_logger.log(f"Model initialized: {model_name}")
        except Exception as e:
            debug_logger.log(f"Failed to initialize model: {str(e)}", 'error')
            raise
        
        # Thread management
        self.active_threads = set()
        self.thread_lock = threading.Lock()
        debug_logger.log("Thread management initialized")
        
        # Signal handling
        signal.signal(signal.SIGINT, self.signal_handler)
        debug_logger.log("Signal handler registered")
        
        debug_logger.log("VoiceChatSystem initialization complete")

    def _setup_logger(self):
        logger = logging.getLogger('VoiceChatSystem')
        logger.handlers.clear()
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG if DEBUG_MODE else logging.INFO)
        
        return logger

    def signal_handler(self, signum, frame):
        """Handle interrupt signals"""
        debug_logger.log(f"Signal {signum} received, stopping system")
        self.stop_system()

    def kill_thread(self, thread_id):
        """Remove thread from active threads"""
        with self.thread_lock:
            if thread_id in self.active_threads:
                self.active_threads.discard(thread_id)
                debug_logger.log(f"Thread {thread_id} removed from active threads", 'debug')

    def register_thread(self, thread_id):
        """Register new thread"""
        with self.thread_lock:
            self.active_threads.add(thread_id)
            debug_logger.log(f"Thread {thread_id} registered", 'debug')

    def immediate_interrupt(self):
        """Completely stop all ongoing processes"""
        debug_logger.log("Initiating immediate interrupt")
        self.interrupt_event.set()
        
        # Stop audio
        if pygame.mixer.get_busy():
            debug_logger.log("Stopping audio playback")
            pygame.mixer.stop()
        
        # Clear all queues
        self._clear_queues()
        debug_logger.log("Queues cleared")
        
        # Kill all active threads except the current one
        current_thread_id = threading.get_ident()
        with self.thread_lock:
            threads_to_kill = self.active_threads.copy()
            threads_to_kill.discard(current_thread_id)
            
            debug_logger.log(f"Killing {len(threads_to_kill)} threads")
            self.active_threads.clear()
            self.active_threads.add(current_thread_id)
        
        self.interrupt_event.clear()
        self.is_system_speaking = False
        debug_logger.log("Interrupt completed")

    def speak_text(self, text, task_id):
        """Convert text to speech with system speech tracking"""
        debug_logger.log(f"Starting text-to-speech (task_id={task_id}, length={len(text)})")
    
        if task_id != self.current_task_id:
            debug_logger.log(f"Task ID mismatch ({task_id} != {self.current_task_id}), aborting", 'warning')
            return False

        try:
            if self.interrupt_event.is_set():
                debug_logger.log("Interrupt detected, aborting speech", 'warning')
                return False
            
            self.is_system_speaking = True
            self.speaking_event.set()
            debug_logger.log("System speaking flag set")
        
        # Create a temporary directory if it doesn't exist
            temp_dir = os.path.join(os.path.expanduser("~"), "voice_chat_temp")
            os.makedirs(temp_dir, exist_ok=True)
        
        # Create a more unique temp file name with full path
            temp_file = os.path.join(temp_dir, f"temp_audio_{task_id}_{time.time()}.mp3")
            debug_logger.log(f"Temporary file path: {temp_file}")
        
        # Generate audio directly to file
            try:
                tts = gTTS(text=text, lang=self.lang)
                tts.save(temp_file)
                debug_logger.log("Audio file saved successfully")
            except Exception as e:
                debug_logger.log(f"Error saving audio file: {str(e)}", 'error')
                return False
        
        # Load and play the audio
            try:
                pygame.mixer.music.load(temp_file)
                pygame.mixer.music.play()
                debug_logger.log("Audio playback started")
            
                while pygame.mixer.music.get_busy() and not self.interrupt_event.is_set():
                    time.sleep(0.1)
            
                pygame.mixer.music.stop()
                debug_logger.log("Audio playback stopped")
            except Exception as e:
                debug_logger.log(f"Error during audio playback: {str(e)}", 'error')
                return False
        
            success = not self.interrupt_event.is_set()
            debug_logger.log(f"Speech completed {'successfully' if success else 'with interrupt'}")
            return success
        
        except Exception as e:
            debug_logger.log(f"Error in speak_text(): {str(e)}", 'error')
            return False
        finally:
            self.is_system_speaking = False
            self.speaking_event.clear()
        
        # Clean up temp file if it exists
            if 'temp_file' in locals() and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                    debug_logger.log(f"Temporary file removed: {temp_file}")
                except Exception as e:
                    debug_logger.log(f"Error removing temp file: {str(e)}", 'warning')
        
            debug_logger.log("Speech resources cleaned up")
    def is_valid_human_speech(self, audio_data):
        """Check if audio is valid human speech and not system output"""
        if self.is_system_speaking:
            debug_logger.log("Audio rejected (system is speaking)", 'debug')
            return False
            
        # Placeholder for more advanced validation
        debug_logger.log("Audio accepted as potential human speech", 'debug')
        return True

    def listen_continuously(self):
        """Listen for speech with self-speech filtering"""
        thread_id = threading.get_ident()
        self.register_thread(thread_id)
        debug_logger.log(f"Listen thread started (ID: {thread_id})")
        
        try:
            with sr.Microphone() as source:
                debug_logger.log("Microphone source opened")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                debug_logger.log(f"Ambient noise adjusted (energy_threshold={self.recognizer.energy_threshold})")
                
                while self.is_listening:
                    try:
                        debug_logger.log("Listening...", 'debug')
                        audio = self.recognizer.listen(source, phrase_time_limit=None)
                        debug_logger.log("Audio captured", 'debug')
                        
                        if self.is_system_speaking or not self.is_valid_human_speech(audio):
                            debug_logger.log("Audio rejected (system speaking or invalid)", 'debug')
                            continue
                        
                        debug_logger.log("Valid human speech detected, interrupting system")
                        self.immediate_interrupt()
                        
                        text = self.recognizer.recognize_google(audio, language=self.lang)
                        debug_logger.log(f"Speech recognized: {text}")
                        
                        if text.lower() in ['quit', 'exit', 'stop', 'bye']:
                            debug_logger.log("Exit command recognized")
                            self.stop_system()
                            break
                        
                        self.current_task_id += 1
                        self.text_queue.put((text, self.current_task_id))
                        debug_logger.log(f"New task queued (ID: {self.current_task_id})")
                        
                    except sr.UnknownValueError:
                        debug_logger.log("Speech not understood", 'debug')
                        continue
                    except sr.RequestError as e:
                        debug_logger.log(f"Speech recognition service error: {str(e)}", 'warning')
                        continue
                    except Exception as e:
                        debug_logger.log(f"Error in listening: {str(e)}", 'error')
                        continue
        except Exception as e:
            debug_logger.log(f"Fatal error in listen_continuously(): {str(e)}", 'error')
            raise
        finally:
            self.kill_thread(thread_id)
            debug_logger.log(f"Listen thread terminated (ID: {thread_id})")

    def process_text(self):
        """Process text with complete task isolation"""
        thread_id = threading.get_ident()
        self.register_thread(thread_id)
        debug_logger.log(f"Process thread started (ID: {thread_id})")
        
        try:
            while self.is_listening:
                try:
                    text, task_id = self.text_queue.get(timeout=1)
                    debug_logger.log(f"Processing text (task_id={task_id}, length={len(text)})")
                    
                    if self.interrupt_event.is_set():
                        debug_logger.log("Interrupt detected, skipping processing", 'debug')
                        continue
                    
                    current_sentence = ""
                    stream = self.model.stream(text)
                    
                    for chunk in stream:
                        if self.interrupt_event.is_set() or task_id != self.current_task_id:
                            debug_logger.log("Interrupt or task ID mismatch, breaking stream", 'debug')
                            break
                        
                        current_sentence += chunk.content
                        sentences = re.split(r'([.!?]+)', current_sentence)
                        
                        while len(sentences) >= 2 and not self.interrupt_event.is_set():
                            sentence = sentences.pop(0) + sentences.pop(0)
                            if sentence.strip():
                                self.sentence_queue.put((sentence, task_id))
                                debug_logger.log(f"Sentence queued: {sentence}", 'debug')
                        
                        current_sentence = ''.join(sentences)
                    
                    if current_sentence.strip() and not self.interrupt_event.is_set():
                        self.sentence_queue.put((current_sentence, task_id))
                        debug_logger.log(f"Final sentence queued: {current_sentence}", 'debug')
                    
                except queue.Empty:
                    continue
                except Exception as e:
                    debug_logger.log(f"Error in processing: {str(e)}", 'error')
                    continue
        except Exception as e:
            debug_logger.log(f"Fatal error in process_text(): {str(e)}", 'error')
            raise
        finally:
            self.kill_thread(thread_id)
            debug_logger.log(f"Process thread terminated (ID: {thread_id})")

    def speak_responses(self):
        """Speak responses with complete task isolation"""
        thread_id = threading.get_ident()
        self.register_thread(thread_id)
        debug_logger.log(f"Speak thread started (ID: {thread_id})")
        
        try:
            while self.is_listening:
                try:
                    if self.interrupt_event.is_set():
                        debug_logger.log("Interrupt detected, skipping speech", 'debug')
                        continue
                        
                    sentence, task_id = self.sentence_queue.get(timeout=1)
                    debug_logger.log(f"Speaking sentence (task_id={task_id}, length={len(sentence)})")
                    
                    if task_id == self.current_task_id and not self.interrupt_event.is_set():
                        self.speak_text(sentence, task_id)
                    
                except queue.Empty:
                    continue
                except Exception as e:
                    debug_logger.log(f"Error in speaking: {str(e)}", 'error')
                    continue
        except Exception as e:
            debug_logger.log(f"Fatal error in speak_responses(): {str(e)}", 'error')
            raise
        finally:
            self.kill_thread(thread_id)
            debug_logger.log(f"Speak thread terminated (ID: {thread_id})")

    def _clear_queues(self):
        """Completely clear all queues"""
        debug_logger.log("Clearing queues")
        cleared_items = 0
        
        # Clear text queue
        while True:
            try:
                self.text_queue.get_nowait()
                cleared_items += 1
            except queue.Empty:
                break
        
        # Clear sentence queue
        while True:
            try:
                self.sentence_queue.get_nowait()
                cleared_items += 1
            except queue.Empty:
                break
                
        debug_logger.log(f"Cleared {cleared_items} items from queues")

    def stop_system(self):
        """Stop everything completely"""
        debug_logger.log("Stopping system")
        self.is_listening = False
        self.immediate_interrupt()
        try:
            pygame.mixer.quit()
            debug_logger.log("PyGame mixer quit")
        except Exception as e:
            debug_logger.log(f"Error quitting mixer: {str(e)}", 'warning')
        
        debug_logger.log("System stopped")

    def start(self):
        """Start the system with complete process isolation"""
        debug_logger.log("Starting system threads")
        
        self.listen_thread = threading.Thread(target=self.listen_continuously, name="ListenThread")
        self.process_thread = threading.Thread(target=self.process_text, name="ProcessThread")
        self.speak_thread = threading.Thread(target=self.speak_responses, name="SpeakThread")
        
        self.listen_thread.start()
        self.process_thread.start()
        self.speak_thread.start()
        
        debug_logger.log("All threads started, entering main loop")
        
        try:
            while self.is_listening:
                time.sleep(0.1)
        except KeyboardInterrupt:
            debug_logger.log("Keyboard interrupt received", 'warning')
            self.stop_system()
        except Exception as e:
            debug_logger.log(f"Error in main loop: {str(e)}", 'error')
            self.stop_system()
        
        debug_logger.log("Waiting for threads to terminate")
        
        self.listen_thread.join(timeout=5)
        self.process_thread.join(timeout=5)
        self.speak_thread.join(timeout=5)
        
        debug_logger.log("System shutdown complete")

def main():
    """Main function to run the voice chat system"""
    # First check all required libraries
    check_libraries()
    
    print("\nVoice Chat System - Main Menu")
    print("="*50)
    print("1. Voice Chat System")
    print("2. Async Demo")
    print("3. Exit")
    
    while True:
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == "1":
            print("\nStarting Voice Chat System...")
            debug_logger.log("Starting Voice Chat System from main menu")
            system = VoiceChatSystem(lang='en', model_name="llama3")
            system.start()
            break
        elif choice == "2":
            print("\nRunning async demo...")
            debug_logger.log("Starting async demo from main menu")
            asyncio.run(async_demo())
            break
        elif choice == "3":
            print("Exiting...")
            debug_logger.log("Program exited from main menu")
            sys.exit(0)
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        debug_logger.log(f"Fatal error in main: {str(e)}", 'error')
        print(f"\nA critical error occurred: {str(e)}")
        print("Check voice_chat_debug.log for details.")
        sys.exit(1)