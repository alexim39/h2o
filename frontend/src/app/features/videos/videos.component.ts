import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type VideoCategory = 'all' | 'howto' | 'testimonial' | 'learn';

interface VideoItem {
  id: string;
  src?: string; // local mp4
  youtubeId?: string; // YouTube
  title: string;
  category: VideoCategory;
  badge: string;
  desc: string;
  poster?: string;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section">
      <div class="container">
        <div class="head">
          <span class="eyebrow">H2Os • Ultra H₂ in motion</span>
          <h1>Watch. Learn. <em>Feel the ritual.</em></h1>
          <p>Real hydrogen tests, how-tos, human stories — plus curated YouTube science on H₂ benefits. All in one premium theatre, no redirects.</p>

          <div class="tabs">
            <button [class.active]="filter()==='all'" (click)="filter.set('all')">All <span>{{ videos.length }}</span></button>
            <button [class.active]="filter()==='howto'" (click)="filter.set('howto')">How to Use <span>{{ howtoCount() }}</span></button>
            <button [class.active]="filter()==='testimonial'" (click)="filter.set('testimonial')">Testimonials <span>{{ testimonialCount() }}</span></button>
            <button [class.active]="filter()==='learn'" (click)="filter.set('learn')">Learn on YouTube <span>{{ learnCount() }}</span></button>
          </div>

          <div class="howto-cta">
            <span class="pulse"></span>
            <span>New to hydrogen? Start with <strong>How to use</strong> — 90s, then explore <strong>Learn</strong> for benefits.</span>
            <button class="btn-neon sm" (click)="filter.set('howto'); scrollToGrid()">Watch How to →</button>
          </div>
        </div>

        <div #grid class="grid">
          @for (v of filtered(); track v.id) {
            <article class="card glass" (click)="open(v)">
              <div class="thumb" [class.vertical]="isVertical(v)" [class.youtube]="isYoutube(v)">
                @if (isYoutube(v)) {
                  <img [src]="youtubeThumb(v.youtubeId!)" [alt]="v.title" class="yt-thumb" loading="lazy" />
                  <span class="yt-badge">YouTube</span>
                } @else {
                  <video [src]="v.src" muted playsinline preload="metadata"></video>
                }
                <span class="play">▶</span>
                <span class="cat" [class.howto]="v.category==='howto'" [class.learn]="v.category==='learn'">{{ v.badge }}</span>
              </div>
              <div class="body">
                <h3>{{ v.title }}</h3>
                <p>{{ v.desc }}</p>
                <span class="meta">
                  @if (v.category==='howto') { How to • H2Os }
                  @else if (v.category==='learn') { Learn • YouTube • H₂ Science }
                  @else { Testimonial • Verified }
                </span>
              </div>
            </article>
          }
        </div>

        @if (filtered().length===0) {
          <p class="empty">No videos in this category.</p>
        }

        <div class="yt-note glass">
          <span class="yt-icon">▶</span>
          <div>
            <strong>Curated YouTube — watch here, no redirect</strong>
            <p>Tap any <em>Learn</em> card → plays in our premium dialog via YouTube embed. You stay on hydrogenwaterbottles.store — we only embed, we don’t host.</p>
          </div>
          <span class="yt-hint">youtube.com/embed</span>
        </div>

        <div class="cta glass">
          <div>
            <h3>Ready for Ultra H₂?</h3>
            <p>See it. Then feel it. 30-day guarantee — hydration, upgraded.</p>
          </div>
          <a routerLink="/store" class="btn-neon">Shop Ultra H₂ — ₦1,300,000 →</a>
        </div>
      </div>
    </section>

