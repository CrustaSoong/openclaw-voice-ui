# 🎤 OpenClaw Voice UI

Beautiful web interface for interacting with OpenClaw via voice. Click to speak, OpenClaw listens and responds!

## ✨ Features

- 🎤 **Browser Speech Recognition** - Click-to-talk using Web Speech API
- 🗣️ **Text-to-Speech** - Hear OpenClaw's responses
- 🌐 **Simple Web UI** - Clean, modern interface that works on any device
- 🔒 **Secure** - Direct WebSocket connection to your OpenClaw gateway
- 📱 **Mobile Friendly** - Works on phones, tablets, and desktops
- 🚀 **Lightweight** - Only 32MB RAM, nginx-based

## 🚀 Quick Start

### Option 1: Docker Run (Testing)

```bash
docker build -t openclaw-voice-ui .
docker run -p 8080:80 openclaw-voice-ui
```

Open http://localhost:8080 and configure your OpenClaw gateway URL!

### Option 2: Kubernetes Deployment (Production)

```bash
# 1. Build and push image
docker build -t your-registry.com/openclaw-voice-ui:latest .
docker push your-registry.com/openclaw-voice-ui:latest

# 2. Update k8s-deployment.yaml with your image

# 3. Deploy
kubectl apply -f k8s-deployment.yaml

# 4. Access via port-forward (or configure ingress)
kubectl port-forward -n openclaw svc/openclaw-voice-ui 8080:80
```

### Option 3: Static Hosting (Cloudflare Pages, Netlify, etc.)

Just deploy `index.html` and `app.js` to any static host! No server needed.

## ⚙️ Configuration

On first load, configure:

1. **Gateway URL**: Your OpenClaw WebSocket address
   - Example: `ws://openclaw.local:18789`
   - K8s: `ws://openclaw:18789` (from within cluster)
   - External: `wss://openclaw.yourdomain.com` (with TLS)

2. **Gateway Token**: Your OpenClaw auth token (optional)
   - Found in `~/.openclaw/openclaw.json` → `gateway.auth.token`
   - Only needed if auth is enabled

Settings are saved in browser localStorage.

## 🎭 How It Works

```
┌─────────────────────────────────────────────────────────┐
│  1. Click Microphone Button                            │
│  2. Browser captures speech → text (Web Speech API)    │
│  3. Send text to OpenClaw Gateway via WebSocket        │
│  4. OpenClaw processes request (tools, memory, etc.)   │
│  5. Response streamed back via WebSocket               │
│  6. Browser speaks response (TTS)                      │
└─────────────────────────────────────────────────────────┘
```

## 🌐 Browser Support

**Speech Recognition (STT)**:
- ✅ Chrome/Edge (Chromium) - Best support
- ✅ Safari (macOS/iOS) - Good support
- ❌ Firefox - Limited support

**Text-to-Speech (TTS)**:
- ✅ All modern browsers

**Tip**: Use Chrome or Safari for best experience!

## 🔧 Advanced Configuration

### Connect to Piper TTS

To use local Piper TTS instead of browser TTS, OpenClaw needs TTS configured:

```json
// ~/.openclaw/openclaw.json
{
  "tools": {
    "tts": {
      "enabled": true,
      "provider": "openai",
      "baseUrl": "http://piper-tts:5000/v1",
      "model": "tts-1",
      "voice": "alloy"
    }
  }
}
```

Then restart OpenClaw gateway.

### Custom Styling

Edit `index.html` to customize colors, fonts, and layout!

### Enable HTTPS (Recommended)

For production use, enable HTTPS:

**Option A: Ingress with TLS**
```yaml
# See k8s-deployment.yaml for ingress example
```

**Option B: Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://openclaw-voice-ui
```

## 📊 Resource Usage

- **Memory**: 32-64MB
- **CPU**: <50m idle, 100-200m during speech
- **Storage**: <5MB (static files)

## 🐛 Troubleshooting

**Microphone not working:**
- Check browser permissions (click lock icon in address bar)
- HTTPS required on non-localhost domains
- Try Chrome or Safari

**Can't connect to OpenClaw:**
- Verify gateway URL is correct
- Check gateway is running: `kubectl get pods -n openclaw`
- Try port-forward: `kubectl port-forward -n openclaw svc/openclaw 18789:18789`
- Check token is correct (if auth enabled)

**No audio response:**
- Check browser volume
- Verify TTS is working: try clicking somewhere first (browsers block audio until user interaction)

**"Speech recognition not supported":**
- Use Chrome, Edge, or Safari
- Firefox has limited/no support

## 🚀 Future Enhancements

- [ ] Wake word detection ("Hey OpenClaw")
- [ ] Local Whisper integration (privacy)
- [ ] Multi-language support
- [ ] Voice activity detection (VAD)
- [ ] Conversation history UI
- [ ] Dark/light theme toggle

## 📝 License

MIT License - Built for OpenClaw

## 🤝 Contributing

PRs welcome! Ideas:
- Better UI/UX
- More browser support
- Wake word detection
- Local STT integration

---

**Built**: 2026-02-09  
**Tech**: Vanilla JS + Web Speech API + WebSocket  
**Size**: ~15KB total (uncompressed)
