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
const SUBTITLE = '2026 TERM 1'

const TIMES_ALL = [
  '08:00','08:20','08:40','09:00','09:20','09:40',
  '10:00','10:20','10:40','11:00','11:20','11:40',
  '12:00','12:20','12:40','13:00','13:20','13:40',
  '14:00','14:20','14:40','15:00','15:20','15:40',
  '16:00','16:20','16:40','17:00','17:20','17:40'
]

const DAY_LABELS = ['Mo','Tu','Adv','Th','Fr']

const TIMETABLE = {
  odd: [
    [
      {label:'—',             span:3,  style:'empty'},
      {label:'Mother Tongue',       span:2,  style:'mt'},
      {label:'SCI',           span:3,  style:'sci'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'MATH',          span:2,  style:'math'},
      {label:'EL',            span:3,  style:'el'},
      {label:'CM(ADMT)',      span:3,  style:'cm'},
      {label:'CCE / Assembly',span:3,  style:'cce'},
      {label:'—',             span:9,  style:'empty'}
    ],
    [
      {label:'S&W',           span:3,  style:'sw'},
      {label:'SCI',           span:2,  style:'sci'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'MATH',          span:3,  style:'math'},
      {label:'Mother Tongue',       span:3,  style:'mt'},
      {label:'HUM (GEOG)',    span:3,  style:'hum'},
      {label:'—',             span:14, style:'empty'}
    ],
    [
      {label:'—',             span:1,  style:'empty'},
      {label:'Mother Tongue',       span:3,  style:'mt'},
      {label:'EL',            span:2,  style:'el'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'SCI',           span:2,  style:'sci'},
      {label:'HUM (GEOG)',    span:2,  style:'hum'},
      {label:'CM(ADMT)',      span:3,  style:'cm'},
      {label:'CCE / Assembly',span:3,  style:'cce'},
      {label:'—',             span:12, style:'empty'}
    ],
    [
      {label:'HBL',           span:30, style:'hbl'}
    ],
    [
      {label:'CM(ICT)',       span:2,  style:'cmict'},
      {label:'MATH',          span:2,  style:'math'},
      {label:'S&W',           span:3,  style:'sw'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'SCI',           span:2,  style:'sci'},
      {label:'HUM (GEOG)',    span:3,  style:'hum'},
      {label:'—',             span:16, style:'empty'}
    ]
  ],
  even: [
    [
      {label:'—',             span:3,  style:'empty'},
      {label:'MATH',          span:2,  style:'math'},
      {label:'SCI',           span:3,  style:'sci'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'EL',            span:3,  style:'el'},
      {label:'S&W',           span:3,  style:'sw'},
      {label:'Mother Tongue',       span:2,  style:'mt'},
      {label:'CCE / Assembly',span:3,  style:'cce'},
      {label:'—',             span:9,  style:'empty'}
    ],
    [
      {label:'EL',            span:3,  style:'el'},
      {label:'CM(ADMT)',      span:2,  style:'cm'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'HUM (GEOG)',    span:3,  style:'hum'},
      {label:'SCI',           span:3,  style:'sci'},
      {label:'MATH',          span:3,  style:'math'},
      {label:'—',             span:14, style:'empty'}
    ],
    [
      {label:'—',             span:1,  style:'empty'},
      {label:'S&W',           span:3,  style:'sw'},
      {label:'CM(ICT)',       span:2,  style:'cmict'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'CM(ADMT)',      span:2,  style:'cm'},
      {label:'Mother Tongue',       span:3,  style:'mt'},
      {label:'EL',            span:2,  style:'el'},
      {label:'CCE / Assembly',span:3,  style:'cce'},
      {label:'—',             span:12, style:'empty'}
    ],
    [
      {label:'—',             span:3,  style:'empty'},
      {label:'SCI',           span:4,  style:'sci'},
      {label:'Mother Tongue',       span:3,  style:'mt'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'CM(ICT)',       span:3,  style:'cmict'},
      {label:'MATH',          span:3,  style:'math'},
      {label:'EL',            span:3,  style:'el'},
      {label:'—',             span:9,  style:'empty'}
    ],
    [
      {label:'CM(ADMT)',      span:2,  style:'cm'},
      {label:'MATH',          span:2,  style:'math'},
      {label:'Mother Tongue',       span:3,  style:'mt'},
      {label:'BREAK',         span:2,  style:'brk'},
      {label:'EL',            span:3,  style:'el'},
      {label:'HUM (GEOG)',    span:2,  style:'hum'},
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
    nowBar.style.display = 'none'
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
      nowBar.style.display = 'flex'
      nowSubj.textContent = label
    } else {
      nowBar.style.display = 'none'
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
    nowBar.style.display = 'none'
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

setInterval(tick, 60000)
wrap.addEventListener('scroll', tick)

// ======================= SETTINGS OVERLAY + COLOURS =======================

function openSettings() {
  const el = document.getElementById('sOverlay')
  if (el) el.classList.add('open')
}

function closeSettings() {
  const el = document.getElementById('sOverlay')
  if (el) el.classList.remove('open')
}

function overlayClick(e) {
  const overlay = document.getElementById('sOverlay')
  if (overlay && e.target === overlay) closeSettings()
}

window.addEventListener('DOMContentLoaded', () => {
  const settingsBtn      = document.getElementById('settingsBtn')
  const overlay          = document.getElementById('sOverlay')
  const settingsCloseBtn = document.getElementById('settingsCloseBtn')

  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettings)
  }
  if (overlay) {
    overlay.addEventListener('click', overlayClick)
  }
  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', closeSettings)
  }

  const glowChk = document.getElementById('glowChk')
  if (glowChk) {
    glowChk.addEventListener('change', e => setGlow(e.target.checked))
  }

  const clrSw    = document.getElementById('clrSw')
  const clrCm    = document.getElementById('clrCm')
  const clrCmict = document.getElementById('clrCmict')
  const clrBrk   = document.getElementById('clrBrk')

  if (clrSw)    clrSw.addEventListener('input', e => setColour('sw', e.target.value, true))
  if (clrCm)    clrCm.addEventListener('input', e => setColour('cm', e.target.value, true))
  if (clrCmict) clrCmict.addEventListener('input', e => setColour('cmict', e.target.value, true))
  if (clrBrk)   clrBrk.addEventListener('input', e => setColour('brk', e.target.value, true))

  document.querySelectorAll('.clr-clear-btn').forEach(btn => {
    const key = btn.dataset.key
    if (!key) return

    btn.addEventListener('click', async () => {
      try {
        const keyName = coloursKey()
        const raw = localStorage.getItem(keyName)
        const stored = raw ? JSON.parse(raw) : {}
        delete stored[key]
        localStorage.setItem(keyName, JSON.stringify(stored))

        if (auth && auth.currentUser) {
          await saveTimetableToCloud(auth.currentUser.uid)
        }
      } catch (e) {}

      const id = KEY_ID[key]
      const prv = document.getElementById('prv' + id)
      const hexSpan = document.getElementById('hex' + id)

      if (prv) prv.style.background = ''
      if (hexSpan) hexSpan.textContent = ''

      document.querySelectorAll('.' + key + ' .subj').forEach(el => {
        el.style.color = ''
      })

      try {
        const raw2 = localStorage.getItem(coloursKey())
        const stored2 = raw2 ? JSON.parse(raw2) : {}
        if (Object.keys(stored2).length === 0) {
          resetHighlightStyles()
        }
      } catch (e) {}
    })
  })

  applyColours()
})

