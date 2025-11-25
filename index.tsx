
import React, { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Game Constants & Config ---
let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;
const WORLD_WIDTH = 6000;

// Physics Tuning: Balanced gameplay speed (fine-tuned v3)
const GRAVITY_DEFAULT = 1.5; // Reduced from 2.25 for more air time
const JUMP_FORCE_DEFAULT = -20;
const SPEED_DEFAULT = 6;
const MAX_STAMINA = 100;
const STAMINA_COST_DODGE = 40;
const STAMINA_COST_DOUBLE_JUMP = 30;
const STAMINA_REGEN = 0.15;

const COLORS = {
    background: '#050505',
    player: '#00f3ff',
    enemyWalker: '#ff0055',
    enemyElite: '#d946ef', // Purple
    enemyHeavy: '#fbbf24', // Gold
    enemyFlyer: '#ffe600',
    enemyTurret: '#ff4400',
    projectile: '#ff0000',
    playerProjectile: '#00ffff',
    platform: '#7c3aed',
    platformBorder: '#a78bfa',
    text: '#ffffff',
    energy: '#fbbf24',
    itemHealth: '#10b981', // Green
    itemEnergy: '#f59e0b',  // Amber
    itemBoost: '#ff00ff',   // Magenta
    itemShield: '#3b82f6',  // Blue
    spring: '#00ff00',      // Green Spring
    spike: '#ff0000',       // Red Spike
    stamina: '#ff69b4'      // Hot Pink for Stamina
};

// --- Gemini AI Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Audio Engine (8-bit Retro Style + Multi-Track) ---
class SoundSynthesizer {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    isPlayingBgm = false;
    bgmMode: 'MENU' | 'COMBAT' | 'GAMEOVER' = 'MENU'; // Keep for compatibility
    currentBGM: 'MENU' | 'COMBAT1' | 'COMBAT2' | 'COMBAT3' | null = null;
    currentCombatIndex: number = -1; // Track current combat BGM index
    currentCombatLoopCount: number = 0; // Count loops of current combat BGM
    hasStartedAnyBGM: boolean = false; // Track if any BGM has started
    nextNoteTime = 0;
    current16thNote = 0;
    scheduleAheadTime = 0.1;
    lookahead = 25.0;
    timerID: number | null = null;
    patternIndex = 0;

    // Track Rotation Logic
    currentTrackIndex = 0;
    trackLoopCounter = 0;

    // --- COMBAT TRACK 1: CLASSIC SYNTHWAVE ---
    track1 = {
        bass: [
            [36, 36, 48, 36, 36, 36, 48, 36, 38, 38, 50, 38, 38, 38, 50, 38],
            [40, 40, 52, 40, 40, 40, 52, 40, 43, 43, 55, 43, 43, 43, 55, 43],
            [36, 0, 36, 0, 48, 0, 36, 0, 36, 36, 48, 48, 36, 0, 36, 0],
            [41, 41, 41, 41, 43, 43, 43, 43, 48, 48, 48, 48, 48, 48, 48, 0],
            [36, 36, 0, 36, 36, 36, 0, 36, 33, 33, 0, 33, 33, 33, 0, 33],
            [41, 41, 0, 41, 41, 41, 0, 41, 40, 40, 0, 40, 43, 43, 0, 43],
            [36, 48, 36, 48, 36, 48, 36, 48, 38, 50, 38, 50, 38, 50, 38, 50], // C section
            [41, 53, 41, 53, 43, 55, 43, 55, 48, 60, 48, 60, 48, 48, 48, 48]  // D section
        ],
        melody: [
            [72, 0, 72, 75, 0, 79, 0, 75, 72, 0, 0, 0, 72, 74, 75, 79],
            [84, 0, 84, 82, 0, 79, 0, 75, 79, 0, 82, 0, 84, 0, 0, 0],
            [72, 75, 79, 84, 79, 75, 72, 0, 67, 70, 74, 79, 74, 70, 67, 0],
            [65, 0, 69, 0, 72, 0, 77, 0, 72, 74, 76, 79, 84, 84, 84, 0],
            [60, 0, 0, 0, 64, 0, 0, 0, 67, 0, 0, 0, 71, 0, 0, 0],
            [72, 0, 76, 0, 79, 0, 84, 0, 79, 0, 76, 0, 72, 0, 67, 0],
            [72, 75, 79, 75, 84, 79, 75, 72, 74, 77, 81, 77, 86, 81, 77, 74],
            [77, 81, 84, 81, 79, 83, 86, 83, 84, 88, 91, 88, 96, 96, 96, 0]
        ],
        perc: [
            [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1],
            [1, 0, 0, 1, 2, 0, 0, 0, 1, 1, 0, 0, 2, 0, 1, 0],
            [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 1, 2, 2],
            [1, 1, 1, 1, 2, 2, 2, 2, 1, 0, 1, 0, 2, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 2, 0],
            [1, 0, 1, 0, 2, 0, 2, 0, 1, 1, 1, 0, 2, 2, 2, 2],
            [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
            [1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 2]
        ]
    };

    // --- COMBAT TRACK 2: CYBERPUNK GLITCH ---
    track2 = {
        bass: [
            [28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], // E low aggressive
            [24, 24, 24, 24, 24, 24, 24, 24, 31, 31, 31, 31, 31, 31, 31, 31], // C to G
            [28, 40, 28, 40, 28, 40, 28, 40, 28, 40, 28, 40, 28, 40, 28, 40], // E arpeggio
            [26, 38, 26, 38, 26, 38, 26, 38, 33, 45, 33, 45, 33, 45, 33, 45], // D to A
            [28, 28, 40, 28, 28, 28, 40, 28, 31, 31, 43, 31, 31, 31, 43, 31], // Syncopated
            [24, 36, 24, 36, 24, 36, 24, 36, 26, 38, 26, 38, 28, 40, 28, 40], // Rising
            [28, 28, 28, 28, 40, 40, 40, 40, 28, 28, 28, 28, 40, 40, 40, 40], // Power chords
            [28, 31, 33, 36, 40, 36, 33, 31, 28, 31, 33, 36, 40, 43, 45, 48]  // Climax run
        ],
        melody: [
            [76, 0, 76, 79, 0, 83, 0, 79, 76, 0, 76, 79, 83, 0, 88, 0], // Fast arpeggios
            [72, 72, 0, 72, 84, 84, 0, 84, 79, 79, 0, 79, 91, 91, 0, 91], // Octave jumps
            [88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73], // Glitch slide
            [76, 0, 0, 0, 88, 0, 0, 0, 76, 0, 0, 0, 91, 0, 0, 0], // Sparse stabs
            [76, 79, 83, 88, 83, 79, 76, 72, 74, 77, 81, 86, 81, 77, 74, 70], // Wave pattern
            [0, 76, 0, 88, 0, 76, 0, 91, 0, 83, 0, 95, 0, 88, 0, 100], // Synth stabs
            [88, 88, 91, 91, 95, 95, 88, 88, 83, 83, 86, 86, 90, 90, 83, 83], // Chord hits
            [76, 79, 83, 88, 91, 95, 100, 103, 100, 95, 91, 88, 83, 79, 76, 0] // Epic finale
        ],
        perc: [
            [1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1], // Fast 4/4
            [1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 0, 1, 1, 2, 2], // Breakbeat
            [1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2], // Industrial
            [1, 0, 0, 1, 2, 0, 0, 2, 1, 1, 0, 1, 2, 2, 0, 2], // Glitchy
            [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2], // Machine gun
            [1, 0, 1, 0, 2, 0, 2, 0, 1, 0, 1, 0, 2, 2, 2, 2], // Build up
            [1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1], // Driving
            [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2]  // Chaos
        ]
    };

    // --- COMBAT TRACK 3: ELECTRIC PULSE ---
    track3 = {
        bass: [
            [33, 33, 33, 33, 33, 33, 33, 33, 40, 40, 40, 40, 40, 40, 40, 40], // F to C power
            [36, 36, 36, 36, 36, 36, 36, 36, 43, 43, 43, 43, 43, 43, 43, 43], // G# to G# high
            [33, 45, 33, 45, 33, 45, 33, 45, 40, 52, 40, 52, 40, 52, 40, 52], // Rapid arp
            [36, 48, 36, 48, 36, 48, 36, 48, 38, 50, 38, 50, 38, 50, 38, 50], // Pulsing
            [33, 0, 33, 0, 45, 0, 45, 0, 33, 0, 33, 0, 45, 0, 45, 0], // Syncopated
            [40, 0, 40, 0, 52, 0, 52, 0, 38, 0, 38, 0, 50, 0, 50, 0], // Stuttering bass
            [33, 33, 45, 45, 33, 33, 45, 45, 40, 40, 52, 52, 40, 40, 52, 52], // Bouncing
            [36, 38, 40, 43, 45, 48, 50, 52, 52, 50, 48, 45, 43, 40, 38, 36]  // Full sweep
        ],
        melody: [
            [81, 84, 88, 93, 88, 84, 81, 77, 84, 88, 93, 96, 93, 88, 84, 81], // Trance lead
            [84, 0, 96, 0, 84, 0, 96, 0, 88, 0, 100, 0, 88, 0, 100, 0], // Gated synth
            [93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78], // Sweep down
            [81, 81, 81, 93, 93, 93, 96, 96, 100, 100, 96, 96, 93, 93, 81, 81], // Chord stabs
            [81, 84, 88, 93, 81, 84, 88, 93, 84, 88, 93, 96, 84, 88, 93, 96], // Fast arp
            [0, 81, 0, 93, 0, 84, 0, 96, 0, 88, 0, 100, 0, 93, 0, 105], // Sparse hits
            [96, 96, 93, 93, 88, 88, 84, 84, 100, 100, 96, 96, 93, 93, 88, 88], // Alternating
            [81, 84, 88, 93, 96, 100, 105, 108, 105, 100, 96, 93, 88, 84, 81, 0] // Epic climb
        ],
        perc: [
            [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0], // Four-on-floor
            [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 1], // Building
            [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0], // Steady pulse
            [1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1], // Double time
            [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2], // Rapid fire
            [1, 0, 1, 0, 2, 0, 2, 0, 1, 0, 1, 0, 2, 2, 2, 2], // Breakdown
            [1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2], // Power beats
            [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2]  // Full intensity
        ]
    };

    combatTracks = [this.track1, this.track2, this.track3];

    // --- MENU BGM (Ambient/Suspense) ---
    menuBass = [
        [24, 0, 0, 0, 31, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0],
        [24, 0, 0, 0, 31, 0, 0, 0, 29, 0, 0, 0, 0, 0, 0, 0],
        [22, 0, 0, 0, 29, 0, 0, 0, 22, 0, 0, 0, 0, 0, 0, 0],
        [21, 0, 0, 0, 28, 0, 0, 0, 33, 0, 0, 0, 0, 0, 0, 0]
    ];
    menuMelody = [
        [60, 0, 64, 0, 67, 0, 72, 0, 67, 0, 64, 0, 60, 0, 0, 0],
        [60, 0, 64, 0, 67, 0, 72, 0, 71, 0, 67, 0, 64, 0, 0, 0],
        [58, 0, 62, 0, 65, 0, 70, 0, 65, 0, 62, 0, 58, 0, 0, 0],
        [57, 0, 61, 0, 64, 0, 69, 0, 73, 0, 69, 0, 64, 0, 0, 0]
    ];

    // --- GAME OVER BGM (Melancholic/Epic) ---
    overBass = [
        [36, 0, 0, 0, 36, 0, 0, 0, 36, 0, 0, 0, 36, 0, 0, 0], // Am
        [33, 0, 0, 0, 33, 0, 0, 0, 33, 0, 0, 0, 33, 0, 0, 0], // F
        [31, 0, 0, 0, 31, 0, 0, 0, 31, 0, 0, 0, 31, 0, 0, 0], // G
        [29, 0, 0, 0, 29, 0, 0, 0, 28, 0, 0, 0, 28, 0, 0, 0]  // F -> E
    ];
    overMelody = [
        [60, 62, 64, 69, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [57, 59, 60, 64, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [55, 57, 59, 62, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [53, 55, 57, 60, 57, 0, 56, 0, 56, 0, 0, 0, 0, 0, 0, 0]
    ];

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.15;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => console.log("Audio resume waiting for gesture"));
        }
    }

    playTone(freq: number, type: OscillatorType, duration: number, vol = 1, slideTo: number | null = null) {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
        }
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration: number, vol = 1, highPass = false) {
        if (!this.ctx || !this.masterGain) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = highPass ? 'highpass' : 'lowpass';
        filter.frequency.value = highPass ? 5000 : 800;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }

    playJump() { this.playTone(150, 'square', 0.1, 0.2, 600); }
    playDoubleJump() { this.playTone(250, 'square', 0.1, 0.2, 800); this.playNoise(0.1, 0.1, true); }
    playShoot() { this.playTone(800, 'sawtooth', 0.1, 0.15, 200); }
    playDodge() { this.playNoise(0.15, 0.3, true); this.playTone(400, 'triangle', 0.1, 0.2, 100); }
    playSpring() { this.playTone(200, 'sine', 0.3, 0.3, 800); } // Spring Sound
    playShieldUp() { this.playTone(300, 'sine', 0.5, 0.3, 600); }
    playShieldBreak() { this.playNoise(0.3, 0.5, true); this.playTone(800, 'sawtooth', 0.2, 0.3, 100); }
    playNoStamina() { this.playTone(150, 'sawtooth', 0.1, 0.3, 100); }

    playSlash() {
        this.playNoise(0.1, 0.2, true);
        this.playTone(100, 'triangle', 0.1, 0.5, 50);
    }

    playExplosion() {
        this.playNoise(0.5, 0.6);
        this.playTone(50, 'sawtooth', 0.5, 0.6, 10);
    }

    playBossDeath() {
        this.playNoise(2.0, 0.8);
        this.playTone(100, 'sawtooth', 1.5, 0.8, 10);
        setTimeout(() => this.playExplosion(), 200);
        setTimeout(() => this.playExplosion(), 500);
        setTimeout(() => this.playExplosion(), 900);
        setTimeout(() => this.playTone(5000, 'square', 0.5, 0.5, 100), 1200);
    }

    playHit() { this.playTone(200, 'sawtooth', 0.1, 0.3, 50); }
    playCollect() { this.playTone(1200, 'sine', 0.1, 0.3, 1800); }
    playPowerUp() {
        this.playTone(400, 'square', 0.1, 0.3, 600);
        setTimeout(() => this.playTone(600, 'square', 0.1, 0.3, 900), 100);
        setTimeout(() => this.playTone(900, 'square', 0.3, 0.3, 1500), 200);
    }

    playUltimateShoot() {
        this.playTone(200, 'square', 0.5, 0.4, 2000);
        setTimeout(() => this.playExplosion(), 100);
    }

    playStartGame() {
        this.playTone(440, 'square', 0.1, 0.5, 880);
        setTimeout(() => this.playTone(880, 'square', 0.4, 0.5, 1760), 100);
    }

    playGameOverSFX() {
        this.playTone(400, 'sawtooth', 0.5, 0.5, 100);
        setTimeout(() => this.playTone(300, 'sawtooth', 0.5, 0.5, 50), 400);
        setTimeout(() => this.playTone(200, 'sawtooth', 1.0, 0.5, 20), 800);
    }

    playWarning() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.value = 0.3;
        gain.gain.linearRampToValueAtTime(0, now + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(now + 0.3);
    }

    scheduler() {
        if (!this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.current16thNote, this.nextNoteTime);
            this.nextNote();
        }
        this.timerID = window.setTimeout(this.scheduler.bind(this), this.lookahead);
    }

    nextNote() {
        const bpm = this.bgmMode === 'COMBAT' ? 150 : (this.bgmMode === 'MENU' ? 110 : 90);
        const secondsPerBeat = 60.0 / bpm;
        this.nextNoteTime += 0.25 * secondsPerBeat;
        this.current16thNote++;
        if (this.current16thNote === 16) {
            this.current16thNote = 0;

            if (this.bgmMode === 'COMBAT') {
                this.patternIndex++;
                if (this.patternIndex >= 8) { // 8 patterns (AABBCCDD)
                    this.patternIndex = 0;
                    this.trackLoopCounter++;
                    this.currentCombatLoopCount++;

                    if (this.trackLoopCounter >= 3) { // Switch song after 3 loops
                        this.trackLoopCounter = 0;
                        // Pick a different random track
                        let nextTrack = Math.floor(Math.random() * this.combatTracks.length);
                        while (nextTrack === this.currentTrackIndex && this.combatTracks.length > 1) {
                            nextTrack = Math.floor(Math.random() * this.combatTracks.length);
                        }
                        this.currentTrackIndex = nextTrack;
                        this.currentCombatIndex = nextTrack;
                        this.currentCombatLoopCount = 0;
                    }
                }
            } else {
                this.patternIndex = (this.patternIndex + 1) % 4;
            }
        }
    }

    scheduleNote(beatNumber: number, time: number) {
        if (!this.ctx || !this.masterGain) return;

        if (this.bgmMode === 'COMBAT') {
            const track = this.combatTracks[this.currentTrackIndex];
            const drum = track.perc[this.patternIndex][beatNumber];
            if (drum === 1) this.playToneAtTime(100, 'square', 0.05, 0.6, 50, time);
            if (drum === 2) this.playNoiseAtTime(0.05, 0.4, time);
            const bassNote = track.bass[this.patternIndex][beatNumber];
            if (bassNote > 0) this.playToneAtTime(midiToFreq(bassNote), 'triangle', 0.1, 0.5, null, time);
            const note = track.melody[this.patternIndex][beatNumber];
            if (note > 0) this.playToneAtTime(midiToFreq(note), 'square', 0.1, 0.3, null, time);

        } else if (this.bgmMode === 'MENU') {
            const bassNote = this.menuBass[this.patternIndex % 4][beatNumber];
            if (bassNote > 0) this.playToneAtTime(midiToFreq(bassNote), 'sine', 0.4, 0.3, null, time);
            const note = this.menuMelody[this.patternIndex % 4][beatNumber];
            if (note > 0) this.playToneAtTime(midiToFreq(note), 'triangle', 0.2, 0.1, null, time);

        } else if (this.bgmMode === 'GAMEOVER') {
            const bassNote = this.overBass[this.patternIndex % 4][beatNumber];
            if (bassNote > 0) this.playToneAtTime(midiToFreq(bassNote), 'sawtooth', 0.3, 0.2, null, time);
            const note = this.overMelody[this.patternIndex % 4][beatNumber];
            if (note > 0) this.playToneAtTime(midiToFreq(note), 'square', 0.4, 0.2, null, time);
        }
    }

    playToneAtTime(freq: number, type: OscillatorType, duration: number, vol: number, slideTo: number | null, time: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, time + duration);

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + duration);
    }

    playNoiseAtTime(duration: number, vol: number, time: number) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3000;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        noise.start(time);
    }

    startBGM(mode: 'MENU' | 'COMBAT' | 'GAMEOVER') {
        // Auto-attempt to play menu BGM if hasn't started yet
        if (mode === 'MENU' && !this.hasStartedAnyBGM) {
            this.init(); // Initialize audio on menu load
            if (this.ctx && this.ctx.state === 'suspended') {
                // Will auto-resume on first user interaction
                document.addEventListener('click', () => {
                    if (this.ctx && this.ctx.state === 'suspended') {
                        this.ctx.resume();
                    }
                }, { once: true });
            }
            this.hasStartedAnyBGM = true;
        }

        if (mode === 'COMBAT') {
            // Random select combat track if starting fresh or switching
            if (this.currentCombatIndex === -1) {
                this.currentCombatIndex = Math.floor(Math.random() * this.combatTracks.length);
                this.currentCombatLoopCount = 0;
            }
        }

        if (this.isPlayingBgm && this.bgmMode === mode) return;
        this.stopBGM();
        if (!this.ctx) this.init();

        this.bgmMode = mode;
        this.isPlayingBgm = true;
        this.current16thNote = 0;
        this.patternIndex = 0;

        if (mode === 'COMBAT') {
            this.currentTrackIndex = this.currentCombatIndex;
        } else {
            this.currentTrackIndex = 0;
        }
        this.trackLoopCounter = 0;

        if (this.ctx) {
            this.nextNoteTime = this.ctx.currentTime + 0.1;
            this.scheduler();
        }
    }

    stopBGM() {
        this.isPlayingBgm = false;
        if (this.timerID) clearTimeout(this.timerID);
    }
}

