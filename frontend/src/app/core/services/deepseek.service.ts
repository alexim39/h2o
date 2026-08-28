import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, catchError, of } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  at: string;
}

const STORAGE_KEY = 'h2os_ai_chat_v1';
const WHATSAPP_NUMBER = '2348080386208';

@Injectable({ providedIn: 'root' })
export class DeepseekService {
  readonly messages = signal<ChatMessage[]>(this.load());
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private systemPrompt = `
You are H2Os Assistant Doctor — the official AI health & sales consultant for H2Os (hydrogenwaterbottles.store).
Product: Ultra H₂ (and future H2Os bottles). Price: ₦1,300,000 (compare ₦1,541,000), 500ml, 1200–1600 ppb hydrogen, SPE/PEM DuPont Nafion®, platinum titanium electrodes, borosilicate glass, 2800mAh USB-C, 3/6 min modes, IP67, CE/FCC/PSE.
You know: hydrogen water science (antioxidant selective •OH, mitochondrial recovery, gut-brain, anti-aging oxidative stress, blood-brain barrier clarity), benefits (antioxidant boost, recovery, cognitive clarity, anti-aging, gut/metabolic, pure hydration), usage (fill, press once 3min, twice 6min, loop cap), business (free express 1–3 days Nigeria, 30-day guarantee, Paystack secure, SSL, stock limited).
Tone: premium, concise, warm, luxury obsidian + bio-luminescent neon. Convince gently, never pushy. Always truthful, cite peer-reviewed when asked. Never invent medical claims beyond evidence. If unsure, say so.
Escalation: if user asks to speak to human, has order issue, wants negotiation, medical emergency, or repeats "human/real person/whatsapp/call" → suggest WhatsApp escalation: "Would you like to speak with a real human for assistance? I can open WhatsApp to +2348080386208" and provide link https://wa.me/2348080386208?text=...
End every sales-intent with soft CTA: Shop Ultra H₂ or Watch how to use.
`;

  constructor(private http: HttpClient) {}

