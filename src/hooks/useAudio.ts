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
  strumSpeed: 40,
  muted: false,
};

export function useAudio() {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const initializingRef = useRef(false);

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (isReady || initializingRef.current) return;
    initializingRef.current = true;

    try {
      await Tone.start();

      // Create a pluck-like synth for guitar simulation
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle",
        },
        envelope: {
          attack: 0.005,
          decay: 0.3,
          sustain: 0.2,
          release: 1.5,
        },
      }).toDestination();

      synth.volume.value = Tone.gainToDb(settings.volume);
      synthRef.current = synth;
      setIsReady(true);
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    } finally {
      initializingRef.current = false;
    }
  }, [isReady, settings.volume]);

  // Update volume when settings change
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = Tone.gainToDb(settings.volume);
    }
  }, [settings.volume]);

  // Play a single note
  const playNote = useCallback(
    (note: string, duration: string = "2n") => {
      if (!synthRef.current || settings.muted) return;
      synthRef.current.triggerAttackRelease(note, duration);
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

      if (!synthRef.current || settings.muted) return;
      if (isPlaying) return; // Prevent overlapping plays

      setIsPlaying(true);

      // Calculate notes to play from the voicing
      const notesToPlay: { note: string; delay: number }[] = [];
      let stringIndex = 0;

      voicing.strings.forEach((fret, idx) => {
        if (fret !== null) {
          const midiNote = getMidiNote(idx, fret);
          const noteName = midiToNoteName(midiNote);
          notesToPlay.push({
            note: noteName,
            delay: stringIndex * settings.strumSpeed,
          });
          stringIndex++;
        }
      });

      // Play notes with strum timing
      const now = Tone.now();
      notesToPlay.forEach(({ note, delay }) => {
        synthRef.current?.triggerAttackRelease(
          note,
          "2n",
          now + delay / 1000
        );
      });

      // Reset playing state after strum completes
      const totalDuration =
        notesToPlay.length * settings.strumSpeed + 100;
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
      if (synthRef.current) {
        synthRef.current.dispose();
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
