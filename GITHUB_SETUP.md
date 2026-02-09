# GitHub Repository Setup

Quick guide to create a GitHub repo for this project.

## 🔧 Setup Steps

### 1. Initialize Git (if not already done)

```bash
cd ~/.openclaw/workspace/openclaw-voice-ui
git init
git add .
git commit -m "Initial commit: OpenClaw Voice UI"
```

### 2. Create GitHub Repository

**Via GitHub CLI** (recommended):
```bash
gh repo create openclaw-voice-ui --public --source=. --remote=origin --push
```

**Or via Web**:
1. Go to https://github.com/new
2. Repository name: `openclaw-voice-ui`
3. Description: "🎤 Beautiful web interface for OpenClaw voice assistant"
4. Public or Private (your choice)
5. Don't initialize with README (we have one)
6. Click "Create repository"

### 3. Link and Push

```bash
# Add remote (if created via web)
git remote add origin git@github.com:YourUsername/openclaw-voice-ui.git

# Push
git branch -M main
git push -u origin main
```

### 4. Configure Repository

**Add Topics** (helps discoverability):
- `openclaw`
- `voice-assistant`
- `speech-recognition`
- `tts`
- `kubernetes`

**GitHub Pages** (optional - for live demo):
1. Settings → Pages
2. Source: `main` branch, `/` (root)
3. Your UI will be live at: `https://yourusername.github.io/openclaw-voice-ui/`

### 5. Set Up GitHub Actions (optional)

Create `.github/workflows/docker.yml` for automated builds:

```yaml
name: Build Docker Image

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

This will automatically build and push images to `ghcr.io/yourusername/openclaw-voice-ui`.

### 6. Add Badge to README

```markdown
[![Docker](https://github.com/YourUsername/openclaw-voice-ui/actions/workflows/docker.yml/badge.svg)](https://github.com/YourUsername/openclaw-voice-ui/actions/workflows/docker.yml)
```

## 🎉 Done!

Your repo is ready! Share it with:
- OpenClaw community
- Reddit (r/selfhosted, r/homelab)
- Discord servers
- Hacker News (Show HN)

## 📝 Suggested README Updates

Add to top of README.md:
```markdown
[![Docker Pulls](https://img.shields.io/docker/pulls/yourusername/openclaw-voice-ui)](https://hub.docker.com/r/yourusername/openclaw-voice-ui)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/openclaw-voice-ui)](https://github.com/yourusername/openclaw-voice-ui/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```
