import React, { useState } from 'react';

const KEY = 'byte-suggestions';
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

export const SuggestionBox: React.FC = () => {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState('');

  /** Real inbox first (Supabase `suggestions` table); localStorage only as dev fallback. */
  const persist = async (body: string): Promise<'supabase' | 'local' | 'error'> => {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/suggestions`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ text: body }),
        });
        if (res.ok) return 'supabase';
        return 'error';
      } catch {
        /* network hiccup — fall through to local */
      }
    }
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || '[]');
      list.push({ text: body, at: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(list));
      return 'local';
    } catch {
      return 'error';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const status = await persist(text.trim());
    setText('');
    setSent(true);
    setNote(
      status === 'supabase'
        ? '✓ Sent to the editor — logged in the backend drop box.'
        : status === 'local'
          ? 'Saved on this device only — backend not connected (set VITE_SUPABASE_* env).'
          : 'Could not send — check the connection and try again.',
    );
    window.setTimeout(() => { setSent(false); setNote(''); }, 6000);
  };

  return (
    <div className="p-5 bg-[#F9F7F2] border-2 border-[#1A1A1A] flex flex-col">
      <span className="font-sans text-[10px] font-bold text-[#b91c1c] uppercase tracking-widest mb-1">
        Reader Suggestion Box
      </span>
      <h4 className="font-cinzel text-base font-bold text-[#1A1A1A] mb-2">
        Story ideas, fixes, repo requests
      </h4>
      <p className="font-serif text-xs italic text-[#1A1A1A]/80 mb-3">
        No AI replies, no auto-publish — just a human editor reading the drop box.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-2 flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="A repo to cover, a story you want written, a bug in the layout..."
          className="w-full bg-[#EEEBE1] border border-[#1A1A1A] p-3 text-sm font-serif-body rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#b91c1c]/40"
        />
        <button
          type="submit"
          className="bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer self-start"
        >
          Drop Suggestion
        </button>
      </form>
      {sent && (
        <p className="mt-2 text-xs font-sans font-bold animate-fadeIn text-[#15803d]">
          {note}
        </p>
      )}
    </div>
  );
};