function hexToRgb(h) {
  return `${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`
}

const KEY_VAR = { sw:'--c-sw', cm:'--c-cm', cmict:'--c-cmict', brk:'--c-brk' }
const KEY_ID  = { sw:'Sw',    cm:'Cm',     cmict:'Cmict',      brk:'Brk' }

function resetHighlightStyles() {
  document.documentElement.style.setProperty('--c-sw',    '70,180,90')
  document.documentElement.style.setProperty('--c-cm',    '200,70,70')
  document.documentElement.style.setProperty('--c-cmict', '180,70,200')
  document.documentElement.style.setProperty('--c-brk',   '255,255,255')

  Object.keys(KEY_ID).forEach(key => {
    document.querySelectorAll('.' + key + ' .subj').forEach(el => {
      el.style.color = ''
    })
  })

  Object.keys(KEY_ID).forEach(key => {
    const id = KEY_ID[key]
    const prv = document.getElementById('prv' + id)
    const hexSpan = document.getElementById('hex' + id)
    if (prv) prv.style.background = ''
    if (hexSpan) hexSpan.textContent = ''
  })
}

function setColour(key, hex, save) {
  if (!hex || !KEY_VAR[key]) return

  document.documentElement.style.setProperty(KEY_VAR[key], hexToRgb(hex))

  const id = KEY_ID[key]
  const prv = document.getElementById('prv' + id)
  const hexSpan = document.getElementById('hex' + id)

  if (prv) prv.style.background = hex
  if (hexSpan) hexSpan.textContent = hex

  if (key !== 'brk') {
    document.querySelectorAll('.' + key + ' .subj').forEach(el => {
      el.style.color = hex
    })
  }

  if (save) {
    ;(async () => {
      try {
        const keyName = coloursKey()
        const raw = localStorage.getItem(keyName)
        const stored = raw ? JSON.parse(raw) : {}
        stored[key] = hex
        localStorage.setItem(keyName, JSON.stringify(stored))

        if (auth && auth.currentUser) {
          await saveTimetableToCloud(auth.currentUser.uid)
        }
      } catch (e) {}
    })()
  }
}

