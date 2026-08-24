import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

type VideoCategory = 'all' | 'howto' | 'testimonial';

interface VideoItem {
  id: string;
  src: string;
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
          <p>Real hydrogen tests, real how-tos, real human stories. All in one premium theatre.</p>

          <div class="tabs">
            <button [class.active]="filter()==='all'" (click)="filter.set('all')">All <span>{{ videos.length }}</span></button>
            <button [class.active]="filter()==='howto'" (click)="filter.set('howto')">How to Use <span>{{ howtoCount() }}</span></button>
            <button [class.active]="filter()==='testimonial'" (click)="filter.set('testimonial')">Testimonials <span>{{ testimonialCount() }}</span></button>
          </div>

          <div class="howto-cta">
            <span class="pulse"></span>
            <span>New to hydrogen? Start with <strong>How to use</strong> — 90 seconds to mastery.</span>
            <button class="btn-neon sm" (click)="filter.set('howto'); scrollToGrid()">Watch How to →</button>
          </div>
        </div>

        <div #grid class="grid">
          @for (v of filtered(); track v.id) {
            <article class="card glass" (click)="open(v)">
              <div class="thumb">
                <video [src]="v.src" muted playsinline preload="metadata"></video>
                <span class="play">▶</span>
                <span class="cat" [class.howto]="v.category==='howto'">{{ v.badge }}</span>
              </div>
              <div class="body">
                <h3>{{ v.title }}</h3>
                <p>{{ v.desc }}</p>
                <span class="meta">{{ v.category === 'howto' ? 'How to • H2Os' : 'Testimonial • Verified' }}</span>
              </div>
            </article>
          }
        </div>

        @if (filtered().length===0) {
          <p class="empty">No videos in this category.</p>
        }

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
          <video [src]="vid.src" controls autoplay playsinline style="width:100%; border-radius:14px; background:#000;"></video>
          <p class="modal-desc">{{ vid.desc }}</p>
          <div class="modal-actions">
            <a routerLink="/store" class="btn-neon sm">Shop Ultra H₂</a>
            <a routerLink="/reviews" class="btn-ghost sm">Community reviews</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .head { text-align:center; max-width: 720px; margin: 0 auto 28px; }
    .head h1 { font-family:'Space Grotesk',sans-serif; font-size: clamp(28px,4vw,40px); letter-spacing:-0.02em; }
    .head h1 em { font-style:normal; color:var(--neon); }
    .head p { color:var(--text-secondary); font-size:14px; margin:10px 0 18px; }
    .tabs { display:inline-flex; gap:8px; background: var(--bg-card); border:1px solid var(--border); padding:6px; border-radius:999px; }
    .tabs button { padding:8px 14px; border-radius:999px; background:transparent; border:none; color:var(--text-secondary); font-weight:700; font-size:12px; display:flex; gap:6px; align-items:center; }
    .tabs button.active { background: var(--neon); color:#050507; box-shadow: var(--neon-glow); }
    .tabs button span { background: rgba(0,0,0,0.08); border-radius:999px; padding:2px 6px; font-size:11px; }
    .tabs button.active span { background: rgba(0,0,0,0.14); color:#050507; }
    .howto-cta { margin-top:14px; display:inline-flex; align-items:center; gap:10px; background: linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,255,136,0.03)); border:1px solid rgba(0,255,136,0.18); border-radius:999px; padding:8px 10px 8px 12px; font-size:12px; color:var(--text-secondary); flex-wrap:wrap; justify-content:center; }
    .howto-cta strong { color:var(--text-primary); }
    .pulse{ width:8px;height:8px;border-radius:50%;background:var(--neon);box-shadow:0 0 10px var(--neon);animation: pulse 1.6s infinite; }
    @keyframes pulse{ 0%,100%{opacity:1}50%{opacity:0.6} }
    .btn-neon.sm{ padding:8px 14px; font-size:12px; }

