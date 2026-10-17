/* Call Mode — Push-to-Talk Voice Call UI */
(function setupCallMode() {
    'use strict';

    const MIN_RECORD_MS = 350;
    const I18N = {
        call_title: 'Call Mode',
        call_status_idle: 'Ready',
        call_status_recording: 'Listening...',
        call_status_thinking: 'Thinking...',
        call_status_speaking: 'Speaking...',
        call_hint_idle: 'Hold to talk',
        call_hint_recording: 'Release to send',
        call_hint_thinking: 'Please wait...',
        call_hint_speaking: 'AI is speaking',
        call_mute: 'Mute',
        call_unmute: 'Unmute',
        call_auto: 'Auto',
        call_hangup: 'End call',
        call_perm_denied: 'Cannot access microphone',
        call_error: 'Voice recognition failed',
        call_start: 'Start call',
    };
    const tr = (key) => {
        if (typeof window.t === 'function') {
            const v = window.t(key);
            if (v && v !== key) return v;
        }
        return I18N[key] || key;
    };

    let mediaRecorder = null;
    let stream = null;
    let chunks = [];
    let recordStartedAt = 0;
    let isRecording = false;
    let isThinking = false;
    let isSpeaking = false;
    let isMuted = false;
    let isAutoMode = false;

    let modal, statusBar, statusText, transcriptEl;
    let micBtn, micHint, muteBtn, autoBtn, hangupBtn, closeBtn, fab;
    let currentAudio = null;

    function pickMimeType() {
        const candidates = [
            'audio/webm;codecs=opus', 'audio/webm',
            'audio/ogg;codecs=opus', 'audio/mp4',
        ];
        for (const m of candidates) {
            if (window.MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) return m;
        }
        return '';
    }

    function stopStream() {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
    }

    function setState(state) {
        isRecording = (state === 'recording');
        isThinking = (state === 'thinking');
        isSpeaking = (state === 'speaking');
        if (!statusBar) return;
        statusBar.classList.remove('state-recording', 'state-thinking', 'state-speaking');
        micBtn.classList.remove('recording', 'thinking', 'speaking');
        let statusKey, hintKey;
        if (state === 'recording') {
            statusBar.classList.add('state-recording');
            micBtn.classList.add('recording');
            micBtn.innerHTML = '<i class="fas fa-stop"></i>';
            statusKey = 'call_status_recording';
            hintKey = 'call_hint_recording';
        } else if (state === 'thinking') {
            statusBar.classList.add('state-thinking');
            micBtn.classList.add('thinking');
            micBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            statusKey = 'call_status_thinking';
            hintKey = 'call_hint_thinking';
        } else if (state === 'speaking') {
            statusBar.classList.add('state-speaking');
            micBtn.classList.add('speaking');
            micBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            statusKey = 'call_status_speaking';
            hintKey = 'call_hint_speaking';
        } else {
            micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            statusKey = 'call_status_idle';
            hintKey = 'call_hint_idle';
        }
        if (statusText) statusText.textContent = tr(statusKey);
        if (micHint) micHint.textContent = tr(hintKey);
    }

    function addBubble(text, role) {
        if (!transcriptEl) return;
        const div = document.createElement('div');
        div.className = 'call-bubble call-bubble-' + role;
        div.textContent = text;
        transcriptEl.appendChild(div);
        requestAnimationFrame(() => {
            transcriptEl.scrollTop = transcriptEl.scrollHeight;
        });
    }

    async function startRecording() {
        if (isThinking || isSpeaking || isRecording) return;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            addBubble(tr('call_perm_denied'), 'system');
            return;
        }
        chunks = [];
        const mimeType = pickMimeType();
        try {
            mediaRecorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
        } catch (e) {
            stopStream();
            addBubble(tr('call_error') + ': ' + e.message, 'system');
            return;
        }
        mediaRecorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };
        mediaRecorder.onstop = () => {
            stopStream();
            const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
            if (blob.size < 256) { setState('idle'); return; }
            uploadRecording(blob);
        };
        mediaRecorder.start(250);
        recordStartedAt = Date.now();
        setState('recording');
    }

    function stopRecording() {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
        const elapsed = Date.now() - recordStartedAt;
        if (elapsed < MIN_RECORD_MS) {
            setTimeout(() => {
                if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
            }, MIN_RECORD_MS - elapsed);
        } else {
            mediaRecorder.stop();
        }
    }

    async function uploadRecording(blob) {
        setState('thinking');
        const fd = new FormData();
        const mt = (blob.type || 'audio/webm').split(';')[0];
        const extMap = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3' };
        const ext = extMap[mt] || 'webm';
        fd.append('file', blob, 'recording.' + ext);
        try {
            const resp = await fetch('/api/voice/asr', { method: 'POST', body: fd });
            const data = await resp.json();
            if (data.status === 'success' && data.text) {
                addBubble(data.text, 'user');
                if (typeof window.sendVoiceMessage === 'function') {
                    window.sendVoiceMessage(data.text, data.audio_url);
                }
                waitForAiReply();
            } else {
                addBubble(data.message || tr('call_error'), 'system');
                setState('idle');
            }
        } catch (e) {
            addBubble(tr('call_error') + ': ' + e.message, 'system');
            setState('idle');
        }
    }

    function waitForAiReply() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) { setState('idle'); return; }
        
        // นับข้อความ bot-message-group ปัจจุบัน
        const initialCount = chatMessages.querySelectorAll('.bot-message-group').length;
        let done = false;
        
        const finish = () => {
            if (done) return;
            done = true;
            observer.disconnect();
            clearTimeout(timeoutId);
            setState('idle');
        };
        
        const timeoutId = setTimeout(finish, 30000);
        
        const observer = new MutationObserver((mutations) => {
            // ตรวจว่ามี bot-message-group ใหม่เพิ่มขึ้นไหม
            const currentCount = chatMessages.querySelectorAll('.bot-message-group').length;
            if (currentCount > initialCount) {
                // มีข้อความใหม่! ดึง text
                const allBots = chatMessages.querySelectorAll('.bot-message-group');
                const lastBot = allBots[allBots.length - 1];
                let text = '';
                if (lastBot) {
                    // พยายามหาข้อความใน .markdown-body หรือ text ปกติ
                    const mdBody = lastBot.querySelector('.markdown-body, .prose');
                    text = (mdBody ? mdBody.textContent : lastBot.textContent) || '';
                    text = text.trim();
                }
                if (text) {
                    addBubble(text, 'ai');
                    // เล่นเสียง TTS อัตโนมัติ
                    playTtsForText(text);
                    finish();
                }
            }
        });
        
        observer.observe(chatMessages, { childList: true, subtree: true });
    }
    
    function playTtsForText(text) {
        if (isMuted) return;
        if (!text) return;
        setState('speaking');
        // เรียก API TTS
        fetch('/api/voice/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, agent_id: window.currentAgentId || '' }),
        })
        .then(r => r.json())
        .then(data => {
            if (data && data.url) {
                const audio = new Audio(data.url);
                currentAudio = audio;
                audio.onended = () => { setState('idle'); currentAudio = null; };
                audio.onerror = () => { setState('idle'); currentAudio = null; };
                audio.play().catch(e => { 
                    console.warn('[Call] play failed:', e); 
                    setState('idle'); 
                });
            } else {
                setState('idle');
            }
        })
        .catch(e => {
            console.warn('[Call] tts failed:', e);
            setState('idle');
        });
    }

    function attachMicEvents() {
        micBtn.addEventListener('mousedown', (e) => {
            if (isAutoMode) return;
            e.preventDefault();
            startRecording();
        });
        micBtn.addEventListener('mouseup', (e) => {
            if (isAutoMode) return;
            e.preventDefault();
            if (isRecording) stopRecording();
        });
        micBtn.addEventListener('mouseleave', () => {
            if (isAutoMode) return;
            if (isRecording) stopRecording();
        });
        micBtn.addEventListener('touchstart', (e) => {
            if (isAutoMode) return;
            e.preventDefault();
            startRecording();
        }, { passive: false });
        micBtn.addEventListener('touchend', (e) => {
            if (isAutoMode) return;
            e.preventDefault();
            if (isRecording) stopRecording();
        }, { passive: false });
        micBtn.addEventListener('click', () => {
            if (!isAutoMode) return;
            if (isRecording) stopRecording();
            else if (!isThinking && !isSpeaking) startRecording();
        });
    }

    function buildFab() {
        fab = document.createElement('button');
        fab.id = 'call-fab';
        fab.setAttribute('data-tooltip', tr('call_start'));
        fab.innerHTML = '<i class="fas fa-phone"></i>';
        fab.addEventListener('click', openModal);
        document.body.appendChild(fab);
    }

    function buildModal() {
        modal = document.createElement('div');
        modal.id = 'call-modal';
        modal.innerHTML = ''
            + '<div class="call-panel">'
            + '  <div class="call-header">'
            + '    <div class="call-title"><i class="fas fa-phone"></i><span>' + tr('call_title') + '</span></div>'
            + '    <button class="call-close" data-role="close"><i class="fas fa-times"></i></button>'
            + '  </div>'
            + '  <div class="call-status"><span class="call-status-dot"></span><span data-role="status-text">' + tr('call_status_idle') + '</span></div>'
            + '  <div class="call-transcript" data-role="transcript"></div>'
            + '  <div class="call-controls">'
            + '    <button class="call-mic" data-role="mic"><i class="fas fa-microphone"></i></button>'
            + '    <div class="call-mic-hint" data-role="mic-hint">' + tr('call_hint_idle') + '</div>'
            + '    <div class="call-controls-row">'
            + '      <button class="call-ctrl-btn" data-role="mute" data-tooltip="' + tr('call_mute') + '"><i class="fas fa-microphone-slash"></i></button>'
            + '      <button class="call-ctrl-btn" data-role="auto" data-tooltip="' + tr('call_auto') + '"><i class="fas fa-play"></i></button>'
            + '      <button class="call-ctrl-btn call-hangup" data-role="hangup" data-tooltip="' + tr('call_hangup') + '"><i class="fas fa-phone-slash"></i></button>'
            + '    </div>'
            + '  </div>'
            + '</div>';
        document.body.appendChild(modal);

        statusBar = modal.querySelector('.call-status');
        statusText = modal.querySelector('[data-role="status-text"]');
        transcriptEl = modal.querySelector('[data-role="transcript"]');
        micBtn = modal.querySelector('[data-role="mic"]');
        micHint = modal.querySelector('[data-role="mic-hint"]');
        muteBtn = modal.querySelector('[data-role="mute"]');
        autoBtn = modal.querySelector('[data-role="auto"]');
        hangupBtn = modal.querySelector('[data-role="hangup"]');
        closeBtn = modal.querySelector('[data-role="close"]');

        closeBtn.addEventListener('click', closeModal);
        hangupBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
        });

        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            muteBtn.classList.toggle('active', isMuted);
            muteBtn.querySelector('i').className = isMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
        });

        autoBtn.addEventListener('click', () => {
            isAutoMode = !isAutoMode;
            autoBtn.classList.toggle('active', isAutoMode);
            autoBtn.querySelector('i').className = isAutoMode ? 'fas fa-pause' : 'fas fa-play';
        });

        attachMicEvents();
    }

    function openModal() {
        if (!modal) buildModal();
        modal.classList.add('open');
        transcriptEl.innerHTML = '';
        addBubble(tr('call_start') + '...', 'system');
        setState('idle');
    }

    function closeModal() {
        if (isRecording) stopRecording();
        stopStream();
        if (currentAudio) { currentAudio.pause(); currentAudio = null; }
        modal.classList.remove('open');
        setState('idle');
    }

    function init() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia
            || typeof window.MediaRecorder === 'undefined') return;
        buildFab();
        buildModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