    @if (active(); as vid) {
      <div class="overlay" (click)="close()">
        <div class="modal glass" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div>
              <span class="eyebrow">{{ vid.badge }}</span>
              <h3>{{ vid.title }}</h3>
            </div>
            <button class="close" (click)="close()">×</button>
          </div>
          <div class="video-wrap" [class.vertical]="isVertical(vid)">
            @if (isYoutube(vid)) {
              <iframe [src]="youtubeEmbed(vid.youtubeId!)" title="{{ vid.title }}"
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
            } @else {
              <video [src]="vid.src" controls autoplay playsinline></video>
            }
          </div>
          <p class="modal-desc">{{ vid.desc }}</p>
          @if (isYoutube(vid)) {
            <p class="yt-disclaimer">Source: YouTube — educational only, not medical advice. Opens embedded, stays on H2Os. <a [href]="'https://www.youtube.com/watch?v=' + vid.youtubeId" target="_blank" rel="noopener" class="link">View on YouTube ↗</a></p>
          }
          <div class="modal-actions">
            <a routerLink="/store" class="btn-neon sm" (click)="close()">Shop Ultra H₂</a>
            <a routerLink="/reviews" class="btn-ghost sm" (click)="close()">Community reviews</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    *{ box-sizing: border-box; }
    .head { text-align:center; max-width: 720px; margin: 0 auto 28px; }
    .head h1 { font-family:'Space Grotesk',sans-serif; font-size: clamp(28px,4vw,40px); letter-spacing:-0.02em; }
    .head h1 em { font-style:normal; color:var(--neon); }
    .head p { color:var(--text-secondary); font-size:14px; margin:10px 0 18px; }
    .tabs { display:inline-flex; gap:8px; background: var(--bg-card); border:1px solid var(--border); padding:6px; border-radius:999px; flex-wrap:wrap; justify-content:center; max-width:100%; }
    .tabs button { padding:8px 14px; border-radius:999px; background:transparent; border:none; color:var(--text-secondary); font-weight:700; font-size:12px; display:flex; gap:6px; align-items:center; white-space:nowrap; }
    .tabs button.active { background: var(--neon); color:#050507; box-shadow: var(--neon-glow); }
    .tabs button span { background: rgba(0,0,0,0.08); border-radius:999px; padding:2px 6px; font-size:11px; }
    .tabs button.active span { background: rgba(0,0,0,0.14); color:#050507; }
    .howto-cta { margin-top:14px; display:inline-flex; align-items:center; gap:10px; background: linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,255,136,0.03)); border:1px solid rgba(0,255,136,0.18); border-radius:999px; padding:8px 10px 8px 12px; font-size:12px; color:var(--text-secondary); flex-wrap:wrap; justify-content:center; text-align:center; max-width:100%; }
    .howto-cta strong { color:var(--text-primary); }
    .pulse{ width:8px;height:8px;border-radius:50%;background:var(--neon);box-shadow:0 0 10px var(--neon);animation: pulse 1.6s infinite; flex-shrink:0; }
    @keyframes pulse{ 0%,100%{opacity:1}50%{opacity:0.6} }
    .btn-neon.sm{ padding:8px 14px; font-size:12px; }

    .grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-top:22px; }
    .card { border-radius:18px; overflow:hidden; cursor:pointer; transition:.18s; display:flex; flex-direction:column; border:1px solid rgba(255,255,255,0.06); background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); }
    .card:hover { transform: translateY(-2px); border-color: rgba(0,255,136,0.22); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,255,136,0.06); }
    .thumb { position:relative; background: radial-gradient(420px 220px at 50% 18%, rgba(0,255,136,0.07), transparent 68%), linear-gradient(180deg,#0B0D10 0%, #07080A 100%); overflow:hidden; display:grid; place-items:center; aspect-ratio: 16/9; }
    .thumb.vertical{ aspect-ratio: 9/11; max-height: 240px; }
    .thumb.youtube{ background: #000; }
    .thumb video, .thumb .yt-thumb { width:100%; height:100%; object-fit: contain; display:block; background: transparent; padding:0; }
    .thumb.youtube .yt-thumb{ object-fit: cover; padding:0; }
    .thumb.vertical video, .thumb.vertical .yt-thumb{ object-fit: contain; padding: 8px 0; }
    .play { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:48px;height:48px;border-radius:50%; background: rgba(5,5,7,0.78); border:1px solid rgba(255,255,255,0.14); backdrop-filter: blur(8px); display:grid; place-items:center; color:white; font-size:16px; box-shadow: 0 4px 16px rgba(0,0,0,0.32); }
    .cat { position:absolute; left:10px; bottom:10px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; padding:5px 8px; border-radius:999px; background: rgba(5,5,7,0.82); border:1px solid rgba(255,255,255,0.10); color:var(--text-secondary); max-width: calc(100% - 20px); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cat.howto { background: rgba(0,255,136,0.18); border-color: rgba(0,255,136,0.24); color: var(--neon); }
    .cat.learn { background: rgba(255,0,80,0.16); border-color: rgba(255,0,80,0.22); color: #FF8A9E; }
    .yt-badge{ position:absolute; right:10px; top:10px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; background: #FF0033; color:white; padding:4px 6px; border-radius:6px; font-weight:800; }
    .body { padding:14px; flex:1; display:flex; flex-direction:column; gap:6px; }
    .body h3 { font-size:13px; line-height:1.4; }
    .body p { font-size:12px; color:var(--text-secondary); line-height:1.5; flex:1; }
    .meta { font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .empty { text-align:center; color:var(--text-muted); padding:40px 0; grid-column: 1/-1; }

    .yt-note{ margin-top:18px; border-radius:14px; padding:12px 14px; display:flex; gap:12px; align-items:center; background: rgba(255,0,80,0.06); border:1px solid rgba(255,0,80,0.12); }
    .yt-note .yt-icon{ width:32px; height:32px; border-radius:50%; background:#FF0033; color:white; display:grid; place-items:center; font-size:14px; flex-shrink:0; }
    .yt-note strong{ display:block; font-size:12px; }
    .yt-note p{ font-size:11px; color:var(--text-secondary); margin:2px 0 0; line-height:1.5; }
    .yt-note p em{ font-style:normal; color:var(--text-primary); font-weight:700; }
    .yt-hint{ margin-left:auto; font-family:'JetBrains Mono', monospace; font-size:10px; color:var(--text-muted); white-space:nowrap; }

    .cta { margin-top:24px; border-radius:18px; padding:18px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
    .cta h3{ font-size:16px; }
    .cta p{ font-size:13px; color:var(--text-secondary); }

    .overlay { position:fixed; inset:0; background: rgba(0,0,0,0.78); backdrop-filter: blur(10px); z-index: 80; display:flex; align-items:center; justify-content:center; padding:16px; overflow-y:auto; overflow-x:hidden; }
    .modal { width:100%; max-width:860px; max-height: min(88vh, 860px); border-radius:20px; padding:16px; overflow:auto; display:flex; flex-direction:column; gap:12px; background: rgba(17,19,24,0.96); border:1px solid rgba(255,255,255,0.08); box-shadow: 0 24px 64px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.04); box-sizing:border-box; margin:auto; }
    .modal-head { display:flex; justify-content:space-between; gap:16px; align-items:start; }
    .modal-head h3{ font-size:16px; line-height:1.3; }
    .close{ width:36px;height:36px;border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid var(--border); color:var(--text-primary); font-size:20px; flex-shrink:0; }
    .video-wrap{ position:relative; width:100%; background:#000; border-radius:14px; overflow:hidden; display:grid; place-items:center; min-height: 180px; aspect-ratio: 16/9; }
    .video-wrap.vertical{ aspect-ratio: 9/11; max-height: 66vh; }
    .video-wrap video, .video-wrap iframe{ width:100%; height:100%; aspect-ratio: 16/9; border:none; display:block; background:#000; border-radius:14px; max-width:100%; }
    .video-wrap.vertical iframe, .video-wrap.vertical video{ aspect-ratio: 9/11; }
    .modal-desc{ font-size:13px; color:var(--text-secondary); line-height:1.6; }
    .yt-disclaimer{ font-size:11px; color:var(--text-muted); line-height:1.5; background: rgba(255,255,255,0.02); border:1px solid var(--border); padding:8px 10px; border-radius:10px; }
    .yt-disclaimer .link{ color:var(--neon); text-decoration:underline; }
    .modal-actions{ display:flex; gap:10px; flex-wrap:wrap; }
    .btn-ghost.sm{ padding:8px 14px; font-size:12px; }

    @media(max-width: 960px){ .grid{ grid-template-columns: 1fr 1fr; } .thumb{ aspect-ratio: 16/9; } .thumb.vertical{ aspect-ratio: 9/11; max-height: 220px; } }
    @media(max-width: 640px){
      .grid{ grid-template-columns: 1fr; }
      .tabs{ width:100%; justify-content:center; }
      .howto-cta{ border-radius:16px; padding:10px 12px; width:100%; }
      .thumb{ aspect-ratio: 16/9; }
      .thumb.vertical{ aspect-ratio: 9/11; max-height: 340px; }
      .yt-note{ flex-direction:column; text-align:center; }
      .yt-hint{ margin-left:0; }
      .overlay{ top:112px; inset:112px 0 0 0; padding:24px 12px 16px; align-items:flex-start; justify-content:center; overflow-x:hidden; overflow-y:auto; }
      .modal{ width: calc(100vw - 24px); max-width: calc(100vw - 24px); max-height: calc(100vh - 128px); padding:14px 12px 12px; border-radius:16px; margin:0 auto; box-sizing:border-box; left:0; right:0; transform:none; }
      .modal-head{ padding-top:4px; }
      .close{ width:38px; height:38px; font-size:22px; }
      .video-wrap{ aspect-ratio: 16/9; }
      .video-wrap iframe, .video-wrap video{ max-height: 48vh; max-width:100%; }
      .video-wrap.vertical iframe, .video-wrap.vertical video{ max-height: 54vh; }
    }
  `]
})
export class VideosComponent {
  private sanitizer = inject(DomSanitizer);
  filter = signal<VideoCategory>('all');
  active = signal<VideoItem | null>(null);

  isVertical(v: VideoItem): boolean {
    return ['blister','brain','eye','diabites','reducing-inflamation-testimonial','sexual-performance-testimonial'].some(k => v.id.includes(k) || (v.src && v.src.includes(k)));
  }
  isYoutube(v: VideoItem): boolean { return !!v.youtubeId; }
  youtubeThumb(id: string): string { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }
  youtubeEmbed(id: string): SafeResourceUrl { return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`); }

  videos: VideoItem[] = [
    // H2Os own
    { id:'howto1', src:'/videos/how-to-use-it.mp4', title:'How to use Ultra H₂ — Your 90-sec ritual', category:'howto', badge:'How to Use • 01:34', desc:'Unbox, charge via USB-C, fill with water, press once for 3 min (daily) or twice for 6 min (max). Watch the bubbles.' },
    { id:'hydrogen-test', src:'/videos/hydrogen-h2o-test.mp4', title:'Hydrogen H₂O Test — See the ppb rise', category:'howto', badge:'Demo • Science', desc:'Lab-style test showing hydrogen infusion in real time. Verification > 1200 ppb.' },
    { id:'blister', src:'/videos/blister-hydrogen-h2o-testimonia.mp4', title:'Blister recovery — Hydrogen diary', category:'testimonial', badge:'Testimonial • Recovery', desc:'Customer shares blister and skin recovery journey with daily Ultra H₂.' },
    { id:'brain', src:'/videos/brain-effect-testimonial.mp4', title:'Brain clarity — Focus returns', category:'testimonial', badge:'Testimonial • Brain', desc:'“Fog lifted in days.” Hear how Ultra H₂ supports cognitive clarity.' },
    { id:'diabetes', src:'/videos/diabites-testimonial.mp4', title:'Metabolic balance — Diabetes story', category:'testimonial', badge:'Testimonial • Metabolic', desc:'Real user on metabolic markers and daily hydrogen ritual.' },
    { id:'eye', src:'/videos/eye-testimonial.mp4', title:'Eye comfort — Customer story', category:'testimonial', badge:'Testimonial • Wellness', desc:'Detailed testimonial on eye comfort and hydration.' },
    { id:'inflammation', src:'/videos/reducing-inflamation-testimonial.mp4', title:'Reducing inflammation — Before & after', category:'testimonial', badge:'Testimonial • Inflammation', desc:'Inflammation, soreness, and recovery — customer’s week 1 to week 3.' },
    { id:'sexual', src:'/videos/sexual-performance-testimonial.mp4', title:'Vitality & performance — Confident ritual', category:'testimonial', badge:'Testimonial • Vitality', desc:'Customer on energy, vitality and confidence — honest review.' },
    // Curated YouTube — your 7 links + disease/benefits/human-life essentials (no redirect)
    { id:'yt-RLLAgmPSE_4', youtubeId:'RLLAgmPSE_4', title:'Why I Changed My Mind About Hydrogen Water (with Tyler LeBaron)', category:'learn', badge:'Learn • YouTube • Expert', desc:'Paul Saladino MD with hydrogen scientist Tyler LeBaron — deep science, why he changed his mind.' },
    { id:'yt-ciyvUm1iz8w', youtubeId:'ciyvUm1iz8w', title:'Benefits of Hydrogen Water to Fight Oxidative Stress — Dr. Paul Barattiero', category:'learn', badge:'Learn • YouTube • Science', desc:'How H₂ fights oxidative stress & inflammation — core mechanism for benefits.' },
    { id:'yt-_LeWBAY-2rQ', youtubeId:'_LeWBAY-2rQ', title:'The 4 Key Benefits Of Hydrogen Water', category:'learn', badge:'Learn • YouTube • Benefits', desc:'HBOT USA — antioxidant, anti-inflammatory, recovery, clarity — supports daily life.' },
    { id:'yt-hdoEaJ8xok0', youtubeId:'hdoEaJ8xok0', title:'I Investigated Drinking Hydrogen Water', category:'learn', badge:'Learn • YouTube • Investigated', desc:'Independent investigation — does H₂ water support health? Balanced view.' },
    { id:'yt-mimGdwc-w0g', youtubeId:'mimGdwc-w0g', title:'What Makes Hydrogen Rich Water So Special? | TUH #144', category:'learn', badge:'Learn • YouTube • Human Life', desc:'Gary Brecka — what makes H₂-rich water special for human health & longevity. Podcast.' },
    { id:'yt-0JxkAX4xrMM', youtubeId:'0JxkAX4xrMM', title:'Is Hydrogen Water Good for Kidney Disease? Doctor Review', category:'learn', badge:'Learn • YouTube • Kidney', desc:'Dr. Bismah — honest review on H₂ and kidney disease. Educational, not medical advice.' },
    // Added: benefits / disease / human-life support
    { id:'yt-wX4yqsAklF8', youtubeId:'wX4yqsAklF8', title:'The Science Behind Hydrogen Water — How It Cleans Cells & Restores Health', category:'learn', badge:'Learn • YouTube • Cellular', desc:'Amanda Bobbett — how H₂ cleans cells at the cellular level, restores health. Supports human life.' },
    { id:'yt-AtBxC9WZXX4', youtubeId:'AtBxC9WZXX4', title:'Can Hydrogen Water Cure Cancer? Claims & Science', category:'learn', badge:'Learn • YouTube • Disease', desc:'Exploring the cancer claims — what science says about H₂ and disease. Educational, not medical advice.' },
    { id:'yt-IvNNls6aJLk', youtubeId:'IvNNls6aJLk', title:'Hydrogen Water 101 — Health Benefits Introduction', category:'learn', badge:'Learn • YouTube • 101', desc:'101 guide — how H₂ promises benefits via extra molecules acting as selective antioxidants for wellness.' },
    // More — benefits, disease, human life
    { id:'yt-FZtaexSmYkQ', youtubeId:'FZtaexSmYkQ', title:'Hydrogen Water Benefits EXPLAINED — Dr. Paul Barattiero', category:'learn', badge:'Learn • YouTube • Benefits', desc:'Dr. Paul Barattiero expert guide — why H₂ is gaining worldwide attention for benefits. Supports wellness.' },
    { id:'yt-WV-XYA9Qpek', youtubeId:'WV-XYA9Qpek', title:'Biohack Yourself Documentary — Hydrogen Water BioStacking', category:'learn', badge:'Learn • YouTube • Human Life', desc:'BioStacking with Carbon 60 + H₂ — how hydrogen impacts gut & brain, reduces inflammation, supports human life.' },
    { id:'yt-SOmcolTnVCk', youtubeId:'SOmcolTnVCk', title:'Hydrogen Water — The Ultimate Guide', category:'learn', badge:'Learn • YouTube • Guide', desc:'Ultimate guide — deep dive into what H₂ water is, benefits you enjoy drinking it regularly, and human life support.' },
    { id:'yt-C4gIk3sX6dg', youtubeId:'C4gIk3sX6dg', title:'Does Water with Added Hydrogen Have More Benefits?', category:'learn', badge:'Learn • YouTube • Benefits', desc:'The Doctors — does water with added hydrogen have more benefits? Clinical discussion on disease support.' },
    { id:'yt-93Pcv9ry7L8', youtubeId:'93Pcv9ry7L8', title:'Hydrogen Water Bottles: Your Questions Answered.', category:'learn', badge:'Learn • YouTube • Q&A', desc:'10 Years Younger — how bottles work, ppb, daily ritual. Educational.' },

  ];

  howtoCount = computed(()=> this.videos.filter(v=>v.category==='howto').length);
  testimonialCount = computed(()=> this.videos.filter(v=>v.category==='testimonial').length);
  learnCount = computed(()=> this.videos.filter(v=>v.category==='learn').length);
  filtered = computed(()=>{
    const f = this.filter();
    if (f==='all') return this.videos;
    return this.videos.filter(v=>v.category===f);
  });

  open(v: VideoItem){ this.active.set(v); document.body.style.overflow='hidden'; }
  close(){ this.active.set(null); document.body.style.overflow=''; }
  scrollToGrid(){ document.querySelector('.grid')?.scrollIntoView({behavior:'smooth', block:'start'}); }
}