function applyColours(fromState) {
  let stored = {}

  if (fromState && fromState.colours) {
    stored = fromState.colours
  } else {
    try {
      const raw = localStorage.getItem(coloursKey())
      stored = raw ? JSON.parse(raw) : {}
    } catch (e) {
      stored = {}
    }
  }

  if (Object.keys(stored).length === 0) {
    resetHighlightStyles()
    return
  }

  Object.keys(KEY_ID).forEach(key => {
    const inputId = 'clr' + KEY_ID[key]
    const inp = document.getElementById(inputId)
    const hex = stored[key]

    if (!hex) return

    if (inp && inp.value !== hex) {
      inp.value = hex
    }

    setColour(key, hex, false)
  })
}

function setGlow(on) {
  document.documentElement.style.setProperty('--glow', on ? '1' : '0')
}

// ======================= AUTH + CLOUD =======================

const accLoggedOut  = document.getElementById('accLoggedOut')
const accLoggedIn   = document.getElementById('accLoggedIn')
const authUserLabel = document.getElementById('authUserLabel')
const authEmail     = document.getElementById('authEmail')
const authPassword  = document.getElementById('authPassword')
const btnDoLogin    = document.getElementById('btnDoLogin')
const btnDoSignup   = document.getElementById('btnDoSignup')
const btnLogout     = document.getElementById('btnLogout')
const toastEl       = document.getElementById('toast')

const showToast = msg => {
  if (!toastEl) {
    alert(msg)
    return
  }

  toastEl.textContent = msg
  toastEl.classList.remove('hidden')
  toastEl.classList.add('show')

 // after rebuild() definition and before setInterval:
function startNowLineLoop() {
  tick()                  // initial position
  setInterval(tick, 60000)  // then every minute
}

wrap.addEventListener('scroll', tick)

// call this instead of just rebuild() in your startup timeout:
setTimeout(() => {
  movePill('pillWeek', document.getElementById('btnOdd'))
  movePill('pillSec',  document.getElementById('btn4pm'))
  document.getElementById('btnOdd').classList.add('active')
  document.getElementById('btn4pm').classList.add('active')
  rebuild()
  startNowLineLoop()
}, 60)

}