function midiToFreq(note: number) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

const soundEngine = new SoundSynthesizer();

// --- Classes ---

class FloatingText {
    x: number;
    y: number;
    text: string;
    color: string;
    life: number = 1.5;
    vy: number = -0.5;
    size: number = 20;
    isBanter: boolean = false;
    target: Player | Enemy | null = null;

    constructor(x: number, y: number, text: string, color: string, size: number = 20, isBanter: boolean = false, target: Player | Enemy | null = null, lifeDuration: number = 1.5) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.isBanter = isBanter;
        this.target = target;
        this.life = lifeDuration;
        if (isBanter) {
            this.vy = 0;
        }
    }

    update() {
        if (!this.isBanter || !this.target) {
            this.y += this.vy;
        }
        this.life -= 0.005; // Halved from 0.01 to double display duration
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        let drawX = this.x;
        let drawY = this.y;

        if (this.target) {
            drawX = this.target.x + this.target.width / 2;
            drawY = this.target.y - 40;
        }

        const screenX = drawX - cameraX;
        ctx.globalAlpha = Math.max(0, Math.min(1, this.life));

        if (this.isBanter) {
            ctx.font = `bold ${this.size}px 'Noto Sans TC'`;
            const textMetrics = ctx.measureText(this.text);
            const padding = 10;
            const w = textMetrics.width + padding * 2;
            const h = this.size + padding * 2;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.roundRect(screenX - w / 2, drawY - h, w, h, 10);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(this.text, screenX, drawY - padding - 5);
            ctx.textAlign = 'start';

            ctx.beginPath();
            ctx.moveTo(screenX, drawY);
            ctx.lineTo(screenX - 5, drawY - 10);
            ctx.lineTo(screenX + 5, drawY - 10);
            ctx.fillStyle = this.color;
            ctx.fill();

        } else {
            ctx.fillStyle = this.color;
            ctx.font = `bold ${this.size}px 'Noto Sans TC'`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'black';
            ctx.fillText(this.text, screenX, drawY);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}

class Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    color = COLORS.platform;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - cameraX;
        if (drawX + this.width < -100 || drawX > CANVAS_WIDTH + 100) return;

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = '#1a0b2e';
        ctx.fillRect(drawX, this.y, this.width, this.height);

        ctx.strokeStyle = COLORS.platformBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, this.y, this.width, this.height);

        ctx.fillStyle = this.color + '44';
        ctx.fillRect(drawX, this.y, this.width, 5);

        ctx.shadowBlur = 0;
    }
}

class InteractiveObject {
    x: number;
    y: number;
    width = 40;
    height = 15;
    type: 'SPRING' | 'SPIKE';

    constructor(x: number, y: number, type: 'SPRING' | 'SPIKE') {
        this.x = x;
        this.y = y;
        this.type = type;
        if (type === 'SPIKE') {
            this.height = 25;
        }
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - cameraX;
        if (drawX < -50 || drawX > CANVAS_WIDTH + 50) return;

        if (this.type === 'SPRING') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLORS.spring;
            ctx.fillStyle = COLORS.spring;
            ctx.fillRect(drawX, this.y, this.width, this.height);
            // Detail
            ctx.fillStyle = '#ccffcc';
            ctx.fillRect(drawX + 5, this.y + 2, this.width - 10, 3);
        } else if (this.type === 'SPIKE') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = COLORS.spike;
            ctx.fillStyle = COLORS.spike;
            ctx.beginPath();
            // Three spikes
            ctx.moveTo(drawX, this.y + this.height);
            ctx.lineTo(drawX + this.width / 6, this.y);
            ctx.lineTo(drawX + this.width / 3, this.y + this.height);

            ctx.lineTo(drawX + this.width / 2, this.y);
            ctx.lineTo(drawX + (this.width * 2 / 3), this.y + this.height);

            ctx.lineTo(drawX + (this.width * 5 / 6), this.y);
            ctx.lineTo(drawX + this.width, this.y + this.height);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}

