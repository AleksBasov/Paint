 /* ===== ДАННЫЕ ИНСТРУМЕНТОВ ===== */
    const TOOLS = [
      { id:'brush', label:'Кисть', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>' },
      { id:'pencil', label:'Карандаш', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="2" x2="22" y2="6"/><path d="M7.5 20.5L2 22l1.5-5.5L17 3l4 4L7.5 20.5z"/></svg>' },
      { id:'eraser', label:'Ластик', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16l9-9 8 8-4 4"/><path d="M6 11l4 4"/></svg>' },
      { id:'_sep1' },
      { id:'line', label:'Линия', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="19" x2="19" y2="5"/></svg>' },
      { id:'arrow', label:'Стрелка', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/></svg>' },
      { id:'rectangle', label:'Прямоугольник', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>' },
      { id:'circle', label:'Круг', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>' },
      { id:'triangle', label:'Треугольник', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 21h20L12 3z"/></svg>' },
      { id:'diamond', label:'Ромб', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>' },
      { id:'star', label:'Звезда', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
      { id:'_sep2' },
      { id:'bezier', label:'Кривая Безье', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 20C8 4 16 4 22 20"/></svg>' },
      { id:'fill', label:'Заливка', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l1-1h3l9-9"/><path d="M3 21V18l9-9 3 3-9 9"/><path d="M14.5 5.5l4-4a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8l-4 4"/><path d="M12 8l-3 3"/></svg>' },
      { id:'eyedropper', label:'Пипетка', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l1-1h3l9-9"/><path d="M3 21v-3l9-9 3 3-9 9"/><path d="M15 6l-1-1a2 2 0 0 1 0-2.8l.7-.7a2 2 0 0 1 2.8 0l1.4 1.4a2 2 0 0 1 0 2.8l-.7.7a2 2 0 0 1-2.8 0L15 6z"/></svg>' },
    ];

    /* ===== ГЕНЕРАЦИЯ ИНСТРУМЕНТОВ ===== */
    function buildToolButtons(container, isMobile) {
      TOOLS.forEach(t => {
        if (t.id.startsWith('_sep')) {
          const sep = document.createElement('hr');
          sep.className = 'tool-sep';
          container.appendChild(sep);
          return;
        }
        const btn = document.createElement('button');
        btn.className = 'tool-item' + (t.id === 'brush' ? ' active' : '');
        btn.dataset.tool = t.id;
        btn.innerHTML = t.icon + `<span>${t.label}</span>`;
        btn.addEventListener('click', () => selectTool(t.id));
        container.appendChild(btn);
      });
    }
    buildToolButtons(document.getElementById('toolbar'), false);
    buildToolButtons(document.getElementById('mobile-tools-grid'), true);

    /* ===== ИНИЦИАЛИЗАЦИЯ ===== */
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const wrapper = document.getElementById('canvas-wrapper');
    const canvasArea = document.getElementById('canvas-area');
    const eraserCursor = document.getElementById('eraser-cursor');
    const CANVAS_W = 1200, CANVAS_H = 800;
    canvas.width = CANVAS_W; canvas.height = CANVAS_H;
    canvas.style.width = CANVAS_W + 'px'; canvas.style.height = CANVAS_H + 'px';

    let state = {
      tool:'brush', color:'#10b981', size:5, opacity:1,
      fillShape:false, smooth:true, isDrawing:false,
      prevX:0, prevY:0, startX:0, startY:0,
      zoom:1, history:[], historyIndex:-1, maxHistory:50, bezierPoints:[]
    };
    let snapshot = null;

    const COLORS = [
      '#ffffff','#a1a1aa','#52525b','#18181b','#ef4444','#f97316',
      '#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6',
      '#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7',
      '#d946ef','#ec4899','#f43f5e','#78350f','#365314','#1e3a5f',
    ];

    /* ===== ТЕМА ===== */
    const themeToggle = document.getElementById('theme-toggle');
    function setTheme(t) { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('sketchlab-theme', t); }
    themeToggle.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));
    const saved = localStorage.getItem('sketchlab-theme'); if (saved) setTheme(saved);

    /* ===== УТИЛИТЫ ===== */
    function showToast(msg, type='info') {
      const c = document.getElementById('toast-container'), t = document.createElement('div');
      t.className = `toast ${type}`; t.textContent = msg; c.appendChild(t);
      setTimeout(() => t.remove(), 2500);
    }
    function getCoords(e) {
      const r = canvas.getBoundingClientRect(), sx = canvas.width/r.width, sy = canvas.height/r.height;
      let cx, cy;
      if (e.touches && e.touches.length > 0) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
      else { cx = e.clientX; cy = e.clientY; }
      return { x: (cx-r.left)*sx, y: (cy-r.top)*sy };
    }
    function hexToRgba(hex, a) {
      return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;
    }

    /* ===== ИСТОРИЯ ===== */
    function saveState() {
      state.history = state.history.slice(0, state.historyIndex+1);
      state.history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
      if (state.history.length > state.maxHistory) state.history.shift();
      state.historyIndex = state.history.length - 1; syncHistory();
    }
    function undo() {
      if (state.historyIndex > 0) { state.historyIndex--; ctx.putImageData(state.history[state.historyIndex],0,0); }
      else if (state.historyIndex === 0) { state.historyIndex = -1; clearInternal(); }
      syncHistory();
    }
    function redo() { if (state.historyIndex < state.history.length-1) { state.historyIndex++; ctx.putImageData(state.history[state.historyIndex],0,0); } syncHistory(); }
    function syncHistory() {
      const cu = state.historyIndex >= 0, cr = state.historyIndex < state.history.length-1;
      ['btn-undo','btn-undo-panel','m-btn-undo'].forEach(id => document.getElementById(id).disabled = !cu);
      ['btn-redo','btn-redo-panel','m-btn-redo'].forEach(id => document.getElementById(id).disabled = !cr);
    }

    /* ===== ХОЛСТ ===== */
    function clearInternal() { ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
    function clearCanvas() { saveState(); clearInternal(); state.bezierPoints=[]; showToast('Холст очищен','info'); }
    function initCanvas() { clearInternal(); }

    /* ===== ЗУМ ===== */
    function setZoom(z) {
      state.zoom = Math.max(0.1, Math.min(5, z));
      wrapper.style.transform = `scale(${state.zoom})`;
      wrapper.style.transformOrigin = 'center center';
      document.getElementById('zoom-display').textContent = Math.round(state.zoom*100)+'%';
    }

    /* ===== ВЫБОР ИНСТРУМЕНТА ===== */
    function selectTool(id) {
      state.tool = id; state.bezierPoints = []; snapshot = null;
      document.querySelectorAll('.tool-item').forEach(b => b.classList.toggle('active', b.dataset.tool === id));
      wrapper.classList.toggle('eraser-cursor', id === 'eraser');
      if (id !== 'eraser') eraserCursor.style.display = 'none';
      document.getElementById('shape-options').style.display = ['rectangle','circle','triangle','diamond','star'].includes(id) ? 'block' : 'none';
    }

    /* ===== РИСОВАНИЕ ===== */
    function setupStroke() {
      ctx.strokeStyle = hexToRgba(state.color, state.opacity);
      ctx.fillStyle = hexToRgba(state.color, state.opacity);
      ctx.lineWidth = state.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 1;
    }
    function drawLine(x,y) { ctx.beginPath(); ctx.moveTo(state.startX,state.startY); ctx.lineTo(x,y); ctx.stroke(); }
    function drawArrow(x,y) {
      const dx=x-state.startX,dy=y-state.startY,a=Math.atan2(dy,dx),hl=Math.max(15,state.size*3);
      ctx.beginPath(); ctx.moveTo(state.startX,state.startY); ctx.lineTo(x,y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y);
      ctx.lineTo(x-hl*Math.cos(a-Math.PI/6),y-hl*Math.sin(a-Math.PI/6));
      ctx.moveTo(x,y); ctx.lineTo(x-hl*Math.cos(a+Math.PI/6),y-hl*Math.sin(a+Math.PI/6)); ctx.stroke();
    }
    function drawRect(x,y) { if(state.fillShape) ctx.fillRect(state.startX,state.startY,x-state.startX,y-state.startY); ctx.strokeRect(state.startX,state.startY,x-state.startX,y-state.startY); }
    function drawCircle(x,y) { const r=Math.max(0.1,Math.hypot(x-state.startX,y-state.startY)); ctx.beginPath(); ctx.arc(state.startX,state.startY,r,0,Math.PI*2); if(state.fillShape) ctx.fill(); ctx.stroke(); }
    function drawTriangle(x,y) { ctx.beginPath(); ctx.moveTo(state.startX,state.startY); ctx.lineTo(x,y); ctx.lineTo(state.startX*2-x,y); ctx.closePath(); if(state.fillShape) ctx.fill(); ctx.stroke(); }
    function drawDiamond(x,y) { const mx=(state.startX+x)/2,my=(state.startY+y)/2; ctx.beginPath(); ctx.moveTo(mx,state.startY); ctx.lineTo(x,my); ctx.lineTo(mx,y); ctx.lineTo(state.startX,my); ctx.closePath(); if(state.fillShape) ctx.fill(); ctx.stroke(); }
    function drawStar(x,y) {
      const cx=(state.startX+x)/2,cy=(state.startY+y)/2,or=Math.max(1,Math.hypot(x-cx,y-cy)),ir=or*0.4;
      ctx.beginPath();
      for(let i=0;i<10;i++){const r=i%2===0?or:ir,a=(Math.PI/5)*i-Math.PI/2;const px=cx+r*Math.cos(a),py=cy+r*Math.sin(a);i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
      ctx.closePath(); if(state.fillShape) ctx.fill(); ctx.stroke();
    }
    function floodFill(sx,sy,fc) {
      const px=Math.floor(sx),py=Math.floor(sy); if(px<0||py<0||px>=canvas.width||py>=canvas.height) return;
      const id=ctx.getImageData(0,0,canvas.width,canvas.height),d=id.data,w=canvas.width;
      const ti=(py*w+px)*4,tR=d[ti],tG=d[ti+1],tB=d[ti+2],tA=d[ti+3];
      const tc=document.createElement('canvas');tc.width=1;tc.height=1;const tx=tc.getContext('2d');
      tx.fillStyle=fc;tx.globalAlpha=state.opacity;tx.fillRect(0,0,1,1);
      const fd=tx.getImageData(0,0,1,1).data,fR=fd[0],fG=fd[1],fB=fd[2],fA=fd[3];
      if(tR===fR&&tG===fG&&tB===fB&&tA===fA) return;
      const tol=30,vis=new Uint8Array(w*canvas.height),stk=[[px,py]];
      function match(i){return Math.abs(d[i]-tR)<=tol&&Math.abs(d[i+1]-tG)<=tol&&Math.abs(d[i+2]-tB)<=tol&&Math.abs(d[i+3]-tA)<=tol;}
      while(stk.length){const[cx,cy]=stk.pop();const p=cy*w+cx;if(cx<0||cy<0||cx>=w||cy>=canvas.height||vis[p])continue;const i=p*4;if(!match(i))continue;vis[p]=1;d[i]=fR;d[i+1]=fG;d[i+2]=fB;d[i+3]=fA;stk.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);}
      ctx.putImageData(id,0,0);
    }
    function pickColor(x,y) {
      const px=Math.floor(x),py=Math.floor(y); if(px<0||py<0||px>=canvas.width||py>=canvas.height) return;
      const d=ctx.getImageData(px,py,1,1).data; const h='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');
      setColor(h); showToast(`Цвет: ${h}`,'success');
    }
    function handleBezierClick(x,y) {
      state.bezierPoints.push({x,y}); ctx.putImageData(snapshot,0,0); drawBezierPreview(x,y);
      if(state.bezierPoints.length===3){
        ctx.putImageData(snapshot,0,0); setupStroke(); ctx.beginPath();
        ctx.moveTo(state.bezierPoints[0].x,state.bezierPoints[0].y);
        ctx.bezierCurveTo(state.bezierPoints[1].x,state.bezierPoints[1].y,state.bezierPoints[2].x,state.bezierPoints[2].y,state.bezierPoints[2].x,state.bezierPoints[2].y);
        ctx.stroke(); state.bezierPoints=[]; saveState();
      }
    }
    function drawBezierPreview(mx,my) {
      const pts=state.bezierPoints; if(!pts.length) return;
      ctx.save(); ctx.setLineDash([6,4]); ctx.strokeStyle='#999'; ctx.lineWidth=1; ctx.globalAlpha=0.7;
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
      for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
      if(pts.length===1) ctx.lineTo(mx,my); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#fff'; ctx.strokeStyle='#999'; ctx.lineWidth=1.5;
      pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();ctx.stroke();});
      if(pts.length===2){ctx.globalAlpha=0.5;setupStroke();ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);ctx.bezierCurveTo(pts[1].x,pts[1].y,mx,my,mx,my);ctx.stroke();}
      ctx.restore();
    }

    /* Обработчики рисования */
    function startDraw(e) {
      if(e.button&&e.button!==0) return; e.preventDefault();
      const{x,y}=getCoords(e); state.isDrawing=true; state.prevX=x; state.prevY=y; state.startX=x; state.startY=y;
      if(state.tool==='bezier') return;
      if(state.tool==='fill'){saveState();floodFill(x,y,state.color);state.isDrawing=false;return;}
      if(state.tool==='eyedropper'){pickColor(x,y);state.isDrawing=false;return;}
      snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);
      if(state.tool==='brush'||state.tool==='pencil'||state.tool==='eraser'){
        setupStroke();
        if(state.tool==='eraser'){ctx.strokeStyle='#fff';ctx.globalAlpha=1;}
        if(state.tool==='pencil'){ctx.lineWidth=Math.max(1,state.size/3);ctx.lineCap='square';ctx.lineJoin='miter';}
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+0.1,y+0.1);ctx.stroke();
      }
    }
    function draw(e) {
      e.preventDefault(); const{x,y}=getCoords(e);
      document.getElementById('coord-x').textContent=Math.round(x);
      document.getElementById('coord-y').textContent=Math.round(y);
      if(state.tool==='eraser'){
        const ds=state.size*state.zoom; eraserCursor.style.display='block';
        eraserCursor.style.width=ds+'px'; eraserCursor.style.height=ds+'px';
        const cx=e.touches?e.touches[0].clientX:e.clientX, cy=e.touches?e.touches[0].clientY:e.clientY;
        eraserCursor.style.left=(cx-ds/2)+'px'; eraserCursor.style.top=(cy-ds/2)+'px';
      }
      if(!state.isDrawing) return;
      if(state.tool==='brush'||state.tool==='pencil'||state.tool==='eraser'){
        if(state.smooth&&state.tool!=='pencil'){const mx=(state.prevX+x)/2,my=(state.prevY+y)/2;ctx.quadraticCurveTo(state.prevX,state.prevY,mx,my);ctx.stroke();ctx.beginPath();ctx.moveTo(mx,my);}
        else{ctx.lineTo(x,y);ctx.stroke();}
        state.prevX=x;state.prevY=y;
      } else if(state.tool==='bezier'){
        if(state.bezierPoints.length>0){ctx.putImageData(snapshot,0,0);drawBezierPreview(x,y);}
      } else {
        ctx.putImageData(snapshot,0,0); setupStroke();
        const f={line:drawLine,arrow:drawArrow,rectangle:drawRect,circle:drawCircle,triangle:drawTriangle,diamond:drawDiamond,star:drawStar};
        if(f[state.tool]) f[state.tool](x,y);
      }
    }
    function stopDraw() {
      if(!state.isDrawing) return; state.isDrawing=false;
      if(state.tool==='bezier'||state.tool==='fill'||state.tool==='eyedropper') return;
      ctx.globalAlpha=1; saveState();
    }
    function handleCanvasClick(e){if(state.tool==='bezier'){const{x,y}=getCoords(e);if(!snapshot)snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);handleBezierClick(x,y);}}

    canvas.addEventListener('mousedown',startDraw);
    canvas.addEventListener('mousemove',draw);
    canvas.addEventListener('mouseup',stopDraw);
    canvas.addEventListener('mouseleave',e=>{stopDraw(e);eraserCursor.style.display='none';});
    canvas.addEventListener('click',handleCanvasClick);
    canvas.addEventListener('touchstart',startDraw,{passive:false});
    canvas.addEventListener('touchmove',draw,{passive:false});
    canvas.addEventListener('touchend',stopDraw);
    canvasArea.addEventListener('wheel',e=>{e.preventDefault();setZoom(state.zoom+(e.deltaY>0?-0.1:0.1));},{passive:false});

    /* ===== СИНХРОНИЗАЦИЯ СЛАЙДЕРОВ ===== */
    const sizeSlider=document.getElementById('size-slider'),sizeVal=document.getElementById('size-val'),sizeDot=document.getElementById('size-dot');
    const opacitySlider=document.getElementById('opacity-slider'),opacityVal=document.getElementById('opacity-val');
    const mSizeSlider=document.querySelector('.mobile-size-slider'),mSizeVal=document.querySelector('.mobile-size-val');
    const mOpacitySlider=document.querySelector('.mobile-opacity-slider'),mOpacityVal=document.querySelector('.mobile-opacity-val');

    function updateSizeUI(){
      const s=state.size; sizeSlider.value=s;sizeVal.textContent=s;mSizeSlider.value=s;mSizeVal.textContent=s;
      const d=Math.max(2,Math.min(36,s));sizeDot.style.width=d+'px';sizeDot.style.height=d+'px';
    }
    function updateOpacityUI(){
      const v=Math.round(state.opacity*100);opacitySlider.value=v;opacityVal.textContent=v+'%';mOpacitySlider.value=v;mOpacityVal.textContent=v+'%';
    }
    sizeSlider.addEventListener('input',()=>{state.size=+sizeSlider.value;updateSizeUI();});
    mSizeSlider.addEventListener('input',()=>{state.size=+mSizeSlider.value;updateSizeUI();});
    opacitySlider.addEventListener('input',()=>{state.opacity=+opacitySlider.value/100;updateOpacityUI();});
    mOpacitySlider.addEventListener('input',()=>{state.opacity=+mOpacitySlider.value/100;updateOpacityUI();});
    updateSizeUI();

    /* Чекбоксы */
    document.getElementById('fill-shape').addEventListener('change',e=>{state.fillShape=e.target.checked;document.querySelector('.mobile-fill-shape').checked=e.target.checked;});
    document.querySelector('.mobile-fill-shape').addEventListener('change',e=>{state.fillShape=e.target.checked;document.getElementById('fill-shape').checked=e.target.checked;});
    document.getElementById('smooth-line').addEventListener('change',e=>{state.smooth=e.target.checked;document.querySelector('.mobile-smooth-line').checked=e.target.checked;});
    document.querySelector('.mobile-smooth-line').addEventListener('change',e=>{state.smooth=e.target.checked;document.getElementById('smooth-line').checked=e.target.checked;});

    /* ===== ЦВЕТА ===== */
    function setColor(hex){
      hex=hex.toLowerCase();state.color=hex;
      document.getElementById('color-picker').value=hex;document.getElementById('color-hex').value=hex;
      document.querySelector('.mobile-color-picker').value=hex;document.querySelector('.mobile-color-hex').value=hex;
      document.querySelectorAll('.color-swatch').forEach(s=>s.classList.toggle('active',s.dataset.color===hex));
    }
    function buildColors(id){
      const g=document.getElementById(id);
      COLORS.forEach(c=>{
        const s=document.createElement('div');s.className='color-swatch'+(c===state.color?' active':'');
        s.style.background=c;s.dataset.color=c;
        if(c==='#ffffff')s.style.border='2px solid var(--border-light)';
        s.addEventListener('click',()=>setColor(c));g.appendChild(s);
      });
    }
    buildColors('color-grid');buildColors('mobile-color-grid');
    document.getElementById('color-picker').addEventListener('input',e=>setColor(e.target.value));
    document.querySelector('.mobile-color-picker').addEventListener('input',e=>setColor(e.target.value));
    function handleHex(el){let v=el.value.trim();if(!v.startsWith('#'))v='#'+v;if(/^#[0-9a-fA-F]{6}$/.test(v))setColor(v);else{el.value=state.color;showToast('Неверный формат цвета','error');}}
    document.getElementById('color-hex').addEventListener('change',e=>handleHex(e.target));
    document.querySelector('.mobile-color-hex').addEventListener('change',e=>handleHex(e.target));

    /* ===== КНОПКИ ДЕЙСТВИЙ ===== */
    document.getElementById('btn-undo').addEventListener('click',undo);
    document.getElementById('btn-redo').addEventListener('click',redo);
    document.getElementById('btn-undo-panel').addEventListener('click',undo);
    document.getElementById('btn-redo-panel').addEventListener('click',redo);
    document.getElementById('m-btn-undo').addEventListener('click',undo);
    document.getElementById('m-btn-redo').addEventListener('click',redo);
    document.getElementById('btn-clear').addEventListener('click',clearCanvas);
    document.getElementById('m-btn-clear').addEventListener('click',clearCanvas);
    document.getElementById('btn-zoom-in').addEventListener('click',()=>setZoom(state.zoom+0.15));
    document.getElementById('btn-zoom-out').addEventListener('click',()=>setZoom(state.zoom-0.15));
    document.getElementById('btn-zoom-fit').addEventListener('click',()=>setZoom(1));
    document.getElementById('m-btn-zoom-in').addEventListener('click',()=>setZoom(state.zoom+0.15));
    document.getElementById('m-btn-zoom-out').addEventListener('click',()=>setZoom(state.zoom-0.15));
    document.getElementById('m-btn-zoom-fit').addEventListener('click',()=>setZoom(1));

    async function saveImage(){
      try{
        const tc=document.createElement('canvas');tc.width=canvas.width;tc.height=canvas.height;
        const tx=tc.getContext('2d');tx.fillStyle='#fff';tx.fillRect(0,0,tc.width,tc.height);tx.drawImage(canvas,0,0);
        const blob=await new Promise(r=>tc.toBlob(r,'image/png'));const url=URL.createObjectURL(blob);
        const a=document.createElement('a');a.href=url;a.download=`sketchlab_${Date.now()}.png`;
        document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},200);
        showToast('Рисунок сохранён','success');
      }catch(err){showToast('Ошибка сохранения','error');}
    }
    document.getElementById('btn-save').addEventListener('click',saveImage);
    document.getElementById('m-btn-save').addEventListener('click',saveImage);

    /* Модалка */
    document.getElementById('btn-shortcuts').addEventListener('click',()=>document.getElementById('shortcuts-modal').classList.add('show'));
    document.getElementById('close-shortcuts').addEventListener('click',()=>document.getElementById('shortcuts-modal').classList.remove('show'));
    document.getElementById('shortcuts-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('show');});

    /* Мобильные вкладки */
    document.querySelectorAll('.mobile-tab').forEach(tab=>{
      tab.addEventListener('click',()=>{
        document.querySelectorAll('.mobile-tab').forEach(t=>t.classList.remove('active'));
        document.querySelectorAll('.mobile-tab-content').forEach(c=>c.classList.remove('active'));
        tab.classList.add('active');document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
      });
    });

    /* ===== ГОРЯЧИЕ КЛАВИШИ ===== */
    const TK={b:'brush',p:'pencil',e:'eraser',l:'line',r:'rectangle',c:'circle',t:'triangle',d:'diamond',a:'arrow',s:'star',g:'fill',i:'eyedropper'};
    document.addEventListener('keydown',e=>{
      if(e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();
      if(e.ctrlKey||e.metaKey){
        if(k==='z'){e.preventDefault();undo();}else if(k==='y'){e.preventDefault();redo();}
        else if(k==='s'){e.preventDefault();saveImage();}else if(k==='='||k==='+'){e.preventDefault();setZoom(state.zoom+0.15);}
        else if(k==='-'){e.preventDefault();setZoom(state.zoom-0.15);}else if(k==='0'){e.preventDefault();setZoom(1);}return;
      }
      if(k==='delete'){clearCanvas();return;}if(k===']'){state.size=Math.min(80,state.size+2);updateSizeUI();return;}
      if(k==='['){state.size=Math.max(1,state.size-2);updateSizeUI();return;}
      if(k==='escape'){state.bezierPoints=[];snapshot=null;document.getElementById('shortcuts-modal').classList.remove('show');return;}
      if(TK[k])selectTool(TK[k]);
    });

    let hasUnsaved=false;
    canvas.addEventListener('mousedown',()=>hasUnsaved=true);
    canvas.addEventListener('touchstart',()=>hasUnsaved=true);
    window.addEventListener('beforeunload',e=>{if(hasUnsaved){e.preventDefault();e.returnValue='';}});

    /* ===== СТАРТ ===== */
    initCanvas();
    document.getElementById('canvas-size').textContent=`${CANVAS_W} x ${CANVAS_H}`;
  
