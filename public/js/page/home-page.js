/* global KEEP */

function homePageHandler() {
  const { post_datetime, post_datetime_format, announcement } = KEEP.theme_config?.home || {}
  const fsc = KEEP.theme_config?.first_screen || {}

  // reset home post update datetime
  const resetHomePostUpdateDate = () => {
    if (post_datetime === 'updated' && post_datetime_format) {
      const datetimeDoms = document.querySelectorAll('.post-meta-info .home-post-history')
      datetimeDoms.forEach((datetimeDom) => {
        const updated = new Date(datetimeDom.dataset.updated).getTime()
        const format = post_datetime_format || KEEP.themeInfo.defaultDatetimeFormat
        datetimeDom.innerHTML = KEEP.utils.formatDatetime(format, updated)
      })
    }
  }

  // set how long age in home post block
  const setHowLongAgoInHome = () => {
    if (post_datetime_format && post_datetime_format !== 'ago') {
      return
    }
    const datetimeDoms = document.querySelectorAll('.post-meta-info .home-post-history')
    datetimeDoms.forEach((v) => {
      const nowTimestamp = Date.now()
      const updatedTimestamp = new Date(v.dataset.updated).getTime()
      v.innerHTML = KEEP.utils.getHowLongAgo(Math.floor((nowTimestamp - updatedTimestamp) / 1000))
    })
  }

  // close website announcement
  const closeWebsiteAnnouncement = () => {
    if (announcement) {
      const waDom = document.querySelector('.home-content-container .website-announcement')
      if (waDom) {
        const closeDom = waDom.querySelector('.close')
        closeDom.addEventListener('click', () => {
          waDom.style.display = 'none'
        })
      }
    }
  }

  const typeFirstScreenText = (text) => {
    const desc = document.querySelector('.first-screen-content .description .desc')
    const cursor = document.querySelector('.first-screen-content .description .cursor')
    if (!desc) return

    desc.textContent = ''
    if (cursor) cursor.style.display = ''

    if (!text) {
      return
    }

    let charIndex = 0
    const typewriter = () => {
      if (charIndex < text.length) {
        desc.textContent += text.charAt(charIndex)
        charIndex++
        setTimeout(typewriter, 100)
      } else if (cursor) {
        cursor.style.display = 'none'
      }
    }

    typewriter()
  }

  const initFirstScreenPlayground = () => {
    const container = document.querySelector('.first-screen-container')
    const canvas = document.querySelector('.first-screen-playground')
    if (!container || !canvas) return

    if (container.__playgroundCleanup) {
      container.__playgroundCleanup()
    }

    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const palette = {
      line: 'rgba(87, 132, 217, 0.22)',
      lineDark: 'rgba(210, 224, 255, 0.24)',
      point: 'rgba(87, 132, 217, 0.42)',
      pointDark: 'rgba(210, 224, 255, 0.48)',
      star: 'rgba(87, 132, 217, 0.86)',
      starDark: 'rgba(232, 239, 255, 0.9)',
      ripple: 'rgba(87, 132, 217, 0.34)',
      rippleDark: 'rgba(232, 239, 255, 0.38)',
      orbit: 'rgba(87, 132, 217, 0.11)',
      orbitDark: 'rgba(232, 239, 255, 0.11)',
      band: 'rgba(87, 132, 217, 0.055)',
      bandDark: 'rgba(232, 239, 255, 0.06)'
    }

    let width = 0
    let height = 0
    let dpr = 1
    let frameId = 0
    const nodes = []
    const stars = []
    const ripples = []

    const isDark = () => document.documentElement.classList.contains('dark-mode') || document.body.classList.contains('dark-mode')
    const color = (light, dark) => (isDark() ? dark : light)
    const withAlpha = (rgba, alpha) => rgba.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`)

    const resize = () => {
      const rect = container.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const nodeCount = Math.max(26, Math.min(62, Math.round(width / 26)))
      nodes.length = 0
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: 1 + Math.random() * 1.5
        })
      }

      stars.length = 0
      const starCount = width < 640 ? 3 : 5
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: width * (0.18 + i * 0.16),
          y: height * (0.24 + Math.random() * 0.52),
          vx: (i % 2 ? -1 : 1) * (0.26 + Math.random() * 0.2),
          vy: (Math.random() - 0.5) * 0.28,
          r: 4.5 + Math.random() * 3.5,
          points: Math.random() > 0.45 ? 5 : 4,
          spin: Math.random() * Math.PI
        })
      }
    }

    const drawBackground = () => {}

    const updatePoint = (p) => {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > width) p.vx *= -1
      if (p.y < 0 || p.y > height) p.vy *= -1
    }

    const drawStar = (star) => {
      const outer = star.r
      const inner = star.r * 0.44
      const spikes = star.points
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outer : inner
        const angle = star.spin - Math.PI / 2 + (i * Math.PI) / spikes
        const x = star.x + Math.cos(angle) * radius
        const y = star.y + Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      drawBackground()

      nodes.forEach(updatePoint)
      stars.forEach((star) => {
        updatePoint(star)
        star.spin += 0.006
      })

      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 128) {
            ctx.strokeStyle = withAlpha(color(palette.line, palette.lineDark), (1 - dist / 128) * 0.2)
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      ctx.fillStyle = color(palette.point, palette.pointDark)
      nodes.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      })

      stars.forEach((star) => {
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 5)
        gradient.addColorStop(0, color(palette.star, palette.starDark))
        gradient.addColorStop(1, 'rgba(87, 132, 217, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r * 5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = color(palette.star, palette.starDark)
        drawStar(star)
        ctx.fill()
      })

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i]
        ripple.age += 1
        const progress = ripple.age / ripple.life
        if (progress >= 1) {
          ripples.splice(i, 1)
          continue
        }
        ctx.strokeStyle = withAlpha(color(palette.ripple, palette.rippleDark), (1 - progress) * 0.34)
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, 18 + progress * 84, 0, Math.PI * 2)
        ctx.stroke()
      }

      if (!prefersReducedMotion) {
        frameId = window.requestAnimationFrame(draw)
      }
    }

    const handleClick = (event) => {
      if (event.target.closest('a, button, input, .sc-icon-item, .search-popup-trigger, .menu-item, .drawer-menu-item')) return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      ripples.push({ x, y, age: 0, life: 56 })
      stars.forEach((star) => {
        const dx = star.x - x || 1
        const dy = star.y - y || 1
        const len = Math.sqrt(dx * dx + dy * dy)
        star.vx += (dx / len) * 0.18
        star.vy += (dy / len) * 0.18
        star.spin += 0.35
      })
    }

    resize()
    draw()
    container.addEventListener('click', handleClick)
    window.addEventListener('resize', resize)

    container.__playgroundCleanup = () => {
      window.cancelAnimationFrame(frameId)
      container.removeEventListener('click', handleClick)
      window.removeEventListener('resize', resize)
      container.__playgroundCleanup = null
    }
  }

  // first screen typewriter
  const initTypewriter = () => {
    const isHitokoto = fsc?.hitokoto === true

    if (fsc?.enable !== true) {
      return
    }

    if (fsc?.enable === true && !isHitokoto && !fsc?.description) {
      return
    }

    const descBox = document.querySelector('.first-screen-content .description')
    if (descBox) {
      descBox.style.opacity = '0'

      setTimeout(
        () => {
          descBox.style.opacity = '1'
          const descItemList = descBox.querySelectorAll('.desc-item')
          descItemList.forEach((descItem) => {
            const desc = descItem.querySelector('.desc')
            const text = desc.innerHTML
            typeFirstScreenText(text)
          })
        },
        isHitokoto ? 400 : 300
      )
    }
  }

  const initFirstScreenBoundaryScroll = () => {
    const firstScreen = document.querySelector('.first-screen-container')
    const homeContent = document.querySelector('.home-content-container')
    if (!firstScreen || !homeContent || fsc?.enable !== true || window.location.pathname.includes('/page/')) return

    if (window.__keepFirstScreenBoundaryCleanup) {
      window.__keepFirstScreenBoundaryCleanup()
    }

    let isAutoScrolling = false
    let wheelUnlockedAt = 0
    const scrollTo = (top) => {
      isAutoScrolling = true
      wheelUnlockedAt = Date.now() + 620
      window.scrollTo({ top, behavior: 'smooth' })
      setTimeout(() => {
        isAutoScrolling = false
      }, 640)
    }

    const getHomeTop = () => Math.round(window.scrollY + homeContent.getBoundingClientRect().top)
    const getFirstScreenHeight = () => Math.round(firstScreen.getBoundingClientRect().height)
    const inBoundaryArea = () => window.scrollY < getFirstScreenHeight() + 80

    const handleWheel = (event) => {
      if (Date.now() < wheelUnlockedAt || isAutoScrolling) {
        event.preventDefault()
        return
      }

      const homeTop = getHomeTop()
      const scrollTop = window.scrollY

      if (event.deltaY > 0 && scrollTop < homeTop - 16) {
        event.preventDefault()
        scrollTo(homeTop)
      } else if (event.deltaY < 0 && inBoundaryArea() && scrollTop <= homeTop + 16) {
        event.preventDefault()
        scrollTo(0)
      }
    }

    let touchStartY = 0
    const handleTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY || 0
    }

    const handleTouchMove = (event) => {
      if (Date.now() < wheelUnlockedAt || isAutoScrolling) {
        event.preventDefault()
        return
      }

      const touchY = event.touches[0]?.clientY || 0
      const deltaY = touchStartY - touchY
      if (Math.abs(deltaY) < 18) return

      const homeTop = getHomeTop()
      const scrollTop = window.scrollY

      if (deltaY > 0 && scrollTop < homeTop - 16) {
        event.preventDefault()
        scrollTo(homeTop)
      } else if (deltaY < 0 && inBoundaryArea() && scrollTop <= homeTop + 16) {
        event.preventDefault()
        scrollTo(0)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    window.__keepFirstScreenBoundaryCleanup = () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.__keepFirstScreenBoundaryCleanup = null
    }
  }

  resetHomePostUpdateDate()
  setHowLongAgoInHome()
  closeWebsiteAnnouncement()
  initFirstScreenPlayground()
  initTypewriter()
  initFirstScreenBoundaryScroll()
}

if (KEEP.theme_config?.pjax?.enable === true && KEEP.utils) {
  homePageHandler()
} else {
  window.addEventListener('DOMContentLoaded', homePageHandler)
}
