// script.js

let currentUserId = null

const coloursKey = () =>
  currentUserId
    ? `timetable-colours-${currentUserId}`
    : 'timetable-colours-guest'

// safe Firebase bootstrap — app still works even if Firebase fails
const auth = window.__auth || null
const db   = window.__db   || null

const fbRaw = window.__fb || {}

const safeFb = {
  onAuthStateChanged: (fbRaw && typeof fbRaw.onAuthStateChanged === 'function')
    ? fbRaw.onAuthStateChanged
    : () => {},
  createUserWithEmailAndPassword: (fbRaw && typeof fbRaw.createUserWithEmailAndPassword === 'function')
    ? fbRaw.createUserWithEmailAndPassword
    : async () => { throw new Error('auth not ready') },
  signInWithEmailAndPassword: (fbRaw && typeof fbRaw.signInWithEmailAndPassword === 'function')
    ? fbRaw.signInWithEmailAndPassword
    : async () => { throw new Error('auth not ready') },
  signOut: (fbRaw && typeof fbRaw.signOut === 'function')
    ? fbRaw.signOut
    : async () => { throw new Error('auth not ready') },
  doc: (fbRaw && typeof fbRaw.doc === 'function')
    ? fbRaw.doc
    : () => { throw new Error('firestore not ready') },
  getDoc: (fbRaw && typeof fbRaw.getDoc === 'function')
    ? fbRaw.getDoc
    : async () => ({ exists: () => false }),
  setDoc: (fbRaw && typeof fbRaw.setDoc === 'function')
    ? fbRaw.setDoc
    : async () => {}
}

const {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
  setDoc
} = safeFb

const TITLE    = 'S2-10'
const SUBTITLE = '2026 TERM 2'

const TIMES_ALL = [
  '08:00','08:20','08:40','09:00','09:20','09:40',
  '10:00','10:20','10:40','11:00','11:20','11:40',
  '12:00','12:20','12:40','13:00','13:20','13:40',
  '14:00','14:20','14:40','15:00','15:20','15:40',
  '16:00','16:20','16:40','17:00','17:20','17:40'
]

const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri']

const TIMETABLE = {
  odd: [
    [
      {label:'—',             span:3,  style:'empty'},
      {label:'Mother Tongue', span:3,  style:'mt'},
      {label:'SCI',           span:2,  style:'sci'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'EL',          span:3,  style:'el'},
      {label:'CM(ADMT)',            span:2,  style:'cm'},
      {label:'S&W',      span:3,  style:'sw'},
      {label:'CCE / Assembly',span:3,  style:'cce'},
      {label:'—',             span:9,  style:'empty'}
    ],
    [
      {label:'HUM (GEOG)',           span:2,  style:'hum'},
      {label:'MATH',           span:3,  style:'math'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'CM(ICT)',          span:3,  style:'cmict'},
      {label:'Mother Tongue', span:3,  style:'mt'},
      {label:'SCI',    span:3,  style:'sci'},
      {label:'—',             span:14, style:'empty'}
    ],
    [
      {label:'—',             span:1,  style:'empty'},
      {label:'SCI', span:2,  style:'sci'},
      {label:'EL',            span:2,  style:'el'},
      {label:'S&W',         span:3,  style:'sw'},
      {label:'BREAK',           span:2,  style:'brk'},
      {label:'MATH',    span:2,  style:'math'},
      {label:'CM(ADMT)',      span:3,  style:'cm'},
      {label:'CCE / Assembly',span:3,  style:'cce'},
      {label:'—',             span:12, style:'empty'}
    ],
    [
      {label:'HBL',           span:30, style:'hbl'}
    ],
    [
      {label:'HUM (GEOG)',       span:3,  style:'hum'},
      {label:'Mother Tongue',          span:2,  style:'mt'},
      {label:'CM(ICT)',           span:2,  style:'cmict'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'EL',           span:3,  style:'el'},
      {label:'MATH',    span:2,  style:'math'},
      {label:'—',             span:16, style:'empty'}
    ]
  ],
  even: [
    [
      {label:'—',             span:3,  style:'empty'},
      {label:'CM(ADMT)',          span:2,  style:'cm'},
      {label:'SCI',           span:3,  style:'sci'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'HUM(GEOG)',            span:3,  style:'hum'},
      {label:'Mother Tongue',           span:2,  style:'mt'},
      {label:'EL', span:3,  style:'el'},
      {label:'CCE / Assembly',span:3,  style:'cce'},
      {label:'—',             span:9,  style:'empty'}
    ],
    [
      {label:'SCI',            span:3,  style:'sci'},
      {label:'HUM(GEOG)',      span:2,  style:'hum'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'EL',    span:3,  style:'el'},
      {label:'S&W',           span:3,  style:'sw'},
      {label:'MATH',          span:3,  style:'math'},
      {label:'—',             span:14, style:'empty'}
    ],
    [
      {label:'—',             span:1,  style:'empty'},
      {label:'SCI',           span:2,  style:'sci'},
      {label:'CM(ICT)',       span:2,  style:'cmict'},
      {label:'S&W',      span:3,  style:'sw'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'MATH',      span:2,  style:'math'},
      {label:'Mother Tongue', span:3,  style:'mt'},
      {label:'CCE / Assembly',span:3,  style:'cce'},
      {label:'—',             span:12, style:'empty'}
    ],
    [
      {label:'—',             span:3,  style:'empty'},
      {label:'SCI',           span:4,  style:'sci'},
      {label:'Mother Tongue', span:3,  style:'mt'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'CM(ADMT)',       span:3,  style:'cm'},
      {label:'MATH',          span:3,  style:'math'},
      {label:'EL',            span:3,  style:'el'},
      {label:'—',             span:9,  style:'empty'}
    ],
    [
      {label:'EL',      span:2,  style:'el'},
      {label:'CM(ADMT)',          span:2,  style:'cm'},
      {label:'Mother Tongue', span:3,  style:'mt'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'MATH',            span:2,  style:'math'},
      {label:'HUM (GEOG)',    span:3,  style:'hum'},
      {label:'—',             span:16, style:'empty'}
    ]
  ]
}

