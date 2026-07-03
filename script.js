const card = document.getElementById('card')
const overlay = document.getElementById('overlay')
const paper = document.getElementById('paper')
const emoji = document.querySelector('.emoji')
const apologyEl = document.getElementById('apology')
const closeBtn = document.getElementById('closeBtn')
const landingPhotoInput = document.getElementById('landingPhotoInput')
const landingPhotoPreview = document.getElementById('landingPhotoPreview')
const photoPreview = document.getElementById('photoPreview')
const forgivenessEl = document.getElementById('forgiveness')
const yesBtn = document.getElementById('yesBtn')
const noBtn = document.getElementById('noBtn')
const landingEmail = document.getElementById('landingEmail')
const sendBtn = document.getElementById('sendBtn')

let selectedPhotoDataUrl = null

const apologyText = "Sorry for yesterday.\nI did not mean to hurt you.\nI hope you can forgive me."

function typeText(element, text, speed=40, cb){
  element.textContent = ''
  let i=0
  const t = setInterval(()=>{
    element.textContent += text[i++]||''
    if(i>text.length){
      clearInterval(t)
      if(cb) cb()
    }
  }, speed)
}

function openApology(){
  if(!selectedPhotoDataUrl){
    card.classList.add('disabled')
    setTimeout(()=>card.classList.remove('disabled'),600)
    alert('Please choose a photo first.')
    return
  }

  overlay.classList.remove('hidden')
  overlay.setAttribute('aria-hidden','false')
  setTimeout(()=>emoji.classList.add('show'),50)
  // ensure paper is visible (remove hidden) before showing animation
  setTimeout(()=>{
    paper.classList.remove('hidden')
    paper.classList.add('show')
  },250)

  // show the selected photo inside the paper
  if(photoPreview && selectedPhotoDataUrl){
    photoPreview.src = selectedPhotoDataUrl
    photoPreview.classList.remove('hidden')
  }

  setTimeout(()=>typeText(apologyEl, apologyText, 40, ()=>{
    // after typing, show forgiveness choices
    if(forgivenessEl) forgivenessEl.classList.remove('hidden')
  }),400)
}

function closeApology(){
  emoji.classList.remove('show')
  paper.classList.remove('show')
  setTimeout(()=>{
    overlay.classList.add('hidden')
    overlay.setAttribute('aria-hidden','true')
    apologyEl.textContent = ''
    // reset photo preview
    if(photoPreview) photoPreview.src = ''
    if(photoPreview) photoPreview.classList.add('hidden')
    // hide paper again
    paper.classList.add('hidden')
    // hide forgiveness and reset emoji
    if(forgivenessEl) forgivenessEl.classList.add('hidden')
    emoji.textContent = '😢 😔 😞'
  },400)
}

card.addEventListener('click', openApology)
card.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') openApology() })
closeBtn.addEventListener('click', closeApology)
overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeApology() })

// Landing photo upload handling
if(landingPhotoInput){
  landingPhotoInput.addEventListener('change', (e)=>{
    const file = e.target.files && e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = ()=>{
      selectedPhotoDataUrl = reader.result
      landingPhotoPreview.src = reader.result
      landingPhotoPreview.classList.remove('hidden')
      // enable card
      card.classList.remove('disabled')
    }
    reader.readAsDataURL(file)
  })
}

// Auto-load saved photo.jpg from the project folder if present
(function tryLoadSavedPhoto(){
  const testImg = new Image()
  testImg.onload = ()=>{
    // file exists and can be loaded via relative path
    selectedPhotoDataUrl = 'photo.jpg'
    if(landingPhotoPreview) {
      landingPhotoPreview.src = 'photo.jpg'
      landingPhotoPreview.classList.remove('hidden')
    }
    card.classList.remove('disabled')
  }
  testImg.onerror = ()=>{
    // no saved photo found — do nothing
  }
  testImg.src = 'photo.jpg'
})()

// Forgiveness handlers
if(yesBtn){
  yesBtn.addEventListener('click', ()=>{
    if(forgivenessEl) forgivenessEl.classList.add('hidden')
    emoji.textContent = '😊 🎉'
    apologyEl.textContent = 'Thank you! ❤️'
  })
}
if(noBtn){
  noBtn.addEventListener('click', ()=>{
    if(forgivenessEl) forgivenessEl.classList.add('hidden')
    emoji.textContent = '😢'
    apologyEl.textContent = "I understand. I'm really sorry."
  })
}

// Generate an image of the apology card and return a data URL
function generateCardImage(callback){
  const canvas = document.createElement('canvas')
  const w = 800, h = 600
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  // background
  ctx.fillStyle = '#fff'
  ctx.fillRect(0,0,w,h)

  // draw photo if present
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = ()=>{
    // draw a centered circular avatar (cover) so photo doesn't fill page
    const iw = img.width, ih = img.height
    const avatarSize = Math.min(300, w - 240) // keep margin
    const ax = w / 2
    const ay = 140
    // compute scale to cover the avatar area
    const scale = Math.max(avatarSize / iw, avatarSize / ih)
    const dw = iw * scale, dh = ih * scale
    const dx = ax - dw / 2
    const dy = ay - dh / 2

    // draw rounded/cropped avatar
    ctx.save()
    ctx.beginPath()
    ctx.arc(ax, ay, avatarSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, dx, dy, dw, dh)
    ctx.restore()

    // emojis below avatar
    ctx.font = '48px serif'
    ctx.textAlign = 'center'
    ctx.fillText('😢 😔 😞', w/2, ay + avatarSize / 2 + 48)

    // apology text
    ctx.fillStyle = '#222'
    ctx.font = '26px sans-serif'
    const lines = apologyText.split('\n')
    let ty = ay + avatarSize / 2 + 100
    for(const line of lines){
      ctx.fillText(line, w/2, ty)
      ty += 34
    }

    callback(canvas.toDataURL('image/png'))
  }
  img.onerror = ()=>{
    // render without image
    ctx.font = '48px serif'
    ctx.textAlign = 'center'
    ctx.fillText('😢 😔 😞', w/2, 220)
    ctx.fillStyle = '#222'
    ctx.font = '26px sans-serif'
    const linesNoImg = apologyText.split('\n')
    let tyNoImg = 270
    for(const line of linesNoImg){
      ctx.fillText(line, w/2, tyNoImg)
      tyNoImg += 34
    }
    callback(canvas.toDataURL('image/png'))
  }
  if(selectedPhotoDataUrl) img.src = selectedPhotoDataUrl
  else img.onerror()
}

// Send / prepare email: download image and open mail client
if(sendBtn){
  sendBtn.addEventListener('click', ()=>{
    if(!selectedPhotoDataUrl){ alert('Choose a photo first.'); return }
    generateCardImage((dataUrl)=>{
      // trigger download
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'apology.png'
      document.body.appendChild(a)
      a.click()
      a.remove()

      // open mail client
      const recipient = landingEmail && landingEmail.value ? landingEmail.value.trim() : ''
      const subject = encodeURIComponent("I'm sorry")
      const body = encodeURIComponent("I've made this for you — please see the attached image.")
      const mailto = 'mailto:' + recipient + '?subject=' + subject + '&body=' + body
      window.location.href = mailto
    })
  })
}
