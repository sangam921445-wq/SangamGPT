 "use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AudioLines, Bot, ChevronDown, CircleHelp, Clapperboard, Copy, Globe2,
  LogIn, LogOut, Menu, MessageCircle, Mic, Plus, Send, Settings, Sparkles,
  User, Video, Volume2, WandSparkles, X
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [tab, setTab] = useState<"chat" | "video" | "voice">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoStatus, setVideoStatus] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user?.email || null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, busy]);

  async function sendMessage(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat request failed");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([...next, { role: "assistant", content: `Sorry, ${err instanceof Error ? err.message : "something went wrong"}` }]);
    } finally { setBusy(false); }
  }

  async function createVideo(e: FormEvent) {
    e.preventDefault();
    if (!videoPrompt.trim()) return;
    setBusy(true); setVideoStatus("Sending your prompt...");
    try {
      const res = await fetch("/api/video", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: videoPrompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Video generation failed");
      setVideoStatus(data.video_url ? `Video ready: ${data.video_url}` : "Request accepted by provider. Check its dashboard for the result.");
    } catch (err) {
      setVideoStatus(err instanceof Error ? err.message : "Could not create video.");
    } finally { setBusy(false); }
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) { alert("Text to speech is not supported in this browser."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  }

  function listen() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input is not supported in this browser. Try Chrome."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; recognition.interimResults = false;
    recognition.onresult = (event: any) => setVoiceText(event.results[0][0].transcript);
    recognition.onerror = () => setVideoStatus("Microphone input failed. Check browser microphone permission.");
    recognition.start();
  }

  async function authSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) { alert("Authentication is not configured. Add your Supabase URL and anon key first."); return; }
    const result = authMode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) alert(result.error.message);
    else { setAuthOpen(false); setPassword(""); alert(authMode === "signup" ? "Account created. Check your email if confirmation is enabled." : "Welcome back!"); }
  }

  async function logout() {
    await supabase?.auth.signOut();
    setUserEmail(null);
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "show" : ""}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={21}/></div><span>Sangam<span className="brand-light">GPT</span></span><button className="icon-btn mobile-close" onClick={() => setMobileMenu(false)}><X size={18}/></button></div>
        <button className="new-chat" onClick={() => { setTab("chat"); setMessages([]); setMobileMenu(false); }}><Plus size={17}/> New chat</button>
        <div className="side-label">WORKSPACE</div>
        <button className={`nav-item ${tab === "chat" ? "active" : ""}`} onClick={() => {setTab("chat");setMobileMenu(false);}}><MessageCircle size={18}/> AI Chat</button>
        <button className={`nav-item ${tab === "video" ? "active" : ""}`} onClick={() => {setTab("video");setMobileMenu(false);}}><Clapperboard size={18}/> AI Video</button>
        <button className={`nav-item ${tab === "voice" ? "active" : ""}`} onClick={() => {setTab("voice");setMobileMenu(false);}}><AudioLines size={18}/> AI Voice</button>
        <div className="sidebar-bottom">
          <div className="side-tip"><Sparkles size={16}/><div><b>Make something amazing</b><p>Your ideas, powered by AI.</p></div></div>
          <button className="nav-item" onClick={() => setAuthOpen(true)}><User size={18}/> {userEmail || "Login / Sign up"}</button>
          {userEmail && <button className="nav-item" onClick={logout}><LogOut size={18}/> Sign out</button>}
          <div className="sidebar-foot"><span className="status-dot"/> SangamGPT Preview</div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setMobileMenu(true)}><Menu size={20}/></button>
          <div className="mobile-brand">Sangam<span>GPT</span></div>
          <div className="top-context"><span className="online-dot"/> AI workspace <ChevronDown size={14}/></div>
          <div className="top-actions"><span className="language"><Globe2 size={15}/> EN</span><button className="profile-btn" onClick={() => setAuthOpen(true)}>{userEmail ? userEmail.slice(0,1).toUpperCase() : <User size={17}/>}</button></div>
        </header>

        {tab === "chat" && <div className="chat-view">
          {messages.length === 0 ? <div className="welcome">
            <div className="welcome-orb"><Sparkles size={27}/></div>
            <div className="eyebrow">WELCOME TO YOUR AI SPACE</div>
            <h1>What can I help you<br/><span>create today?</span></h1>
            <p>Ask anything, explore ideas, or turn your imagination into something real.</p>
            <div className="suggestions">
              {[
                ["✦","Learn something","Explain artificial intelligence in simple words"],
                ["⌘","Write something","Write a professional introduction for my business"],
                ["⌁","Build something","Help me plan a modern website"]
              ].map(([icon,title,prompt]) => <button className="suggestion" key={title} onClick={() => setInput(prompt)}><span className="suggestion-icon">{icon}</span><span><b>{title}</b><small>{prompt}</small></span><span className="suggestion-arrow">↗</span></button>)}
            </div>
          </div> : <div className="messages">{messages.map((m,i) => <div className={`message ${m.role}`} key={i}><div className="avatar">{m.role === "assistant" ? <Sparkles size={16}/> : <User size={16}/>}</div><div className="message-body"><div className="message-name">{m.role === "assistant" ? "SangamGPT" : "You"}</div><p>{m.content}</p>{m.role === "assistant" && <div className="message-tools"><button onClick={() => navigator.clipboard.writeText(m.content)}><Copy size={13}/> Copy</button><button onClick={() => speak(m.content)}><Volume2 size={13}/> Listen</button></div>}</div></div>)}{busy && <div className="typing"><span/><span/><span/> SangamGPT is thinking</div>}<div ref={bottomRef}/></div>}
          <form className="composer-wrap" onSubmit={sendMessage}><div className="composer"><button type="button" className="attach-btn" title="Voice input" onClick={listen}><Mic size={19}/></button><input value={input} onChange={e => setInput(e.target.value)} placeholder="Message SangamGPT..." aria-label="Message SangamGPT"/><button className="send-btn" type="submit" disabled={!input.trim() || busy}><Send size={17}/></button></div><div className="disclaimer">SangamGPT can make mistakes. Verify important information.</div></form>
        </div>}

        {tab === "video" && <div className="tool-view"><div className="tool-heading"><div className="tool-icon purple"><Video size={23}/></div><div><div className="eyebrow">AI CREATIVE STUDIO</div><h1>Turn words into <span>videos.</span></h1><p>Describe your idea and connect a video generation provider to create it.</p></div></div><form className="tool-card" onSubmit={createVideo}><label>YOUR VIDEO IDEA</label><textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="A cinematic sunrise over the Himalayas, golden light, slow camera movement..." rows={5}/><div className="tool-card-foot"><span>Be descriptive for better results</span><button className="primary-btn" disabled={busy || !videoPrompt.trim()}><WandSparkles size={16}/> Generate video</button></div></form>{videoStatus && <div className="notice"><CircleHelp size={17}/><span>{videoStatus}</span></div>}<div className="provider-note"><b>Provider setup required</b><p>Video generation is not included in free website hosting. Connect a video AI provider and configure its API endpoint and secret key on Vercel.</p></div></div>}

        {tab === "voice" && <div className="tool-view"><div className="tool-heading"><div className="tool-icon blue"><AudioLines size={23}/></div><div><div className="eyebrow">AI AUDIO STUDIO</div><h1>Give your words a <span>voice.</span></h1><p>Turn text into speech using your browser's built-in voice engine.</p></div></div><div className="tool-card"><label>TEXT TO SPEAK</label><textarea value={voiceText} onChange={e => setVoiceText(e.target.value)} placeholder="Type something you want SangamGPT to say..." rows={6}/><div className="tool-card-foot"><span>Browser text-to-speech · No API key</span><div className="button-row"><button className="secondary-btn" onClick={() => window.speechSynthesis.cancel()} type="button">Stop</button><button className="primary-btn" onClick={() => speak(voiceText)} disabled={!voiceText.trim()} type="button"><Volume2 size={16}/> Speak text</button></div></div></div><div className="provider-note"><b>Voice input</b><p>Use the microphone button in AI Chat to dictate text. Browser and language support may vary.</p><button className="secondary-btn" onClick={listen}><Mic size={15}/> Try microphone</button></div></div>}

        <footer className="page-footer">© 2026 SangamGPT <span>Built for ideas without limits.</span></footer>
      </section>

      {authOpen && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setAuthOpen(false);}}><div className="auth-modal"><button className="modal-close" onClick={() => setAuthOpen(false)}><X size={18}/></button><div className="brand modal-brand"><div className="brand-mark"><Sparkles size={20}/></div><span>Sangam<span className="brand-light">GPT</span></span></div><h2>{authMode === "login" ? "Welcome back" : "Create your account"}</h2><p>Sign in to your SangamGPT workspace.</p><form onSubmit={authSubmit}><label>Email address</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/><label>Password</label><input type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"/><button className="primary-btn auth-submit" type="submit"><LogIn size={16}/>{authMode === "login" ? "Sign in" : "Create account"}</button></form><div className="auth-switch">{authMode === "login" ? "New to SangamGPT?" : "Already have an account?"} <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>{authMode === "login" ? "Sign up" : "Log in"}</button></div>{!supabase && <div className="auth-hint">Connect Supabase in your environment settings to enable secure accounts.</div>}</div></div>}
    </main>
  );
}
