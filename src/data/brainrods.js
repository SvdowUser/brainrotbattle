// Brainwod creatures — all based on the Italian Brainrot meme universe.
// Each entry has: id, name, type, rarity, desc, hp, atk, catchRate, draw(ctx,cx,cy,sz,frame)

function eye(ctx, cx, cy, r, fr=0) {
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  const px = cx + Math.cos(fr*0.05)*r*0.2, py = cy + Math.sin(fr*0.05)*r*0.2;
  ctx.beginPath(); ctx.arc(px, py, r*0.55, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(px-r*0.15, py-r*0.2, r*0.18, 0, Math.PI*2); ctx.fill();
}

export const BRAINRODS = [
  // ─── COMMON ───────────────────────────────────────────────────────────────────
  {
    id: 1, name: 'Tung Tung Tung Sahur', type: 'Rhythm', rarity: 'common',
    color: '#D4A017', color2: '#FFD700',
    desc: 'A sentient golden drum that appears at dawn. The TUNG TUNG resonates through reality itself.',
    hp: 32, atk: 9, catchRate: 0.55,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, b = Math.sin(f * 0.2) * 2;
      cy += b;
      // Drum body
      ctx.fillStyle = '#C8891A';
      ctx.beginPath(); ctx.ellipse(cx, cy, s*.40, s*.50, 0, 0, Math.PI*2); ctx.fill();
      // Drum skin top
      ctx.fillStyle = '#F0E8C8';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.42, s*.40, s*.10, 0, 0, Math.PI*2); ctx.fill();
      // Drum skin bottom
      ctx.fillStyle = '#E8DDB0';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.42, s*.40, s*.10, 0, 0, Math.PI*2); ctx.fill();
      // Gold bands
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = sz*.05;
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.18, s*.40, s*.09, 0, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.12, s*.40, s*.09, 0, 0, Math.PI*2); ctx.stroke();
      // Eyes
      eye(ctx, cx - s*.13, cy - s*.08, s*.09, f);
      eye(ctx, cx + s*.13, cy - s*.08, s*.09, f);
      // Smile
      ctx.strokeStyle = '#8B5E0A'; ctx.lineWidth = sz*.03; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy + s*.10, s*.10, 0.15, Math.PI - 0.15); ctx.stroke();
      // Drumstick arms
      const ang = Math.sin(f * 0.25) * 0.4;
      ctx.strokeStyle = '#7B4B12'; ctx.lineWidth = sz*.05;
      ctx.save(); ctx.translate(cx - s*.42, cy - s*.1); ctx.rotate(-0.7 + ang);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s*.55, -s*.08); ctx.stroke();
      ctx.fillStyle = '#FFE880';
      ctx.beginPath(); ctx.arc(-s*.55, -s*.08, s*.08, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.translate(cx + s*.42, cy - s*.1); ctx.rotate(0.7 - ang);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(s*.55, -s*.08); ctx.stroke();
      ctx.fillStyle = '#FFE880';
      ctx.beginPath(); ctx.arc(s*.55, -s*.08, s*.08, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    },
  },
  {
    id: 2, name: 'Tralalero Tralala', type: 'Water', rarity: 'common',
    color: '#5088C8', color2: '#A8D0F0',
    desc: 'A shark that grew legs one day and never looked back. Sings constantly. Very off-key.',
    hp: 28, atk: 8, catchRate: 0.55,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, b = Math.sin(f * 0.15) * 1.5;
      // Legs + shoes
      const legB = Math.sin(f * 0.22) * 4;
      ctx.fillStyle = '#1E3A6E';
      ctx.fillRect(cx - s*.18, cy + s*.22, s*.14, s*.35 + legB);
      ctx.fillRect(cx + s*.04, cy + s*.22, s*.14, s*.35 - legB);
      // Shoes
      ctx.fillStyle = '#E03030';
      ctx.beginPath(); ctx.ellipse(cx - s*.11, cy + s*.57 + legB, s*.16, s*.08, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.11, cy + s*.57 - legB, s*.16, s*.08, 0, 0, Math.PI*2); ctx.fill();
      // Shark body
      cy += b;
      ctx.fillStyle = '#4A7EC0';
      ctx.beginPath();
      ctx.moveTo(cx, cy - s*.55);
      ctx.bezierCurveTo(cx + s*.45, cy - s*.5, cx + s*.45, cy + s*.2, cx, cy + s*.25);
      ctx.bezierCurveTo(cx - s*.45, cy + s*.2, cx - s*.45, cy - s*.5, cx, cy - s*.55);
      ctx.fill();
      // White belly
      ctx.fillStyle = '#C8E0F4';
      ctx.beginPath();
      ctx.ellipse(cx, cy, s*.22, s*.35, 0, 0, Math.PI*2); ctx.fill();
      // Top fin
      ctx.fillStyle = '#3668A8';
      ctx.beginPath();
      ctx.moveTo(cx - s*.05, cy - s*.45);
      ctx.lineTo(cx + s*.25, cy - s*.65);
      ctx.lineTo(cx + s*.08, cy - s*.32);
      ctx.closePath(); ctx.fill();
      // Eyes
      eye(ctx, cx - s*.18, cy - s*.18, s*.10, f);
      // Big shark grin
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(cx - s*.32, cy + s*.10);
      ctx.lineTo(cx + s*.32, cy + s*.05);
      ctx.lineTo(cx + s*.28, cy + s*.22);
      ctx.lineTo(cx - s*.28, cy + s*.25);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(cx - s*.28, cy + s*.12, s*.56, s*.07);
      // Teeth
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - s*.28 + i*s*.13, cy + s*.12);
        ctx.lineTo(cx - s*.21 + i*s*.13, cy + s*.04);
        ctx.lineTo(cx - s*.15 + i*s*.13, cy + s*.12);
        ctx.closePath(); ctx.fill();
      }
    },
  },
  {
    id: 3, name: 'Brrr Brrr Patapim', type: 'Ice', rarity: 'common',
    color: '#70C8E8', color2: '#C8F0FF',
    desc: 'Always cold. Always shivering. Emits a "patapim" sound nobody can explain.',
    hp: 35, atk: 7, catchRate: 0.55,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.85, shiv = Math.sin(f * 0.5) * 2;
      cx += shiv;
      // Ice spikes on back
      ctx.fillStyle = '#A8E4F8';
      for (let i = -2; i <= 2; i++) {
        const h = s * (0.25 - Math.abs(i) * 0.04);
        ctx.beginPath();
        ctx.moveTo(cx + i*s*.15, cy - s*.38);
        ctx.lineTo(cx + i*s*.15 - s*.05, cy - s*.38 + h);
        ctx.lineTo(cx + i*s*.15 + s*.05, cy - s*.38 + h);
        ctx.closePath(); ctx.fill();
      }
      // Round body
      ctx.fillStyle = '#60B8D8';
      ctx.beginPath(); ctx.ellipse(cx, cy, s*.40, s*.42, 0, 0, Math.PI*2); ctx.fill();
      // Lighter chest patch
      ctx.fillStyle = '#A8DCF0';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.10, s*.22, s*.26, 0, 0, Math.PI*2); ctx.fill();
      // Eyes
      eye(ctx, cx - s*.14, cy - s*.12, s*.10, f);
      eye(ctx, cx + s*.14, cy - s*.12, s*.10, f);
      // Blush (cold cheeks)
      ctx.fillStyle = 'rgba(180,220,255,0.6)';
      ctx.beginPath(); ctx.ellipse(cx - s*.22, cy + s*.04, s*.10, s*.07, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.22, cy + s*.04, s*.10, s*.07, 0, 0, Math.PI*2); ctx.fill();
      // Small stubby feet
      ctx.fillStyle = '#4898B8';
      ctx.beginPath(); ctx.ellipse(cx - s*.15, cy + s*.42, s*.10, s*.07, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.15, cy + s*.42, s*.10, s*.07, 0, 0, Math.PI*2); ctx.fill();
    },
  },
  {
    id: 4, name: 'Chimpanzini Bananini', type: 'Nature', rarity: 'common',
    color: '#D4A840', color2: '#805020',
    desc: 'Half chimp half banana. Scientists refuse to study it. Smells incredible.',
    hp: 30, atk: 10, catchRate: 0.55,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.85, b = Math.sin(f * 0.15) * 2;
      // Banana tail
      ctx.strokeStyle = '#E8C838'; ctx.lineWidth = sz*.07; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + s*.3, cy + s*.3);
      ctx.quadraticCurveTo(cx + s*.6, cy, cx + s*.5, cy - s*.4);
      ctx.stroke();
      // Body
      ctx.fillStyle = '#C89030';
      ctx.beginPath(); ctx.ellipse(cx, cy + b, s*.30, s*.38, 0, 0, Math.PI*2); ctx.fill();
      // Banana body stripes
      ctx.strokeStyle = '#B07820'; ctx.lineWidth = sz*.03;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(cx + i*s*.15, cy - s*.28 + b); ctx.lineTo(cx + i*s*.12, cy + s*.32 + b); ctx.stroke();
      }
      // Head
      ctx.fillStyle = '#A07028';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.38 + b, s*.28, s*.25, 0, 0, Math.PI*2); ctx.fill();
      // Big round monkey ears
      ctx.fillStyle = '#C89030';
      ctx.beginPath(); ctx.arc(cx - s*.28, cy - s*.38 + b, s*.14, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.28, cy - s*.38 + b, s*.14, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#E8C0A0';
      ctx.beginPath(); ctx.arc(cx - s*.28, cy - s*.38 + b, s*.08, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.28, cy - s*.38 + b, s*.08, 0, Math.PI*2); ctx.fill();
      // Snout
      ctx.fillStyle = '#E8C8A0';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.30 + b, s*.15, s*.12, 0, 0, Math.PI*2); ctx.fill();
      // Nostrils
      ctx.fillStyle = '#80501A';
      ctx.beginPath(); ctx.arc(cx - s*.05, cy - s*.30 + b, s*.03, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.05, cy - s*.30 + b, s*.03, 0, Math.PI*2); ctx.fill();
      // Eyes
      eye(ctx, cx - s*.10, cy - s*.44 + b, s*.08, f);
      eye(ctx, cx + s*.10, cy - s*.44 + b, s*.08, f);
    },
  },
  {
    id: 5, name: 'Tracallero Tracallà', type: 'Earth', rarity: 'common',
    color: '#B06030', color2: '#804010',
    desc: 'A tiny cart that gained sentience. Rolls around bumping into things purposefully.',
    hp: 38, atk: 6, catchRate: 0.55,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.85, roll = f * 0.18;
      // Wheels
      ctx.fillStyle = '#403020';
      ctx.beginPath(); ctx.arc(cx - s*.22, cy + s*.28, s*.20, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.22, cy + s*.28, s*.20, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#D08040';
      ctx.beginPath(); ctx.arc(cx - s*.22, cy + s*.28, s*.14, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.22, cy + s*.28, s*.14, 0, Math.PI*2); ctx.fill();
      // Wheel spokes
      ctx.strokeStyle = '#603010'; ctx.lineWidth = sz*.04;
      for (let i = 0; i < 4; i++) {
        const a = roll + i * Math.PI/2;
        ctx.beginPath();
        ctx.moveTo(cx - s*.22, cy + s*.28);
        ctx.lineTo(cx - s*.22 + Math.cos(a)*s*.14, cy + s*.28 + Math.sin(a)*s*.14);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + s*.22, cy + s*.28);
        ctx.lineTo(cx + s*.22 + Math.cos(a)*s*.14, cy + s*.28 + Math.sin(a)*s*.14);
        ctx.stroke();
      }
      // Cart body
      ctx.fillStyle = '#C07838';
      ctx.fillRect(cx - s*.35, cy - s*.18, s*.70, s*.46);
      ctx.fillStyle = '#D49050';
      ctx.fillRect(cx - s*.33, cy - s*.16, s*.66, s*.18);
      // Face on the front
      eye(ctx, cx - s*.14, cy - s*.04, s*.10, f);
      eye(ctx, cx + s*.14, cy - s*.04, s*.10, f);
      ctx.strokeStyle = '#5A2A08'; ctx.lineWidth = sz*.03; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy + s*.10, s*.10, 0.2, Math.PI - 0.2); ctx.stroke();
    },
  },

  // ─── UNCOMMON ─────────────────────────────────────────────────────────────────
  {
    id: 6, name: 'Bombardiro Crocodilo', type: 'Chaos', rarity: 'uncommon',
    color: '#5A9A3A', color2: '#8FBC52',
    desc: 'A crocodile who became a biplane. Nobody knows how or why. It just bombed stuff.',
    hp: 44, atk: 14, catchRate: 0.35,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, tilt = Math.sin(f * 0.10) * 3;
      cy += tilt;
      // Wings
      ctx.fillStyle = '#4A8A2A';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx - s*.3, cy - s*.15, cx - s*.7, cy + s*.05, cx - s*.75, cy + s*.18);
      ctx.bezierCurveTo(cx - s*.6, cy + s*.14, cx - s*.2, cy + s*.10, cx, cy + s*.15);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx + s*.3, cy - s*.15, cx + s*.7, cy + s*.05, cx + s*.75, cy + s*.18);
      ctx.bezierCurveTo(cx + s*.6, cy + s*.14, cx + s*.2, cy + s*.10, cx, cy + s*.15);
      ctx.closePath(); ctx.fill();
      // Wing stripes
      ctx.strokeStyle = '#3A7A1A'; ctx.lineWidth = sz*.025;
      ctx.beginPath(); ctx.moveTo(cx - s*.1, cy + s*.05); ctx.lineTo(cx - s*.65, cy + s*.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + s*.1, cy + s*.05); ctx.lineTo(cx + s*.65, cy + s*.15); ctx.stroke();
      // Body (elongated croc)
      ctx.fillStyle = '#5A9A3A';
      ctx.beginPath(); ctx.ellipse(cx, cy, s*.18, s*.52, 0, 0, Math.PI*2); ctx.fill();
      // Scales
      ctx.fillStyle = '#4A8A2A';
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath(); ctx.arc(cx + (i%2)*s*.05, cy + i*s*.12, s*.07, 0, Math.PI*2); ctx.fill();
      }
      // Snout
      ctx.fillStyle = '#6AAA4A';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.62, s*.10, s*.18, 0, 0, Math.PI*2); ctx.fill();
      // Teeth on snout
      ctx.fillStyle = '#F0F0E0';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i*s*.06, cy - s*.68);
        ctx.lineTo(cx + i*s*.06 - s*.03, cy - s*.76);
        ctx.lineTo(cx + i*s*.06 + s*.03, cy - s*.76);
        ctx.closePath(); ctx.fill();
      }
      // Eyes
      eye(ctx, cx - s*.08, cy - s*.48, s*.08, f);
      eye(ctx, cx + s*.08, cy - s*.48, s*.08, f);
      // Bomb tail
      ctx.fillStyle = '#252525';
      ctx.beginPath(); ctx.arc(cx, cy + s*.62, s*.10, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#FF6600'; ctx.lineWidth = sz*.04;
      const fuseLen = s*.15 + Math.sin(f*.3)*s*.03;
      ctx.beginPath(); ctx.moveTo(cx, cy + s*.52); ctx.lineTo(cx + s*.08, cy + s*.52 - fuseLen); ctx.stroke();
      // Fuse spark
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.arc(cx + s*.08, cy + s*.52 - fuseLen, s*.04, 0, Math.PI*2); ctx.fill();
    },
  },
  {
    id: 7, name: 'Ballerina Cappuccina', type: 'Psychic', rarity: 'uncommon',
    color: '#C87840', color2: '#F0E0C8',
    desc: 'A coffee cup that discovered ballet. Its pirouettes are genuinely graceful.',
    hp: 36, atk: 15, catchRate: 0.35,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.88, spin = f * 0.12;
      // Tutu (spinning)
      ctx.save(); ctx.translate(cx, cy + s*.15); ctx.rotate(spin * 0.3);
      ctx.fillStyle = '#F5E6D0';
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate(i * Math.PI/4);
        ctx.beginPath();
        ctx.ellipse(s*.28, 0, s*.14, s*.08, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#ECD4B8';
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate(i * Math.PI/4 + 0.2);
        ctx.beginPath();
        ctx.ellipse(s*.22, 0, s*.10, s*.06, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      // Cup body
      ctx.fillStyle = '#A05020';
      ctx.beginPath();
      ctx.moveTo(cx - s*.25, cy - s*.15);
      ctx.lineTo(cx + s*.25, cy - s*.15);
      ctx.lineTo(cx + s*.20, cy + s*.28);
      ctx.lineTo(cx - s*.20, cy + s*.28);
      ctx.closePath(); ctx.fill();
      // Cup stripe
      ctx.fillStyle = '#C07038';
      ctx.fillRect(cx - s*.25, cy + s*.00, s*.50, s*.08);
      // Handle
      ctx.strokeStyle = '#9A4818'; ctx.lineWidth = sz*.055;
      ctx.beginPath();
      ctx.arc(cx + s*.30, cy + s*.07, s*.12, -Math.PI*.4, Math.PI*.5);
      ctx.stroke();
      // Foam top
      ctx.fillStyle = '#F8F0E8';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.18, s*.25, s*.10, 0, 0, Math.PI*2); ctx.fill();
      // Latte art (heart)
      ctx.fillStyle = '#D4913C';
      ctx.beginPath(); ctx.arc(cx - s*.06, cy - s*.20, s*.05, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.06, cy - s*.20, s*.05, 0, Math.PI*2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - s*.12, cy - s*.18);
      ctx.lineTo(cx, cy - s*.08);
      ctx.lineTo(cx + s*.12, cy - s*.18);
      ctx.fill();
      // Face
      eye(ctx, cx - s*.10, cy + s*.04, s*.08, f);
      eye(ctx, cx + s*.10, cy + s*.04, s*.08, f);
      // Ballet arms (raised)
      ctx.strokeStyle = '#C07038'; ctx.lineWidth = sz*.05; ctx.lineCap = 'round';
      const armA = Math.sin(f*.12) * 0.2;
      ctx.save(); ctx.translate(cx - s*.25, cy - s*.05);
      ctx.rotate(-Math.PI*.6 + armA);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s*.3, -s*.2); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.translate(cx + s*.25, cy - s*.05);
      ctx.rotate(Math.PI*.6 - armA);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(s*.3, -s*.2); ctx.stroke();
      ctx.restore();
    },
  },
  {
    id: 8, name: 'Lirilì Larilà', type: 'Earth', rarity: 'uncommon',
    color: '#4A7A30', color2: '#A8C870',
    desc: 'An elephant that grafted itself onto a cactus. Now it just stands there humming.',
    hp: 48, atk: 12, catchRate: 0.35,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.88, sway = Math.sin(f * 0.08) * 1.5;
      cx += sway;
      // Cactus body
      ctx.fillStyle = '#4A8A30';
      ctx.beginPath();
      ctx.moveTo(cx - s*.20, cy + s*.55);
      ctx.lineTo(cx - s*.20, cy - s*.22);
      ctx.bezierCurveTo(cx - s*.20, cy - s*.38, cx + s*.20, cy - s*.38, cx + s*.20, cy - s*.22);
      ctx.lineTo(cx + s*.20, cy + s*.55);
      ctx.closePath(); ctx.fill();
      // Cactus arms
      ctx.fillStyle = '#5A9A40';
      ctx.beginPath();
      ctx.moveTo(cx - s*.20, cy - s*.08);
      ctx.lineTo(cx - s*.48, cy - s*.08);
      ctx.lineTo(cx - s*.48, cy + s*.05);
      ctx.lineTo(cx - s*.20, cy + s*.05);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + s*.20, cy - s*.02);
      ctx.lineTo(cx + s*.46, cy - s*.02);
      ctx.lineTo(cx + s*.46, cy + s*.11);
      ctx.lineTo(cx + s*.20, cy + s*.11);
      ctx.fill();
      // Cactus spines
      ctx.strokeStyle = '#F0F0C0'; ctx.lineWidth = sz*.025;
      const spines = [[-s*.22,cy+s*.3],[s*.22,cy+s*.3],[-s*.22,cy+s*.1],[s*.22,cy+s*.1],
                      [-s*.22,cy-s*.1],[s*.22,cy-s*.1],[-s*.5,cy],[-s*.5,cy-s*.1],[s*.48,cy+s*.04]];
      for (const [bx,by] of spines) {
        const dir = bx < 0 ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(cx + bx, by); ctx.lineTo(cx + bx + dir*s*.08, by - s*.04); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + bx, by); ctx.lineTo(cx + bx + dir*s*.08, by + s*.04); ctx.stroke();
      }
      // Elephant head
      ctx.fillStyle = '#A8A090';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.45, s*.26, s*.22, 0, 0, Math.PI*2); ctx.fill();
      // Ears
      ctx.fillStyle = '#989080';
      ctx.beginPath(); ctx.ellipse(cx - s*.30, cy - s*.45, s*.14, s*.18, -0.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.30, cy - s*.45, s*.14, s*.18, 0.2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#D0B8B0';
      ctx.beginPath(); ctx.ellipse(cx - s*.30, cy - s*.45, s*.08, s*.11, -0.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.30, cy - s*.45, s*.08, s*.11, 0.2, 0, Math.PI*2); ctx.fill();
      // Trunk (curling)
      ctx.strokeStyle = '#A8A090'; ctx.lineWidth = sz*.08; ctx.lineCap = 'round';
      const trunkCurl = Math.sin(f*.07) * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s*.28);
      ctx.bezierCurveTo(cx + s*.05, cy - s*.10, cx + s*.20 + trunkCurl*s*.2, cy + s*.08, cx + s*.25, cy + s*.05);
      ctx.stroke();
      // Eyes
      eye(ctx, cx - s*.10, cy - s*.50, s*.07, f);
      eye(ctx, cx + s*.10, cy - s*.50, s*.07, f);
    },
  },
  {
    id: 9, name: 'Crocodillo Porcodillo', type: 'Earth', rarity: 'uncommon',
    color: '#8AC848', color2: '#FFB0B0',
    desc: 'Neither fully pig nor fully crocodile. Smells like both. Eats everything.',
    hp: 50, atk: 13, catchRate: 0.35,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.88, b = Math.sin(f*0.14)*1.5;
      cy += b;
      // Curly pig tail
      ctx.strokeStyle = '#FFB0B0'; ctx.lineWidth = sz*.04; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx + s*.42, cy + s*.1, s*.12, 0, Math.PI*1.5);
      ctx.stroke();
      // Croc body
      ctx.fillStyle = '#7AC038';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.08, s*.40, s*.32, 0, 0, Math.PI*2); ctx.fill();
      // Scales
      ctx.fillStyle = '#6AAA28';
      for (let i = -2; i <= 2; i++) {
        for (let j = -1; j <= 1; j++) {
          ctx.beginPath(); ctx.arc(cx + i*s*.15, cy + j*s*.15 + s*.08, s*.06, 0, Math.PI); ctx.fill();
        }
      }
      // Pig head
      ctx.fillStyle = '#F0A8A0';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.28, s*.30, s*.25, 0, 0, Math.PI*2); ctx.fill();
      // Pig ears
      ctx.fillStyle = '#E89090';
      ctx.beginPath(); ctx.ellipse(cx - s*.22, cy - s*.48, s*.12, s*.14, -0.3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.22, cy - s*.48, s*.12, s*.14, 0.3, 0, Math.PI*2); ctx.fill();
      // Pig snout
      ctx.fillStyle = '#E8A0A0';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.18, s*.18, s*.13, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#C07070';
      ctx.beginPath(); ctx.arc(cx - s*.06, cy - s*.18, s*.04, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.06, cy - s*.18, s*.04, 0, Math.PI*2); ctx.fill();
      // Eyes
      eye(ctx, cx - s*.12, cy - s*.35, s*.09, f);
      eye(ctx, cx + s*.12, cy - s*.35, s*.09, f);
      // Croc legs
      ctx.fillStyle = '#7AC038';
      ctx.beginPath(); ctx.ellipse(cx - s*.35, cy + s*.32, s*.12, s*.08, 0.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.35, cy + s*.32, s*.12, s*.08, -0.5, 0, Math.PI*2); ctx.fill();
    },
  },
  {
    id: 10, name: 'Bombombini Gusini', type: 'Chaos', rarity: 'uncommon',
    color: '#E8E8D8', color2: '#252525',
    desc: 'A goose whose head is a bomb. It honks and things explode. Terrifying.',
    hp: 40, atk: 16, catchRate: 0.35,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.88, b = Math.sin(f*0.12)*2;
      // Goose body
      ctx.fillStyle = '#D8D8C8';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.12 + b, s*.32, s*.40, 0.2, 0, Math.PI*2); ctx.fill();
      // Wings
      ctx.fillStyle = '#B8B8A8';
      ctx.beginPath();
      ctx.moveTo(cx - s*.1, cy + b);
      ctx.bezierCurveTo(cx - s*.5, cy - s*.1 + b, cx - s*.55, cy + s*.2 + b, cx - s*.2, cy + s*.3 + b);
      ctx.closePath(); ctx.fill();
      // Neck
      ctx.fillStyle = '#D0D0C0';
      ctx.beginPath();
      ctx.moveTo(cx - s*.08, cy - s*.22 + b);
      ctx.bezierCurveTo(cx - s*.04, cy - s*.42 + b, cx + s*.04, cy - s*.42 + b, cx + s*.08, cy - s*.22 + b);
      ctx.closePath(); ctx.fill();
      // BOMB head
      ctx.fillStyle = '#1A1A1A';
      ctx.beginPath(); ctx.arc(cx, cy - s*.52 + b, s*.22, 0, Math.PI*2); ctx.fill();
      // Bomb shine
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.arc(cx - s*.08, cy - s*.60 + b, s*.08, 0, Math.PI*2); ctx.fill();
      // Fuse
      ctx.strokeStyle = '#A07828'; ctx.lineWidth = sz*.04;
      const fuseFlick = Math.sin(f*.35) * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + s*.10, cy - s*.65 + b);
      ctx.bezierCurveTo(cx + s*.20, cy - s*.72 + b, cx + s*.28 + fuseFlick*s*.1, cy - s*.78 + b, cx + s*.25, cy - s*.80 + b);
      ctx.stroke();
      ctx.fillStyle = '#FF8C00';
      ctx.beginPath(); ctx.arc(cx + s*.25, cy - s*.80 + b, s*.05, 0, Math.PI*2); ctx.fill();
      // Angry eyes on bomb
      ctx.fillStyle = '#FF2222';
      ctx.beginPath(); ctx.arc(cx - s*.09, cy - s*.54 + b, s*.06, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.09, cy - s*.54 + b, s*.06, 0, Math.PI*2); ctx.fill();
      // Goose orange feet
      ctx.fillStyle = '#FF9922';
      ctx.beginPath(); ctx.ellipse(cx - s*.14, cy + s*.52 + b, s*.12, s*.06, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.14, cy + s*.52 + b, s*.12, s*.06, 0, 0, Math.PI*2); ctx.fill();
    },
  },

  // ─── RARE ─────────────────────────────────────────────────────────────────────
  {
    id: 11, name: 'Cappuccino Assassino', type: 'Shadow', rarity: 'rare',
    color: '#3A1A0A', color2: '#C07838',
    desc: 'A dark roast coffee cup with hidden blades. Zero mercy. Perfect foam.',
    hp: 58, atk: 24, catchRate: 0.20,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, b = Math.sin(f*.10)*1.5;
      cy += b;
      // Shadow aura
      ctx.fillStyle = 'rgba(30,5,0,0.3)';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.52, s*.45, s*.14, 0, 0, Math.PI*2); ctx.fill();
      // Cloak
      ctx.fillStyle = '#1A0A04';
      ctx.beginPath();
      ctx.moveTo(cx, cy - s*.62);
      ctx.bezierCurveTo(cx + s*.55, cy - s*.4, cx + s*.60, cy + s*.3, cx + s*.45, cy + s*.55);
      ctx.lineTo(cx - s*.45, cy + s*.55);
      ctx.bezierCurveTo(cx - s*.60, cy + s*.3, cx - s*.55, cy - s*.4, cx, cy - s*.62);
      ctx.fill();
      // Blades
      ctx.fillStyle = '#C0C8D0';
      ctx.save(); ctx.translate(cx - s*.45, cy + s*.2); ctx.rotate(-0.5);
      ctx.fillRect(-sz*.04, -s*.22, sz*.08, s*.22); ctx.restore();
      ctx.save(); ctx.translate(cx + s*.45, cy + s*.2); ctx.rotate(0.5);
      ctx.fillRect(-sz*.04, -s*.22, sz*.08, s*.22); ctx.restore();
      // Cup body
      ctx.fillStyle = '#2A1206';
      ctx.beginPath();
      ctx.moveTo(cx - s*.22, cy - s*.08);
      ctx.lineTo(cx + s*.22, cy - s*.08);
      ctx.lineTo(cx + s*.18, cy + s*.32);
      ctx.lineTo(cx - s*.18, cy + s*.32);
      ctx.closePath(); ctx.fill();
      // Foam
      ctx.fillStyle = '#D8C0A0';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.12, s*.22, s*.09, 0, 0, Math.PI*2); ctx.fill();
      // Steam (menacing)
      ctx.strokeStyle = 'rgba(180,160,140,0.6)'; ctx.lineWidth = sz*.04; ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        const sx2 = cx + i * s*.10, sy2 = cy - s*.22;
        ctx.beginPath();
        ctx.moveTo(sx2, sy2);
        ctx.bezierCurveTo(sx2 - s*.06, sy2 - s*.08, sx2 + s*.06, sy2 - s*.16, sx2, sy2 - s*.24);
        ctx.stroke();
      }
      // Eyes (glowing red)
      ctx.fillStyle = '#FF2200';
      ctx.beginPath(); ctx.arc(cx - s*.09, cy + s*.04, s*.06, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.09, cy + s*.04, s*.06, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#FF9900';
      ctx.beginPath(); ctx.arc(cx - s*.09, cy + s*.04, s*.03, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.09, cy + s*.04, s*.03, 0, Math.PI*2); ctx.fill();
    },
  },
  {
    id: 12, name: 'Frigo Camelo', type: 'Ice', rarity: 'rare',
    color: '#E8F4FF', color2: '#A0C8E8',
    desc: 'A camel whose hump is a functioning fridge. It keeps snacks inside. Really.',
    hp: 65, atk: 20, catchRate: 0.20,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, b = Math.sin(f*.10)*2;
      cy += b;
      // Camel body
      ctx.fillStyle = '#D4B870';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.20, s*.35, s*.28, 0, 0, Math.PI*2); ctx.fill();
      // Neck
      ctx.fillStyle = '#C8AE60';
      ctx.beginPath();
      ctx.moveTo(cx - s*.10, cy - s*.02);
      ctx.bezierCurveTo(cx - s*.08, cy - s*.30, cx + s*.04, cy - s*.42, cx + s*.08, cy - s*.50);
      ctx.lineTo(cx + s*.20, cy - s*.50);
      ctx.bezierCurveTo(cx + s*.22, cy - s*.40, cx + s*.14, cy - s*.22, cx + s*.10, cy - s*.02);
      ctx.closePath(); ctx.fill();
      // FRIDGE HUMP
      ctx.fillStyle = '#E8F4FF';
      ctx.fillRect(cx - s*.22, cy - s*.40, s*.44, s*.45);
      // Fridge door details
      ctx.strokeStyle = '#A0B8C8'; ctx.lineWidth = sz*.025;
      ctx.strokeRect(cx - s*.20, cy - s*.38, s*.40, s*.41);
      ctx.beginPath(); ctx.moveTo(cx - s*.20, cy - s*.16); ctx.lineTo(cx + s*.20, cy - s*.16); ctx.stroke();
      // Fridge handle
      ctx.strokeStyle = '#808898'; ctx.lineWidth = sz*.04; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + s*.15, cy - s*.30); ctx.lineTo(cx + s*.15, cy - s*.22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + s*.15, cy - s*.05); ctx.lineTo(cx + s*.15, cy + s*.00); ctx.stroke();
      // Cold air wisps
      ctx.fillStyle = 'rgba(200,230,255,0.5)';
      ctx.beginPath(); ctx.arc(cx - s*.08, cy - s*.45 + Math.sin(f*.2)*s*.02, s*.04, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.05, cy - s*.50 + Math.sin(f*.2+1)*s*.02, s*.03, 0, Math.PI*2); ctx.fill();
      // Camel head
      ctx.fillStyle = '#D4B870';
      ctx.beginPath(); ctx.ellipse(cx + s*.14, cy - s*.58, s*.16, s*.12, 0.3, 0, Math.PI*2); ctx.fill();
      // Eye
      eye(ctx, cx + s*.20, cy - s*.62, s*.07, f);
      // Camel snout
      ctx.fillStyle = '#C8A858';
      ctx.beginPath(); ctx.ellipse(cx + s*.28, cy - s*.56, s*.10, s*.07, 0.1, 0, Math.PI*2); ctx.fill();
      // Legs
      ctx.fillStyle = '#C8A858';
      const lv = Math.sin(f*.15) * s*.04;
      ctx.fillRect(cx - s*.25, cy + s*.42, s*.10, s*.22 + lv);
      ctx.fillRect(cx - s*.08, cy + s*.42, s*.10, s*.22 - lv);
      ctx.fillRect(cx + s*.08, cy + s*.42, s*.10, s*.22 + lv);
      ctx.fillRect(cx + s*.22, cy + s*.42, s*.10, s*.22 - lv);
    },
  },
  {
    id: 13, name: 'Trippi Troppi', type: 'Psychic', rarity: 'rare',
    color: '#E060FF', color2: '#60FFAA',
    desc: 'It phases between dimensions. Staring at it too long changes your personality.',
    hp: 54, atk: 28, catchRate: 0.20,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9;
      const hue = (f * 2) % 360;
      // Pulsing aura
      ctx.save();
      ctx.globalAlpha = 0.25;
      for (let i = 3; i >= 0; i--) {
        ctx.fillStyle = `hsl(${(hue + i*60) % 360}, 100%, 60%)`;
        const r = s * (.50 + i*.08 + Math.sin(f*.15)*s*.03);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
      // Warped body
      ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI*2;
        const r = s * (.32 + Math.sin(a * 3 + f*.18) * s*.08);
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
      // Inner pattern
      ctx.fillStyle = `hsl(${(hue+180)%360}, 90%, 65%)`;
      ctx.beginPath(); ctx.arc(cx, cy, s*.18, 0, Math.PI*2); ctx.fill();
      // Multiple trippy eyes
      const eyePositions = [[-s*.14, -s*.10], [s*.14, -s*.10], [0, s*.06]];
      for (const [ex, ey] of eyePositions) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx+ex, cy+ey, s*.09, 0, Math.PI*2); ctx.fill();
        // Spinning pupil
        ctx.fillStyle = `hsl(${(hue+90)%360}, 100%, 30%)`;
        const pa = f * 0.12;
        ctx.beginPath(); ctx.arc(cx+ex+Math.cos(pa)*s*.03, cy+ey+Math.sin(pa)*s*.03, s*.06, 0, Math.PI*2); ctx.fill();
      }
      // Floating particles
      for (let i = 0; i < 5; i++) {
        const a = f*.1 + i*Math.PI*.4;
        const r = s*.5;
        ctx.fillStyle = `hsl(${(hue + i*72) % 360}, 100%, 70%)`;
        ctx.beginPath(); ctx.arc(cx + Math.cos(a)*r, cy + Math.sin(a)*r, s*.04, 0, Math.PI*2); ctx.fill();
      }
    },
  },
  {
    id: 14, name: 'Glorbo Fruttodrillo', type: 'Nature', rarity: 'rare',
    color: '#30A040', color2: '#FF4444',
    desc: 'A watermelon dragon. Its flames are fruit juice. It is delicious. Do not eat it.',
    hp: 62, atk: 22, catchRate: 0.20,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, b = Math.sin(f*.12)*2;
      cy += b;
      // Tail
      ctx.strokeStyle = '#30A040'; ctx.lineWidth = sz*.09; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + s*.3, cy + s*.2);
      ctx.bezierCurveTo(cx + s*.5, cy + s*.4, cx + s*.55, cy + s*.1, cx + s*.45, cy - s*.1);
      ctx.stroke();
      // Stripes on tail
      ctx.strokeStyle = '#1A7028'; ctx.lineWidth = sz*.03;
      ctx.beginPath(); ctx.moveTo(cx+s*.4, cy+s*.25); ctx.lineTo(cx+s*.52, cy+s*.18); ctx.stroke();
      // Dragon body (watermelon)
      ctx.fillStyle = '#38B048';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.08, s*.38, s*.42, 0, 0, Math.PI*2); ctx.fill();
      // Watermelon stripes (dark green)
      ctx.strokeStyle = '#1A7028'; ctx.lineWidth = sz*.035;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(cx + i*s*.14, cy - s*.35); ctx.lineTo(cx + i*s*.12, cy + s*.45); ctx.stroke();
      }
      // Red flesh edge
      ctx.fillStyle = '#FF4444';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.08, s*.30, s*.34, 0, 0, Math.PI*2); ctx.fill();
      // Seeds
      ctx.fillStyle = '#1A1A1A';
      const seeds = [[-s*.12,cy-s*.08],[s*.12,cy-s*.08],[-s*.05,cy+s*.12],[s*.18,cy+s*.05],[-s*.18,cy+s*.05]];
      for (const [sx2,sy2] of seeds) {
        ctx.beginPath(); ctx.ellipse(cx+sx2, sy2, s*.04, s*.06, 0.3, 0, Math.PI*2); ctx.fill();
      }
      // Wings
      ctx.fillStyle = '#38B048';
      ctx.beginPath();
      ctx.moveTo(cx - s*.1, cy - s*.25);
      ctx.bezierCurveTo(cx - s*.55, cy - s*.5, cx - s*.65, cy - s*.2, cx - s*.4, cy - s*.05);
      ctx.bezierCurveTo(cx - s*.3, cy - s*.1, cx - s*.15, cy - s*.18, cx - s*.1, cy - s*.25);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + s*.1, cy - s*.25);
      ctx.bezierCurveTo(cx + s*.55, cy - s*.5, cx + s*.65, cy - s*.2, cx + s*.4, cy - s*.05);
      ctx.bezierCurveTo(cx + s*.3, cy - s*.1, cx + s*.15, cy - s*.18, cx + s*.1, cy - s*.25);
      ctx.fill();
      // Head
      ctx.fillStyle = '#30A040';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.42, s*.24, s*.20, 0, 0, Math.PI*2); ctx.fill();
      // Snout
      ctx.fillStyle = '#F05050';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.36, s*.16, s*.10, 0, 0, Math.PI*2); ctx.fill();
      eye(ctx, cx - s*.10, cy - s*.50, s*.09, f);
      eye(ctx, cx + s*.10, cy - s*.50, s*.09, f);
    },
  },

  // ─── EPIC ─────────────────────────────────────────────────────────────────────
  {
    id: 15, name: 'La Vacca Saturno', type: 'Cosmic', rarity: 'epic',
    color: '#E8C870', color2: '#9050C0',
    desc: 'A cow that swallowed a planet. The rings are real. So is the mooing.',
    hp: 80, atk: 30, catchRate: 0.10,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, orbitA = f * 0.05;
      // Saturn rings
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.3);
      ctx.strokeStyle = '#C8A050'; ctx.lineWidth = sz*.06;
      ctx.beginPath(); ctx.ellipse(0, 0, s*.72, s*.20, 0, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#D4B068'; ctx.lineWidth = sz*.03;
      ctx.beginPath(); ctx.ellipse(0, 0, s*.62, s*.17, 0, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
      // Cow body
      ctx.fillStyle = '#F0F0E8';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.12, s*.32, s*.36, 0, 0, Math.PI*2); ctx.fill();
      // Cow spots
      ctx.fillStyle = '#2A1A0A';
      ctx.beginPath(); ctx.ellipse(cx - s*.12, cy + s*.05, s*.10, s*.14, -0.4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.15, cy + s*.18, s*.08, s*.11, 0.3, 0, Math.PI*2); ctx.fill();
      // Udder
      ctx.fillStyle = '#F0B0B0';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.44, s*.16, s*.10, 0, 0, Math.PI*2); ctx.fill();
      // Legs
      ctx.fillStyle = '#E8E8E0';
      ctx.fillRect(cx - s*.22, cy + s*.44, s*.10, s*.20);
      ctx.fillRect(cx + s*.12, cy + s*.44, s*.10, s*.20);
      // Head
      ctx.fillStyle = '#F0F0E8';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.36, s*.24, s*.20, 0, 0, Math.PI*2); ctx.fill();
      // Horns (cosmic)
      ctx.fillStyle = '#9050C0';
      ctx.beginPath(); ctx.moveTo(cx - s*.14, cy - s*.50); ctx.lineTo(cx - s*.22, cy - s*.68); ctx.lineTo(cx - s*.06, cy - s*.52); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + s*.14, cy - s*.50); ctx.lineTo(cx + s*.22, cy - s*.68); ctx.lineTo(cx + s*.06, cy - s*.52); ctx.fill();
      // Cow snout
      ctx.fillStyle = '#F0C8B8';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.28, s*.16, s*.12, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#D08080';
      ctx.beginPath(); ctx.arc(cx - s*.06, cy - s*.28, s*.04, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.06, cy - s*.28, s*.04, 0, Math.PI*2); ctx.fill();
      eye(ctx, cx - s*.10, cy - s*.42, s*.08, f);
      eye(ctx, cx + s*.10, cy - s*.42, s*.08, f);
      // Orbiting star
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.arc(cx + Math.cos(orbitA)*s*.72, cy + Math.sin(orbitA)*s*.20*0.6, s*.05, 0, Math.PI*2); ctx.fill();
    },
  },
  {
    id: 16, name: 'Sahur Drumbo', type: 'Rhythm', rarity: 'epic',
    color: '#C89020', color2: '#FF8800',
    desc: 'The evolved titan drum. Its TUNG echoes across all timelines simultaneously.',
    hp: 88, atk: 32, catchRate: 0.10,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, pulse = Math.sin(f*.18)*3;
      // Glow
      ctx.save(); ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 20;
      // Big drum body
      ctx.fillStyle = '#A87010';
      ctx.beginPath(); ctx.ellipse(cx, cy, s*.52, s*.62, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Drum top
      ctx.fillStyle = '#F5E8B0';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.54 + pulse*.1, s*.52, s*.14, 0, 0, Math.PI*2); ctx.fill();
      // Gold bands
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = sz*.07;
      for (const offsetY of [-s*.28, -s*.06, s*.18]) {
        ctx.beginPath(); ctx.ellipse(cx, cy + offsetY, s*.52, s*.13, 0, 0, Math.PI*2); ctx.stroke();
      }
      // Drum laces
      ctx.strokeStyle = '#F0D080'; ctx.lineWidth = sz*.03;
      for (let i = 0; i < 6; i++) {
        const a = (i/6)*Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a)*s*.48, cy - s*.54 + Math.sin(a)*s*.13);
        ctx.lineTo(cx + Math.cos(a)*s*.48, cy - s*.28 + Math.sin(a)*s*.13);
        ctx.stroke();
      }
      // Face (intense)
      eye(ctx, cx - s*.16, cy - s*.08, s*.12, f);
      eye(ctx, cx + s*.16, cy - s*.08, s*.12, f);
      ctx.strokeStyle = '#8B5E0A'; ctx.lineWidth = sz*.04; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy + s*.18, s*.14, 0.1, Math.PI-0.1); ctx.stroke();
      // 4 drumstick arms
      const arms = [[-s*.55,-s*.2,-1.0],[s*.55,-s*.2,1.0],[-s*.55,s*.10,-0.6],[s*.55,s*.10,0.6]];
      const arm4A = Math.sin(f*.22) * 0.3;
      for (const [ax,ay,baseA] of arms) {
        ctx.strokeStyle = '#7B4B12'; ctx.lineWidth = sz*.055;
        ctx.save(); ctx.translate(cx+ax, cy+ay); ctx.rotate(baseA + arm4A*(ax<0?1:-1));
        const dir = ax < 0 ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(dir*s*.48, -s*.08); ctx.stroke();
        ctx.fillStyle = '#FFE880';
        ctx.beginPath(); ctx.arc(dir*s*.48, -s*.08, s*.09, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    },
  },
  {
    id: 17, name: 'Il Bombardiro Supremo', type: 'Chaos', rarity: 'epic',
    color: '#3A7A20', color2: '#FF4400',
    desc: 'An advanced military grade croc-plane. Has missiles. Has coffee. Has regrets.',
    hp: 85, atk: 36, catchRate: 0.10,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, tilt = Math.sin(f*.08)*4;
      cy += tilt;
      // Jet engines
      ctx.fillStyle = '#606870';
      ctx.beginPath(); ctx.ellipse(cx - s*.55, cy + s*.08, s*.10, s*.08, 0.4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.55, cy + s*.08, s*.10, s*.08, -0.4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#FF6600';
      ctx.beginPath(); ctx.ellipse(cx - s*.55, cy + s*.08, s*.07, s*.05, 0.4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.55, cy + s*.08, s*.07, s*.05, -0.4, 0, Math.PI*2); ctx.fill();
      // Large wings
      ctx.fillStyle = '#3A7A20';
      ctx.beginPath();
      ctx.moveTo(cx - s*.08, cy + s*.05);
      ctx.lineTo(cx - s*.75, cy - s*.10);
      ctx.lineTo(cx - s*.78, cy + s*.20);
      ctx.lineTo(cx - s*.10, cy + s*.25);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + s*.08, cy + s*.05);
      ctx.lineTo(cx + s*.75, cy - s*.10);
      ctx.lineTo(cx + s*.78, cy + s*.20);
      ctx.lineTo(cx + s*.10, cy + s*.25);
      ctx.closePath(); ctx.fill();
      // Missiles under wings
      ctx.fillStyle = '#C0C0C8';
      ctx.fillRect(cx - s*.55, cy + s*.20, s*.20, s*.06);
      ctx.fillRect(cx + s*.35, cy + s*.20, s*.20, s*.06);
      ctx.fillStyle = '#FF3300';
      ctx.fillRect(cx - s*.56, cy + s*.20, s*.05, s*.06);
      ctx.fillRect(cx + s*.51, cy + s*.20, s*.05, s*.06);
      // Body
      ctx.fillStyle = '#4A8A2A';
      ctx.beginPath(); ctx.ellipse(cx, cy, s*.18, s*.58, 0, 0, Math.PI*2); ctx.fill();
      // Camo pattern
      ctx.fillStyle = '#3A6A1A';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.ellipse(cx + (i%2)*s*.06, cy + i*s*.14, s*.07, s*.09, i*.5, 0, Math.PI*2); ctx.fill();
      }
      // Head/snout
      ctx.fillStyle = '#5A9A3A';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.66, s*.12, s*.20, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3A7A20';
      ctx.beginPath(); ctx.arc(cx, cy - s*.58, s*.10, 0, Math.PI); ctx.fill();
      eye(ctx, cx - s*.08, cy - s*.56, s*.07, f);
      eye(ctx, cx + s*.08, cy - s*.56, s*.07, f);
    },
  },
  {
    id: 18, name: 'Tralalero Profondo', type: 'Water', rarity: 'epic',
    color: '#0A2040', color2: '#00AAFF',
    desc: 'The deep sea evolution. Its shoes are sonar devices. Its song sinks ships.',
    hp: 78, atk: 34, catchRate: 0.10,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9, b = Math.sin(f*.12)*2;
      cy += b;
      // Bioluminescent glow
      ctx.save(); ctx.shadowColor = '#0088FF'; ctx.shadowBlur = 15;
      // Body (deep dark blue shark)
      ctx.fillStyle = '#0A2040';
      ctx.beginPath();
      ctx.moveTo(cx, cy - s*.58);
      ctx.bezierCurveTo(cx + s*.48, cy - s*.52, cx + s*.48, cy + s*.22, cx, cy + s*.28);
      ctx.bezierCurveTo(cx - s*.48, cy + s*.22, cx - s*.48, cy - s*.52, cx, cy - s*.58);
      ctx.fill();
      ctx.restore();
      // Bioluminescent stripes
      ctx.strokeStyle = '#00DDFF'; ctx.lineWidth = sz*.025;
      ctx.beginPath();
      ctx.moveTo(cx - s*.30, cy - s*.30);
      ctx.bezierCurveTo(cx - s*.10, cy + s*.10, cx + s*.10, cy + s*.10, cx + s*.30, cy - s*.30);
      ctx.stroke();
      // Anglerfish light lure
      ctx.strokeStyle = '#00AAFF'; ctx.lineWidth = sz*.03; ctx.lineCap = 'round';
      const lureA = Math.sin(f*.15) * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s*.52);
      ctx.bezierCurveTo(cx + s*.10, cy - s*.65, cx + s*.18 + lureA*s*.1, cy - s*.72, cx + s*.20, cy - s*.75);
      ctx.stroke();
      const lureGlow = (Math.sin(f*.2) + 1) * 0.5;
      ctx.save(); ctx.shadowColor = '#00FFFF'; ctx.shadowBlur = 10 + lureGlow*10;
      ctx.fillStyle = `rgba(0,${180+lureGlow*75},255,${0.7+lureGlow*.3})`;
      ctx.beginPath(); ctx.arc(cx + s*.20, cy - s*.75, s*.06, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Deep sea shoes (glowing)
      ctx.fillStyle = '#003080';
      ctx.beginPath(); ctx.ellipse(cx - s*.12, cy + s*.50, s*.16, s*.08, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.12, cy + s*.50, s*.16, s*.08, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0060C0';
      ctx.beginPath(); ctx.ellipse(cx - s*.12, cy + s*.48, s*.12, s*.05, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + s*.12, cy + s*.48, s*.12, s*.05, 0, 0, Math.PI*2); ctx.fill();
      // Dark abyss eyes (glowing)
      ctx.save(); ctx.shadowColor = '#00FFFF'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#00DDFF';
      ctx.beginPath(); ctx.arc(cx - s*.18, cy - s*.14, s*.09, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.18, cy - s*.14, s*.09, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#001830';
      ctx.beginPath(); ctx.arc(cx - s*.18, cy - s*.14, s*.05, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s*.18, cy - s*.14, s*.05, 0, Math.PI*2); ctx.fill();
    },
  },

  // ─── LEGENDARY ────────────────────────────────────────────────────────────────
  {
    id: 19, name: 'Brainrot Primo', type: 'Brainrot', rarity: 'legendary',
    color: '#FF00AA', color2: '#FFFF00',
    desc: 'The original brainrot. All Italian chaos creatures descend from it. Do not look directly at it.',
    hp: 130, atk: 55, catchRate: 0.05,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9;
      const hue = (f * 3) % 360;
      // Chaotic outer form
      ctx.save();
      for (let layer = 4; layer >= 0; layer--) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = `hsl(${(hue + layer*30) % 360}, 100%, 60%)`;
        const warp = s * (.55 + layer * .06);
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI*2;
          const r = warp + Math.sin(a * 4 + f * 0.12 + layer) * s * .12;
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      // Core body
      ctx.fillStyle = `hsl(${(hue+180)%360}, 70%, 20%)`;
      ctx.beginPath(); ctx.arc(cx, cy, s*.42, 0, Math.PI*2); ctx.fill();
      // Glitch lines across body
      ctx.strokeStyle = `hsl(${hue}, 100%, 80%)`;
      ctx.lineWidth = sz*.04;
      for (let i = 0; i < 4; i++) {
        const y = cy - s*.3 + i * s*.2;
        ctx.beginPath(); ctx.moveTo(cx - s*.3 + Math.sin(f*.2+i)*s*.1, y); ctx.lineTo(cx + s*.3 + Math.sin(f*.2+i+1)*s*.1, y); ctx.stroke();
      }
      // Face chaos: many elements of other brainrots
      // Drum rings
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = sz*.04;
      ctx.beginPath(); ctx.ellipse(cx, cy, s*.30, s*.08, 0, 0, Math.PI*2); ctx.stroke();
      // Shark teeth
      ctx.fillStyle = '#FFFFFF';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i*s*.08, cy + s*.18);
        ctx.lineTo(cx + i*s*.08 - s*.04, cy + s*.30);
        ctx.lineTo(cx + i*s*.08 + s*.04, cy + s*.30);
        ctx.closePath(); ctx.fill();
      }
      // Big chaotic eyes
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx + i*s*.18, cy - s*.10, s*.13, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = `hsl(${(hue + i*60) % 360}, 100%, 50%)`;
        ctx.beginPath(); ctx.arc(cx + i*s*.18 + Math.cos(f*.15)*s*.03, cy - s*.10 + Math.sin(f*.15)*s*.03, s*.09, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(cx + i*s*.18, cy - s*.10, s*.04, 0, Math.PI*2); ctx.fill();
      }
      // Orbiting mini icons (drum + shark + croc symbols)
      for (let i = 0; i < 3; i++) {
        const a = f * 0.06 + i * Math.PI * 2/3;
        const ox = cx + Math.cos(a) * s * .65, oy = cy + Math.sin(a) * s * .65;
        ctx.fillStyle = `hsl(${(hue + i*120) % 360}, 100%, 65%)`;
        ctx.beginPath(); ctx.arc(ox, oy, s*.07, 0, Math.PI*2); ctx.fill();
      }
    },
  },
  {
    id: 20, name: 'Tung Tung Omega', type: 'Rhythm', rarity: 'legendary',
    color: '#FFD700', color2: '#FF8800',
    desc: 'The drum god. Its beat is the heartbeat of the universe. TUNG TUNG TUNG.',
    hp: 120, atk: 60, catchRate: 0.05,
    draw(ctx, cx, cy, sz, f) {
      const s = sz * 0.9;
      const beat = Math.abs(Math.sin(f * 0.25)) * 4;
      cy -= beat * 0.5;
      // Divine glow halo
      ctx.save(); ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 30 + beat*3;
      ctx.fillStyle = 'rgba(255,200,0,0.1)';
      ctx.beginPath(); ctx.arc(cx, cy, s*.85, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Outer ring (divine)
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = sz*.06;
      ctx.beginPath(); ctx.arc(cx, cy, s*.72, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#FF8800'; ctx.lineWidth = sz*.03;
      ctx.beginPath(); ctx.arc(cx, cy, s*.65, 0, Math.PI*2); ctx.stroke();
      // Massive golden drum
      ctx.fillStyle = '#C89020';
      ctx.beginPath(); ctx.ellipse(cx, cy, s*.52 + beat*.2, s*.62 + beat*.2, 0, 0, Math.PI*2); ctx.fill();
      // Ornate drum patterns
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = sz*.06;
      const bands = [-s*.34, -s*.10, s*.16, s*.40];
      for (const b2 of bands) {
        ctx.beginPath(); ctx.ellipse(cx, cy + b2, s*.52, s*.13, 0, 0, Math.PI*2); ctx.stroke();
      }
      // Divine drum skin
      ctx.fillStyle = '#F8F0C8';
      ctx.beginPath(); ctx.ellipse(cx, cy - s*.54 - beat*.1, s*.52, s*.15, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#F0E8B0';
      ctx.beginPath(); ctx.ellipse(cx, cy + s*.54 + beat*.1, s*.52, s*.15, 0, 0, Math.PI*2); ctx.fill();
      // Eyes (large, divine)
      eye(ctx, cx - s*.18, cy - s*.10, s*.14, f);
      eye(ctx, cx + s*.18, cy - s*.10, s*.14, f);
      // Glowing crown
      ctx.fillStyle = '#FFD700';
      const crownPts = [-s*.22,-s*.12,0,s*.12,s*.22];
      for (const cp of crownPts) {
        const h = s*.16 + (Math.abs(cp) < s*.05 ? s*.10 : 0);
        ctx.beginPath(); ctx.moveTo(cx+cp, cy-s*.72); ctx.lineTo(cx+cp-s*.05, cy-s*.72-h); ctx.lineTo(cx+cp+s*.05, cy-s*.72-h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FF4400';
        ctx.beginPath(); ctx.arc(cx+cp, cy-s*.72-h-s*.04, s*.04, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#FFD700';
      }
      // 6 drumstick arms
      const stickAngles = [[-s*.56,-s*.2,-1.1],[s*.56,-s*.2,1.1],[-s*.60,s*.05,-0.6],[s*.60,s*.05,0.6],[-s*.55,s*.25,-0.3],[s*.55,s*.25,0.3]];
      const armBeat = Math.sin(f*.22) * 0.35;
      for (const [ax,ay,baseA] of stickAngles) {
        ctx.strokeStyle = '#A87010'; ctx.lineWidth = sz*.06;
        ctx.save(); ctx.translate(cx+ax, cy+ay); ctx.rotate(baseA + armBeat*(ax<0?1:-1));
        const dir = ax < 0 ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(dir*s*.50, -s*.05); ctx.stroke();
        ctx.fillStyle = '#FFE070';
        ctx.save(); ctx.shadowColor='#FFD700'; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(dir*s*.50, -s*.05, s*.10, 0, Math.PI*2); ctx.fill();
        ctx.restore(); ctx.restore();
      }
    },
  },
];

export const RARITY_COLORS = {
  common:    '#78909C',
  uncommon:  '#2E7D32',
  rare:      '#1565C0',
  epic:      '#6A1B9A',
  legendary: '#E65100',
};

export const RARITY_CATCH_RATES = {
  common: 0.55, uncommon: 0.35, rare: 0.20, epic: 0.10, legendary: 0.05,
};

export function getBrainrodById(id) {
  return BRAINRODS.find(b => b.id === id) || null;
}
