"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

const pickRecorderMime = (): string | undefined => {
  if (typeof MediaRecorder === "undefined") return undefined;
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return "audio/mp4";
  }
  return undefined;
};

type VoiceUiCopy = {
  recordAria: string;
  stopSendAria: string;
  attachAria: string;
  recordingLabel: string;
};

type ImageUiCopy = {
  sendImageAria: string;
};

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  onSendVoice?: (blob: Blob, filename: string) => void | Promise<void>;
  voiceUi?: VoiceUiCopy;
  onSendImage?: (blob: Blob, filename: string) => void | Promise<void>;
  imageUi?: ImageUiCopy;
};

export const ChatInput = ({
  value,
  onChange,
  onSend,
  placeholder = "Type a message",
  disabled = false,
  onSendVoice,
  voiceUi,
  onSendImage,
  imageUi,
}: ChatInputProps): React.JSX.Element => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback((): void => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend();
  }, [disabled, onSend, value]);

  const onSubmitForm = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const stopAndSend = useCallback(
    (mr: MediaRecorder, stream: MediaStream): void => {
      mr.onstop = () => {
        stream.getTracks().forEach((t) => {
          t.stop();
        });
        const blob = new Blob(chunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        const ext = blob.type.includes("mp4") ? "m4a" : "webm";
        const filename = `voice-${Date.now()}.${ext}`;
        void onSendVoice?.(blob, filename);
      };
      if (mr.state === "recording") {
        mr.requestData();
      }
      mr.stop();
    },
    [onSendVoice],
  );

  const toggleRecording = useCallback(async (): Promise<void> => {
    if (disabled || !onSendVoice || !voiceUi) return;

    if (isRecording && mediaRecorderRef.current) {
      const mr = mediaRecorderRef.current;
      const stream = mr.stream;
      mediaRecorderRef.current = null;
      setIsRecording(false);
      stopAndSend(mr, stream);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mime = pickRecorderMime();
      const mr = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };
      mr.onerror = () => {
        stream.getTracks().forEach((t) => {
          t.stop();
        });
        setIsRecording(false);
        mediaRecorderRef.current = null;
      };
      mr.start(200);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      /* mic denied or unsupported */
    }
  }, [disabled, isRecording, onSendVoice, stopAndSend, voiceUi]);

  const onPickFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const f = e.target.files?.[0];
      if (f && onSendVoice) {
        void onSendVoice(f, f.name);
      }
      e.target.value = "";
    },
    [onSendVoice],
  );

  const onPickImage = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const f = e.target.files?.[0];
      if (f && onSendImage) {
        void onSendImage(f, f.name);
      }
      e.target.value = "";
    },
    [onSendImage],
  );

  const voiceEnabled = Boolean(onSendVoice && voiceUi);
  const imageEnabled = Boolean(onSendImage && imageUi);
  const voiceBusy = disabled;

  return (
    <form
      onSubmit={onSubmitForm}
      className="border-t border-zinc-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-1.5 shadow-inner dark:border-white/10 dark:bg-zinc-900/40">
        {imageEnabled && imageUi ? (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={onPickImage}
            />
            <button
              type="button"
              disabled={voiceBusy}
              onClick={() => {
                imageInputRef.current?.click();
              }}
              className={[
                "grid size-11 shrink-0 place-items-center rounded-xl text-zinc-600 outline-none transition hover:bg-zinc-200/80 focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:focus-visible:ring-white/20",
              ].join(" ")}
              aria-label={imageUi.sendImageAria}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </button>
          </>
        ) : null}
        {voiceEnabled && voiceUi ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={onPickFile}
            />
            <button
              type="button"
              disabled={voiceBusy || isRecording}
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className={[
                "grid size-11 shrink-0 place-items-center rounded-xl text-zinc-600 outline-none transition hover:bg-zinc-200/80 focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:focus-visible:ring-white/20",
              ].join(" ")}
              aria-label={voiceUi.attachAria}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </button>
            <button
              type="button"
              disabled={voiceBusy}
              onClick={() => {
                void toggleRecording();
              }}
              className={[
                "grid size-11 shrink-0 place-items-center rounded-xl outline-none transition focus-visible:ring-2",
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500/30"
                  : "text-zinc-600 hover:bg-zinc-200/80 focus-visible:ring-zinc-900/20 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:focus-visible:ring-white/20",
              ].join(" ")}
              aria-label={
                isRecording ? voiceUi.stopSendAria : voiceUi.recordAria
              }
              aria-pressed={isRecording}
            >
              {isRecording ? (
                <span
                  className="flex size-5 items-center justify-center rounded-sm bg-white"
                  aria-hidden="true"
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="23" />
                  <line x1="8" x2="16" y1="23" y2="23" />
                </svg>
              )}
            </button>
          </>
        ) : null}
        <label htmlFor="inbox-chat-composer" className="sr-only">
          Message
        </label>
        <textarea
          id="inbox-chat-composer"
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 disabled:opacity-50 dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
        {voiceEnabled && voiceUi && isRecording ? (
          <span
            className="self-center whitespace-nowrap text-xs font-medium text-red-600 dark:text-red-400"
            role="status"
            aria-live="polite"
          >
            {voiceUi.recordingLabel}
          </span>
        ) : null}
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className={[
            "grid size-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white shadow-sm outline-none transition",
            "bg-zinc-900 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900/20",
            "disabled:pointer-events-none disabled:opacity-40",
            "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-white/20",
          ].join(" ")}
          aria-label="Send message"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    </form>
  );
};
