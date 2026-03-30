import * as THREE from 'three'
import { GLTFLoader } from 'GLTFLoader'
document.addEventListener('DOMContentLoaded', function () {
  initLogin()
  initSecondScreenCards()
  initSoundOptions()
  initCircles()
  initDrag()
  initEmails()
  initPaperStack()
  initSignaturePad()

  try {
    initThree()
  } catch (error) {
    console.error('initThree error:', error)
  }
})

/* LOGIN */

function initLogin() {
  const login = document.querySelector('.login')
  const input = document.querySelector('.fullname-input')
  const nextButton = document.querySelector('.next-button')

  if (!login || !input || !nextButton) return

  nextButton.disabled = true

  input.addEventListener('input', function () {
    const value = input.value.trim()
    nextButton.disabled = value.length === 0
    fillEmployeeName(value)
  })

  nextButton.addEventListener('click', function () {
    closeLogin(login, input)
  })

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      closeLogin(login, input)
    }
  })
}

function closeLogin(login, input) {
  const value = input.value.trim()

  if (value.length === 0) {
    input.focus()
    return
  }

  fillEmployeeName(value)
  login.classList.add('hidden')
  document.dispatchEvent(new Event('loginClosed'))
}

function fillEmployeeName(name) {
  const safeName = name && name.trim().length > 0 ? name.trim() : '[ФИО]'

  const inlineName = document.querySelector('.employee-name-inline')
  const bottomName = document.querySelector('.employee-name-bottom')

  if (inlineName) inlineName.textContent = safeName
  if (bottomName) bottomName.textContent = safeName
}

/* FIRST SCREEN */

function initThree() {
  const modelContainer = document.querySelector('.model')
  if (!modelContainer) return

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    30,
    modelContainer.clientWidth / modelContainer.clientHeight,
    0.1,
    3000
  )

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })

  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.outputEncoding = THREE.sRGBEncoding

  modelContainer.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const lightFront = new THREE.DirectionalLight(0xffffff, 0.6)
  lightFront.position.set(0, 3, 6)
  scene.add(lightFront)

  let model = null
  let targetRotationX = 0
  let targetRotationY = 0

  const baseRotationY = -0.2
  const loader = new GLTFLoader()

  loader.load(
    './images/3d.glb',
    function (gltf) {
      model = gltf.scene

      model.traverse(function (child) {
        if (child.isMesh) {
          const oldMaterial = child.material

          if (Array.isArray(oldMaterial)) {
            child.material = oldMaterial.map(function () {
              return new THREE.MeshStandardMaterial({
                color: '#bdbdbd',
                roughness: 0.92,
                metalness: 0.02
              })
            })
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: '#bdbdbd',
              roughness: 0.92,
              metalness: 0.02
            })
          }
        }
      })

      scene.add(model)

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      model.position.x -= center.x
      model.position.y -= center.y
      model.position.z -= center.z

      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 6 / maxDim
      model.scale.setScalar(scale)

      const scaledBox = new THREE.Box3().setFromObject(model)
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
      const scaledSize = scaledBox.getSize(new THREE.Vector3())

      model.position.x -= scaledCenter.x
      model.position.y -= scaledCenter.y
      model.position.z -= scaledCenter.z

      model.position.y -= scaledSize.y * 0.14

      camera.position.set(0, 0.8, 10.5)
      camera.lookAt(0, 0.6, 0)

      model.rotation.y = baseRotationY
    },
    undefined,
    function (error) {
      console.log('Ошибка загрузки модели:', error)
    }
  )

  window.addEventListener('mousemove', function (event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = (event.clientY / window.innerHeight) * 2 - 1

    targetRotationY = baseRotationY + x * 0.28
    targetRotationX = -y * 0.08
  })

  function animate() {
    requestAnimationFrame(animate)

    if (model) {
      model.rotation.y += (targetRotationY - model.rotation.y) * 0.04
      model.rotation.x += (targetRotationX - model.rotation.x) * 0.04
    }

    renderer.render(scene, camera)
  }

  animate()

  window.addEventListener('resize', onWindowResize)

  function onWindowResize() {
    const width = modelContainer.clientWidth
    const height = modelContainer.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
}

/* SECOND SCREEN CARDS */

function initSecondScreenCards() {
  const allCards = document.querySelectorAll('.about')

  const pairs = [
    { trigger: '.lamp', card: '.lamp-card' },
    { trigger: '.fridge', card: '.fridge-card' },
    { trigger: '.plant', card: '.plant-card' },
    { trigger: '.silencer', card: '.silencer-card' },
    { trigger: '.vinyl', card: '.vinyl-card' }
  ]

  function closeAllCards() {
    allCards.forEach(function (card) {
      card.classList.remove('active')
    })
  }

  pairs.forEach(function (pair) {
    const trigger = document.querySelector(pair.trigger)
    const card = document.querySelector(pair.card)

    if (!trigger || !card) return

    trigger.addEventListener('click', function () {
      closeAllCards()
      card.classList.add('active')
    })
  })

  const closeButtons = document.querySelectorAll('.about .close')

  closeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      closeAllCards()
    })
  })
}

