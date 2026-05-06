"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T }
  ? T
  : any;

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface VoiceSearchOptions {
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: (finalTranscript: string) => void;
  onError?: (err: string) => void;
}

export interface VoiceSearchState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useVoiceSearch(opts: VoiceSearchOptions = {}): VoiceSearchState {
  const { lang = "en-IN", onResult, onEnd, onError } = opts;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalRef = useRef<string>("");
  const listeningRef = useRef(false);

  // Stable refs for callbacks
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onResultRef.current = onResult;
    onEndRef.current = onEnd;
    onErrorRef.current = onError;
  }, [onResult, onEnd, onError]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      listeningRef.current = true;
      setIsListening(true);
      setError(null);
      finalRef.current = "";
      setTranscript("");
    };

    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (final) finalRef.current += final;
      const combined = (finalRef.current + interim).trim();
      setTranscript(combined);
      onResultRef.current?.(combined, !!final);
    };

    rec.onerror = (event: any) => {
      const code: string = event?.error || "unknown";
      const msg =
        code === "not-allowed" || code === "service-not-allowed"
          ? "Microphone permission denied"
          : code === "no-speech"
          ? "No speech detected"
          : code === "audio-capture"
          ? "No microphone found"
          : code === "network"
          ? "Network error"
          : `Voice error: ${code}`;
      setError(msg);
      onErrorRef.current?.(msg);
    };

    rec.onend = () => {
      listeningRef.current = false;
      setIsListening(false);
      onEndRef.current?.(finalRef.current.trim());
    };

    recognitionRef.current = rec;
    return () => {
      try {
        rec.onstart = rec.onresult = rec.onerror = rec.onend = null;
        if (listeningRef.current) rec.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || listeningRef.current) return;
    try {
      rec.start();
    } catch (e: any) {
      const msg = e?.message || "Could not start voice input";
      setError(msg);
      onErrorRef.current?.(msg);
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || !listeningRef.current) return;
    try {
      rec.stop();
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    if (listeningRef.current) stop();
    else start();
  }, [start, stop]);

  return { isListening, isSupported, transcript, error, start, stop, toggle };
}
