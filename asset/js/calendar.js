/* SG Menzingen – Monatskalender
   Lädt assets/js/events.json und rendert eine Monatsansicht mit Navigation.
*/
(() => {
  const monthLabel = document.getElementById('monthLabel');
  const yearSelect = document.getElementById('yearSelect');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const grid = document.getElementById('calendar');
  const tbody = document.getElementById('eventRows');

  let events = []; // aus JSON
  let current = new Date();

  const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

  // Modal
  const modal = new bootstrap.Modal('#eventModal');
  const mTitle = document.getElementById('eventTitle');
  const mDate  = document.getElementById('eventDate');
  const mLoc   = document.getElementById('eventLocation');
  const mDesc  = document.getElementById('eventDesc');

  function fmt(d){
    return d.toLocaleDateString('de-CH',{year:'numeric',month:'2-digit',day:'2-digit'});
  }

  function byMonthYear(ev, y, m){
    const dt = new Date(ev.date);
    return dt.getFullYear()===y && dt.getMonth()===m;
  }

  function renderYearOptions(minY, maxY){
    yearSelect.innerHTML='';
    for(let y=minY; y<=maxY; y++){
      const opt=document.createElement('option');
      opt.value=y; opt.textContent=y;
      if(y===current.getFullYear()) opt.selected=true;
      yearSelect.appendChild(opt);
    }
  }

  function render(){
    const y = current.getFullYear();
    const m = current.getMonth();
    monthLabel.textContent = `${MONTHS[m]} ${y}`;

    // Kalender-Gitter
    grid.innerHTML='';
    const first = new Date(y, m, 1);
    const startIdx = (first.getDay()+6)%7; // Mo=0
    const daysInMonth = new Date(y, m+1, 0).getDate();

    // Leere Zellen vor dem 1.
    for(let i=0;i<startIdx;i++){
      const c=document.createElement('div'); c.className='calendar-cell opacity-25';
      grid.appendChild(c);
    }

    const monthEvents = events.filter(ev => byMonthYear(ev, y, m))
                              .sort((a,b)=> new Date(a.date)-new Date(b.date));

    // Tage
    for(let d=1; d<=daysInMonth; d++){
      const cell=document.createElement('div');
      cell.className='calendar-cell';
      const day=document.createElement('div');
      day.className='day'; day.textContent=d;
      const wrap=document.createElement('div');
      wrap.className='events';

      // Events des Tages
      const todayStr = new Date(y,m,d).toISOString().slice(0,10);
      monthEvents.filter(e => e.date===todayStr).forEach(e=>{
        const tag=document.createElement('span');
        tag.className='badge-event';
        tag.textContent = e.title + (e.time ? ` · ${e.time}` : '');
        tag.title = e.location || '';
        tag.addEventListener('click', ()=>{
          mTitle.textContent = e.title;
          mDate.textContent  = fmt(new Date(e.date)) + (e.time?` · ${e.time}`:'');
          mLoc.textContent   = e.location || '—';
          mDesc.textContent  = e.description || '';
          modal.show();
        });
        wrap.appendChild(tag);
      });

      cell.appendChild(day);
      cell.appendChild(wrap);
      grid.appendChild(cell);
    }

    // Fallback-Liste (optional)
    if(tbody){
      tbody.innerHTML='';
      monthEvents.forEach(e=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${fmt(new Date(e.date))}</td>
                      <td>${e.title}</td>
                      <td>${e.location||'—'}</td>
                      <td>${e.time||'—'}</td>`;
        tbody.appendChild(tr);
      });
    }
  }

  function go(delta){
    current = new Date(current.getFullYear(), current.getMonth()+delta, 1);
    render();
  }

  // Init
  fetch('assets/js/events.json')
    .then(r=>r.json())
    .then(json=>{
      events = json.events || [];
      // Jahrbereich aus Daten bestimmen
      const years = events.map(e=> new Date(e.date).getFullYear());
      const minY = Math.min(...years), maxY = Math.max(...years);
      const today = new Date();
      // auf ersten Monat mit Events in aktuellem Jahr springen, sonst erstes Jahr
      const hasThisYear = years.includes(today.getFullYear());
      current = hasThisYear
        ? new Date(today.getFullYear(), Math.min(...events.filter(e=>new Date(e.date).getFullYear()===today.getFullYear()).map(e=>new Date(e.date).getMonth())), 1)
        : new Date(minY, Math.min(...events.filter(e=>new Date(e.date).getFullYear()===minY).map(e=>new Date(e.date).getMonth())), 1);

      renderYearOptions(minY, maxY);
      render();

      yearSelect.addEventListener('change', ()=>{
        current = new Date(parseInt(yearSelect.value,10), current.getMonth(), 1);
        render();
      });
      prevBtn.addEventListener('click', ()=>go(-1));
      nextBtn.addEventListener('click', ()=>go(1));
    })
    .catch(err=>{
      console.error('Events laden fehlgeschlagen', err);
      document.getElementById('fallbackTable')?.classList.remove('d-none');
    });
})();