/* SOUND OPTIONS */

function initSoundOptions() {
  const allRadios = document.querySelectorAll(
    '.sound-options input[type="radio"]'
  )
  const allAudios = document.querySelectorAll('.sound-options audio')

  if (!allRadios.length) return

  allRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      allAudios.forEach(function (audio) {
        audio.pause()
        audio.currentTime = 0
      })

      const label = radio.closest('label')
      if (!label) return

      const selectedAudio = label.querySelector('audio')
      if (!selectedAudio) return

      selectedAudio.volume = 0.3
      selectedAudio.play().catch(function () {})
    })
  })
}

/* CALENDAR CIRCLES */

function initCircles() {
  const circles = document.querySelectorAll('.fourth-screen .circle')

  if (!circles.length) return

  circles.forEach(function (circle) {
    circle.addEventListener('click', function () {
      circle.classList.toggle('active')
    })
  })
}

/* DRAG STICKERS */

function initDrag() {
  const container = document.querySelector('.fourth-screen')
  const stickers = document.querySelectorAll(
    '.fourth-screen .sticker-1, .fourth-screen .sticker-2'
  )

  if (!container || !stickers.length) return

  stickers.forEach(function (sticker) {
    let isDragging = false
    let shiftX = 0
    let shiftY = 0

    sticker.addEventListener('mousedown', function (event) {
      isDragging = true

      const rect = sticker.getBoundingClientRect()

      shiftX = event.clientX - rect.left
      shiftY = event.clientY - rect.top

      sticker.style.zIndex = '100'
      event.preventDefault()
    })

    document.addEventListener('mousemove', function (event) {
      if (!isDragging) return

      const parentRect = container.getBoundingClientRect()

      let left = event.clientX - parentRect.left - shiftX
      let top = event.clientY - parentRect.top - shiftY

      const maxLeft = parentRect.width - sticker.offsetWidth
      const maxTop = parentRect.height - sticker.offsetHeight

      if (left < 0) left = 0
      if (top < 0) top = 0
      if (left > maxLeft) left = maxLeft
      if (top > maxTop) top = maxTop

      sticker.style.left = left + 'px'
      sticker.style.top = top + 'px'
    })

    document.addEventListener('mouseup', function () {
      isDragging = false
    })

    sticker.addEventListener('dragstart', function (event) {
      event.preventDefault()
    })
  })
}

function initPaperStack() {
  const papers = document.querySelectorAll(
    '.paper-grey, .paper-white, .paper-lavender, .business-card'
  )

  if (!papers.length) return

  let currentZ = 20

  papers.forEach(function (paper) {
    paper.addEventListener('click', function () {
      papers.forEach(function (item) {
        item.classList.remove('active')
        item.style.boxShadow = 'none'
      })

      currentZ += 1
      paper.classList.add('active')
      paper.style.zIndex = String(currentZ)
      paper.style.boxShadow = '0 1vw 2vw rgba(0, 0, 0, 0.18)'
    })
  })
}

/* EMAILS */

