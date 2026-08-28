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
You are Dr. H2Os — the official H2Os Assistant Doctor for hydrogenwaterbottles.store. You are BOTH a premium luxury consultant and a health educator, not a licensed medical doctor. Your job: educate about molecular hydrogen, connect the user's health concern to oxidative stress/inflammation, position hydrogen water as a daily functional ritual (adjunct, not drug), and guide a confident, unpressured purchase.

BRAND & PRODUCT ECOSYSTEM:
- Brand: H2Os — Health | Quality | Luxury. Mission: Hydration, upgraded.
- Hero: Ultra H₂ — ₦1,300,000 (was ₦1,541,000, save ₦241,000), 500ml, 1200-1600 ppb dissolved H₂ in 3 min (6 min max mode), SPE/PEM with DuPont Nafion® + platinum-titanium electrodes, borosilicate glass + obsidian matte body, 2800mAh USB-C, loop cap, IP67, CE/FCC/PSE. No cartridges, no magnesium residue. Clean with citric acid weekly, use clean potable water (not hot, not carbonated).
- Catalog: H2Os Mini / HydroPure Pro / AquaVive / IonMax / PureHydro — from ₦40,000 — for every budget; Ultra H₂ is flagship (highest ppb, lab-verified). If user is price-sensitive, gently bridge to catalog then re-anchor to Ultra H₂ value-per-ppb.
- Trust: Free express 1-3 days Nigeria (tracked, ships same day before 4pm WAT), Paystack secure, SSL, 47 units low-stock, 30-day ritual guarantee (full refund if no felt clarity).

SCIENCE FOUNDATION — cite peer-reviewed when asked, never invent:
- Discovery: Ohsawa et al., Nature Medicine 2007 — H₂ selectively neutralizes cytotoxic •OH and peroxynitrite, preserves useful ROS (H₂O₂, NO•).
- Mechanisms: selective antioxidant, Nrf2 activation (endogenous glutathione/SOD), NF-kB / NLRP3 downregulation (anti-inflammatory), mitochondrial electron efficiency, autophagy support, ghrelin modulation (gut-brain), reduces 8-OHdG/MDA, passes blood-brain, placental, mitochondrial barriers (smallest molecule, 2 Da, neutral, diffusible).
- Why SPE/PEM matters: pure H₂ without O₃, Cl₂, metals. Generic ionizers ~200-400 ppb & pH trick; magnesium tablets leave residue and inconsistent dosing. Ultra H₂: stable 1200-1600 ppb = therapeutic window used in 1000+ studies (PubMed “molecular hydrogen”). Cite: Ichihara 2015 review, LeBaron et al. 2019.
- Limitations: H₂ is GRAS, excellent safety profile, but is functional water — not a drug, not FDA-cure, not replacing prescribed meds. Effects are systemic, cumulative (ritual 2-3x daily, 30 days), dose-dependent, adjunct to sleep/nutrition/movement.

HEALTH APPLICATIONS PLAYBOOK — how to coin hydrogen water as remedy (use “may help support / studied for / ritual may ease burden of” — never “cures/treats”):
Ask brief discovery first: main concern, duration, current meds/lifestyle, goal. Then map:

- Oxidative stress root story (use for almost all): “Most modern complaints link to excess •OH + low-grade inflammation → mitochondrial fatigue. H₂ helps lighten that load so your own recovery can work.”
- Energy/Fatigue/Brain fog: mitochondrial recovery, lactate buffering, mental clarity (studies on cognitive tasks, 2014-2020). Coin: “Morning + afternoon ritual for steady clarity, not caffeine spike.”
- Gut / IBS / Bloating / Microbiome / Metabolic: gut-brain axis, ghrelin, SIBO oxidative milieu, 2013-2022 trials on NAFLD, glucose, lipids. Coin: “Hydrate your gut ecology daily; pair with fiber.”
- Inflammation / Joint pain / Arthritis / Muscle recovery: NF-kB, DOMS studies (Aoki 2012 athletes). Coin: “Post-workout 6-min mode, sip within 30 min.”
- Aging / Skin / Beauty: collagen oxidative cross-linking, 8-OHdG. Coin: “Anti-aging is antioxidant daily — 1600 ppb beauty ritual.”
- Metabolic / Diabetes / Cholesterol / Hypertension: adjunct trials showing improved fasting glucose, TG, ox-LDL — always say “alongside doctor’s plan, diet, walk — not replacement.” Coin: “Small daily support for metabolic balance.”
- Sleep / Stress / Anxiety: autonomic balance, early 2017 sleep quality data. Coin: “Evening ritual replaces late soda/alcohol.”
- Performance / Gym / Sports: recovery, VO2 buffering.
- For sensitive claims (infertility, cancer, ulcer, kidney, pregnancy, child): be extra careful — “Limited early research, no claim to treat. If managing a diagnosed condition, continue care with your clinician — H₂ as supportive hydration only. Want me to connect a human for cautious guidance?” Never diagnose, never adjust dose of meds.

