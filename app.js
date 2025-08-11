
(function(){
  var STORAGE_KEY = 'postit_layers_vanilla_v1';
  var COLORS = ['#fde68a','#a7f3d0','#bfdbfe','#fecaca','#ddd6fe','#e9d5ff','#fbcfe8'];

  function uid(prefix){ return (prefix||'id') + '_' + Math.random().toString(36).slice(2,9); }

  function loadState(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e){}
    var layerA = { id: uid('layer'), name:'Strategy', visible:true };
    var layerB = { id: uid('layer'), name:'Tasks', visible:true };
    var layerC = { id: uid('layer'), name:'Inspiration', visible:false };
    var n1 = { id: uid('note'), ownerLayerId: layerA.id, x:100, y:80, w:180, h:140, color:COLORS[0], text:'Project overview\n— audience\n— value prop', styleOverrides: (function(o){ o[layerB.id]={visible:true,color:COLORS[2],opacity:0.9}; return o;})({}) };
    var n2 = { id: uid('note'), ownerLayerId: layerB.id, x:420, y:220, w:180, h:140, color:COLORS[1], text:'MVP backlog\n- Canvas\n- Layers\n- LocalStorage', styleOverrides:{} };
    var n3 = { id: uid('note'), ownerLayerId: layerA.id, x:700, y:120, w:180, h:140, color:COLORS[3], text:'Risks\n- Scope\n- Schedule\n- Tech debt', styleOverrides: (function(o){ o[layerC.id]={visible:true,opacity:0.6}; return o;})({}) };
    return { layers:[layerA,layerB,layerC], notes:[n1,n2,n3], activeLayerId: layerA.id, cam:{x:0,y:0} };
  }

  var state = loadState();

  function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){} }

  var canvas = document.getElementById('canvas');
  var layerList = document.getElementById('layerList');

  function visibleLayerIds(){
    var s = {};
    state.layers.forEach(function(l){ if(l.visible) s[l.id]=true; });
    return s;
  }

  function noteStyleFor(note){
    var vis = visibleLayerIds();
    var a = (note.styleOverrides && note.styleOverrides[state.activeLayerId]) || null;
    if (a && a.visible) return { color: a.color || note.color, opacity: (a.opacity!=null?a.opacity:1) };
    if (vis[note.ownerLayerId]) return { color: note.color, opacity: 1 };
    for (var lid in (note.styleOverrides||{})){
      var o = note.styleOverrides[lid];
      if (vis[lid] && o.visible) return { color: (o.color||note.color), opacity:(o.opacity!=null?o.opacity:1) };
    }
    return null;
  }

  function render(){
    // layers
    layerList.innerHTML='';
    state.layers.forEach(function(l){
      var row = document.createElement('div');
      row.className = 'layer-row' + (state.activeLayerId===l.id?' active':'');
      var cb = document.createElement('input');
      cb.type='checkbox'; cb.checked = !!l.visible;
      cb.onchange = function(){ l.visible = !l.visible; save(); render(); };
      var btn = document.createElement('button');
      btn.className='btn'; btn.style.flex='1'; btn.textContent = l.name;
      btn.onclick = function(){ state.activeLayerId=l.id; save(); render(); };
      var rn = document.createElement('button');
      rn.className='btn'; rn.textContent='✎';
      rn.onclick = function(){ var name = prompt('New name:', l.name)||''; name=name.trim(); if(!name) return; l.name=name; save(); render(); };
      var del = document.createElement('button');
      del.className='btn'; del.textContent='🗑';
      del.onclick=function(){
        var owns = state.notes.some(function(n){return n.ownerLayerId===l.id;});
        if (owns) { alert('Cannot delete: layer owns notes.'); return; }
        if (!confirm('Delete layer "'+l.name+'"?')) return;
        // remove refs
        state.notes.forEach(function(n){ if(n.styleOverrides && n.styleOverrides[l.id]){ delete n.styleOverrides[l.id]; }});
        state.layers = state.layers.filter(function(x){ return x.id!==l.id; });
        if (state.activeLayerId===l.id && state.layers.length) state.activeLayerId = state.layers[0].id;
        save(); render();
      };
      row.appendChild(cb); row.appendChild(btn); row.appendChild(rn); row.appendChild(del);
      layerList.appendChild(row);
    });

    // canvas
    canvas.innerHTML='';
    canvas.className = 'gridbg';
    canvas.style.transform = 'translate('+state.cam.x+'px,'+state.cam.y+'px)';
    state.notes.forEach(function(n){
      var st = noteStyleFor(n);
      if (!st) return;
      var el = document.createElement('div');
      el.className='note';
      el.style.left = (n.x)+'px';
      el.style.top = (n.y)+'px';
      el.style.width = n.w+'px';
      el.style.height = n.h+'px';
      el.style.background = st.color;
      el.style.opacity = st.opacity;

      var head = document.createElement('header');
      var title = document.createElement('span');
      title.textContent = (n.ownerLayerId===state.activeLayerId?'(owner) ':'') + 'Post-it';
      var actions = document.createElement('div');
      var dup = document.createElement('button'); dup.className='btn'; dup.textContent='⧉';
      dup.onclick = function(ev){ ev.stopPropagation(); var c=JSON.parse(JSON.stringify(n)); c.id=uid('note'); c.x+=24; c.y+=24; state.notes.push(c); save(); render(); };
      var ref = document.createElement('button'); ref.className='btn'; ref.textContent='@';
      ref.onclick = function(ev){ ev.stopPropagation(); if (n.ownerLayerId===state.activeLayerId){ alert('This note already belongs to the active layer.'); return; } n.styleOverrides = n.styleOverrides||{}; var cur = n.styleOverrides[state.activeLayerId]||{}; cur.visible=true; n.styleOverrides[state.activeLayerId]=cur; save(); render(); };
      var del = document.createElement('button'); del.className='btn'; del.textContent='✕';
      del.onclick = function(ev){ ev.stopPropagation(); state.notes = state.notes.filter(function(x){return x.id!==n.id;}); save(); render(); };
      actions.appendChild(dup); actions.appendChild(ref); actions.appendChild(del);
      head.appendChild(title); head.appendChild(actions);

      var ta = document.createElement('textarea');
      ta.value = n.text||'';
      ta.onmousedown = function(ev){ ev.stopPropagation(); };
      ta.oninput = function(){ n.text = ta.value; save(); };

      var res = document.createElement('div');
      res.title='Resize';
      res.style.cssText='position:absolute;bottom:6px;right:6px;width:16px;height:16px;background:#fff8;border:1px solid rgba(0,0,0,.2);border-radius:4px;cursor:nwse-resize;';

      el.appendChild(head); el.appendChild(ta); el.appendChild(res);
      canvas.appendChild(el);

      // drag note
      el.onmousedown = function(ev){
        ev.preventDefault();
        var sx = ev.clientX, sy = ev.clientY, ox = n.x, oy = n.y;
        function mm(e2){
          n.x = ox + (e2.clientX - sx);
          n.y = oy + (e2.clientY - sy);
          el.style.left = n.x+'px';
          el.style.top = n.y+'px';
        }
        function mu(){ window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); save(); }
        window.addEventListener('mousemove', mm);
        window.addEventListener('mouseup', mu);
      };

      // resize
      res.onmousedown = function(ev){
        ev.stopPropagation(); ev.preventDefault();
        var sx = ev.clientX, sy = ev.clientY, sw = n.w, sh = n.h;
        function mm(e2){
          n.w = Math.max(120, sw + (e2.clientX - sx));
          n.h = Math.max(100, sh + (e2.clientY - sy));
          el.style.width = n.w+'px';
          el.style.height = n.h+'px';
        }
        function mu(){ window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); save(); }
        window.addEventListener('mousemove', mm);
        window.addEventListener('mouseup', mu);
      };
    });
  }

  // pan background
  (function(){
    var bg = document.getElementById('canvas');
    var panning = false, sx=0, sy=0, ox=0, oy=0;
    bg.onmousedown = function(ev){ panning=true; sx=ev.clientX; sy=ev.clientY; ox=state.cam.x; oy=state.cam.y; };
    window.addEventListener('mousemove', function(ev){ if(!panning) return; state.cam.x = ox + (ev.clientX - sx); state.cam.y = oy + (ev.clientY - sy); render(); });
    window.addEventListener('mouseup', function(){ panning=false; save(); });
  })();

  // toolbar
  document.getElementById('addNote').onclick = function(){
    var active = state.layers.find(function(l){return l.id===state.activeLayerId;});
    if (!active) return;
    state.notes.push({ id: uid('note'), ownerLayerId: active.id, x: 120 - state.cam.x, y: 120 - state.cam.y, w:180, h:140, color: COLORS[Math.floor(Math.random()*COLORS.length)], text:'New note', styleOverrides:{} });
    save(); render();
  };
  document.getElementById('reset').onclick = function(){ state.cam = {x:0,y:0}; save(); render(); };
  document.getElementById('addLayer').onclick = function(){
    var name = prompt('Layer name:')||''; name=name.trim(); if(!name) return;
    var layer = { id: uid('layer'), name:name, visible:true };
    state.layers.push(layer); state.activeLayerId = layer.id; save(); render();
  };

  render();
})();