// ======================= STATIC UI SETUP =======================

document.getElementById('titleEl').textContent = TITLE
document.getElementById('btmEl').textContent   = TITLE + ' · ' + SUBTITLE

const DAYS_SH  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const nowDate  = new Date()
const todayDow = nowDate.getDay()
document.getElementById('todayPill').textContent =
  DAYS_SH[todayDow] + ' · ' +
  nowDate.toLocaleDateString('en-SG',{day:'numeric',month:'short'})

// minutes from 08:00, every 20 mins
const ALL_MINS = [
  480,500,520, 540,560,580, 600,620,640, 660,680,700,
  720,740,760, 780,800,820, 840,860,880,
  900,920,940, 960,980,1000, 1020,1040,1060
]

const LOWER_N = 21
const UPPER_N = 30

let week = 'odd'
let sec  = 'lower'

function nCols()  { return sec === 'lower' ? LOWER_N : UPPER_N }
function mins()   { return ALL_MINS.slice(0, nCols()) }
function endMin() { return sec === 'lower' ? 960 : 1080 }
function times()  { return TIMES_ALL.slice(0, nCols()) }

const wrap = document.getElementById('tableWrap')

const timeLine = document.createElement('div')
timeLine.className = 'time-line'
timeLine.id = 'tl'
timeLine.style.display = 'none'
wrap.appendChild(timeLine)

// ======================= TABLE BUILD =======================

function buildTable(wk) {
  const ts = times()
  const isUpper = sec === 'upper'

  let html = `<table id="tbl${wk}" class="hidden" style="min-width:${isUpper ? 940 : 700}px">
<thead><tr><th class="th-label" style="width:26px"></th>`

  ts.forEach((t,i) => {
    const minor = isUpper && (i % 2 !== 0)
    html += minor
      ? `<th class="th-minor"></th>`
      : `<th class="th-major">${t}</th>`
  })

  html += `</tr></thead><tbody>`

  TIMETABLE[wk].forEach((blocks, di) => {
    const dow = di + 1
    const isToday = dow === todayDow
    html += `<tr${isToday ? ' class="today-row"' : ''}>`
    html += `<td class="td-day">${DAY_LABELS[di]}</td>`
    let rem = nCols()
    blocks.forEach((b, bi) => {
      if (rem <= 0) return
      const sp = Math.min(b.span, rem)
      rem -= sp
      html += `<td colspan="${sp}"><div class="cell ${b.style}" id="c-${wk}-${di}-${bi}"><span class="subj">${b.label}</span></div></td>`
    })
    html += `</tr>`
  })

  html += `</tbody></table>`
  return html
}

function showActive() {
  ['odd','even'].forEach(w => {
    const t = document.getElementById('tbl'+w)
    if (t) t.classList.toggle('hidden', w !== week)
  })
}

function rebuild() {
  wrap.querySelectorAll('table').forEach(t => t.remove())
  wrap.insertAdjacentHTML('afterbegin', buildTable('odd') + buildTable('even'))
  applyColours()
  showActive()
  setTimeout(tick, 60)
}

// ======================= TOGGLE PILLS =======================

function movePill(pillId, btnEl) {
  const p = document.getElementById(pillId)
  if (!p || !btnEl) return
  p.style.left  = btnEl.offsetLeft + 'px'
  p.style.width = btnEl.offsetWidth + 'px'
}

