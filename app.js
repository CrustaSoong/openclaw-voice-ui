// OpenClaw Voice Assistant Client
class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.ws = null;
        this.isListening = false;
        this.isProcessing = false;
        
        this.elements = {
            micButton: document.getElementById('micButton'),
            status: document.getElementById('status'),
            transcript: document.getElementById('transcript'),
            response: document.getElementById('response'),
            errorBox: document.getElementById('error-box'),
            gatewayUrl: document.getElementById('gatewayUrl'),
            gatewayToken: document.getElementById('gatewayToken')
        };
        
        this.init();
    }
    
    init() {
        // Check for Web Speech API support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Speech recognition not supported in this browser. Try Chrome, Edge, or Safari.');
            return;
        }
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        // Set up event listeners
        this.recognition.onstart = () => this.onRecognitionStart();
        this.recognition.onresult = (e) => this.onRecognitionResult(e);
        this.recognition.onerror = (e) => this.onRecognitionError(e);
        this.recognition.onend = () => this.onRecognitionEnd();
        
        // Mic button click
        this.elements.micButton.addEventListener('click', () => this.toggleListening());
        
        // Load saved config
        this.loadConfig();
        
        // Save config on change
        this.elements.gatewayUrl.addEventListener('change', () => this.saveConfig());
        this.elements.gatewayToken.addEventListener('change', () => this.saveConfig());
    }
    
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        this.elements.transcript.textContent = '';
        this.elements.response.textContent = '';
        this.hideError();
        
        try {
            this.recognition.start();
        } catch (e) {
            this.showError('Failed to start microphone: ' + e.message);
        }
    }
    
    stopListening() {
        this.recognition.stop();
    }
    
    onRecognitionStart() {
        this.isListening = true;
        this.elements.micButton.classList.add('listening');
        this.updateStatus('🎤 Listening...');
    }
    
    onRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        this.elements.transcript.textContent = finalTranscript || interimTranscript;
        
        if (finalTranscript) {
            this.sendToOpenClaw(finalTranscript.trim());
        }
    }
    
    onRecognitionError(event) {
        console.error('Speech recognition error:', event.error);
        
        const errorMessages = {
            'no-speech': 'No speech detected. Please try again.',
            'audio-capture': 'Microphone not accessible.',
            'not-allowed': 'Microphone permission denied.',
            'network': 'Network error occurred.'
        };
        
        this.showError(errorMessages[event.error] || `Error: ${event.error}`);
        this.resetState();
    }
    
    onRecognitionEnd() {
        this.isListening = false;
        this.elements.micButton.classList.remove('listening');
        
        if (!this.isProcessing) {
            this.updateStatus('Ready to listen');
        }
    }
    
    async sendToOpenClaw(text) {
        this.isProcessing = true;
        this.elements.micButton.classList.add('processing');
        this.updateStatus('🤔 Thinking...');
        
        const gatewayUrl = this.elements.gatewayUrl.value;
        const gatewayToken = this.elements.gatewayToken.value;
        
        if (!gatewayUrl) {
            this.showError('Please configure Gateway URL');
            this.resetState();
            return;
        }
        
        try {
            // Connect to OpenClaw Gateway via WebSocket
            await this.connectWebSocket(gatewayUrl, gatewayToken);
            
            // Send message
            this.ws.send(JSON.stringify({
                type: 'message',
                text: text,
                channel: 'voice-ui'
            }));
            
        } catch (error) {
            this.showError('Failed to connect to OpenClaw: ' + error.message);
            this.resetState();
        }
    }
    
    connectWebSocket(url, token) {
        return new Promise((resolve, reject) => {
            // Add token as query param if provided
            const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('Connected to OpenClaw');
                resolve();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(new Error('WebSocket connection failed'));
            };
            
            this.ws.onmessage = (event) => {
                this.handleGatewayMessage(event.data);
            };
            
            this.ws.onclose = () => {
                console.log('Disconnected from OpenClaw');
            };
            
            // Timeout after 5 seconds
            setTimeout(() => {
                if (this.ws.readyState !== WebSocket.OPEN) {
                    reject(new Error('Connection timeout'));
                }
            }, 5000);
        });
    }
    
    handleGatewayMessage(data) {
        try {
            const message = JSON.parse(data);
            
            if (message.type === 'response' || message.text) {
                const responseText = message.text || message.content;
                this.elements.response.textContent = responseText;
                
                // Speak the response
                this.speakResponse(responseText);
            }
            
            if (message.type === 'complete' || message.done) {
                this.resetState();
                if (this.ws) {
                    this.ws.close();
                    this.ws = null;
                }
            }
            
        } catch (e) {
            console.error('Failed to parse gateway message:', e);
        }
    }
    
    speakResponse(text) {
        // Use Web Speech API for TTS (fallback if Piper isn't configured)
        // TODO: Integrate with Piper TTS via OpenClaw's tts tool
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onend = () => {
            this.updateStatus('Ready to listen');
        };
        
        window.speechSynthesis.speak(utterance);
    }
    
    resetState() {
        this.isProcessing = false;
        this.isListening = false;
        this.elements.micButton.classList.remove('listening', 'processing');
        this.updateStatus('Ready to listen');
    }
    
    updateStatus(text) {
        this.elements.status.textContent = text;
    }
    
    showError(message) {
        this.elements.errorBox.textContent = message;
        this.elements.errorBox.classList.remove('hidden');
    }
    
    hideError() {
        this.elements.errorBox.classList.add('hidden');
    }
    
    loadConfig() {
        const savedUrl = localStorage.getItem('openclaw_gateway_url');
        const savedToken = localStorage.getItem('openclaw_gateway_token');
        
        if (savedUrl) {
            this.elements.gatewayUrl.value = savedUrl;
        }
        if (savedToken) {
            this.elements.gatewayToken.value = savedToken;
        }
    }
    
    saveConfig() {
        localStorage.setItem('openclaw_gateway_url', this.elements.gatewayUrl.value);
        localStorage.setItem('openclaw_gateway_token', this.elements.gatewayToken.value);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceAssistant();
});