class Item {
    x: number;
    y: number;
    type: 'HEALTH' | 'ENERGY' | 'BOOST' | 'SHIELD';
    width = 24;
    height = 24;
    vy = -8;
    groundY = 0;

    constructor(x: number, y: number, type: 'HEALTH' | 'ENERGY' | 'BOOST' | 'SHIELD') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.groundY = y + 100;
    }

    update(platforms: Platform[]) {
        this.vy += 0.5; // gravity
        this.y += this.vy;

        for (const plat of platforms) {
            if (
                this.x > plat.x && this.x < plat.x + plat.width &&
                this.y + this.height >= plat.y &&
                this.y + this.height <= plat.y + plat.height + 20 &&
                this.vy > 0
            ) {
                this.y = plat.y - this.height;
                this.vy = 0;
            }
        }
        if (this.y + this.height > CANVAS_HEIGHT - 40) {
            this.y = CANVAS_HEIGHT - 40 - this.height;
            this.vy = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - cameraX;
        if (drawX < -50 || drawX > CANVAS_WIDTH + 50) return;

        const bobOffset = Math.sin(Date.now() / 200) * 5;

        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        if (this.type === 'HEALTH') {
            ctx.shadowColor = COLORS.itemHealth;
            ctx.fillStyle = COLORS.itemHealth;
            const cx = drawX + this.width / 2;
            const cy = this.y + this.height / 2 + bobOffset;
            ctx.fillRect(cx - 10, cy - 4, 20, 8);
            ctx.fillRect(cx - 4, cy - 10, 8, 20);
            ctx.strokeRect(cx - 10, cy - 4, 20, 8);
            ctx.strokeRect(cx - 4, cy - 10, 8, 20);
        } else if (this.type === 'ENERGY') {
            ctx.shadowColor = COLORS.itemEnergy;
            ctx.fillStyle = COLORS.itemEnergy;
            const cx = drawX + this.width / 2;
            const cy = this.y + this.height / 2 + bobOffset;
            ctx.beginPath();
            ctx.moveTo(cx + 5, cy - 12);
            ctx.lineTo(cx - 5, cy);
            ctx.lineTo(cx + 2, cy);
            ctx.lineTo(cx - 6, cy + 12);
            ctx.lineTo(cx + 4, cy);
            ctx.lineTo(cx - 2, cy);
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'BOOST') {
            ctx.shadowColor = COLORS.itemBoost;
            ctx.fillStyle = COLORS.itemBoost;
            const cx = drawX + this.width / 2;
            const cy = this.y + this.height / 2 + bobOffset;
            ctx.beginPath();
            ctx.roundRect(cx - 8, cy - 12, 16, 24, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(cx - 8, cy - 2, 16, 4);
        } else if (this.type === 'SHIELD') {
            ctx.shadowColor = COLORS.itemShield;
            ctx.strokeStyle = COLORS.itemShield;
            const cx = drawX + this.width / 2;
            const cy = this.y + this.height / 2 + bobOffset;
            ctx.beginPath();
            // Hexagon
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60 * Math.PI) / 180;
                const r = 14;
                const px = cx + r * Math.cos(angle);
                const py = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('S', cx, cy + 4);
        }
        ctx.shadowBlur = 0;
    }
}

class VisualEffect {
    x: number;
    y: number;
    life = 1.0;
    type: 'SLASH' | 'IMPACT';
    facingRight: boolean;

