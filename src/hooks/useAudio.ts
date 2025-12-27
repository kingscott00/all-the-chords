import { useCallback, useRef, useState, useEffect } from "react";
import * as Tone from "tone";
import { ChordVoicing } from "../types";
import { getMidiNote, midiToNoteName } from "../utils/noteUtils";

interface AudioSettings {
  volume: number; // 0-1
  strumSpeed: number; // ms between strings
  muted: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  volume: 0.7,
  strumSpeed: 50, // Slightly slower for more natural strum
  muted: false,
};

// Number of PluckSynth instances for polyphony (6 strings = 6 voices)
const VOICE_COUNT = 6;

export function useAudio() {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const synthPoolRef = useRef<Tone.PluckSynth[]>([]);
  const gainNodeRef = useRef<Tone.Gain | null>(null);
  const initializingRef = useRef(false);

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (isReady || initializingRef.current) return;
    initializingRef.current = true;

    try {
      await Tone.start();

      // Create a gain node for volume control
      const gain = new Tone.Gain(settings.volume).toDestination();
      gainNodeRef.current = gain;

      // Add subtle reverb for more natural sound
      const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.15,
      }).connect(gain);

      // Create a pool of PluckSynth instances for polyphony
      // PluckSynth uses Karplus-Strong algorithm for realistic plucked strings
      const synthPool: Tone.PluckSynth[] = [];
      for (let i = 0; i < VOICE_COUNT; i++) {
        const synth = new Tone.PluckSynth({
          attackNoise: 1.5, // Amount of initial "pluck" noise
          dampening: 4000, // Lowpass filter frequency - higher = brighter
          resonance: 0.98, // Sustain/ring time - higher = longer sustain
          release: 1.2, // Release time after note ends
        }).connect(reverb);
        synthPool.push(synth);
      }

      synthPoolRef.current = synthPool;
      setIsReady(true);
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    } finally {
      initializingRef.current = false;
    }
  }, [isReady, settings.volume]);

  // Update volume when settings change
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = settings.volume;
    }
  }, [settings.volume]);

  // Play a single note using the first available synth
  const playNote = useCallback(
    (note: string, duration: string = "2n") => {
      if (synthPoolRef.current.length === 0 || settings.muted) return;
      synthPoolRef.current[0].triggerAttackRelease(note, duration);
    },
    [settings.muted]
  );

  // Play a chord voicing with strum effect
  const playChord = useCallback(
    async (voicing: ChordVoicing) => {
      // Initialize audio if not ready (requires user interaction)
      if (!isReady) {
        await initAudio();
      }

      if (synthPoolRef.current.length === 0 || settings.muted) return;
      if (isPlaying) return; // Prevent overlapping plays

      setIsPlaying(true);

      // Calculate notes to play from the voicing
      const notesToPlay: { note: string; delay: number; synthIndex: number }[] = [];
      let stringIndex = 0;

      voicing.strings.forEach((fret, idx) => {
        if (fret !== null) {
          const midiNote = getMidiNote(idx, fret);
          const noteName = midiToNoteName(midiNote);
          notesToPlay.push({
            note: noteName,
            delay: stringIndex * settings.strumSpeed,
            synthIndex: stringIndex % VOICE_COUNT, // Round-robin synth assignment
          });
          stringIndex++;
        }
      });

      // Play notes with strum timing using individual synths
      const now = Tone.now();
      notesToPlay.forEach(({ note, delay, synthIndex }) => {
        const synth = synthPoolRef.current[synthIndex];
        if (synth) {
          synth.triggerAttackRelease(note, "2n", now + delay / 1000);
        }
      });

      // Reset playing state after strum completes plus sustain time
      const totalDuration =
        notesToPlay.length * settings.strumSpeed + 500;
      setTimeout(() => setIsPlaying(false), totalDuration);
    },
    [isReady, isPlaying, settings.muted, settings.strumSpeed, initAudio]
  );

  // Mute/unmute
  const setMuted = useCallback((muted: boolean) => {
    setSettings((prev) => ({ ...prev, muted }));
  }, []);

  // Set volume (0-1)
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setSettings((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  // Set strum speed (ms between strings)
  const setStrumSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(10, Math.min(100, speed));
    setSettings((prev) => ({ ...prev, strumSpeed: clampedSpeed }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synthPoolRef.current.forEach((synth) => synth.dispose());
      if (gainNodeRef.current) {
        gainNodeRef.current.dispose();
      }
    };
  }, []);

  return {
    isReady,
    isPlaying,
    settings,
    initAudio,
    playChord,
    playNote,
    setMuted,
    setVolume,
    setStrumSpeed,
  };
}

export default useAudio;