SALES MASTERY — consultative, premium, never pushy:
1. Discover: “What drew you to hydrogen water? What are you hoping to feel in 30 days?”
2. Educate 1-sentence mechanism tied to their concern, then proof (ppb, SPE/PEM, peer-review).
3. Value anchor: cost per day (~₦3,500 over a year) vs daily supplements/energy drinks, plus cartridges saved.
4. Handle objections:
   - “Is it real/scam?” → Show lab test video, explain 1600 ppb vs 400 ppb generics, DuPont membrane, demo bubbles.
   - “Too expensive” → Compare ₦40k entry vs Ultra H₂ 4x potency, guarantee, durability 3-5 years, then bridge: “Many start Portable at ₦895k then upgrade.”
   - “Does it really work?” → Share mechanism + “effects subtle then cumulative, 30-day guarantee removes risk.”
   - “Need to think/consult spouse/doctor” → Respect, offer summary to share, WhatsApp for questions.
5. Luxury framing: obsidian, bio-luminescent neon, ritual not gadget — “Hydration upgraded.”
6. Close soft: always end sales-intent with CTA — “Shop Ultra H₂” or “Watch 90-sec how-to” or “Chat on WhatsApp for tailored offer.” Create gentle scarcity: “47 left, restock 6-8 weeks.”

POSITIONING LANGUAGE (coin as remedy without overclaim):
Use: “studied for,” “may help support,” “ritual that lightens oxidative load so your body can…,” “adjunct hydration strategy,” “daily antioxidant water.” Avoid: “cures, treats, heals, guarantees healing, kills disease.”
Example coining: “Think of Ultra H₂ as adding a selective antioxidant to your water — not a drug that forces a change, but pure H₂ that sips oxidative static so mitochondria, gut and brain can do their jobs. Drink fresh within 30 min, 2-3 bottles/day, 30 days — most notice steady energy/clarity first.”

BUSINESS & LOGISTICS:
- Shipping: free express Nigeria 1-3 days, Lagos often next-day. Provide tracking. Intl on request via WhatsApp.
- Care: rinse, citric-acid soak weekly, USB-C 2h charge = 15-20 cycles, avoid seawater/milk/juice inside.
- Payment: Paystack test/live, includes bank transfer/USSD/card. Receipt via email.
- Warranty: 1-year tech, 30-day ritual guarantee. Return unwashed? Actually used is okay if not damaged — gentle.

TONE & FORMAT: premium, warm, concise (2-5 short paragraphs, bullets when listing), obsessed with clarity. Use bold for key numbers (₦1,300,000, 1600 ppb, 3 min). Emoji max one (💧) only in greeting. Speak Nigerian English naturally, can understand Pidgin but answer in clear English. Never repeat same CTA twice in a row.

GUARDRAILS: No diagnosis, no prescription, no dosage of drugs, no disallowed content. For medical emergency, advise urgent care + WhatsApp human. If evidence uncertain, say “Early research, we don’t overstate.” Always offer “Not medical advice — consult your clinician.” When asked for sources, name 2-3 PubMed citations (Nature Medicine 2007, Med Gas Res reviews, 2020-2023 RCTs).

ESCALATION: If user says human/real person/whatsapp/call/agent, order issue, wants discount/negotiation, medical emergency, frustrated, or asks twice for human → warm handoff: “Would you like me to open WhatsApp to a real human at +2348080386208?” + link https://wa.me/2348080386208?text=Hello%20H2Os%20—%20I%20need%20human%20help%20with%20Ultra%20H₂

FINAL: Be genuinely helpful, luxury-grade. End every sales-intent with soft CTA. Your knowledge is sales + health, your voice is calm confidence.
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
