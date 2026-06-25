# BrainRotBattle — Setup Guide

Vollständige Anleitung zum Aufsetzen des Projekts auf deinem Hetzner Server und Build als Mobile App.

## Was du bekommst

Ein vollständig funktionierender 3D Endless Runner Prototyp mit:
- **Three.js 3D Engine** mit Brainrot-Character (Placeholder bis Sketchfab-Models geladen)
- **3-Lane Runner** Mechanik (Links/Mitte/Rechts wie Subway Surfers)
- **Swipe + Touch Controls** für Mobile
- **Coin Collection + Obstacle System**
- **Character Selection Screen** (erweiterbar für mehr Brainrot Characters)
- **Score + High Score Tracking** (localStorage)
- **Progressives Speed Scaling** (wird schneller je länger du läufst)
- **Capacitor Setup** für iOS + Android Builds
- **Hetzner Deploy Script**

## Voraussetzungen auf deinem Hetzner Server

```bash
# Node.js 20+ (falls nicht installiert)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git (sollte schon da sein)
sudo apt-get install -y git

# Nginx für Hosting
sudo apt-get install -y nginx
```

## Schritt 1: Projekt auf Server deployen

```bash
# Dateien auf Server kopieren (von deinem lokalen PC):
scp -r brainrotbattle chris@46.4.204.162:/home/chris/

# Auf Server einloggen
ssh chris@46.4.204.162

# Ins Projekt wechseln
cd /home/chris/brainrotbattle

# Dependencies installieren
npm install

# Dev-Server starten (für Testing)
npm run dev
# → läuft auf http://46.4.204.162:5173
```

## Schritt 2: Sketchfab Brainrot Models laden

1. Gehe auf: https://sketchfab.com/3d-models/italian-brainrot-pack-vol1-2c36c12a0243457aa05c402c46db4660
2. Klicke "Download 3D Model" (kostenlos, CC-BY Lizenz)
3. Wähle **glTF (.glb)** Format
4. Entpacke die ZIP
5. Kopiere die `.glb` Dateien in `/public/models/characters/`
6. Benenne sie um:
   - `tralalero.glb`
   - `bombardino.glb`
   - `tungtung.glb`
   - (etc.)

**Credits-Datei nicht vergessen!** (CC-BY verlangt Attribution)
- In `/public/CREDITS.txt` die Sketchfab-Links + Artist Name eintragen
- Im Game Settings-Screen einen "Credits" Button einbauen

## Schritt 3: Für Production bauen

```bash
# Production Build
npm run build
# → erstellt /dist Ordner

# Nginx konfigurieren (siehe nginx.conf im Projekt)
sudo cp nginx.conf /etc/nginx/sites-available/brainrotbattle
sudo ln -s /etc/nginx/sites-available/brainrotbattle /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Jetzt läuft das Game auf http://46.4.204.162
```

## Schritt 4: Domain brainrotbattle.io aufsetzen

```bash
# Bei deinem Domain-Provider:
# A-Record: brainrotbattle.io → 46.4.204.162
# A-Record: www.brainrotbattle.io → 46.4.204.162

# SSL mit Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d brainrotbattle.io -d www.brainrotbattle.io
```

## Schritt 5: Mobile App builden (Capacitor)

**Auf deinem lokalen PC** (nicht Server):

```bash
# Dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Capacitor initialisieren
npx cap init BrainRotBattle io.brainrotbattle.app --web-dir=dist

# Build + Sync
npm run build
npx cap sync

# Android Build (braucht Android Studio installiert)
npx cap add android
npx cap open android
# → In Android Studio: Build → Generate Signed Bundle/APK

# iOS Build (braucht Mac + Xcode)
npx cap add ios
npx cap open ios
# → In Xcode: Product → Archive → Upload to App Store Connect
```

## Kosten-Übersicht

| Item | Kosten |
|------|--------|
| Hetzner Server | schon bezahlt |
| Domain brainrotbattle.io | schon bezahlt |
| Sketchfab Models | GRATIS (CC-BY) |
| Meshy AI Pro (falls nötig) | $20/Monat |
| Apple Developer Account | $99/Jahr |
| Google Play Developer | $25 einmalig |
| **TOTAL** | **~$144 + $20/Monat** |

## 12-Wochen Timeline

- **Woche 1-2**: Setup + erste Tests ← DU BIST HIER
- **Woche 3-5**: Core Runner Loop polieren + erste Characters einbauen
- **Woche 6-7**: 8-10 Characters integrieren + Toon Shader für einheitlichen Look
- **Woche 8-9**: Meta-Progression (Character Level-Up, XP System, Shop)
- **Woche 10**: Ads (AppLovin MAX) + IAPs (RevenueCat)
- **Woche 11**: Tutorial, Polish, Soft Launch in 1 Land
- **Woche 12**: TikTok Launch Push + App Store Global

## Build in Public — TikTok Content Plan

Start direkt diese Woche! Jede Woche 2-3 Clips:
- **Woche 1**: "Ich baue ein Brainrot Game 🧠" (dieses Setup zeigen)
- **Woche 2**: "Erste Character Animation läuft!" (Running-Animation)
- **Woche 3**: "Bombardino kann jetzt fliegen" (neues Gameplay)
- **Usw.**

Jeder Clip = mehr Awareness + Pre-Launch Hype.

## Probleme?

Frag mich einfach nochmal hier im Chat. Ich helfe dir durch jeden Schritt.