const mapAuthError = err => {
  const code = err && err.code ? String(err.code) : ''
  const msg  = err && err.message ? String(err.message) : ''

  if (!code || msg.includes('Cannot read properties')) {
    return 'Something went wrong on our side. Please try again.'
  }

  if (code.includes('auth/invalid-email')) {
    return 'That email does not look right. Check and try again.'
  }
  if (code.includes('auth/missing-password')) {
    return 'Please enter your password.'
  }
  if (code.includes('auth/weak-password')) {
    return 'Password is too weak. Use at least 6 characters.'
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'This email already has an account. Try logging in instead.'
  }
  if (code.includes('auth/user-not-found')) {
    return 'No account found with that email. Try signing up first.'
  }
  if (code.includes('auth/wrong-password')) {
    return 'Incorrect password. Try again.'
  }

  return 'We could not do that. Please try again.'
}

const updateAuthUI = user => {
  if (user) {
    if (accLoggedOut) accLoggedOut.style.display = 'none'
    if (accLoggedIn)  accLoggedIn.style.display  = 'flex'
    if (authUserLabel) authUserLabel.textContent = user.email || ''
  } else {
    if (accLoggedOut) accLoggedOut.style.display = 'flex'
    if (accLoggedIn)  accLoggedIn.style.display  = 'none'
    if (authUserLabel) authUserLabel.textContent = ''
  }
}

const getCurrentTimetableState = () => {
  try {
    const raw = localStorage.getItem(coloursKey())
    const colours = raw ? JSON.parse(raw) : {}
    return { colours }
  } catch (e) {
    return { colours: {} }
  }
}

const rebuildFromState = state => {
  if (!state || !state.colours) {
    applyColours()
    return
  }
  try {
    localStorage.setItem(coloursKey(), JSON.stringify(state.colours))
  } catch (e) {}
  applyColours(state)
}

const applyTimetableStateAuth = state => {
  rebuildFromState(state)
}

const saveTimetableToCloud = async uid => {
  if (!uid) return
  const state = getCurrentTimetableState()
  const ref = doc(db, 'timetables', uid)
  await setDoc(ref, { state }, { merge: true })
  showToast('Timetable saved to cloud')
}

const loadTimetableFromCloud = async uid => {
  if (!uid) return null
  const ref = doc(db, 'timetables', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return data.state || null
}

const ensureUserDoc = async uid => {
  const ref = doc(db, 'timetables', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { state: getCurrentTimetableState() || {} })
  }
}

const doSignup = async () => {
  const email = authEmail?.value.trim()
  const password = authPassword?.value

  if (!email || !password) {
    alert('Enter both email and password.')
    return
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password)
  } catch (err) {
    console.error('signup error', err)
    alert(mapAuthError(err))
  }
}

const doLogin = async () => {
  const email = authEmail?.value.trim()
  const password = authPassword?.value

  if (!email || !password) {
    alert('Enter both email and password.')
    return
  }

  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (err) {
    console.error('login error', err)
    alert(mapAuthError(err))
  }
}

const doLogout = async () => {
  try {
    await signOut(auth)
  } catch (err) {
    console.error('logout error', err)
    alert('Could not log out. Please try again.')
  }
}

if (btnDoSignup) btnDoSignup.addEventListener('click', doSignup)
if (btnDoLogin)  btnDoLogin.addEventListener('click', doLogin)
if (btnLogout)   btnLogout.addEventListener('click', doLogout)

let didHandleInitialAuth = false

onAuthStateChanged(auth, async user => {
  currentUserId = user ? user.uid : null
  updateAuthUI(user)

  if (!didHandleInitialAuth) {
    didHandleInitialAuth = true
  } else {
    if (user) {
      showToast('Signed in')
    } else {
      showToast('Signed out')
      alert('You have been logged out.')
    }
  }

  if (user) {
    await ensureUserDoc(user.uid)
    const state = await loadTimetableFromCloud(user.uid)
    if (state) {
      applyTimetableStateAuth(state)
    } else {
      resetHighlightStyles()
    }
  } else {
    const guestRaw = localStorage.getItem(coloursKey())
    if (guestRaw) {
      applyColours()
    } else {
      resetHighlightStyles()
    }
  }
})