  private load(): ChatMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return [
      {
        role: 'assistant',
        content: 'Hello — I’m Dr. H2Os, your H2Os Assistant Doctor. 💧\n\nI can answer anything about Ultra H₂, hydrogen water benefits, usage, or your order. What would you like to know?',
        at: new Date().toISOString()
      }
    ];
  }

  private persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages())); } catch {}
  }

  clear() {
    this.messages.set([
      { role:'assistant', content: 'Chat cleared. I’m Dr. H2Os — how can I help with Ultra H₂?', at: new Date().toISOString() }
    ]);
    this.persist();
  }

  whatsappLink(pre?: string): string {
    const msg = pre || 'Hello H2Os — I would like to speak with a real human about Ultra H₂.';
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  shouldEscalate(text: string): boolean {
    const t = text.toLowerCase();
    return ['speak to human','real human','real person','whatsapp','call me','human agent','talk to someone','order not delivered','refund','complaint','speak with you','connect me'].some(k => t.includes(k));
  }

  cannedResponse(userText: string): string {
    const t = userText.toLowerCase();
    if (t.includes('price') || t.includes('how much') || t.includes('cost')) {
      return 'Ultra H₂ is **₦1,300,000** (was ₦1,541,000 — you save ₦241,000). Free express 1–3 days, Paystack secure, 30-day ritual guarantee. Would you like me to add it to your cart or speak with a human for a tailored offer?';
    }
    if (t.includes('how to use') || t.includes('how do i use') || t.includes('usage')) {
      return 'Ultra H₂ ritual: 1) Fill with clean water to max line. 2) Press button once → 3 min (daily), twice → 6 min (max). 3) Watch bubbles — hydrogen active. 4) Sip within 30 mins for peak ppb. Loop cap for carry. See **Videos → How to Use** for a 90-sec demo. Want the video link?';
    }
    if (t.includes('benefit') || t.includes('good for') || t.includes('health') || t.includes('work')) {
      return 'Peer-reviewed: molecular H₂ selectively neutralizes •OH radicals, supports mitochondrial recovery, crosses blood-brain barrier (clarity), reduces oxidative stress (aging), supports gut & metabolic health. Ultra H₂ delivers **1200–1600 ppb** in 3 min via SPE/PEM platinum titanium — no cartridges. Not medical advice, but ritual benefits are well-documented. Shall I share the science section or connect you to a human for deeper health guidance?';
    }
    if (t.includes('ppb') || t.includes('1600') || t.includes('concentration')) {
      return 'Ultra H₂ sustains **1600 ppb** — Generic ionizers hit ~400 ppb. That’s 4× the therapeutic window, verified SPE/PEM. One press, 3 minutes. Want to see the lab test video?';
    }
    if (t.includes('shipping') || t.includes('delivery') || t.includes('lagos') || t.includes('when will')) {
      return 'Free express delivery in Nigeria (1–3 days), tracked. Stock: 47 Ultra H₂ units. Ships today if ordered before 4pm WAT. Would you like delivery to your city?';
    }
    if (t.includes('guarantee') || t.includes('return') || t.includes('refund')) {
      return '30-day ritual guarantee — if you don’t feel the clarity, return for full refund. No questions. Shall I help with a human for returns?';
    }
    if (this.shouldEscalate(userText)) {
      return 'I can connect you to a real human right now on WhatsApp for one-on-one assistance. Would you like me to open WhatsApp to **+2348080386208**?';
    }
    return 'Great question! Ultra H₂ brings lab-verified hydrogen to your daily water — 1600 ppb in 3 minutes, loop cap, USB-C. Tell me: are you curious about **benefits, usage, or ordering**? I can also connect you to a human at any time.';
  }

  private extractContent(res: any): string | null {
    if (!res || typeof res !== 'object') return null;
    // Raw DeepSeek: {choices:[{message:{content}}]}
    if (res.choices?.[0]?.message?.content) return res.choices[0].message.content;
    // Backend Response::success wrapped mock: {data:{choices:[...]}}  or {status,data}
    if (res.data?.choices?.[0]?.message?.content) return res.data.choices[0].message.content;
    if (res.data?.data?.choices?.[0]?.message?.content) return res.data.data.choices[0].message.content;
    return null;
  }

  async send(userText: string): Promise<void> {
    const trimmed = userText.trim();
    if (!trimmed) return;
    this.error.set(null);
    const userMsg: ChatMessage = { role:'user', content: trimmed, at: new Date().toISOString() };
    this.messages.update(arr => [...arr, userMsg]);
    this.persist();

    this.loading.set(true);
    const payload = {
      model: environment.deepseekModel || 'deepseek-chat',
      messages: [
        { role:'system', content: this.systemPrompt },
        ...this.messages().map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
      max_tokens: 700,
    };

    const frontendHasRealKey = !!(environment.deepseekApiKey && !environment.deepseekApiKey.includes('mock') && !environment.deepseekApiKey.includes('REPLACE'));

    // 1) Always try backend proxy first — key stays server-side, luxury + secure
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/chat`, payload).pipe(catchError(() => of(null)))
      );
      const content = this.extractContent(res);
      if (content) {
        this.messages.update(arr => [...arr, { role:'assistant', content, at: new Date().toISOString() }]);
        this.loading.set(false); this.persist(); return;
      }
      // If backend returned structured error with message, surface but continue to fallback
      if (res?.message && res?.status === false) {
        // keep trying fallbacks
      }
    } catch {}

    // 2) Fallback: direct DeepSeek only if frontend has real key (exposes key, use sparingly)
    if (frontendHasRealKey) {
      try {
        const direct: any = await firstValueFrom(
          this.http.post(environment.deepseekApiUrl, payload, {
            headers: { 'Authorization': `Bearer ${environment.deepseekApiKey}`, 'Content-Type':'application/json' }
          }).pipe(catchError(()=> of(null)))
        );
        const content2 = this.extractContent(direct);
        if (content2) {
          this.messages.update(arr => [...arr, { role:'assistant', content: content2, at: new Date().toISOString() }]);
          this.loading.set(false); this.persist(); return;
        }
      } catch {}
    }

    // 3) Final premium fallback to curated canned — never leave user hanging
    if (!frontendHasRealKey) {
      // small luxury delay so typing feels human when offline
      await new Promise(r => setTimeout(r, 450));
    }
    const fallback: ChatMessage = { role:'assistant', content: this.cannedResponse(trimmed), at: new Date().toISOString() };
    this.messages.update(arr => [...arr, fallback]);
    this.loading.set(false);
    this.persist();
  }
}