    .grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-top:22px; }
    .card { border-radius:18px; overflow:hidden; cursor:pointer; transition:.18s; display:flex; flex-direction:column; border:1px solid rgba(255,255,255,0.06); }
    .card:hover { transform: translateY(-2px); border-color: rgba(0,255,136,0.22); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
    .thumb { position:relative; aspect-ratio: 16/9; background:#0B0D10; overflow:hidden; }
    .thumb video { width:100%; height:100%; object-fit:cover; display:block; background:#000; }
    .play { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:48px;height:48px;border-radius:50%; background: rgba(5,5,7,0.78); border:1px solid rgba(255,255,255,0.14); backdrop-filter: blur(8px); display:grid; place-items:center; color:white; font-size:16px; }
    .cat { position:absolute; left:10px; bottom:10px; font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; padding:5px 8px; border-radius:999px; background: rgba(5,5,7,0.82); border:1px solid rgba(255,255,255,0.10); color:var(--text-secondary); }
    .cat.howto { background: rgba(0,255,136,0.18); border-color: rgba(0,255,136,0.24); color: var(--neon); }
    .body { padding:14px; flex:1; display:flex; flex-direction:column; gap:6px; }
    .body h3 { font-size:13px; line-height:1.4; }
    .body p { font-size:12px; color:var(--text-secondary); line-height:1.5; flex:1; }
    .meta { font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); }
    .empty { text-align:center; color:var(--text-muted); padding:40px 0; }

    .cta { margin-top:24px; border-radius:18px; padding:18px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
    .cta h3{ font-size:16px; }
    .cta p{ font-size:13px; color:var(--text-secondary); }

    .overlay { position:fixed; inset:0; background: rgba(0,0,0,0.72); backdrop-filter: blur(8px); z-index: 80; display:grid; place-items:center; padding:18px; }
    .modal { width: min(840px, 96vw); border-radius:20px; padding:16px; max-height: 92vh; overflow:auto; }
    .modal-head { display:flex; justify-content:space-between; gap:16px; align-items:start; margin-bottom:12px; }
    .modal-head h3{ font-size:16px; }
    .close{ width:32px;height:32px;border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid var(--border); color:var(--text-primary); font-size:20px; }
    .modal-desc{ font-size:13px; color:var(--text-secondary); margin:12px 0; }
    .modal-actions{ display:flex; gap:10px; flex-wrap:wrap; }
    .btn-ghost.sm{ padding:8px 14px; font-size:12px; }

    @media(max-width: 960px){ .grid{ grid-template-columns: 1fr 1fr; } }
    @media(max-width: 640px){ .grid{ grid-template-columns: 1fr; } .tabs{ flex-wrap:wrap; justify-content:center; } }
  `]
})
export class VideosComponent {
  filter = signal<VideoCategory>('all');
  active = signal<VideoItem | null>(null);

  videos: VideoItem[] = [
    { id:'howto1', src:'/videos/how-to-use-it.mp4', title:'How to use Ultra H₂ — Your 90-sec ritual', category:'howto', badge:'How to Use • 01:34', desc:'Unbox, charge via USB-C, fill with water, press once for 3 min (daily) or twice for 6 min (max). Watch the bubbles.' },
    { id:'hydrogen-test', src:'/videos/hydrogen-h2o-test.mp4', title:'Hydrogen H₂O Test — See the ppb rise', category:'howto', badge:'Demo • Science', desc:'Lab-style test showing hydrogen infusion in real time. Verification > 1200 ppb.' },
    { id:'blister', src:'/videos/blister-hydrogen-h2o-testimonia.mp4', title:'Blister recovery — Hydrogen diary', category:'testimonial', badge:'Testimonial • Recovery', desc:'Customer shares blister and skin recovery journey with daily Ultra H₂.' },
    { id:'brain', src:'/videos/brain-effect-testimonial.mp4', title:'Brain clarity — Focus returns', category:'testimonial', badge:'Testimonial • Brain', desc:'“Fog lifted in days.” Hear how Ultra H₂ supports cognitive clarity.' },
    { id:'diabetes', src:'/videos/diabites-testimonial.mp4', title:'Metabolic balance — Diabetes story', category:'testimonial', badge:'Testimonial • Metabolic', desc:'Real user on metabolic markers and daily hydrogen ritual.' },
    { id:'eye', src:'/videos/eye-testimonial.mp4', title:'Eye comfort — Customer story', category:'testimonial', badge:'Testimonial • Wellness', desc:'Detailed testimonial on eye comfort and hydration.' },
    { id:'inflammation', src:'/videos/reducing-inflamation-testimonial.mp4', title:'Reducing inflammation — Before & after', category:'testimonial', badge:'Testimonial • Inflammation', desc:'Inflammation, soreness, and recovery — customer’s week 1 to week 3.' },
    { id:'sexual', src:'/videos/sexual-performance-testimonial.mp4', title:'Vitality & performance — Confident ritual', category:'testimonial', badge:'Testimonial • Vitality', desc:'Customer on energy, vitality and confidence — honest review.' },
  ];

  howtoCount = computed(()=> this.videos.filter(v=>v.category==='howto').length);
  testimonialCount = computed(()=> this.videos.filter(v=>v.category==='testimonial').length);
  filtered = computed(()=>{
    const f = this.filter();
    if (f==='all') return this.videos;
    return this.videos.filter(v=>v.category===f);
  });

  open(v: VideoItem){ this.active.set(v); document.body.style.overflow='hidden'; }
  close(){ this.active.set(null); document.body.style.overflow=''; }
  scrollToGrid(){ document.querySelector('.grid')?.scrollIntoView({behavior:'smooth', block:'start'}); }
}