function setWeek(w) {
  week = w
  document.getElementById('btnOdd').classList.toggle('active',  w === 'odd')
  document.getElementById('btnEven').classList.toggle('active', w === 'even')
  movePill('pillWeek', document.getElementById(w === 'odd' ? 'btnOdd' : 'btnEven'))
  showActive()
  tick()
}

function setSec(s) {
  sec = s
  document.getElementById('btn4pm').classList.toggle('active', s === 'lower')
  document.getElementById('btn6pm').classList.toggle('active', s === 'upper')
  movePill('pillSec', document.getElementById(s === 'lower' ? 'btn4pm' : 'btn6pm'))
  rebuild()
}

window.setWeek = setWeek
window.setSec  = setSec

setTimeout(() => {
  movePill('pillWeek', document.getElementById('btnOdd'))
  movePill('pillSec',  document.getElementById('btn4pm'))
  document.getElementById('btnOdd').classList.add('active')
  document.getElementById('btn4pm').classList.add('active')
  rebuild()
}, 60)

// ======================= TIME + NOW-LINE =======================

function nowMins() {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes()
}

function colPositions() {
  const tbl = document.getElementById('tbl'+week)
  if (!tbl) return null
  const ths  = tbl.querySelectorAll('thead th')
  const pm   = mins()
  const em   = endMin()
  const wr   = wrap.getBoundingClientRect()
  const cols = []

  for (let i = 1; i < ths.length; i++) {
    const r = ths[i].getBoundingClientRect()
    cols.push({
      l: r.left  - wr.left + wrap.scrollLeft,
      r: r.right - wr.left + wrap.scrollLeft,
      s: pm[i-1],
      e: i < ths.length - 1 ? pm[i] : em
    })
  }
  return cols
}

function tick() {
  const nm = nowMins()
  const pm = mins()
  const em = endMin()
  const tl = document.getElementById('tl')
  const nowBar  = document.getElementById('nowBar')
  const nowSubj = document.getElementById('nowSubj')

  const weekday = todayDow >= 1 && todayDow <= 5
  const inHours = nm >= pm[0] && nm <= em

  document.querySelectorAll('.cell.now').forEach(c => c.classList.remove('now'))

  if (!weekday || !inHours) {
    tl.style.display = 'none'
    if (nowBar) nowBar.style.display = 'none'
    return
  }

  let nowP = -1
  for (let i = 0; i < pm.length; i++) {
    const e = i < pm.length - 1 ? pm[i+1] : em
    if (nm >= pm[i] && nm < e) {
      nowP = i
      break
    }
  }

  const di = todayDow - 1
  const day = TIMETABLE[week]?.[di]

  if (day && nowP >= 0) {
    let pIdx = 0
    let label = null

    day.forEach(b => {
      if (nowP >= pIdx && nowP <= pIdx + b.span - 1) label = b.label
      pIdx += b.span
    })

    if (label && label !== '—') {
      if (nowBar) nowBar.style.display = 'flex'
      if (nowSubj) nowSubj.textContent = label
    } else {
      if (nowBar) nowBar.style.display = 'none'
    }

    pIdx = 0
    day.forEach((b, bi) => {
      if (nowP >= pIdx && nowP <= pIdx + b.span - 1 && b.style !== 'empty') {
        const cell = document.getElementById(`c-${week}-${di}-${bi}`)
        if (cell) cell.classList.add('now')
      }
      pIdx += b.span
    })
  } else {
    if (nowBar) nowBar.style.display = 'none'
  }

  const cols = colPositions()
  if (!cols) {
    tl.style.display = 'none'
    return
  }

  let xPos = null
  for (let i = 0; i < cols.length; i++) {
    const c = cols[i]
    if (nm >= c.s && nm < c.e) {
      xPos = c.l + (nm - c.s) / (c.e - c.s) * (c.r - c.l)
      break
    }
  }
  if (xPos === null && nm >= cols[cols.length - 1].s) xPos = cols[cols.length - 1].r

  const tbl = document.getElementById('tbl'+week)
  if (xPos !== null && tbl) {
    const thead    = tbl.querySelector('thead')
    const todayRow = tbl.querySelector('tr.today-row')
    const wr       = wrap.getBoundingClientRect()

    if (todayRow) {
      const top = thead.getBoundingClientRect().bottom - wr.top + wrap.scrollTop
      const h   = todayRow.getBoundingClientRect().bottom - thead.getBoundingClientRect().bottom
      tl.style.display = 'block'
      tl.style.left    = xPos + 'px'
      tl.style.top     = top + 'px'
      tl.style.height  = Math.max(h, 0) + 'px'
    } else {
      tl.style.display = 'none'
    }
  } else {
    tl.style.display = 'none'
  }
}

// keep it moving & synced
setInterval(tick, 60000)
wrap.addEventListener('scroll', tick)