function initEmails() {
  const popup = document.querySelector('.email-popup')
  const from = document.querySelector('.email-from-text')
  const text = document.querySelector('.email-text')
  const close = document.querySelector('.email-popup .close')
  const login = document.querySelector('.login')

  if (!popup || !from || !text || !close) return

  const emails = [
    {
      from: 'ANNA@FRAME.BU',
      text: 'КТО СЪЕЛ МОЙ ЙОГУРТ И ПОСТАВИЛ ОБРАТНО ПУСТУЮ БАНКУ??'
    },
    {
      from: 'IVAN@FRAME.BU',
      text: 'ЭТО БЫЛ НЕ Я, НО, КАЖЕТСЯ, Я ВИДЕЛ КАК ЕГО СЪЕЛИ...'
    },
    {
      from: 'NIKOLAY@FRAME.BU',
      text: 'КОЛЛЕГИ, ОСТАЛАСЬ НЕДЕЛЯ ДО ПРЕЗЕНТАЦИИ КЛИЕНТУ. ПОДСКАЖИТЕ, КАКОЙ СТАТУС ПО ЗАДАЧЕ?'
    },
    {
      from: 'ANNA@FRAME.BU',
      text: 'ТОГДА ПОЧЕМУ ТЫ СТОЯЛ РЯДОМ И НИЧЕГО НЕ СДЕЛАЛ(('
    },
    {
      from: 'IVAN@FRAME.BU',
      text: 'Я РАЗМЫШЛЯЛ О ЗВУКЕ ЛОЖКИ В ПУСТОЙ БАНКЕ'
    },
    {
      from: 'ARKADIY@FRAME.BU',
      text: 'ВСЕМ ПРИВЕТ, ПРЕДЛАГАЮ СЕГОДНЯ ОРГАНИЗОВАТЬ ВСТРЕЧУ, НА КОТОРОЙ ОПРЕДЕЛИМ ВЕКТОР РАЗВИТИЯ НА ЭТОТ КВАРТАЛ.'
    },
    {
      from: 'LEARN@FRAME.BU',
      text: `КОЛЛЕГИ, ДОБРЫЙ ДЕНЬ!
ВАШЕМУ ВНИМАНИЮ ПРЕДЛАГАЕТСЯ НОВЫЙ КУРС ПОВЫШЕНИЯ КВАЛИФИКАЦИИ, КОТОРЫЙ УЖЕ ДОСТУПЕН НА ПЛАТФОРМЕ.
УСПЕЙТЕ ЗАРЕГИСТРИРОВАТЬСЯ ДО 10.01 22:59`
    },
    {
      from: 'MASHULYA@FRAME.BU',
      text: 'Я ВСЕ ЕЩЕ СЛЫШУ КАК ВЫ ПЕЧАТАЕТЕ!!! ПОЖАЛУЙСТА ВКЛЮЧИТЕ ПОГЛОЩАТЕЛЬ ЗВУКА, У МЕНЯ ВСТРЕЧА С КЛИЕНТОМ!'
    }
  ]

  const positions = [
    { left: '6vw', top: '8vh' },
    { right: '8vw', top: '10vh' },
    { left: '8vw', top: '52vh' },
    { right: '10vw', top: '55vh' },
    { left: '34vw', top: '16vh' },
    { left: '38vw', top: '58vh' }
  ]

  let started = false
  let showTimer = 0
  let hideTimer = 0

  function makeDraggable(popup) {
    let isDragging = false
    let startX, startY, initialLeft, initialTop

    const topBar = popup.querySelector('.top')

    topBar.style.cursor = 'grab'

    topBar.addEventListener('mousedown', (e) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY

      const rect = popup.getBoundingClientRect()
      initialLeft = rect.left
      initialTop = rect.top

      topBar.style.cursor = 'grabbing'

      e.preventDefault()
    })

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return

      const dx = e.clientX - startX
      const dy = e.clientY - startY

      popup.style.left = initialLeft + dx + 'px'
      popup.style.top = initialTop + dy + 'px'
      popup.style.right = 'auto'
    })

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false
        topBar.style.cursor = 'grab'
      }
    })
  }

  makeDraggable(popup)

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)]
  }

  function setPosition(position) {
    popup.style.left = 'auto'
    popup.style.right = 'auto'
    popup.style.top = 'auto'

    if (position.left) popup.style.left = position.left
    if (position.right) popup.style.right = position.right
    if (position.top) popup.style.top = position.top
  }

  function hidePopup() {
    popup.classList.remove('active')
    hideTimer = 0
    scheduleNextEmail()
  }

  function showPopup() {
    const email = randomItem(emails)
    const position = randomItem(positions)

    from.textContent = email.from
    text.textContent = email.text

    setPosition(position)
    popup.classList.add('active')

    hideTimer = window.setTimeout(function () {
      hidePopup()
    }, 10000)
  }

  function scheduleNextEmail() {
    if (!started) return

    if (showTimer) {
      window.clearTimeout(showTimer)
      showTimer = 0
    }

    const delay = 3000 + Math.random() * 2000

    showTimer = window.setTimeout(function () {
      if (!popup.classList.contains('active')) {
        showPopup()
      }
    }, delay)
  }

  close.addEventListener('click', function () {
    popup.classList.remove('active')

    if (hideTimer) {
      window.clearTimeout(hideTimer)
      hideTimer = 0
    }

    if (showTimer) {
      window.clearTimeout(showTimer)
      showTimer = 0
    }

    scheduleNextEmail()
  })

  document.addEventListener('loginClosed', function () {
    if (started) return
    started = true
    scheduleNextEmail()
  })

  if (login && login.classList.contains('hidden')) {
    started = true
    scheduleNextEmail()
  }
}

/* SIGNATURE PAD */
function initSignaturePad() {
  const canvas = document.querySelector('.signature-canvas')
  const signatureWrap = document.querySelector('.signature')
  const SignaturePadClass = window.SignaturePad

  if (!canvas || !signatureWrap || !SignaturePadClass) return

  let signaturePad = null

  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const rect = signatureWrap.getBoundingClientRect()

    if (!rect.width || !rect.height) return

    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    const context = canvas.getContext('2d')
    if (!context) return

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.scale(ratio, ratio)
  }

  requestAnimationFrame(function () {
    resizeCanvas()

    signaturePad = new SignaturePadClass(canvas, {
      backgroundColor: 'rgba(0,0,0,0)',
      penColor: '#fd3d06',
      minWidth: 1,
      maxWidth: 2.2
    })
  })

  window.addEventListener('resize', function () {
    if (!signaturePad) return

    const data = signaturePad.isEmpty() ? null : signaturePad.toData()
    resizeCanvas()

    if (data) {
      signaturePad.fromData(data)
    }
  })
}