    constructor(x: number, y: number, type: 'SLASH' | 'IMPACT', facingRight: boolean = true) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.facingRight = facingRight;
        this.life = type === 'SLASH' ? 0.375 : 0.8; // Increased SLASH from 0.25 to 0.375 (1.5x)
    }

    update() {
        this.life -= this.type === 'SLASH' ? 0.133 : 0.05; // Adjusted SLASH decay for 1.5x duration
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - cameraX;
        const alpha = this.life > 0.05 ? 1.0 : this.life * 20;
        ctx.globalAlpha = alpha;

        if (this.type === 'SLASH') {
            ctx.shadowBlur = 0;
            ctx.lineCap = 'round';

            const size = 65;
            const dir = this.facingRight ? 1 : -1;
            const startX = drawX;

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(startX, this.y, 8, 0, Math.PI * 2);
            ctx.fill();

            const offsets = [-1.5, -0.5, 0.5, 1.5]; // 4 lines
            for (const i of offsets) {
                const yOff = i * 15;
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#00ffff';
                ctx.beginPath();
                ctx.moveTo(startX, this.y + yOff * 0.5);

                const cp1x = startX + (dir * size * 0.5);
                const cp1y = this.y + yOff * 0.8 - 5;
                const endX = startX + (dir * size);
                const endY = this.y + yOff + 5;

                ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
                ctx.stroke();

                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}

class Projectile {
    x: number;
    y: number;
    width = 10;
    height = 10;
    vx: number;
    vy: number;
    color = COLORS.projectile;
    life = 120;
    isPlayer = false;
    isUltimate = false;
    hasExploded = false;

    constructor(x: number, y: number, vx: number, vy: number, isPlayer = false, isUltimate = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.isPlayer = isPlayer;
        this.isUltimate = isUltimate;
        this.color = isUltimate ? '#ffcc00' : (isPlayer ? COLORS.playerProjectile : COLORS.projectile);
        this.width = isUltimate ? 50 : 12;
        this.height = isUltimate ? 50 : 12;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - cameraX;
        if (drawX < -50 || drawX > CANVAS_WIDTH + 50) return;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.isUltimate ? 50 : 15;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(drawX, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        if (this.isUltimate) {
            ctx.strokeStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(drawX, this.y);
            ctx.lineTo(drawX - (this.vx * 3), this.y - (this.vy * 3));
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
}

class Explosion {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    life = 20;
    color = '#ffcc00';

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.maxRadius = 250;
    }

    update() {
        this.radius += (this.maxRadius - this.radius) * 0.25;
        this.life--;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - cameraX;
        ctx.globalAlpha = this.life / 20;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(drawX, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(drawX, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class Player {
    x = 100;
    y = 300;
    width = 32;
    height = 32;
    vx = 0;
    vy = 0;
    color = COLORS.player;
    isGrounded = false;
    facingRight = true;

    isAttacking = false;
    attackActiveFrame = 0;
    attackCooldown = 0;
    currentAttackHitSet = new Set<number>();

    hp = 80;
    maxHp = 80;
    energy = 0;
    stamina = 100;
    maxStamina = 100;
    jumpCount = 0; // 0 = grounded, 1 = first jump used, 2 = double jump used

    invincibleTimer = 0;
    dodgeCooldown = 0;
    dodgeSpeedTimer = 0; // New: tracks dodge speed buff duration
    buffTimer = 0;
    hasShield = false;

    update(gravity: number, platforms: Platform[], interactiveObjects: InteractiveObject[]) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += gravity;

        // Stamina Regen
        if (this.buffTimer > 0) {
            this.stamina = this.maxStamina; // Infinite stamina while boosted
        } else {
            if (this.stamina < this.maxStamina) {
                this.stamina = Math.min(this.maxStamina, this.stamina + STAMINA_REGEN);
            }
        }

        if (this.buffTimer > 0) this.buffTimer--;
        if (this.dodgeCooldown > 0) this.dodgeCooldown--;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > WORLD_WIDTH) this.x = WORLD_WIDTH - this.width;

        this.isGrounded = false;

        if (this.y + this.height > CANVAS_HEIGHT + 100) {
            this.y = 0;
            if (!this.hasShield) {
                this.hp -= 10;
            } else {
                this.hasShield = false;
                soundEngine.playShieldBreak();
            }
        }

        if (this.vy >= 0) {
            for (const plat of platforms) {
                if (
                    this.x + this.width > plat.x + 5 &&
                    this.x < plat.x + plat.width - 5 &&
                    this.y + this.height >= plat.y &&
                    this.y + this.height <= plat.y + plat.height + 30 &&
                    this.y + this.height - this.vy <= plat.y + 20
                ) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                    this.jumpCount = 0;
                }
            }
        }

        // Interactables
        for (const obj of interactiveObjects) {
            if (
                this.x < obj.x + obj.width &&
                this.x + this.width > obj.x &&
                this.y < obj.y + obj.height &&
                this.y + this.height > obj.y
            ) {
                if (obj.type === 'SPRING') {
                    this.vy = -22.5; // Reduced to 50% (was -45)
                    this.stamina = Math.min(this.maxStamina, this.stamina + 15);
                    soundEngine.playSpring();
                    this.isGrounded = false;
                    this.jumpCount = 1; // Treat as mid-air
                } else if (obj.type === 'SPIKE') {
                    if (this.invincibleTimer <= 0) {
                        if (this.hasShield) {
                            this.hasShield = false;
                            this.invincibleTimer = 30;
                            soundEngine.playShieldBreak();
                        } else {
                            this.hp -= 10;
                            this.invincibleTimer = 30;
                            soundEngine.playHit();
                        }
                        this.vy = -10;
                    }
                }
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.attackActiveFrame > 0) {
            this.attackActiveFrame--;
            if (this.attackActiveFrame <= 0) {
                this.isAttacking = false;
                this.currentAttackHitSet.clear();
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        if (this.invincibleTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) return;
        const drawX = this.x - cameraX;

        // Buff Effect
        if (this.buffTimer > 0 || (this.invincibleTimer > 0 && this.dodgeCooldown > 0)) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = (this.dodgeCooldown > 30) ? '#0088ff' : (Math.random() > 0.5 ? '#ff00ff' : '#00ffff');
            ctx.fillRect(drawX - (this.vx * 2), this.y, this.width, this.height);
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = '#fff';
            for (let i = 0; i < 2; i++) {
                ctx.fillRect(drawX + Math.random() * 30, this.y + Math.random() * 30, 3, 3);
            }
        }

        if (this.hasShield) {
            ctx.strokeStyle = COLORS.itemShield;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = COLORS.itemShield;
            const spin = Date.now() / 200;
            const r = this.width * 1.2;
            const cx = drawX + this.width / 2;
            const cy = this.y + this.height / 2;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = spin + (i * 60 * Math.PI) / 180;
                const px = cx + r * Math.cos(angle);
                const py = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        if (this.energy >= 99) {
            ctx.shadowBlur = 20 + Math.sin(Date.now() / 100) * 10;
            ctx.shadowColor = '#ffcc00';
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }

        // Body 
        ctx.fillStyle = this.invincibleTimer > 0 ? '#ff0000' : this.color;
        ctx.fillRect(drawX, this.y + 5, this.width, this.height - 5);

        // Head 
        ctx.fillRect(drawX - 2, this.y - 2, this.width + 4, 15);

        // Dynamic Tail
        const tailOsc = Math.sin(Date.now() / 150) * 10;
        const tailBaseX = this.facingRight ? drawX : drawX + this.width;
        const tailTipX = this.facingRight ? tailBaseX - 15 : tailBaseX + 15;

        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.moveTo(tailBaseX, this.y + 20);
        ctx.quadraticCurveTo(tailBaseX, this.y + 10, tailTipX + (this.vx * 0.5), this.y + 10 + tailOsc);
        ctx.stroke();

        // Face - CUTER VERSION
        const faceCenterX = this.facingRight ? drawX + 22 : drawX + 10;
        const faceCenterY = this.y + 6;

        // Big Oval Eyes
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        // Left Eye
        ctx.beginPath();
        ctx.ellipse(faceCenterX - 6, faceCenterY, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right Eye
        ctx.beginPath();
        ctx.ellipse(faceCenterX + 6, faceCenterY, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cat Mouth (ω)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(faceCenterX - 2, faceCenterY + 6, 2, 0, Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(faceCenterX + 2, faceCenterY + 6, 2, 0, Math.PI, false);
        ctx.stroke();

        // Pink Nose
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.arc(faceCenterX, faceCenterY + 4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers (Glowing)
        ctx.fillStyle = '#ffffff';
        const whiskerX = this.facingRight ? drawX + 30 : drawX - 4;
        ctx.fillRect(whiskerX, this.y + 16, 6, 1);
        ctx.fillRect(whiskerX, this.y + 19, 6, 1);

        // Ears 
        ctx.fillStyle = this.invincibleTimer > 0 ? '#ff0000' : this.color;
        // Left Ear
        ctx.beginPath();
        ctx.moveTo(drawX, this.y);
        ctx.lineTo(drawX + 4, this.y - 12);
        ctx.lineTo(drawX + 12, this.y);
        ctx.fill();
        // Inner Left Ear (Darker)
        ctx.fillStyle = '#00aaaa';
        ctx.beginPath();
        ctx.moveTo(drawX + 3, this.y);
        ctx.lineTo(drawX + 5, this.y - 7);
        ctx.lineTo(drawX + 9, this.y);
        ctx.fill();

        ctx.fillStyle = this.invincibleTimer > 0 ? '#ff0000' : this.color;
        // Right Ear
        ctx.beginPath();
        ctx.moveTo(drawX + this.width, this.y);
        ctx.lineTo(drawX + this.width - 4, this.y - 12);
        ctx.lineTo(drawX + this.width - 12, this.y);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

type BossType = 'ASSAULT' | 'BOMBER' | 'TANK' | 'SPEED';

class Enemy {
    id: number;
    x: number;
    y: number;
    width = 35;
    height = 30;
    vx = 0;
    vy = 0;
    color = COLORS.enemyWalker;
    speed = 2;
    hp = 1;
    maxHp = 1;
    type: 'WALKER' | 'FLYER' | 'TURRET' | 'DASHER' | 'ELITE' | 'HEAVY' | 'BOSS' = 'WALKER';
    bossType?: BossType;
    attackTimer = 0;
    name: string = '';
    knockbackResist = 0;

    constructor(id: number, x: number, y: number, speedMod: number, difficultyMult: number = 1.0, typeOverride?: string) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = (Math.random() * 0.375 + 0.375) * speedMod; // Further halved to 50%

        if (typeOverride) {
            this.type = typeOverride as any;
        } else {
            const r = Math.random();
            if (r < 0.3) this.type = 'WALKER';
            else if (r < 0.5) this.type = 'FLYER';
            else if (r < 0.65) this.type = 'TURRET';
            else if (r < 0.8) this.type = 'DASHER';
            else if (r < 0.9) this.type = 'ELITE';
            else this.type = 'HEAVY';
        }

        const hpScale = difficultyMult;

        if (this.type === 'WALKER') {
            this.color = COLORS.enemyWalker;
            this.hp = 20 * hpScale;
        } else if (this.type === 'FLYER') {
            this.color = COLORS.enemyFlyer;
            this.width = 25; this.height = 25;
            this.hp = 20 * hpScale;
        } else if (this.type === 'TURRET') {
            this.color = COLORS.enemyTurret;
            this.width = 40; this.height = 40;
            this.speed = 0;
            this.hp = 40 * hpScale;
        } else if (this.type === 'DASHER') {
            this.color = '#ffffff';
            this.speed *= 1.8;
            this.hp = 30 * hpScale;
        } else if (this.type === 'ELITE') {
            this.color = COLORS.enemyElite;
            this.width = 40; this.height = 45;
            this.speed *= 1.2;
            this.hp = 60 * hpScale;
        } else if (this.type === 'HEAVY') {
            this.color = COLORS.enemyHeavy;
            this.width = 50; this.height = 50;
            this.speed *= 0.6;
            this.hp = 100 * hpScale;
            this.knockbackResist = 0.8;
        } else if (this.type === 'BOSS') {
            this.width = 120;
            this.height = 140;
            this.hp = 1500 * hpScale;
            this.maxHp = 1500 * hpScale;
            this.knockbackResist = 1.0;
        }
        this.maxHp = this.hp;
    }

    update(target: Player, platforms: Platform[], projectiles: Projectile[], difficultyLevel: number = 0) {
        const dx = target.x - this.x;
        const dist = Math.sqrt(dx * dx + (target.y - this.y) * (target.y - this.y));

        if (this.type !== 'BOSS' && dist > 1200) return;

        if (this.type === 'BOSS') {
            this.updateBoss(target, projectiles, difficultyLevel);
            return;
        }

        // Standard Enemy Logic
        if (this.type === 'WALKER' || this.type === 'ELITE' || this.type === 'HEAVY') {
            if (Math.abs(this.vx) < 0.1) {
                if (this.x < target.x) this.vx = this.speed;
                else this.vx = -this.speed;
            } else {
                this.vx *= 0.95;
                if (Math.abs(this.vx) < this.speed) {
                    if (this.x < target.x) this.vx = this.speed;
                    else this.vx = -this.speed;
                }
            }

            this.x += this.vx;
            this.vy += GRAVITY_DEFAULT;
            this.y += this.vy;

            if (this.vy >= 0) {
                for (const plat of platforms) {
                    if (
                        this.x + this.width > plat.x &&
                        this.x < plat.x + plat.width &&
                        this.y + this.height >= plat.y &&
                        this.y + this.height <= plat.y + plat.height + 20 &&
                        this.y + this.height - this.vy <= plat.y + 20
                    ) {
                        this.y = plat.y - this.height;
                        this.vy = 0;
                    }
                }
            }
        } else if (this.type === 'FLYER') {
            const dy = (target.y - 50) - this.y;
            this.x += dx * 0.015 * this.speed;
            this.y += dy * 0.015 * this.speed;
        } else if (this.type === 'TURRET') {
            this.attackTimer++;
            if (this.attackTimer > 240) { // Doubled from 120
                const angle = Math.atan2(target.y - this.y, target.x - this.x);
                projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height / 2, Math.cos(angle) * 2.25, Math.sin(angle) * 2.25)); // Further reduced to 25%
                soundEngine.playShoot();
                this.attackTimer = 0;
            }
        } else if (this.type === 'DASHER') {
            this.attackTimer++;
            if (this.attackTimer < 60) {
                if (Math.abs(dx) > 200) this.x += (dx > 0 ? 2 : -2);
            } else if (this.attackTimer < 100) {
                if (this.x < target.x) this.x += this.speed * 1.25; // Reduced to 50%
                else this.x -= this.speed * 1.25;
            } else {
                this.attackTimer = 0;
            }
            this.vy += GRAVITY_DEFAULT;
            this.y += this.vy;

            if (this.vy >= 0) {
                for (const plat of platforms) {
                    if (
                        this.x + this.width > plat.x &&
                        this.x < plat.x + plat.width &&
                        this.y + this.height >= plat.y &&
                        this.y + this.height <= plat.y + plat.height + 20 &&
                        this.y + this.height - this.vy <= plat.y + 20
                    ) {
                        this.y = plat.y - this.height;
                        this.vy = 0;
                    }
                }
            }
        }
    }

    updateBoss(target: Player, projectiles: Projectile[], difficultyLevel: number) {
        this.attackTimer++;

        const cdr = Math.min(30, difficultyLevel * 2);

        // --- BOSS AI ---
        if (this.bossType === 'ASSAULT') {
            const targetY = CANVAS_HEIGHT - 200;
            this.y += (targetY - this.y) * 0.05;
            const idealX = target.x + (target.x > this.x ? -300 : 300);
            this.x += (idealX - this.x) * 0.02; // Reduced from 0.03

            if (this.attackTimer % (80 - cdr) === 0) {
                soundEngine.playShoot();
                for (let i = -3; i <= 3; i++) {
                    const angle = Math.atan2(target.y - this.y, target.x - this.x) + (i * 0.15);
                    projectiles.push(new Projectile(this.x + this.width / 2, this.y + this.height / 2, Math.cos(angle) * 2.1, Math.sin(angle) * 2.1)); // Further halved to 50%
                }
            }
        }
        else if (this.bossType === 'BOMBER') {
            const targetY = CANVAS_HEIGHT - 400;
            this.y += (targetY - this.y) * 0.05;
            this.x += (target.x - this.x) * 0.03; // Reduced from 0.04

            if (this.attackTimer % (60 - cdr) === 0) {
                soundEngine.playShoot();
                const p = new Projectile(this.x + this.width / 2, this.y + this.height, (Math.random() - 0.5) * 0.875, 2.1); // Further halved
                p.width = 25; p.height = 25;
                projectiles.push(p);
            }
        }
        else if (this.bossType === 'TANK') {
            this.y += GRAVITY_DEFAULT;
            if (this.y + this.height > CANVAS_HEIGHT - 40) this.y = CANVAS_HEIGHT - 40 - this.height;

            if (this.x < target.x - 400) this.x += 1.0; // Reduced from 1.5
            else if (this.x > target.x + 400) this.x -= 1.0;

            if (this.attackTimer % (140 - cdr * 2) === 0) {
                soundEngine.playShoot();
                const angle = Math.atan2(target.y - this.y, target.x - this.x);
                const speed = 1.4 + (difficultyLevel * 0.0875); // Further halved
                const p = new Projectile(this.x + this.width / 2, this.y + this.height / 2, Math.cos(angle) * speed, Math.sin(angle) * speed);
                p.width = 70; p.height = 70;
                projectiles.push(p);
            }
        }
        else if (this.bossType === 'SPEED') {
            const groundY = CANVAS_HEIGHT - 40 - this.height;
            this.y = groundY;

            const cycle = 110 - cdr * 2;

            if (this.attackTimer % cycle < 30) {
                // Prepare
            } else if (this.attackTimer % cycle < 50) {
                // Dash
                this.x += (target.x > this.x ? 8 : -8); // Much reduced from 20
            } else {
                // Idle move
                this.x += (target.x - this.x) * 0.02; // Reduced from 0.03
            }
        }

        if (this.x < 0) this.x = 0;
        if (this.x > WORLD_WIDTH - this.width) this.x = WORLD_WIDTH - this.width;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - cameraX;
        if (drawX + this.width < -100 || drawX > CANVAS_WIDTH + 100) return;

        ctx.shadowBlur = this.type === 'BOSS' ? 25 : 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        if (this.type === 'BOSS') {
            if (this.bossType === 'ASSAULT') {
                ctx.fillRect(drawX, this.y, this.width, this.height);
                ctx.fillStyle = '#222';
                ctx.fillRect(drawX - 10, this.y + 20, 20, 100);
                ctx.fillRect(drawX + this.width - 10, this.y + 20, 20, 100);
            } else if (this.bossType === 'BOMBER') {
                ctx.beginPath();
                ctx.moveTo(drawX + this.width / 2, this.y);
                ctx.lineTo(drawX + this.width, this.y + this.height);
                ctx.lineTo(drawX, this.y + this.height);
                ctx.fill();
            } else if (this.bossType === 'TANK') {
                ctx.fillRect(drawX, this.y, this.width, this.height);
                ctx.fillStyle = '#000';
                ctx.fillRect(drawX, this.y + this.height - 20, this.width, 20);
            } else if (this.bossType === 'SPEED') {
                ctx.beginPath();
                ctx.moveTo(drawX + 20, this.y);
                ctx.lineTo(drawX + this.width, this.y + 20);
                ctx.lineTo(drawX + this.width - 20, this.y + this.height);
                ctx.lineTo(drawX, this.y + this.height - 20);
                ctx.fill();
            } else {
                ctx.fillRect(drawX, this.y, this.width, this.height);
            }
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 40;
            ctx.beginPath();
            const eyeOffset = Math.sin(Date.now() / 200) * 10;
            ctx.arc(drawX + this.width / 2, this.y + 40 + eyeOffset, 15, 0, Math.PI * 2);
            ctx.fill();

        } else {
            ctx.fillRect(drawX, this.y, this.width, this.height);

            if (this.type === 'ELITE') {
                ctx.beginPath();
                ctx.moveTo(drawX + 5, this.y);
                ctx.lineTo(drawX - 5, this.y - 15);
                ctx.lineTo(drawX + 15, this.y);
                ctx.moveTo(drawX + this.width - 5, this.y);
                ctx.lineTo(drawX + this.width + 5, this.y - 15);
                ctx.lineTo(drawX + this.width - 15, this.y);
                ctx.fillStyle = this.color;
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.fillRect(drawX + 5, this.y + 10, 5, 25);
                ctx.fillRect(drawX + this.width - 10, this.y + 10, 5, 25);
            }
            else if (this.type === 'HEAVY') {
                ctx.fillStyle = '#d97706';
                ctx.fillRect(drawX - 5, this.y + 10, 10, this.height - 20);
                ctx.fillRect(drawX + this.width - 5, this.y + 10, 10, this.height - 20);
                ctx.fillRect(drawX + 10, this.y + 10, this.width - 20, this.height - 20);
            }
            else {
                ctx.fillStyle = '#000';
                ctx.fillRect(drawX + 5, this.y + 5, 10, 5);
            }

            if (this.type === 'ELITE' || this.type === 'HEAVY') {
                const barW = this.width + 10;
                const barX = drawX - 5;
                const barY = this.y - 15;
                ctx.fillStyle = '#333';
                ctx.fillRect(barX, barY, barW, 5);
                ctx.fillStyle = '#ef4444';
                const pct = Math.max(0, this.hp / this.maxHp);
                ctx.fillRect(barX, barY, barW * pct, 5);
            }
        }
        ctx.shadowBlur = 0;
    }
}

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life = 1.0;
    color: string;
    size: number;

    constructor(x: number, y: number, color: string, sizeMod = 1) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.size = (Math.random() * 4 + 3) * sizeMod;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.5;
        this.life -= 0.03;
        this.size *= 0.95;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - cameraX;
        if (drawX < -10 || drawX > CANVAS_WIDTH + 10) return;
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

class BackgroundBuilding {
    x: number;
    width: number;
    height: number;
    color: string;
    windows: { x: number, y: number }[] = [];
    parallaxFactor: number;

    constructor(x: number, factor: number) {
        this.x = x;
        this.parallaxFactor = factor;
        this.width = Math.random() * 80 + 60;
        this.height = Math.random() * 350 + 150;
        const shade = Math.floor(20 * factor);
        this.color = `rgba(${shade}, ${shade + 10}, ${shade + 35}, ${Math.random() * 0.6 + 0.4})`;
        for (let i = 0; i < 8; i++) {
            if (Math.random() > 0.4) {
                this.windows.push({
                    x: Math.random() * (this.width - 12),
                    y: Math.random() * (this.height - 20)
                });
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number) {
        const drawX = this.x - (cameraX * this.parallaxFactor);
        if (drawX + this.width < -1000 || drawX > CANVAS_WIDTH + 1000) return;
        ctx.fillStyle = this.color;
        const yPos = CANVAS_HEIGHT - this.height;
        ctx.fillRect(drawX, yPos, this.width, this.height);
        ctx.fillStyle = Math.random() > 0.95 ? '#ffffff' : 'rgba(0, 243, 255, 0.4)';
        this.windows.forEach(w => {
            ctx.fillRect(drawX + w.x, yPos + w.y, 5, 10);
        });
    }
}

const CAT_QUOTES = [
    "連一隻老鼠都抓不到... 該去睡午覺了喵。",
    "稍微熱身了一下，但還不夠優雅。",
    "這就是賽博貓咪的實力嗎？還不錯喵。",
    "太瘋狂了！這座城市已經沒有對手了！",
    "我是這座城市的傳說，無人能擋！喵哈哈哈！",
    "反應速度 0.05秒，這就是我的極限嗎？不！",
    "給我更多的能量電池！我還能再戰！",
    "愚蠢的機器人，根本抓不到我的尾巴。",
    "今晚的晚餐是... 螺絲釘佐機油？嘔...",
    "在霓虹燈下起舞，這就是我的生存之道。",
    "系統過載？不，這只是我剛開始認真而已。",
    "下一次，我會跳得更高，抓得更狠。",
    "看到那道青色的閃光了嗎？那就是我。",
    "這個維度的敵人太弱了，換下一個頻道吧。",
    "喵嗚... 有點累了，但傳說不能停下腳步。"
];

// --- Combat Banter Data ---
const PLAYER_BANTER = [
    "本喵的爪子可是不長眼的！",
    "想抓我？再去練個一百年吧喵！",
    "你的動作太慢了，本喵都要睡著了。",
    "看到我的尾巴了嗎？那是你永遠追不上的光。",
    "本喵今天心情好，讓你三招如何？",
    "這種程度的攻擊，連本喵的毛都碰不到。",
    "喵哈哈哈！你是來搞笑的嗎？",
    "本喵肚子餓了，速戰速決吧！",
    "你的程式碼裡是不是有 bug 啊喵？",
    "別擋路，本喵正在趕時間去統治世界！"
];

const BOSS_BANTER = [
    "有機體清除程序... 執行中。",
    "偵測到高能反應，啟動防禦矩陣。",
    "你的存在是邏輯錯誤。",
    "抵抗是無效的，乖乖變成數據吧。",
    "計算勝率... 99.9% 歸我。",
    "渺小的貓科動物，感受鋼鐵的憤怒吧。",
    "你的速度在我的處理器面前不值一提。",
    "終結指令已下達。",
    "這裡將是你的墳墓。",
    "無用的掙扎。"
];

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// --- Main Component ---
const CyberpunkGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hpBarRef = useRef<HTMLDivElement>(null);
    const energyBarRef = useRef<HTMLDivElement>(null);
    const energyTextRef = useRef<HTMLDivElement>(null);
    const staminaBarRef = useRef<HTMLDivElement>(null); // Ref for stamina

    const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAME_OVER' | 'INSTRUCTIONS'>('MENU');
    const [score, setScore] = useState(0);
    const [bossDefeatedCount, setBossDefeatedCount] = useState(0);
    const [bossTimer, setBossTimer] = useState(0);
    const [bossData, setBossData] = useState<{ name: string } | null>(null);
    const [bossHp, setBossHp] = useState({ current: 0, max: 100, name: "" });
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [survivalTime, setSurvivalTime] = useState(0);

    const entityIdCounter = useRef(0);
    const lastBossType = useRef<BossType | null>(null);

    const gameRef = useRef({
        player: new Player(),
        enemies: [] as Enemy[],
        items: [] as Item[],
        boss: null as Enemy | null,
        particles: [] as Particle[],
        buildings: [] as BackgroundBuilding[],
        platforms: [] as Platform[],
        interactiveObjects: [] as InteractiveObject[],
        projectiles: [] as Projectile[],
        explosions: [] as Explosion[],
        visualEffects: [] as VisualEffect[],
        floatingTexts: [] as FloatingText[],
        keys: {} as Record<string, boolean>,
        screenShake: 0,
        cameraX: 0,
        glitchIntensity: 0,
        isFetchingBoss: false,
        nextBossSpawnReady: false,
        combatBanterTimer: 0,
        startTime: 0,
        currentTime: 0,
        pauseStartTime: 0,
        isGameActive: false, // True if game session is live (even if paused)
        lastFrameTime: 0, // For deltaTime calculation
        deltaTime: 0, // Time between frames in seconds
        difficultyLevel: 0, // New difficulty system: 0-5
        lastDifficultyIncTime: 0 // Track when difficulty was last increased
    });

    useEffect(() => {
        const handleResize = () => {
            CANVAS_WIDTH = window.innerWidth;
            CANVAS_HEIGHT = window.innerHeight;
            if (canvasRef.current) {
                canvasRef.current.width = CANVAS_WIDTH;
                canvasRef.current.height = CANVAS_HEIGHT;
            }
            initLevel();
        };
        window.addEventListener('resize', handleResize);

        initLevel();

        if (gameState === 'MENU') {
            // Initialize audio and attempt to start BGM
            soundEngine.init();
            try {
                soundEngine.startBGM('MENU');
            } catch (e) {
                console.log('BGM will start after first user interaction');
            }
            // Ensure BGM starts on any first click
            const startBGMOnClick = () => {
                if (!soundEngine.isPlayingBgm) {
                    soundEngine.startBGM('MENU');
                }
                document.removeEventListener('click', startBGMOnClick);
            };
            document.addEventListener('click', startBGMOnClick, { once: true });
        }

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const initLevel = () => {
        const b: BackgroundBuilding[] = [];
        for (let i = 0; i < 40; i++) b.push(new BackgroundBuilding(i * 100 - 500, 0.2));
        for (let i = 0; i < 60; i++) b.push(new BackgroundBuilding(i * 80 - 500, 0.5));
        gameRef.current.buildings = b;

        const plats: Platform[] = [];
        const interactables: InteractiveObject[] = [];

        plats.push(new Platform(-500, CANVAS_HEIGHT - 40, WORLD_WIDTH + 1000, 100));

        let currentX = 600;
        while (currentX < WORLD_WIDTH) {
            let w = 150 + Math.random() * 200;
            let y = (CANVAS_HEIGHT - 150) - (Math.random() * 200);
            plats.push(new Platform(currentX, y, w, 20));

            // Platform traps/springs (reduced to 1/3)
            if (Math.random() < 0.1) { // Reduced from 0.3
                const type = Math.random() > 0.5 ? 'SPRING' : 'SPIKE';
                interactables.push(new InteractiveObject(currentX + Math.random() * (w - 40), y - (type === 'SPIKE' ? 25 : 15), type));
            }

            if (Math.random() > 0.6) {
                plats.push(new Platform(currentX + w + 50, y - 60, 80, 20));
                plats.push(new Platform(currentX + w + 150, y - 120, 80, 20));
                currentX += w + 250;
            } else {
                currentX += w + 100;
            }
        }

        // Ground floor interactive objects (reduced to 1/3)
        for (let i = 0; i < 7; i++) { // Reduced from 20
            const x = Math.random() * (WORLD_WIDTH - 1000) + 500;
            const type = Math.random() > 0.6 ? 'SPRING' : 'SPIKE';
            interactables.push(new InteractiveObject(x, CANVAS_HEIGHT - 40 - (type === 'SPIKE' ? 25 : 15), type));
        }

        gameRef.current.platforms = plats;
        gameRef.current.interactiveObjects = interactables;
    }

    useEffect(() => {
        if (gameState === 'GAME_OVER') {
            const interval = setInterval(() => {
                setCurrentQuoteIndex(prev => (prev + 1) % CAT_QUOTES.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [gameState]);

    const startGame = () => {
        soundEngine.init();
        soundEngine.playStartGame();
        setTimeout(() => soundEngine.startBGM('COMBAT'), 500);

        setGameState('PLAYING');
        setScore(0);
        setBossDefeatedCount(0);
        setSurvivalTime(0);

        const g = gameRef.current;
        g.player = new Player();
        g.enemies = [];
        g.items = [];
        g.projectiles = [];
        g.explosions = [];
        g.visualEffects = [];
        g.floatingTexts = [];
        g.boss = null;
        g.nextBossSpawnReady = false;
        g.combatBanterTimer = 100;
        g.startTime = Date.now();
        g.currentTime = Date.now();
        g.isGameActive = true;
        g.difficultyLevel = 0; // Reset difficulty
        g.lastDifficultyIncTime = 0;
        lastBossType.current = null;

        // Reset BGM track index to force random selection
        soundEngine.currentCombatIndex = -1;

        startBossTimer(15);
    };

    const pauseGame = () => {
        gameRef.current.pauseStartTime = Date.now();
        setGameState('INSTRUCTIONS');
    };

    const resumeGame = () => {
        const now = Date.now();
        const pausedDuration = now - gameRef.current.pauseStartTime;
        gameRef.current.startTime += pausedDuration;
        setGameState('PLAYING');
    };

    const returnToMenu = () => {
        gameRef.current.isGameActive = false;
        setGameState('MENU');
        soundEngine.startBGM('MENU');
    };

    const endGame = () => {
        setGameState('GAME_OVER');
        gameRef.current.isGameActive = false;
        soundEngine.playGameOverSFX();
        setTimeout(() => soundEngine.startBGM('GAMEOVER'), 1000);

        let initialIdx = 0;
        if (bossDefeatedCount > 8) initialIdx = 4;
        else if (bossDefeatedCount > 3) initialIdx = 2;
        setCurrentQuoteIndex(initialIdx);
    }

    const startBossTimer = (seconds: number) => {
        setBossTimer(seconds);
        fetchNextBossData();
    };

    useEffect(() => {
        if (gameState === 'PLAYING' && bossTimer > 0) {
            const interval = setInterval(() => {
                setBossTimer(prev => {
                    if (prev <= 1) {
                        gameRef.current.nextBossSpawnReady = true;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState, bossTimer]);

    const fetchNextBossData = async () => {
        if (gameRef.current.isFetchingBoss) return;
        gameRef.current.isFetchingBoss = true;
        try {
            const prompt = `Generate a creative Cyberpunk Boss name in Traditional Chinese (e.g., 虛空行者, 鋼鐵巨獸). JSON format: { "name": "String" }`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            const text = response.text ? response.text.replace(/```json/g, '').replace(/```/g, '').trim() : null;
            if (text) setBossData(JSON.parse(text));
        } catch (e) {
            console.log("Using fallback boss");
        } finally {
            gameRef.current.isFetchingBoss = false;
        }
    };

    const spawnBossNow = () => {
        const g = gameRef.current;
        if (g.boss) return;

        const elapsedSec = (g.currentTime - g.startTime) / 1000;
        // Adjusted difficulty curve: Slower scaling
        const difficultyMult = 1 + (bossDefeatedCount * 0.25) + (elapsedSec / 180);
        const bossName = bossData?.name || `機甲暴龍-MK${bossDefeatedCount + 1}`;

        let spawnX = g.player.x + 400;
        if (spawnX > WORLD_WIDTH - 200) spawnX = g.player.x - 400;

        const timeScale = 1 + (elapsedSec / 180) * 0.2;
        const boss = new Enemy(entityIdCounter.current++, spawnX, 50, 1, timeScale * difficultyMult, 'BOSS');
        boss.name = bossName;

        const types: BossType[] = ['ASSAULT', 'BOMBER', 'TANK', 'SPEED'];
        let availableTypes = types.filter(t => t !== lastBossType.current);
        let chosenType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        boss.bossType = chosenType;
        lastBossType.current = chosenType;

        if (chosenType === 'ASSAULT') boss.color = '#ef4444';
        else if (chosenType === 'BOMBER') boss.color = '#fbbf24';
        else if (chosenType === 'TANK') boss.color = '#10b981';
        else if (chosenType === 'SPEED') boss.color = '#3b82f6';

        g.enemies.push(boss);
        g.boss = boss;
        g.nextBossSpawnReady = false;

        setBossHp({ current: boss.hp, max: boss.maxHp, name: bossName });
        soundEngine.playWarning();
        g.screenShake = 30;

        const quotes = [
            "鎖定目標... 毀滅程序啟動。",
            "偵測到非法入侵者... 排除。",
            "我是這座城市的法律。",
            "你的數據將被抹除。",
            "顫抖吧，生物體。"
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        g.floatingTexts.push(new FloatingText(0, 40, quote, '#ffffff', 20, true, boss, 3.0));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const g = gameRef.current;
            g.keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();

            if (gameState === 'PLAYING') {
                if (e.code === 'KeyZ' || e.code === 'KeyK') triggerAttack();

                if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                    if (g.player.dodgeCooldown === 0) {
                        // Check Stamina
                        if (g.player.stamina >= STAMINA_COST_DODGE || g.player.buffTimer > 0) {
                            if (g.player.buffTimer <= 0) g.player.stamina -= STAMINA_COST_DODGE;

                            g.player.dodgeCooldown = 210; // 3.5 seconds at 60fps
                            g.player.invincibleTimer = 90; // 1.5 seconds at 60fps (dodge invincibility)
                            // Give speed buff: 2x speed for 0.5 seconds
                            g.player.dodgeSpeedTimer = 30; // 0.5 second speed boost at 60fps
                            soundEngine.playDodge();
                        } else {
                            soundEngine.playNoStamina();
                        }
                    }
                }

                if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
                    // Jump Logic including Double Jump
                    if (g.player.isGrounded) {
                        g.player.vy = JUMP_FORCE_DEFAULT;
                        g.player.isGrounded = false;
                        g.player.jumpCount = 1;
                        soundEngine.playJump();
                        for (let i = 0; i < 5; i++) g.particles.push(new Particle(g.player.x + 16, g.player.y + 30, '#fff'));
                    } else if (g.player.jumpCount < 2) {
                        // Double Jump Check
                        if (g.player.stamina >= STAMINA_COST_DOUBLE_JUMP || g.player.buffTimer > 0) {
                            if (g.player.buffTimer <= 0) g.player.stamina -= STAMINA_COST_DOUBLE_JUMP;
                            g.player.vy = JUMP_FORCE_DEFAULT * 0.9; // Slightly weaker 2nd jump
                            g.player.jumpCount = 2;
                            soundEngine.playDoubleJump();
                            // Pink particles for double jump
                            for (let i = 0; i < 8; i++) g.particles.push(new Particle(g.player.x + 16, g.player.y + 30, COLORS.stamina, 1.2));
                        } else {
                            soundEngine.playNoStamina();
                        }
                    }
                }

                if (e.code === 'KeyR') {
                    if (g.player.energy >= 99) {
                        g.player.energy = 0;
                        if (energyBarRef.current) energyBarRef.current.style.width = '0%';
                        if (energyTextRef.current) energyTextRef.current.style.display = 'none';

                        g.screenShake = 20;
                        g.glitchIntensity = 0.5;
                        soundEngine.playUltimateShoot();

                        const dir = g.player.facingRight ? 1 : -1;
                        const projectile = new Projectile(
                            g.player.x + (dir * 30),
                            g.player.y + 10,
                            dir * 12.5, // Reduced to 50%
                            0,
                            true,
                            true
                        );
                        g.projectiles.push(projectile);
                    }
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => gameRef.current.keys[e.code] = false;

        const handleMouseDown = (e: MouseEvent) => {
            if (gameState === 'MENU') {
                setGameState('INSTRUCTIONS');
                return;
            }
            if (e.button === 0 && gameState === 'PLAYING') triggerAttack();
        }

        const triggerAttack = () => {
            const g = gameRef.current;
            const speedMod = g.player.buffTimer > 0 ? 0.5 : 1.0;
            if (!g.player.isAttacking && g.player.attackCooldown === 0) {
                g.player.isAttacking = true;
                g.player.attackActiveFrame = 5;
                g.player.attackCooldown = 72 * speedMod; // Increased 1.5x from 48
                g.player.currentAttackHitSet.clear();
                soundEngine.playSlash();

                const slashX = g.player.facingRight ? g.player.x + g.player.width + 10 : g.player.x - 50;
                g.visualEffects.push(new VisualEffect(
                    slashX,
                    g.player.y + g.player.height / 2 - 15,
                    'SLASH',
                    g.player.facingRight
                ));
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousedown', handleMouseDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [gameState]);

    // Canvas initialization - ensures proper dimensions before first render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const render = () => {
            if (gameState === 'PLAYING') {
                const g = gameRef.current;
                g.currentTime = Date.now();

                // Calculate deltaTime for frame-rate independent game logic
                if (g.lastFrameTime === 0) g.lastFrameTime = g.currentTime;
                const rawDelta = (g.currentTime - g.lastFrameTime) / 1000;
                // Cap deltaTime to prevent death spiral on slow frames (max 0.1s = 10 FPS minimum)
                g.deltaTime = Math.min(rawDelta, 0.1);
                g.lastFrameTime = g.currentTime;

                // Target 60 FPS: use multiplier for frame-based logic
                const frameMultiplier = g.deltaTime * 60;

                const elapsedSec = (g.currentTime - g.startTime) / 1000;

                setSurvivalTime(g.currentTime - g.startTime);

                const p = g.player;

                if (hpBarRef.current) hpBarRef.current.style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
                if (energyBarRef.current) energyBarRef.current.style.width = `${Math.min(100, p.energy)}%`;
                if (energyTextRef.current) energyTextRef.current.style.display = p.energy >= 99 ? 'flex' : 'none';
                // Stamina Bar Update
                if (staminaBarRef.current) {
                    const pct = Math.max(0, (p.stamina / p.maxStamina) * 100);
                    staminaBarRef.current.style.height = `${pct}%`;
                    staminaBarRef.current.style.filter = p.stamina < STAMINA_COST_DOUBLE_JUMP ? 'grayscale(100%)' : 'none';
                }

                // NEW DIFFICULTY SYSTEM: Every 30 seconds, increase difficulty (max 5 times)
                // Each level adds 20% enemy damage
                if (g.difficultyLevel < 5 && elapsedSec - g.lastDifficultyIncTime >= 30) {
                    g.difficultyLevel++;
                    g.lastDifficultyIncTime = elapsedSec;
                    // Visual feedback
                    g.screenShake = 10;
                    g.floatingTexts.push(new FloatingText(p.x, p.y - 60, `難度上升! Lv${g.difficultyLevel}`, '#ff00ff', 24));
                }

                if (g.nextBossSpawnReady && !g.boss) spawnBossNow();

                const spawnRate = g.boss ? 0.00125 : 0.00375; // Further halved from 0.0025/0.0075
                if (Math.random() < spawnRate + (bossDefeatedCount * 0.005) + (elapsedSec / 1000)) {
                    // Enemy cap: max 10 enemies at once
                    if (g.enemies.length < 10) { // Reduced from 20
                        const ex = Math.random() > 0.5 ? p.x + 800 : p.x - 800;
                        if (ex > 100 && ex < WORLD_WIDTH - 100) {
                            const timeScale = 1 + (elapsedSec / 60) * 0.2;
                            g.enemies.push(new Enemy(entityIdCounter.current++, ex, 100, 1 + (bossDefeatedCount * 0.1), timeScale));
                        }
                    }
                }

                // --- Banter Logic (4-6s) ---
                if (g.combatBanterTimer > 0) {
                    g.combatBanterTimer -= frameMultiplier;
                } else {
                    // 4-6 seconds @ 60fps = 240 - 360 frames
                    if (Math.random() > 0.5) {
                        const txt = PLAYER_BANTER[Math.floor(Math.random() * PLAYER_BANTER.length)];
                        g.floatingTexts.push(new FloatingText(0, 0, txt, '#00f3ff', 16, true, p, 4.0)); // Increased from 1.8 to 4.0
                    } else if (g.boss) {
                        const txt = BOSS_BANTER[Math.floor(Math.random() * BOSS_BANTER.length)];
                        g.floatingTexts.push(new FloatingText(0, 0, txt, '#ff4444', 16, true, g.boss, 4.0)); // Increased from 1.8 to 4.0
                    }
                    g.combatBanterTimer = 240 + Math.random() * 120;
                }

                let targetCamX = p.x - CANVAS_WIDTH / 2.5;
                if (targetCamX < 0) targetCamX = 0;
                if (targetCamX > WORLD_WIDTH - CANVAS_WIDTH) targetCamX = WORLD_WIDTH - CANVAS_WIDTH;
                g.cameraX += (targetCamX - g.cameraX) * 0.1;

                let shakeX = 0, shakeY = 0;
                if (g.screenShake > 0) {
                    shakeX = (Math.random() - 0.5) * g.screenShake;
                    shakeY = (Math.random() - 0.5) * g.screenShake;
                    g.screenShake *= 0.9;
                }
                ctx.save();
                ctx.translate(shakeX, shakeY);
                if (Math.random() < g.glitchIntensity) ctx.translate(Math.random() * 20 - 10, 0);
                g.glitchIntensity *= 0.9;

                ctx.fillStyle = COLORS.background;
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                g.buildings.sort((a, b) => a.parallaxFactor - b.parallaxFactor).forEach(b => b.draw(ctx, g.cameraX));
                g.platforms.forEach(plat => plat.draw(ctx, g.cameraX));
                g.interactiveObjects.forEach(obj => obj.draw(ctx, g.cameraX));

                // PHYSICS UPDATE (frame-rate independent)
                p.vx *= Math.pow(0.8, frameMultiplier);
                if (Math.abs(p.vx) < 0.1) p.vx = 0;

                // Apply dodge speed buff if active (2x speed)
                let dodgeSpeedMod = p.dodgeSpeedTimer > 0 ? 2.0 : 1.0; // Changed to 2x
                const speedMod = (p.buffTimer > 0 ? 1.5 : 1.0) * dodgeSpeedMod;
                const currentSpeed = SPEED_DEFAULT * speedMod * frameMultiplier;

                if (g.keys['ArrowLeft'] || g.keys['KeyA']) {
                    p.vx = -currentSpeed;
                    p.facingRight = false;
                }
                if (g.keys['ArrowRight'] || g.keys['KeyD']) {
                    p.vx = currentSpeed;
                    p.facingRight = true;
                }

                // Decrement dodge speed timer
                if (p.dodgeSpeedTimer > 0) p.dodgeSpeedTimer -= frameMultiplier;

                // Note: Jump logic is handled in keyDown to prevent continuous jumping
                p.update(GRAVITY_DEFAULT * frameMultiplier, g.platforms, g.interactiveObjects);

                // ITEMS UPDATE
                for (let i = g.items.length - 1; i >= 0; i--) {
                    const item = g.items[i];
                    item.update(g.platforms);
                    item.draw(ctx, g.cameraX);

                    // Check collision with player
                    if (
                        p.x < item.x + item.width &&
                        p.x + p.width > item.x &&
                        p.y < item.y + item.height &&
                        p.y + p.height > item.y
                    ) {
                        if (item.type === 'HEALTH') {
                            p.hp = Math.min(p.maxHp, p.hp + (p.maxHp * 0.25)); // +25%
                            soundEngine.playCollect();
                            g.floatingTexts.push(new FloatingText(p.x, p.y - 30, "+HP", COLORS.itemHealth));
                        } else if (item.type === 'ENERGY') {
                            p.energy = Math.min(100, p.energy + 35);
                            p.stamina = Math.min(p.maxStamina, p.stamina + 50); // +50 Stamina
                            soundEngine.playCollect();
                            g.floatingTexts.push(new FloatingText(p.x, p.y - 30, "+ENERGY", COLORS.itemEnergy));
                        } else if (item.type === 'BOOST') {
                            p.buffTimer = 420;
                            soundEngine.playPowerUp();
                            g.screenShake = 10;
                            g.floatingTexts.push(new FloatingText(p.x, p.y - 30, "MAX POWER!", COLORS.itemBoost, 30));
                            for (let j = 0; j < 10; j++) g.particles.push(new Particle(p.x + 16, p.y + 16, '#ff00ff', 2));
                        } else if (item.type === 'SHIELD') {
                            p.hasShield = true;
                            soundEngine.playShieldUp();
                            g.floatingTexts.push(new FloatingText(p.x, p.y - 30, "SHIELD UP", COLORS.itemShield));
                        }
                        g.items.splice(i, 1);
                    }
                }

                // PROJECTILES
                for (let i = g.projectiles.length - 1; i >= 0; i--) {
                    const proj = g.projectiles[i];
                    proj.update();
                    proj.draw(ctx, g.cameraX);

                    if (proj.isUltimate && !proj.hasExploded) {
                        let hit = false;
                        // Loose hitbox check
                        for (const e of g.enemies) {
                            const dx = proj.x - (e.x + e.width / 2);
                            const dy = proj.y - (e.y + e.height / 2);
                            if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
                                hit = true;
                                break;
                            }
                        }

                        if (hit) {
                            proj.hasExploded = true;
                            g.projectiles.splice(i, 1);
                            g.explosions.push(new Explosion(proj.x, proj.y));
                            g.screenShake = 50;
                            soundEngine.playExplosion();

                            for (let k = g.enemies.length - 1; k >= 0; k--) {
                                const e = g.enemies[k];
                                const dx = proj.x - (e.x + e.width / 2);
                                const dy = proj.y - (e.y + e.height / 2);
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist < 400) {
                                    // RNG Damage Logic
                                    const r = Math.random();
                                    let dmg = 404;
                                    let color = '#fff';
                                    if (r < 0.40) { dmg = 404; color = '#cccccc'; }
                                    else if (r < 0.65) { dmg = 520; color = '#ff69b4'; }
                                    else if (r < 0.90) { dmg = 666; color = '#ff0000'; }
                                    else { dmg = 777; color = '#ffd700'; }

                                    if (e.type === 'BOSS') {
                                        // Cap boss dmg at 20% max HP, but show the RNG number visually
                                        const actualDmg = Math.min(e.hp, e.maxHp * 0.20);
                                        e.hp -= actualDmg;
                                        g.floatingTexts.push(new FloatingText(e.x, e.y, `${dmg}!!`, color, 50));
                                    } else {
                                        g.floatingTexts.push(new FloatingText(e.x, e.y, `${dmg}!!`, color, 30));
                                        e.hp -= dmg;
                                    }

                                    e.vy = -15;
                                    e.x += (e.x > proj.x ? 50 : -50);

                                    if (e.hp <= 0) {
                                        let dropChance = 0.05;
                                        if (e.type === 'ELITE' || e.type === 'HEAVY') dropChance = 0.5;
                                        else if (e.type === 'BOSS') dropChance = 1.0;

                                        if (Math.random() < dropChance) {
                                            const r = Math.random();
                                            let type: 'HEALTH' | 'ENERGY' | 'BOOST' | 'SHIELD';
                                            if (r < 0.3) type = 'HEALTH';
                                            else if (r < 0.6) type = 'ENERGY';
                                            else if (r < 0.85) type = 'BOOST';
                                            else type = 'SHIELD';

                                            g.items.push(new Item(e.x + e.width / 2, e.y, type));
                                        }

                                        g.enemies.splice(k, 1);
                                        setScore(s => s + (e.type === 'BOSS' ? 5000 : (e.type === 'ELITE' ? 300 : 100)));
                                        soundEngine.playExplosion();

                                        if (e.type === 'BOSS') {
                                            g.boss = null;
                                            setBossHp(prev => ({ ...prev, current: 0 }));
                                            setBossDefeatedCount(prev => prev + 1);
                                            soundEngine.playBossDeath();
                                            startBossTimer(15);
                                        }
                                    } else {
                                        if (e.type === 'BOSS') setBossHp(prev => ({ ...prev, current: e.hp }));
                                    }
                                }
                            }
                            continue;
                        }
                    } else if (proj.life <= 0) {
                        g.projectiles.splice(i, 1);
                        continue;
                    }

                    if (!proj.isPlayer) {
                        if (p.x < proj.x + 10 && p.x + p.width > proj.x && p.y < proj.y + 10 && p.y + p.height > proj.y) {
                            if (p.invincibleTimer <= 0) {
                                if (p.hasShield) {
                                    p.hasShield = false;
                                    p.invincibleTimer = 30;
                                    soundEngine.playShieldBreak();
                                    g.floatingTexts.push(new FloatingText(p.x, p.y, "BLOCK", COLORS.itemShield));
                                } else {
                                    const damageMultiplier = 1 + (g.difficultyLevel * 0.2); // 20% per difficulty level
                                    p.hp -= Math.floor(15 * damageMultiplier);
                                    p.invincibleTimer = 150; // 2.5 seconds at 60fps
                                    g.screenShake = 15;
                                    soundEngine.playHit();
                                    g.floatingTexts.push(new FloatingText(p.x, p.y, `-${Math.floor(15 * damageMultiplier)}`, '#ff0000'));
                                    if (p.hp <= 0) endGame();
                                }
                            }
                        }
                    }
                }

                for (let i = g.explosions.length - 1; i >= 0; i--) {
                    const exp = g.explosions[i];
                    exp.update();
                    exp.draw(ctx, g.cameraX);
                    if (exp.life <= 0) g.explosions.splice(i, 1);
                }

                for (let i = g.visualEffects.length - 1; i >= 0; i--) {
                    const fx = g.visualEffects[i];
                    fx.update();
                    fx.draw(ctx, g.cameraX);
                    if (fx.life <= 0) g.visualEffects.splice(i, 1);
                }

                for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
                    const ft = g.floatingTexts[i];
                    ft.update();
                    ft.draw(ctx, g.cameraX);
                    if (ft.life <= 0) g.floatingTexts.splice(i, 1);
                }

                for (let i = g.enemies.length - 1; i >= 0; i--) {
                    const e = g.enemies[i];
                    e.update(p, g.platforms, g.projectiles, bossDefeatedCount);
                    e.draw(ctx, g.cameraX);

                    const hitPadding = e.type === 'BOSS' ? 10 : 0;

                    if (
                        p.x < e.x + e.width - hitPadding &&
                        p.x + p.width > e.x + hitPadding &&
                        p.y < e.y + e.height - hitPadding &&
                        p.y + p.height > e.y + hitPadding
                    ) {
                        if (p.invincibleTimer <= 0) {
                            if (p.hasShield) {
                                p.hasShield = false;
                                p.invincibleTimer = 30;
                                soundEngine.playShieldBreak();
                                p.vy = -8;
                                p.vx = p.x < e.x ? -15 : 15;
                                g.floatingTexts.push(new FloatingText(p.x, p.y, "BLOCK", COLORS.itemShield));
                            } else {
                                const damageMultiplier = 1 + (g.difficultyLevel * 0.2); // 20% per difficulty level
                                const dmg = Math.floor(10 * damageMultiplier);
                                p.hp -= dmg;
                                p.invincibleTimer = 150; // 2.5 seconds at 60fps
                                p.vy = -8;
                                p.vx = p.x < e.x ? -15 : 15;
                                soundEngine.playHit();
                                g.floatingTexts.push(new FloatingText(p.x, p.y, `-${dmg}`, '#ff0000'));
                                if (p.hp <= 0) endGame();
                            }
                        }
                    }

                    if (p.isAttacking && p.attackActiveFrame > 0) {
                        const attackRange = 110;
                        const attackX = p.facingRight ? p.x + p.width / 2 : p.x - attackRange + p.width / 2;

                        if (attackX < e.x + e.width && attackX + attackRange > e.x && p.y < e.y + e.height + 40 && p.y + p.height > e.y - 40) {

                            if (!p.currentAttackHitSet.has(e.id)) {
                                p.currentAttackHitSet.add(e.id);

                                const damage = 35;
                                if (e.type === 'BOSS') {
                                    e.hp -= damage;
                                } else {
                                    e.hp -= damage;
                                    if (!e.knockbackResist) e.vx = p.facingRight ? 10 : -10;
                                }

                                if (p.energy < 100) p.energy = Math.min(100, p.energy + 12.5); // 8 hits to charge (100/8=12.5)

                                soundEngine.playHit();
                                g.particles.push(new Particle(e.x + e.width / 2, e.y + e.height / 2, '#fff'));

                                if (e.hp <= 0) {
                                    let dropChance = 0.05;
                                    if (e.type === 'ELITE' || e.type === 'HEAVY') dropChance = 0.5;
                                    else if (e.type === 'BOSS') dropChance = 1.0;

                                    if (Math.random() < dropChance) {
                                        const r = Math.random();
                                        let type: 'HEALTH' | 'ENERGY' | 'BOOST' | 'SHIELD';
                                        if (r < 0.3) type = 'HEALTH';
                                        else if (r < 0.6) type = 'ENERGY';
                                        else if (r < 0.85) type = 'BOOST';
                                        else type = 'SHIELD';

                                        g.items.push(new Item(e.x + e.width / 2, e.y, type));
                                    }

                                    g.enemies.splice(i, 1);
                                    setScore(s => s + (e.type === 'BOSS' ? 5000 : (e.type === 'ELITE' ? 300 : 100)));
                                    soundEngine.playExplosion();

                                    if (e.type === 'BOSS') {
                                        g.boss = null;
                                        setBossHp(prev => ({ ...prev, current: 0 }));
                                        setBossDefeatedCount(prev => prev + 1);
                                        soundEngine.playBossDeath();
                                        startBossTimer(15);
                                    }
                                } else {
                                    if (e.type === 'BOSS') setBossHp(prev => ({ ...prev, current: e.hp }));
                                }
                            }
                        }
                    }
                }

                for (let i = g.particles.length - 1; i >= 0; i--) {
                    const part = g.particles[i];
                    part.update();
                    part.draw(ctx, g.cameraX);
                    if (part.life <= 0) g.particles.splice(i, 1);
                }

                p.draw(ctx, g.cameraX);
                ctx.restore();

                if (!g.boss && bossTimer > 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(0, 80, CANVAS_WIDTH, 50);
                    ctx.fillStyle = '#ff0055';
                    ctx.font = "bold 24px 'Noto Sans TC'";
                    ctx.textAlign = 'center';
                    ctx.fillText(`警報: 強敵將於 ${bossTimer} 秒後降臨`, CANVAS_WIDTH / 2, 115);
                }

                if (g.boss) {
                    const barW = Math.min(500, CANVAS_WIDTH - 40);
                    const barX = (CANVAS_WIDTH - barW) / 2;
                    ctx.fillStyle = 'rgba(0,0,0,0.8)';
                    ctx.fillRect(barX, 50, barW, 25);
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(barX, 50, barW * (bossHp.current / bossHp.max), 25);
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(barX, 50, barW, 25);
                    ctx.fillStyle = '#fff';
                    ctx.font = "bold 18px 'Noto Sans TC'";
                    ctx.textAlign = 'center';
                    ctx.fillText(bossHp.name, CANVAS_WIDTH / 2, 40);
                }
            }
            animationId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationId);
    }, [gameState, bossHp, bossTimer]);

    return (
        <div className="relative w-screen h-screen flex justify-center items-center font-zh bg-neutral-900 overflow-hidden select-none">
            <div className="scanlines"></div>

            {/* HUD Layer */}
            <div className={`absolute top-5 left-5 z-10 pointer-events-none scale-110 origin-top-left transition-opacity duration-500 ${gameState === 'PLAYING' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-white font-bold text-2xl mb-1 drop-shadow-md font-zh">分數: {score}</div>

                <div className="flex items-center mb-2">
                    <span className="text-cyan-300 text-lg mr-2 w-20 font-bold">生命值</span>
                    <div className="w-72 h-7 bg-gray-900 border-2 border-cyan-500 skew-x-[-12deg]">
                        <div ref={hpBarRef} className="h-full bg-cyan-400 transition-none box-shadow-[0_0_10px_#00f3ff]" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="flex items-center">
                    <span className="text-yellow-400 text-lg mr-2 w-20 font-bold">能量值</span>
                    <div className="w-72 h-7 bg-gray-900 border-2 border-yellow-500 skew-x-[-12deg] relative">
                        <div ref={energyBarRef} className="h-full bg-yellow-400 transition-none shadow-[0_0_15px_#fbbf24]" style={{ width: '0%' }}></div>
                        <div ref={energyTextRef} className="absolute inset-0 flex items-center justify-center text-sm font-black text-black animate-pulse hidden">
                            大招就緒 (R)
                        </div>
                    </div>
                </div>
            </div>

            {/* Stamina Bar - Paw Theme */}
            <div className={`absolute top-48 left-8 z-10 pointer-events-none flex flex-col items-center gap-1 scale-110 origin-left transition-opacity duration-500 ${gameState === 'PLAYING' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-6 h-40 bg-gray-900 border border-pink-400 rounded-full relative overflow-hidden">
                    <div ref={staminaBarRef} className="absolute bottom-0 left-0 w-full bg-pink-400 transition-all duration-100 ease-linear" style={{ height: '100%' }}></div>
                </div>
                <div className="text-pink-400 font-bold text-sm">體力</div>
                {/* CSS Paw Icon */}
                <div className="relative w-10 h-10">
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-5 bg-pink-400 rounded-full shadow-[0_0_5px_#ff69b4]"></div>
                    <div className="absolute top-1 left-0 w-2.5 h-3.5 bg-pink-400 rounded-full"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-3.5 bg-pink-400 rounded-full"></div>
                    <div className="absolute top-1 right-0 w-2.5 h-3.5 bg-pink-400 rounded-full"></div>
                </div>
            </div>

            {/* Right HUD */}
            <div className={`absolute top-5 right-5 text-right z-10 scale-110 origin-top-right transition-opacity duration-500 ${gameState === 'PLAYING' ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-2xl font-bold text-white font-arcade drop-shadow-md">BOSS殺數</h2>
                <p className="text-6xl text-red-500 font-bold drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">{bossDefeatedCount}</p>
                <h2 className="text-lg font-bold text-gray-400 font-arcade mt-2">生存時間</h2>
                <p className="text-4xl text-white font-bold">{formatTime(survivalTime)}</p>

                <div className="mt-2 flex justify-end">
                    <button onClick={pauseGame} className="pointer-events-auto w-10 h-10 rounded-full border-2 border-white/50 text-white hover:bg-white hover:text-black font-bold transition-colors flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_#ffffff]">
                        ?
                    </button>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="block bg-black z-0 cursor-crosshair"
            />

            {/* MAIN MENU */}
            {gameState === 'MENU' && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-50 bg-gradient-to-br from-indigo-900 via-black to-purple-900 overflow-hidden"
                    onClick={() => setGameState('INSTRUCTIONS')}
                >
                    <div className="absolute inset-0 pointer-events-none opacity-30"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.3) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
                            animation: 'gridMove 20s linear infinite'
                        }}>
                    </div>
                    <style>{`@keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 0 1000px; } }`}</style>

                    <h1 className="text-7xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-600 mb-12 glitch-text p-4 z-10 text-center drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                        《賽博喵の奇幻冒險》
                    </h1>

                    <div className="animate-bounce text-2xl text-white font-bold font-arcade mt-8 z-10 drop-shadow-[0_0_10px_#00f3ff] tracking-wider opacity-80">
                        [ 點擊任意位置開始遊戲 ]
                    </div>

                    <div className="absolute bottom-5 right-5 z-10 text-pink-500 font-bold text-xl font-zh animate-pulse drop-shadow-[0_0_5px_#ff00ff]">
                        作者：陳政緯( ･ิω･ิ)
                    </div>
                </div>
            )}

            {/* INSTRUCTION PAGE */}
            {gameState === 'INSTRUCTIONS' && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden text-white p-8">
                    {/* Grid BG */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 border-2 border-cyan-500/30 m-4 rounded-3xl"
                        style={{ backgroundImage: 'radial-gradient(#00f3ff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                    </div>

                    {/* Header */}
                    <div className="absolute top-8 left-8 z-10 cursor-pointer group" onClick={returnToMenu}>
                        <div className="w-12 h-12 border-2 border-cyan-500 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-cyan-400 mb-1"></div>
                        </div>
                        <div className="text-xs text-cyan-500 text-center mt-1 font-bold">HOME</div>
                    </div>

                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)] font-zh tracking-widest">
                        「 遊戲操作說明 」
                    </h2>

                    <div className="grid grid-cols-2 gap-8 w-full max-w-6xl z-10">
                        {/* Controls */}
                        <div className="bg-gray-900/80 border border-cyan-500/50 rounded-xl p-6 relative overflow-hidden group hover:border-cyan-400 transition-colors">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/30 pb-2">操作手則</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-8 h-8 border border-white rounded flex items-center justify-center font-bold">A</div>
                                        <div className="w-8 h-8 border border-white rounded flex items-center justify-center font-bold">D</div>
                                    </div>
                                    <span>左右移動</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-8 border border-white rounded flex items-center justify-center font-bold text-xs">SPACE</div>
                                    <span>跳躍 / 二段跳(消耗體力)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-8 border border-pink-400 text-pink-400 rounded flex items-center justify-center font-bold text-xs">SHIFT</div>
                                    <span>閃避 (短暫無敵 消耗體力)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border border-yellow-400 text-yellow-400 rounded flex items-center justify-center font-bold">R</div>
                                    <span>量子毀滅砲 (大範圍爆炸傷害)</span>
                                </div>
                                <div className="flex items-center gap-3 col-span-2">
                                    <div className="w-24 h-8 border border-red-400 text-red-400 rounded flex items-center justify-center font-bold text-xs">左鍵 / K</div>
                                    <span>貓爪攻擊 (回復能量)</span>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-gray-900/80 border border-green-500/50 rounded-xl p-6 relative overflow-hidden group hover:border-green-400 transition-colors">
                            <h3 className="text-xl font-bold text-green-400 mb-4 border-b border-green-500/30 pb-2">道具一覽</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-500 shadow-[0_0_10px_#22c55e] flex items-center justify-center text-black font-bold text-xs">+</div>
                                    <span className="text-sm">醫療包 (回復生命值)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-yellow-500 shadow-[0_0_10px_#eab308] clip-path-polygon-[50%_0,100%_50%,50%_100%,0_50%]"></div>
                                    <span className="text-sm">能量電池 (回負能量 + 體力)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></div>
                                    <span className="text-sm">沙德威斯坦 (攻速和跑速大幅提升)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-blue-500 text-blue-500 flex items-center justify-center text-xs font-bold rounded-full shadow-[0_0_5px_#3b82f6]">S</div>
                                    <span className="text-sm">量子護盾 (抵免一次傷害)</span>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-gray-900/80 border border-pink-500/50 rounded-xl p-6 relative overflow-hidden group hover:border-pink-400 transition-colors">
                            <h3 className="text-xl font-bold text-pink-400 mb-4 border-b border-pink-500/30 pb-2">數值狀態</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-700 rounded"><div className="w-3/4 h-full bg-cyan-400"></div></div>
                                    <span>生命值(注意血量!)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-700 rounded"><div className="w-1/2 h-full bg-yellow-400"></div></div>
                                    <span>能量 (攻擊後能夠充能)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-700 rounded"><div className="w-full h-full bg-pink-400"></div></div>
                                    <span>體力 (閃避/二段跳將會消耗)</span>
                                </div>
                            </div>
                        </div>

                        {/* Environment */}
                        <div className="bg-gray-900/80 border border-red-500/50 rounded-xl p-6 relative overflow-hidden group hover:border-red-400 transition-colors">
                            <h3 className="text-xl font-bold text-red-400 mb-4 border-b border-red-500/30 pb-2">地圖物件</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-2 bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                                    <span>重力彈簧 (能夠彈跳 + 回復些許體力)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-red-500"></div>
                                        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-red-500"></div>
                                    </div>
                                    <span>尖尖地刺 (觸碰會被刺傷)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={gameRef.current.isGameActive ? resumeGame : startGame}
                        className="mt-8 px-16 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-2xl tracking-widest rounded-full shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:scale-105 hover:shadow-[0_0_50px_rgba(0,243,255,0.6)] transition-all z-20 font-arcade animate-pulse"
                    >
                        {gameRef.current.isGameActive ? "返回戰鬥" : " Let's Go! "}
                    </button>
                </div>
            )}

            {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 backdrop-blur-sm">
                    <div className="bg-neutral-900 border-2 border-cyan-500 p-8 rounded-lg shadow-[0_0_50px_rgba(0,243,255,0.3)] max-w-3xl w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

                        <h1 className="text-6xl font-black text-white mb-2 font-zh text-center tracking-widest border-b border-gray-700 pb-4">
                            戰鬥結束
                        </h1>

                        <div className="flex flex-col gap-6 mt-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-black/50 p-4 border border-gray-700 rounded flex flex-col items-center">
                                    <span className="text-gray-400 text-sm font-zh tracking-widest uppercase">擊殺BOSS (WAVES)</span>
                                    <span className="text-5xl font-bold text-cyan-400 font-arcade mt-2">{bossDefeatedCount}</span>
                                </div>
                                <div className="bg-black/50 p-4 border border-gray-700 rounded flex flex-col items-center">
                                    <span className="text-gray-400 text-sm font-zh tracking-widest uppercase">生存時間 (TIME)</span>
                                    <span className="text-5xl font-bold text-purple-400 font-arcade mt-2">{formatTime(survivalTime)}</span>
                                </div>
                                <div className="bg-black/50 p-4 border border-gray-700 rounded flex flex-col items-center">
                                    <span className="text-gray-400 text-sm font-zh tracking-widest uppercase">總積分 (SCORE)</span>
                                    <span className="text-5xl font-bold text-yellow-400 font-arcade mt-2">{score}</span>
                                </div>
                            </div>

                            <div
                                className="relative mt-4 bg-gray-800/50 p-6 rounded border-l-4 border-pink-500 cursor-pointer hover:bg-gray-800/70 transition-colors"
                                onClick={() => setCurrentQuoteIndex((prev) => (prev + 1) % CAT_QUOTES.length)}
                            >
                                <div className="absolute -top-3 -left-3 bg-pink-600 text-white text-xs px-2 py-1 font-bold rounded shadow-lg">
                                    本喵的喃喃自語
                                </div>
                                <p className="text-xl text-white italic font-zh leading-relaxed tracking-wide mt-2 text-center">
                                    "{CAT_QUOTES[currentQuoteIndex]}"
                                </p>
                                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                                    [點擊切換]
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button onClick={startGame} className="px-12 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-xl tracking-widest rounded shadow-[0_0_30px_rgba(255,0,0,0.4)] hover:scale-105 transition-all pointer-events-auto font-zh group">
                                <span className="group-hover:animate-pulse">再來一次(✪ω✪)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<CyberpunkGame />);
