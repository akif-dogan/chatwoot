/**
 * Mars AI Chat Widget — Glowing AI Chat Assistant
 * Standalone embed script with Shadow DOM isolation.
 * Connects to Chatwoot Widget API + ActionCable WebSocket.
 *
 * Usage:
 *   <script>
 *     (function(w,d){
 *       var s=d.createElement('script');
 *       s.src='https://help.marsai.co.uk/widget/marsai-widget.js';
 *       s.async=true; d.head.appendChild(s);
 *       w.MarsAI=w.MarsAI||{};
 *       w.MarsAI.websiteToken='jYRfsbUDzjWcwf2Gcta2dpDm';
 *       w.MarsAI.baseUrl='https://help.marsai.co.uk';
 *     })(window,document);
 *   </script>
 */
(function () {
  'use strict';

  /* ─── Config ──────────────────────────────────────────── */
  const CFG = {
    get baseUrl() { return (window.MarsAI && window.MarsAI.baseUrl) || 'https://help.marsai.co.uk'; },
    get token()   { return (window.MarsAI && window.MarsAI.websiteToken) || ''; },
    helpUrl: 'https://help.marsai.co.uk/help/articles',
    faqUrl:  'https://help.marsai.co.uk/help/faq',
    storageKey: 'marsai_widget_state',
    bubbleDelay: 3000,
  };

  /* ─── Styles (injected into Shadow DOM) ───────────────── */
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:host { all: initial; font-family: 'Outfit', system-ui, -apple-system, sans-serif; }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Animations ── */
@keyframes glowPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes bubbleIn {
  from { transform: scale(0) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes panelIn {
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes messageIn {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes glowFlash {
  0% { box-shadow: 0 0 0 rgba(37,99,235,0); }
  50% { box-shadow: 0 0 20px rgba(37,99,235,0.4); }
  100% { box-shadow: 0 0 0 rgba(37,99,235,0); }
}
@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
  50% { box-shadow: 0 0 0 4px rgba(16,185,129,0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Bubble ── */
.marsai-bubble {
  position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
  width: 60px; height: 60px; border-radius: 28px; cursor: pointer;
  background: linear-gradient(135deg, #2563EB, #06B6D4);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 30px rgba(37,99,235,0.35), 0 8px 24px rgba(0,0,0,0.3);
  animation: bubbleIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
  transition: transform 0.2s, box-shadow 0.2s;
}
.marsai-bubble:hover {
  transform: scale(1.08);
  box-shadow: 0 0 40px rgba(37,99,235,0.5), 0 8px 24px rgba(0,0,0,0.3);
}
.marsai-bubble::before {
  content: ''; position: absolute; inset: -4px; border-radius: 32px;
  background: linear-gradient(135deg, #2563EB, #06B6D4, #8B5CF6);
  background-size: 200% 200%; animation: gradientShift 3s ease infinite, glowPulse 2s ease-in-out infinite;
  z-index: -1; filter: blur(8px); opacity: 0.5;
}
.marsai-bubble svg { width: 28px; height: 28px; fill: #fff; }
.marsai-bubble .close-icon { display: none; }
.marsai-bubble.open .chat-icon { display: none; }
.marsai-bubble.open .close-icon { display: block; }

.marsai-badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 20px; height: 20px; border-radius: 10px;
  background: #EF4444; color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 5px; border: 2px solid #0F172A;
  animation: bubbleIn 0.3s ease;
}
.marsai-badge.hidden { display: none; }

/* ── Panel ── */
.marsai-panel {
  position: fixed; bottom: 96px; right: 24px; z-index: 2147483646;
  width: 380px; max-height: 600px; border-radius: 20px;
  background: rgba(15,23,42,0.92);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 25px 60px rgba(37,99,235,0.15), 0 10px 30px rgba(0,0,0,0.4);
  display: flex; flex-direction: column;
  animation: panelIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  overflow: hidden;
}
.marsai-panel.hidden { display: none; }

/* glow border */
.marsai-panel::before {
  content: ''; position: absolute; inset: -1px; border-radius: 21px;
  background: linear-gradient(135deg, #2563EB, #06B6D4, #8B5CF6, #2563EB);
  background-size: 300% 300%; animation: gradientShift 4s ease infinite;
  z-index: -1; opacity: 0.5;
}

/* gradient accent line */
.marsai-panel::after {
  content: ''; position: absolute; top: 0; left: 16px; right: 16px; height: 2px;
  background: linear-gradient(90deg, transparent, #2563EB, #06B6D4, #8B5CF6, transparent);
  background-size: 200% 100%; animation: gradientShift 3s ease infinite;
  border-radius: 2px;
}

/* ── Panel Header ── */
.panel-header {
  padding: 20px 20px 16px; flex-shrink: 0;
  background: linear-gradient(180deg, rgba(37,99,235,0.12) 0%, transparent 100%);
}
.panel-header-row { display: flex; align-items: center; gap: 12px; }
.panel-avatar {
  width: 40px; height: 40px; border-radius: 14px;
  background: linear-gradient(135deg, #2563EB, #06B6D4);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.panel-avatar svg { width: 22px; height: 22px; fill: #fff; }
.panel-title { font-size: 16px; font-weight: 600; color: #F1F5F9; }
.panel-subtitle { font-size: 12px; color: #94A3B8; margin-top: 1px; display: flex; align-items: center; gap: 6px; }
.status-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #10B981;
  animation: statusPulse 2s ease infinite;
}
.panel-close {
  margin-left: auto; background: none; border: none; cursor: pointer;
  color: #94A3B8; padding: 4px; border-radius: 8px; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.panel-close:hover { color: #F1F5F9; background: rgba(255,255,255,0.08); }
.panel-close svg { width: 18px; height: 18px; }

/* ── Screens ── */
.screen { display: none; flex-direction: column; flex: 1; min-height: 0; }
.screen.active { display: flex; }

/* ── Home Screen ── */
.home-welcome {
  padding: 0 20px 16px; font-size: 20px; font-weight: 600; color: #F1F5F9;
  line-height: 1.3;
}
.home-cards { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 8px; }
.home-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border-radius: 14px;
  background: rgba(30,41,59,0.7); border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.home-card:hover {
  background: rgba(37,99,235,0.12); border-color: rgba(37,99,235,0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(37,99,235,0.1);
}
.home-card-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-size: 18px;
}
.home-card-icon.chat { background: rgba(37,99,235,0.15); }
.home-card-icon.articles { background: rgba(6,182,212,0.15); }
.home-card-icon.faq { background: rgba(139,92,246,0.15); }
.home-card-icon.history { background: rgba(16,185,129,0.15); }
.home-card-text { flex: 1; }
.home-card-title { font-size: 14px; font-weight: 500; color: #F1F5F9; }
.home-card-desc { font-size: 12px; color: #94A3B8; margin-top: 2px; }
.home-card-arrow { color: #64748B; font-size: 14px; transition: transform 0.2s; }
.home-card:hover .home-card-arrow { transform: translateX(2px); color: #94A3B8; }

.home-recent { padding: 8px 20px 16px; }
.home-recent-label { font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }

/* ── Pre-chat Form ── */
.prechat { padding: 0 20px 20px; gap: 12px; }
.prechat-back {
  background: none; border: none; cursor: pointer; color: #94A3B8;
  font-size: 13px; display: flex; align-items: center; gap: 6px;
  padding: 4px 0; margin-bottom: 4px; transition: color 0.2s;
}
.prechat-back:hover { color: #F1F5F9; }
.prechat-back svg { width: 16px; height: 16px; }
.prechat-title { font-size: 16px; font-weight: 600; color: #F1F5F9; margin-bottom: 4px; }
.prechat-desc { font-size: 13px; color: #94A3B8; margin-bottom: 8px; }

.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 12px; font-weight: 500; color: #94A3B8; }
.form-input, .form-textarea {
  width: 100%; padding: 10px 14px; border-radius: 12px;
  background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.08);
  color: #F1F5F9; font-size: 14px; font-family: inherit;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus, .form-textarea:focus {
  border-color: rgba(37,99,235,0.5);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.form-input::placeholder, .form-textarea::placeholder { color: #475569; }
.form-textarea { min-height: 80px; resize: vertical; }

.form-submit {
  width: 100%; padding: 12px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
  color: #fff; font-size: 14px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
}
.form-submit:hover {
  box-shadow: 0 0 24px rgba(37,99,235,0.4);
  transform: translateY(-1px);
}
.form-submit:active { transform: translateY(0); }
.form-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.form-error { color: #EF4444; font-size: 12px; }

/* ── Chat View ── */
.chat-messages {
  flex: 1; overflow-y: auto; padding: 12px 16px; display: flex;
  flex-direction: column; gap: 8px; min-height: 0;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

.msg { display: flex; gap: 8px; animation: messageIn 0.3s ease; max-width: 85%; }
.msg.agent { align-self: flex-start; }
.msg.customer { align-self: flex-end; flex-direction: row-reverse; }
.msg-avatar {
  width: 28px; height: 28px; border-radius: 10px;
  background: linear-gradient(135deg, #2563EB, #06B6D4);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.msg-avatar svg { width: 14px; height: 14px; fill: #fff; }
.msg.customer .msg-avatar { display: none; }
.msg-body { display: flex; flex-direction: column; gap: 3px; }
.msg-sender { font-size: 11px; font-weight: 500; color: #64748B; }
.msg.customer .msg-sender { display: none; }
.msg-content {
  padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5;
  word-break: break-word; white-space: pre-wrap;
}
.msg.agent .msg-content {
  background: rgba(30,41,59,0.8); color: #E2E8F0;
  border-bottom-left-radius: 6px;
}
.msg.agent .msg-content.new { animation: glowFlash 0.6s ease; }
.msg.customer .msg-content {
  background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #fff;
  border-bottom-right-radius: 6px;
}
.msg-time { font-size: 10px; color: #475569; }
.msg.customer .msg-time { text-align: right; }

/* Typing indicator */
.typing-indicator {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 0; animation: messageIn 0.3s ease;
}
.typing-indicator.hidden { display: none; }
.typing-dots { display: flex; gap: 4px; }
.typing-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: linear-gradient(135deg, #2563EB, #06B6D4);
  box-shadow: 0 0 6px rgba(37,99,235,0.5);
}
.typing-dot:nth-child(1) { animation: dotPulse 1.4s ease-in-out infinite; }
.typing-dot:nth-child(2) { animation: dotPulse 1.4s ease-in-out 0.2s infinite; }
.typing-dot:nth-child(3) { animation: dotPulse 1.4s ease-in-out 0.4s infinite; }
.typing-label { font-size: 12px; color: #64748B; }

/* ── Chat Input ── */
.chat-input-area {
  padding: 12px 16px 16px; flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(15,23,42,0.6);
}
.chat-input-row { display: flex; align-items: flex-end; gap: 8px; }
.chat-input {
  flex: 1; padding: 10px 14px; border-radius: 14px;
  background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.08);
  color: #F1F5F9; font-size: 14px; font-family: inherit;
  outline: none; resize: none; min-height: 40px; max-height: 120px;
  transition: border-color 0.2s;
}
.chat-input:focus { border-color: rgba(37,99,235,0.5); }
.chat-input::placeholder { color: #475569; }
.chat-send {
  width: 40px; height: 40px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
  color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.chat-send:hover { box-shadow: 0 0 20px rgba(37,99,235,0.4); transform: translateY(-1px); }
.chat-send:active { transform: translateY(0); }
.chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
.chat-send svg { width: 18px; height: 18px; }

/* ── Powered By ── */
.powered-by {
  padding: 8px 20px 12px; text-align: center;
  font-size: 11px; color: #475569; flex-shrink: 0;
}
.powered-by a { color: #64748B; text-decoration: none; font-weight: 500; transition: color 0.2s; }
.powered-by a:hover { color: #94A3B8; }

/* ── Responsive ── */
@media (max-width: 440px) {
  .marsai-panel { right: 0; left: 0; bottom: 0; width: 100%; max-height: 100vh; border-radius: 20px 20px 0 0; }
  .marsai-panel::before { border-radius: 21px 21px 0 0; }
  .marsai-bubble { bottom: 16px; right: 16px; }
}

/* ── Loading spinner ── */
.loading-spinner {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite;
  display: inline-block;
}
`;

  /* ─── SVG Icons ────────────────────────────────────────── */
  const ICONS = {
    chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
    bot: '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.17A7.002 7.002 0 0113 22h-2a7.002 7.002 0 01-6.83-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73A2.002 2.002 0 0112 2zm0 7a5 5 0 00-5 5 5 5 0 005 5 5 5 0 005-5 5 5 0 00-5-5zm-2 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/></svg>',
  };

  /* ─── Chatwoot API Client ─────────────────────────────── */
  class ChatwootAPI {
    constructor(baseUrl, websiteToken) {
      this.baseUrl = baseUrl.replace(/\/$/, '');
      this.websiteToken = websiteToken;
      this.authToken = null;
      this.pubsubToken = null;
      this.conversationId = null;
      this.ws = null;
      this.onMessage = null;
      this.onTyping = null;
      this.onStatusChange = null;
      this._wsRetries = 0;
      this._maxRetries = 5;
    }

    _headers() {
      const h = { 'Content-Type': 'application/json' };
      if (this.authToken) h['X-Auth-Token'] = this.authToken;
      return h;
    }

    async _fetch(path, opts = {}) {
      const sep = path.includes('?') ? '&' : '?';
      const url = `${this.baseUrl}${path}${sep}website_token=${this.websiteToken}`;
      const res = await fetch(url, { headers: this._headers(), ...opts });
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      return res.json();
    }

    async init() {
      const data = await this._fetch('/api/v1/widget/config', { method: 'POST', body: '{}' });
      this.authToken = data.token;
      this.pubsubToken = data.pubsub_token;
      return data;
    }

    async createConversation(contact, message) {
      const body = {
        contact: { name: contact.name, email: contact.email, phone_number: contact.phone || '' },
        message: { content: message },
      };
      const data = await this._fetch('/api/v1/widget/conversations', { method: 'POST', body: JSON.stringify(body) });
      this.conversationId = data.id || data.conversation_id;

      // Re-read pubsub_token from conversation if available
      if (data.pubsub_token) this.pubsubToken = data.pubsub_token;
      return data;
    }

    async sendMessage(content) {
      const body = { content };
      return this._fetch('/api/v1/widget/messages', { method: 'POST', body: JSON.stringify(body) });
    }

    async getMessages(before) {
      let path = '/api/v1/widget/messages';
      if (before) path += `?before=${before}`;
      return this._fetch(path, { method: 'GET' });
    }

    async toggleTyping(typing) {
      return this._fetch('/api/v1/widget/conversations/toggle_typing', {
        method: 'POST',
        body: JSON.stringify({ typing_status: typing ? 'on' : 'off' }),
      }).catch(() => {}); // Non-critical
    }

    /* WebSocket via ActionCable */
    connectWebSocket() {
      if (this.ws) { try { this.ws.close(); } catch(e) {} }
      if (!this.pubsubToken) return;

      const wsProto = this.baseUrl.startsWith('https') ? 'wss' : 'ws';
      const wsHost = this.baseUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProto}://${wsHost}/cable`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this._wsRetries = 0;
        const sub = { command: 'subscribe', identifier: JSON.stringify({ channel: 'RoomChannel', pubsub_token: this.pubsubToken }) };
        this.ws.send(JSON.stringify(sub));
      };

      this.ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.type === 'ping' || data.type === 'confirm_subscription') return;
          if (!data.message) return;

          const msg = data.message;
          const event = msg.event;

          if (event === 'message.created' && msg.data) {
            const m = msg.data;
            // Only show agent/bot messages (message_type 1 = outgoing from agent)
            if (m.message_type === 1 && this.onMessage) {
              this.onMessage(m);
            }
          }
          if (event === 'conversation.typing_on' && this.onTyping) this.onTyping(true);
          if (event === 'conversation.typing_off' && this.onTyping) this.onTyping(false);
          if (event === 'conversation.status_changed' && this.onStatusChange) this.onStatusChange(msg.data);
        } catch(e) { /* ignore parse errors */ }
      };

      this.ws.onclose = () => {
        if (this._wsRetries < this._maxRetries) {
          this._wsRetries++;
          setTimeout(() => this.connectWebSocket(), 2000 * this._wsRetries);
        }
      };

      this.ws.onerror = () => { /* onclose handles reconnect */ };
    }

    disconnect() {
      this._maxRetries = 0;
      if (this.ws) { try { this.ws.close(); } catch(e) {} }
    }
  }

  /* ─── Widget Class ────────────────────────────────────── */
  class MarsAIWidget {
    constructor() {
      this.state = {
        screen: 'bubble',
        isOpen: false,
        messages: [],
        contact: { name: '', email: '', phone: '' },
        isTyping: false,
        agentName: 'Mars AI Assistant',
        unreadCount: 0,
        loading: false,
      };

      this.api = new ChatwootAPI(CFG.baseUrl, CFG.token);
      this.api.onMessage = (m) => this._handleAgentMessage(m);
      this.api.onTyping = (t) => this._setTyping(t);

      this._loadState();
      this._createDOM();
      this._bindEvents();
      this._initAPI();

      // Show bubble after delay
      setTimeout(() => {
        this.els.bubble.style.display = 'flex';
      }, CFG.bubbleDelay);
    }

    /* ── State persistence ── */
    _loadState() {
      try {
        const saved = localStorage.getItem(CFG.storageKey);
        if (saved) {
          const s = JSON.parse(saved);
          if (s.authToken) this.api.authToken = s.authToken;
          if (s.pubsubToken) this.api.pubsubToken = s.pubsubToken;
          if (s.conversationId) this.api.conversationId = s.conversationId;
          if (s.contact) this.state.contact = s.contact;
          if (s.messages) this.state.messages = s.messages;
        }
      } catch(e) { /* fresh start */ }
    }

    _saveState() {
      try {
        localStorage.setItem(CFG.storageKey, JSON.stringify({
          authToken: this.api.authToken,
          pubsubToken: this.api.pubsubToken,
          conversationId: this.api.conversationId,
          contact: this.state.contact,
          messages: this.state.messages.slice(-50), // Keep last 50 messages
        }));
      } catch(e) {}
    }

    /* ── API init ── */
    async _initAPI() {
      try {
        await this.api.init();
        if (this.api.conversationId) {
          // Returning user — load history and connect WS
          this.api.connectWebSocket();
        }
        this._saveState();
      } catch(e) {
        console.warn('[MarsAI Widget] Init error:', e.message);
      }
    }

    /* ── DOM construction ── */
    _createDOM() {
      // Host element
      this.host = document.createElement('div');
      this.host.id = 'marsai-widget-host';
      this.shadow = this.host.attachShadow({ mode: 'open' });

      // Styles
      const style = document.createElement('style');
      style.textContent = CSS;
      this.shadow.appendChild(style);

      // Bubble
      const bubble = document.createElement('div');
      bubble.className = 'marsai-bubble';
      bubble.style.display = 'none';
      bubble.innerHTML = `
        <span class="chat-icon">${ICONS.bot}</span>
        <span class="close-icon">${ICONS.close}</span>
        <span class="marsai-badge hidden">0</span>
      `;

      // Panel
      const panel = document.createElement('div');
      panel.className = 'marsai-panel hidden';
      panel.innerHTML = `
        <div class="panel-header">
          <div class="panel-header-row">
            <div class="panel-avatar">${ICONS.bot}</div>
            <div>
              <div class="panel-title">Mars AI</div>
              <div class="panel-subtitle"><span class="status-dot"></span> Online</div>
            </div>
            <button class="panel-close">${ICONS.close}</button>
          </div>
        </div>

        <!-- Home Screen -->
        <div class="screen home-screen active" data-screen="home">
          <div class="home-welcome">How can we help you today?</div>
          <div class="home-cards">
            <div class="home-card" data-action="chat">
              <div class="home-card-icon chat">💬</div>
              <div class="home-card-text">
                <div class="home-card-title">Start a conversation</div>
                <div class="home-card-desc">Chat with our AI assistant</div>
              </div>
              <span class="home-card-arrow">→</span>
            </div>
            <div class="home-card" data-action="articles">
              <div class="home-card-icon articles">📚</div>
              <div class="home-card-text">
                <div class="home-card-title">Browse articles</div>
                <div class="home-card-desc">Find answers in our knowledge base</div>
              </div>
              <span class="home-card-arrow">→</span>
            </div>
            <div class="home-card" data-action="faq">
              <div class="home-card-icon faq">❓</div>
              <div class="home-card-text">
                <div class="home-card-title">FAQ</div>
                <div class="home-card-desc">Common questions answered</div>
              </div>
              <span class="home-card-arrow">→</span>
            </div>
          </div>
          <div class="home-recent"></div>
        </div>

        <!-- Pre-chat Form Screen -->
        <div class="screen prechat" data-screen="prechat">
          <button class="prechat-back">${ICONS.back} Back</button>
          <div class="prechat-title">Start a conversation</div>
          <div class="prechat-desc">Fill in your details and we'll get back to you shortly.</div>
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input class="form-input" name="name" placeholder="Your name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input class="form-input" name="email" type="email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-input" name="phone" type="tel" placeholder="+44 ..." >
          </div>
          <div class="form-group">
            <label class="form-label">Message *</label>
            <textarea class="form-textarea" name="message" placeholder="How can we help?"></textarea>
          </div>
          <div class="form-error" style="display:none"></div>
          <button class="form-submit">Start chat</button>
        </div>

        <!-- Chat Screen -->
        <div class="screen chat-screen" data-screen="chat">
          <div class="chat-messages"></div>
          <div class="typing-indicator hidden">
            <div class="typing-dots">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
            <span class="typing-label">Mars AI is thinking...</span>
          </div>
          <div class="chat-input-area">
            <div class="chat-input-row">
              <textarea class="chat-input" placeholder="Type your message..." rows="1"></textarea>
              <button class="chat-send">${ICONS.send}</button>
            </div>
          </div>
        </div>

        <div class="powered-by">Powered by <a href="https://marsai.co.uk" target="_blank" rel="noopener">Mars AI</a></div>
      `;

      this.shadow.appendChild(bubble);
      this.shadow.appendChild(panel);
      document.body.appendChild(this.host);

      // Cache elements
      this.els = {
        bubble, panel,
        badge: bubble.querySelector('.marsai-badge'),
        closeBtn: panel.querySelector('.panel-close'),
        screens: {
          home: panel.querySelector('[data-screen="home"]'),
          prechat: panel.querySelector('[data-screen="prechat"]'),
          chat: panel.querySelector('[data-screen="chat"]'),
        },
        // Home
        cardChat: panel.querySelector('[data-action="chat"]'),
        cardArticles: panel.querySelector('[data-action="articles"]'),
        cardFaq: panel.querySelector('[data-action="faq"]'),
        recentSection: panel.querySelector('.home-recent'),
        // Form
        prechatBack: panel.querySelector('.prechat-back'),
        formName: panel.querySelector('input[name="name"]'),
        formEmail: panel.querySelector('input[name="email"]'),
        formPhone: panel.querySelector('input[name="phone"]'),
        formMessage: panel.querySelector('.form-textarea'),
        formError: panel.querySelector('.form-error'),
        formSubmit: panel.querySelector('.form-submit'),
        // Chat
        chatMessages: panel.querySelector('.chat-messages'),
        typingIndicator: panel.querySelector('.typing-indicator'),
        chatInput: panel.querySelector('.chat-input'),
        chatSend: panel.querySelector('.chat-send'),
        // Header
        panelTitle: panel.querySelector('.panel-title'),
        panelSubtitle: panel.querySelector('.panel-subtitle'),
      };
    }

    /* ── Event bindings ── */
    _bindEvents() {
      // Bubble click
      this.els.bubble.addEventListener('click', () => this._toggle());

      // Panel close
      this.els.closeBtn.addEventListener('click', () => this._toggle());

      // Home cards
      this.els.cardChat.addEventListener('click', () => {
        if (this.api.conversationId && this.state.messages.length) {
          this._showScreen('chat');
          this._renderMessages();
        } else {
          this._showScreen('prechat');
        }
      });
      this.els.cardArticles.addEventListener('click', () => window.open(CFG.helpUrl, '_blank'));
      this.els.cardFaq.addEventListener('click', () => window.open(CFG.faqUrl, '_blank'));

      // Pre-chat back
      this.els.prechatBack.addEventListener('click', () => this._showScreen('home'));

      // Form submit
      this.els.formSubmit.addEventListener('click', () => this._submitForm());

      // Chat send
      this.els.chatSend.addEventListener('click', () => this._sendMessage());

      // Chat input — enter to send, shift+enter for newline
      this.els.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this._sendMessage();
        }
      });

      // Auto-resize textarea
      this.els.chatInput.addEventListener('input', () => {
        const el = this.els.chatInput;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
      });
    }

    /* ── Panel toggle ── */
    _toggle() {
      this.state.isOpen = !this.state.isOpen;

      if (this.state.isOpen) {
        this.els.panel.classList.remove('hidden');
        this.els.bubble.classList.add('open');
        this.state.unreadCount = 0;
        this._updateBadge();

        // Decide which screen to show
        if (this.api.conversationId && this.state.messages.length) {
          this._showScreen('chat');
          this._renderMessages();
          this._scrollToBottom();
        } else {
          this._showScreen('home');
        }

        // Show recent conversation on home if exists
        this._updateRecentConversation();
      } else {
        this.els.panel.classList.add('hidden');
        this.els.bubble.classList.remove('open');
      }
    }

    /* ── Screen management ── */
    _showScreen(name) {
      Object.values(this.els.screens).forEach(s => s.classList.remove('active'));
      if (this.els.screens[name]) this.els.screens[name].classList.add('active');
      this.state.screen = name;

      if (name === 'chat') {
        setTimeout(() => {
          this._scrollToBottom();
          this.els.chatInput.focus();
        }, 100);
      }
    }

    /* ── Pre-chat form ── */
    async _submitForm() {
      const name = this.els.formName.value.trim();
      const email = this.els.formEmail.value.trim();
      const phone = this.els.formPhone.value.trim();
      const message = this.els.formMessage.value.trim();

      // Validate
      if (!name || !email || !message) {
        this._showFormError('Please fill in all required fields.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this._showFormError('Please enter a valid email address.');
        return;
      }

      this._showFormError('');
      this.els.formSubmit.disabled = true;
      this.els.formSubmit.innerHTML = '<span class="loading-spinner"></span>';

      try {
        this.state.contact = { name, email, phone };

        // Create conversation with first message
        const convData = await this.api.createConversation(this.state.contact, message);

        // Add customer message to local state
        this.state.messages.push({
          id: Date.now(),
          content: message,
          message_type: 0, // customer
          created_at: new Date().toISOString(),
          sender: { name },
        });

        this._saveState();
        this.api.connectWebSocket();

        // Switch to chat
        this._showScreen('chat');
        this._renderMessages();
      } catch(e) {
        this._showFormError('Could not start chat. Please try again.');
        console.error('[MarsAI Widget]', e);
      } finally {
        this.els.formSubmit.disabled = false;
        this.els.formSubmit.textContent = 'Start chat';
      }
    }

    _showFormError(msg) {
      this.els.formError.textContent = msg;
      this.els.formError.style.display = msg ? 'block' : 'none';
    }

    /* ── Send message ── */
    async _sendMessage() {
      const content = this.els.chatInput.value.trim();
      if (!content || this.state.loading) return;

      this.state.loading = true;
      this.els.chatSend.disabled = true;

      // Add to local messages
      this.state.messages.push({
        id: Date.now(),
        content,
        message_type: 0,
        created_at: new Date().toISOString(),
        sender: { name: this.state.contact.name || 'You' },
      });

      this.els.chatInput.value = '';
      this.els.chatInput.style.height = 'auto';
      this._renderMessages();
      this._scrollToBottom();

      try {
        await this.api.sendMessage(content);
        this._saveState();
      } catch(e) {
        console.error('[MarsAI Widget] Send error:', e);
      } finally {
        this.state.loading = false;
        this.els.chatSend.disabled = false;
        this.els.chatInput.focus();
      }
    }

    /* ── Handle incoming agent message ── */
    _handleAgentMessage(m) {
      // Deduplicate
      if (this.state.messages.some(x => x.id === m.id)) return;

      this.state.messages.push({
        id: m.id,
        content: m.content,
        message_type: 1,
        created_at: m.created_at,
        sender: m.sender || { name: this.state.agentName },
      });

      this._setTyping(false);
      this._saveState();

      if (this.state.isOpen && this.state.screen === 'chat') {
        this._renderMessages();
        this._scrollToBottom();
      } else {
        this.state.unreadCount++;
        this._updateBadge();
      }

      // Update agent name if provided
      if (m.sender && m.sender.name) {
        this.state.agentName = m.sender.name;
      }
    }

    /* ── Typing indicator ── */
    _setTyping(isTyping) {
      this.state.isTyping = isTyping;
      if (this.els.typingIndicator) {
        this.els.typingIndicator.classList.toggle('hidden', !isTyping);
      }
      if (isTyping) this._scrollToBottom();
    }

    /* ── Render messages ── */
    _renderMessages() {
      const container = this.els.chatMessages;
      container.innerHTML = '';

      this.state.messages.forEach((m, i) => {
        const isAgent = m.message_type === 1;
        const div = document.createElement('div');
        div.className = `msg ${isAgent ? 'agent' : 'customer'}`;

        const senderName = m.sender?.name || (isAgent ? this.state.agentName : 'You');
        const time = this._formatTime(m.created_at);
        const isNew = i === this.state.messages.length - 1 && isAgent;

        div.innerHTML = `
          ${isAgent ? `<div class="msg-avatar">${ICONS.bot}</div>` : ''}
          <div class="msg-body">
            <span class="msg-sender">${this._escapeHtml(senderName)}</span>
            <div class="msg-content${isNew ? ' new' : ''}">${this._formatContent(m.content)}</div>
            <span class="msg-time">${time}</span>
          </div>
        `;
        container.appendChild(div);
      });
    }

    /* ── Badge ── */
    _updateBadge() {
      const badge = this.els.badge;
      if (this.state.unreadCount > 0) {
        badge.textContent = this.state.unreadCount > 9 ? '9+' : this.state.unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    /* ── Recent conversation on home ── */
    _updateRecentConversation() {
      const section = this.els.recentSection;
      if (!this.api.conversationId || !this.state.messages.length) {
        section.innerHTML = '';
        return;
      }
      const last = this.state.messages[this.state.messages.length - 1];
      const preview = (last.content || '').substring(0, 60) + ((last.content || '').length > 60 ? '...' : '');
      section.innerHTML = `
        <div class="home-recent-label">Recent conversation</div>
        <div class="home-card" data-action="resume">
          <div class="home-card-icon history">💬</div>
          <div class="home-card-text">
            <div class="home-card-title">Continue conversation</div>
            <div class="home-card-desc">${this._escapeHtml(preview)}</div>
          </div>
          <span class="home-card-arrow">→</span>
        </div>
      `;
      section.querySelector('[data-action="resume"]').addEventListener('click', () => {
        this._showScreen('chat');
        this._renderMessages();
      });
    }

    /* ── Helpers ── */
    _scrollToBottom() {
      const el = this.els.chatMessages;
      if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    }

    _formatTime(iso) {
      if (!iso) return '';
      try {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch(e) { return ''; }
    }

    _escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str || '';
      return div.innerHTML;
    }

    _formatContent(content) {
      if (!content) return '';
      // Escape HTML first, then convert basic markdown
      let text = this._escapeHtml(content);
      // Bold: **text**
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic: *text*
      text = text.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
      // Links: [text](url)
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#60A5FA;text-decoration:underline">$1</a>');
      // Line breaks
      text = text.replace(/\n/g, '<br>');
      return text;
    }
  }

  /* ─── Boot ────────────────────────────────────────────── */
  function boot() {
    if (!CFG.token) {
      console.error('[MarsAI Widget] Missing websiteToken. Set window.MarsAI.websiteToken before loading the script.');
      return;
    }
    const widget = new MarsAIWidget();
    window.MarsAI = window.MarsAI || {};
    window.MarsAI.open = () => { if (!widget.state.isOpen) widget._toggle(); };
    window.MarsAI.close = () => { if (widget.state.isOpen) widget._toggle(); };
    window.MarsAI.toggle = () => widget._toggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
