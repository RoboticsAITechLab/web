/**
 * Shared Gemini AI for all gym prototypes.
 * Set window.GYM_AI_CONFIG before loading this script (optional for custom UI).
 * Existing pages with #aiChatWindow keep their UI and use fetchGeminiAPI from here.
 */
(function () {
    const geminiApiKey = "";
    const geminiModel = "gemini-3-flash-preview";
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    window.fetchGeminiAPI = async function (promptText, systemInstructionText = "") {
        const payload = { contents: [{ parts: [{ text: promptText }] }] };
        if (systemInstructionText) {
            payload.systemInstruction = { parts: [{ text: systemInstructionText }] };
        }
        let delay = 1000;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await fetch(geminiApiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    if (response.status === 429 && attempt < 3) {
                        await new Promise((r) => setTimeout(r, delay));
                        delay *= 2;
                        continue;
                    }
                    throw new Error("Gemini API status " + response.status);
                }
                const result = await response.json();
                return result?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to parse AI response. Please try again.";
            } catch (err) {
                if (attempt === 3) {
                    console.error("Gemini error:", err);
                    return "Sorry, AI is temporarily unavailable. Please retry in a moment.";
                }
                await new Promise((r) => setTimeout(r, delay));
                delay *= 2;
            }
        }
    };

    window.formatMarkdown = function (text, accentClass) {
        const acc = accentClass || "text-violet-400";
        return String(text)
            .replace(/\*\*(.*?)\*\*/g, `<strong class="${acc} font-bold">$1</strong>`)
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="opacity-80 px-1 rounded text-[11px]">$1</code>')
            .replace(/^\s*-\s+(.*)$/gmu, '<li class="ml-4 list-disc mb-1">$1</li>')
            .replace(/\n\n/g, "<br/><br/>")
            .replace(/\n/g, "<br/>");
    };

    function scrollChatFeed() {
        const feed = document.getElementById("gym-ai-feed");
        if (feed) feed.scrollTop = feed.scrollHeight;
    }

    window.toggleGymAIChat = function () {
        const win = document.getElementById("gym-ai-chat-window");
        if (win) {
            win.classList.toggle("hidden");
            scrollChatFeed();
        }
    };

    window.sendGymAIMessage = async function (presetText) {
        const cfg = window.GYM_AI_CONFIG || {};
        const input = document.getElementById("gym-ai-input");
        const text = (presetText || (input && input.value) || "").trim();
        if (!text) return;
        if (input) input.value = "";

        const feed = document.getElementById("gym-ai-feed");
        const typing = document.getElementById("gym-ai-typing");
        if (!feed) return;

        feed.innerHTML +=
            '<div class="flex gap-2 justify-end"><div class="p-3 rounded-2xl text-xs max-w-[85%] gym-ai-user-bubble">' +
            text +
            "</div></div>";
        scrollChatFeed();

        if (typing) typing.classList.remove("hidden");
        scrollChatFeed();

        const system =
            cfg.systemPrompt ||
            "You are an expert fitness coach. Give concise, actionable advice with bullet points.";
        const raw = await window.fetchGeminiAPI(text, system);
        const html = window.formatMarkdown(raw, cfg.accentClass);

        if (typing) typing.classList.add("hidden");
        feed.innerHTML +=
            '<div class="flex gap-2"><div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] gym-ai-avatar shrink-0">' +
            (cfg.emoji || "🤖") +
            '</div><div class="p-3 rounded-2xl text-xs max-w-[85%] gym-ai-bot-bubble leading-relaxed">' +
            html +
            "</div></div>";
        scrollChatFeed();
    };

    window.askGymAIInline = async function (promptOverride) {
        const cfg = window.GYM_AI_CONFIG || {};
        const input = document.getElementById("gym-ai-inline-input");
        const prompt = (typeof promptOverride === "string" && promptOverride.trim()) ? promptOverride.trim() : (input && input.value.trim());
        if (!prompt) return;

        const loader = document.getElementById("gym-ai-inline-loader");
        const result = document.getElementById("gym-ai-inline-result");
        const btn = document.getElementById("gym-ai-inline-btn");
        if (loader) loader.classList.remove("hidden");
        if (result) result.classList.add("hidden");
        if (btn) btn.disabled = true;

        const raw = await window.fetchGeminiAPI(prompt, cfg.systemPrompt || "");
        if (loader) loader.classList.add("hidden");
        if (result) {
            result.innerHTML = window.formatMarkdown(raw, cfg.accentClass);
            result.classList.remove("hidden");
        }
        if (btn) btn.disabled = false;
    };

    window.initGymAIWidget = function () {
        const cfg = window.GYM_AI_CONFIG;
        if (!cfg || cfg.skipWidget) return;
        if (document.getElementById("aiChatWindow") || document.getElementById("pranaChatWindow") || document.getElementById("forgeChatWindow")) return;
        if (document.getElementById("gym-ai-chat-window")) return;

        const t = cfg.theme || {};
        const launcher = t.launcher || "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center font-bold shadow-lg transition-transform hover:scale-110";
        const launcherStyle = t.launcherBg || "background: linear-gradient(135deg,#8b5cf6,#d946ef); color:white";
        const win = t.window || "fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[520px] rounded-3xl shadow-2xl flex flex-col hidden overflow-hidden border";
        const winExtra = t.windowClass || "bg-zinc-950/95 border-zinc-800 text-zinc-100";

        document.body.insertAdjacentHTML(
            "beforeend",
            `
            <style>
                .gym-ai-user-bubble { ${t.userBubble || "background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.3)"} }
                .gym-ai-bot-bubble { ${t.botBubble || "background:rgba(24,24,27,0.9);border:1px solid rgba(63,63,70,0.8)"} }
                .gym-ai-avatar { ${t.avatar || "background:linear-gradient(135deg,#8b5cf6,#d946ef);color:#fff"} }
            </style>
            <button type="button" onclick="toggleGymAIChat()" class="${launcher}" style="${launcherStyle}" aria-label="Open AI Coach">
                <span class="text-2xl">${cfg.emoji || "🤖"}</span>
            </button>
            <div id="gym-ai-chat-window" class="${win} ${winExtra}">
                <div class="p-4 border-b flex justify-between items-center ${t.headerClass || "bg-zinc-900 border-zinc-800"}">
                    <div>
                        <h4 class="font-bold text-sm">${cfg.coachTitle || cfg.brand + " AI Coach"}</h4>
                        <span class="text-[10px] flex items-center gap-1 ${t.badgeClass || "text-emerald-400"}">
                            <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span> Gemini AI Live
                        </span>
                    </div>
                    <button type="button" onclick="toggleGymAIChat()" class="opacity-60 hover:opacity-100">✕</button>
                </div>
                <div class="p-2 border-b flex flex-wrap gap-1 max-h-16 overflow-y-auto ${t.chipsBar || ""}">
                    ${(cfg.quickPrompts || [])
                        .map((q) => {
                            const safe = q.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                            const label = q.length > 32 ? q.slice(0, 32) + "…" : q;
                            return `<button type="button" onclick="sendGymAIMessage('${safe}')" class="text-[10px] px-2 py-1 rounded-full border whitespace-nowrap ${t.chipClass || "border-zinc-700 text-zinc-400"}">${label}</button>`;
                        })
                        .join("")}
                </div>
                <div id="gym-ai-feed" class="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                    <div class="flex gap-2">
                        <div class="gym-ai-avatar w-6 h-6 rounded-full flex items-center justify-center shrink-0">${cfg.emoji || "🤖"}</div>
                        <div class="gym-ai-bot-bubble p-3 rounded-2xl max-w-[85%]">${cfg.welcome || "Hi! Ask me about workouts, diet, or membership."}</div>
                    </div>
                </div>
                <div id="gym-ai-typing" class="hidden px-4 py-2 text-[10px] animate-pulse ${t.badgeClass || "text-violet-400"}">Coach is thinking…</div>
                <div class="p-3 border-t flex gap-2 ${t.inputBar || "bg-zinc-900 border-zinc-800"}">
                    <input id="gym-ai-input" type="text" placeholder="Ask your AI coach…" class="flex-1 rounded-xl px-3 py-2 text-xs outline-none ${t.inputClass || "bg-zinc-950 border border-zinc-800 text-white"}" onkeypress="if(event.key==='Enter')sendGymAIMessage()">
                    <button type="button" onclick="sendGymAIMessage()" class="px-4 py-2 rounded-xl text-xs font-bold ${t.sendClass || "bg-violet-600 text-white"}">Send</button>
                </div>
            </div>
            `
        );
    };

    document.addEventListener("DOMContentLoaded", function () {
        window.initGymAIWidget();
    });
})();
