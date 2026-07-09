const CHALK_COLORS = {
  white: '#f0f0f0',
  yellow: '#ffd93d',
  cyan: '#6bcbff',
  green: '#6bcb77',
  red: '#ff6b6b',
  pink: '#ff8fab',
  orange: '#ffa94d',
  purple: '#b197fc'
}

export class DrawEngine {
  constructor(canvas, opts = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dpr = window.devicePixelRatio || 1
    this.animating = false
    this.queue = []
    this.markerPos = { x: 0, y: 0 }
    this.markerVisible = false
    this.onMarkerMove = opts.onMarkerMove || null
    this.boardWidth = opts.width || 800
    this.boardHeight = opts.height || 500
    this.resize()
  }

  resize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      this.boardWidth = rect.width
      this.boardHeight = rect.height
    }
    this.canvas.width = this.boardWidth * this.dpr
    this.canvas.height = this.boardHeight * this.dpr
    this.canvas.style.width = this.boardWidth + 'px'
    this.canvas.style.height = this.boardHeight + 'px'
    this.ctx.scale(this.dpr, this.dpr)
  }

  clear() {
    this.ctx.fillStyle = '#1a1a2e'
    this.ctx.fillRect(0, 0, this.boardWidth, this.boardHeight)
    this.ctx.fillStyle = 'rgba(255,255,255,0.02)'
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.boardWidth
      const y = Math.random() * this.boardHeight
      const r = Math.random() * 2
      this.ctx.beginPath()
      this.ctx.arc(x, y, r, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  clearSection() {
    this.ctx.fillStyle = '#1a1a2e'
    this.ctx.fillRect(0, 0, this.boardWidth, this.boardHeight)
    this.ctx.fillStyle = 'rgba(255,255,255,0.02)'
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.boardWidth
      const y = Math.random() * this.boardHeight
      const r = Math.random() * 2
      this.ctx.beginPath()
      this.ctx.arc(x, y, r, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  color(name) { return CHALK_COLORS[name] || name || CHALK_COLORS.white }

  _chalkStroke(ctx, x1, y1, x2, y2, color, width) {
    const steps = Math.max(Math.floor(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 3), 2)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      const nx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 1.2
      const ny = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 1.2
      if (i === 0) { ctx.beginPath(); ctx.moveTo(nx, ny) }
      else ctx.lineTo(nx, ny)
    }
    ctx.stroke()
  }

  drawLine(x1, y1, x2, y2, color = 'white', width = 2) {
    this._chalkStroke(this.ctx, x1, y1, x2, y2, this.color(color), width)
  }

  drawArrow(x1, y1, x2, y2, color = 'white', label = '') {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const headLen = 14
    this._chalkStroke(this.ctx, x1, y1, x2, y2, this.color(color), 3)
    this._chalkStroke(this.ctx, x2, y2, x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4), this.color(color), 3)
    this._chalkStroke(this.ctx, x2, y2, x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4), this.color(color), 3)
    if (label) this.drawText(label, (x1 + x2) / 2 + 12, (y1 + y2) / 2 - 8, color, 14)
  }

  drawBox(x, y, w, h, color = 'white', label = '', fill = false) {
    if (fill) {
      this.ctx.fillStyle = this.color(color) + '15'
      this.ctx.fillRect(x, y, w, h)
    }
    this._chalkStroke(this.ctx, x, y, x + w, y, this.color(color), 2.5)
    this._chalkStroke(this.ctx, x + w, y, x + w, y + h, this.color(color), 2.5)
    this._chalkStroke(this.ctx, x + w, y + h, x, y + h, this.color(color), 2.5)
    this._chalkStroke(this.ctx, x, y + h, x, y, this.color(color), 2.5)
    if (label) this.drawText(label, x + w / 2, y + h / 2 + 5, color, 15, 'center', 'middle')
  }

  drawCircle(cx, cy, r, color = 'white', label = '') {
    const steps = 36
    for (let i = 0; i < steps; i++) {
      const a1 = (i / steps) * Math.PI * 2
      const a2 = ((i + 1) / steps) * Math.PI * 2
      const x1 = cx + r * Math.cos(a1)
      const y1 = cy + r * Math.sin(a1)
      const x2 = cx + r * Math.cos(a2)
      const y2 = cy + r * Math.sin(a2)
      this._chalkStroke(this.ctx, x1, y1, x2, y2, this.color(color), 2.5)
    }
    if (label) this.drawText(label, cx, cy + r + 20, color, 14, 'center')
  }

  drawText(text, x, y, color = 'white', size = 18, align = 'left', baseline = 'top') {
    this.ctx.font = `${size}px "Segoe UI", system-ui, sans-serif`
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.shadowColor = this.color(color) + '40'
    this.ctx.shadowBlur = 4
    this.ctx.fillStyle = this.color(color)
    const chars = text.split('')
    let cx = x
    for (const ch of chars) {
      this.ctx.fillText(ch, cx, y)
      cx += this.ctx.measureText(ch).width
    }
    this.ctx.shadowBlur = 0
  }

  writeLine(text, x, y, color = 'white', size = 18, align = 'left') {
    this.drawText(text, x, y, color, size, align)
  }

  highlight(x, y, w, h, color = 'yellow') {
    this.ctx.fillStyle = this.color(color) + '25'
    this.ctx.fillRect(x, y - 2, w, h + 4)
    this.ctx.strokeStyle = this.color(color) + '50'
    this.ctx.lineWidth = 1.5
    this.ctx.strokeRect(x, y - 2, w, h + 4)
  }

  drawCurve(points, color = 'white', width = 2.5) {
    if (points.length < 2) return
    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2
      const cy = (points[i - 1].y + points[i].y) / 2
      this.ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, cx, cy)
    }
    this.ctx.strokeStyle = this.color(color)
    this.ctx.lineWidth = width
    this.ctx.stroke()
  }

  drawAxes(originX, originY, width, height, color = 'white') {
    this._chalkStroke(this.ctx, originX, originY, originX + width, originY, this.color(color), 2)
    this._chalkStroke(this.ctx, originX, originY, originX, originY - height, this.color(color), 2)
    this.drawText('x', originX + width - 15, originY + 10, color, 14)
    this.drawText('y', originX + 8, originY - height + 5, color, 14)
    this.drawText('O', originX - 18, originY + 5, color, 13)
  }

  drawVectorArrow(x1, y1, x2, y2, color = 'cyan', label = '', width = 4) {
    this.drawArrow(x1, y1, x2, y2, color, '')
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    if (label) this.drawText(label, mx + 10, my - 10, color, 15)
  }

  animateDraw(actions, onComplete) {
    this.queue = [...actions]
    this.animating = true
    this._processQueue(onComplete)
  }

  _processQueue(onComplete) {
    if (this.queue.length === 0) {
      this.animating = false
      this.markerVisible = false
      if (this.onMarkerMove) this.onMarkerMove(null)
      if (onComplete) onComplete()
      return
    }
    const action = this.queue.shift()
    this._executeAction(action, () => this._processQueue(onComplete))
  }

  _executeAction(action, next) {
    const { type, x, y, x1, y1, x2, y2, color, label, text, size, w, h, r, cx, cy, points, style } = action
    const dur = action.duration || 600
    const col = color || 'white'

    this.markerVisible = true

    switch (type) {
      case 'write':
      case 'text': {
        const sz = size || 18
        const chars = (text || label || '').split('')
        let i = 0
        const interval = dur / chars.length
        const startX = x || 50
        const startY = y || 50
        this._animateChars(chars, startX, startY, col, sz, interval, (pos) => {
          this.markerPos = pos
          if (this.onMarkerMove) this.onMarkerMove(pos)
        }, () => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 200)
        })
        break
      }
      case 'line': {
        this._animateStroke(
          (t) => {
            const px = x1 + (x2 - x1) * t
            const py = y1 + (y2 - y1) * t
            return { x: px, y: py }
          },
          (px, py) => {
            this.markerPos = { x: px, y: py }
            if (this.onMarkerMove) this.onMarkerMove({ x: px, y: py })
          },
          () => {
            this.drawLine(x1, y1, x2, y2, col, style === 'bold' ? 4 : 2.5)
            if (this.onMarkerMove) this.onMarkerMove(null)
            setTimeout(next, 150)
          },
          dur
        )
        break
      }
      case 'arrow':
      case 'vector': {
        this.drawArrow(x1, y1, x2, y2, col, label || '')
        if (this.onMarkerMove) this.onMarkerMove({ x: x2, y: y2 })
        setTimeout(() => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 150)
        }, 300)
        break
      }
      case 'box': {
        this.drawBox(x, y, w || 80, h || 60, col, label || '', style === 'fill')
        setTimeout(() => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 150)
        }, 300)
        break
      }
      case 'circle': {
        this.drawCircle(cx || x || 200, cy || y || 200, r || 40, col, label || '')
        setTimeout(() => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 150)
        }, 400)
        break
      }
      case 'highlight': {
        const hw = action.width || 200
        const hh = action.height || 30
        this.highlight(x || 50, y || 50, hw, hh, col)
        setTimeout(() => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 100)
        }, 200)
        break
      }
      case 'axes': {
        this.drawAxes(x || 100, y || 350, w || 250, h || 200, col)
        setTimeout(() => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 200)
        }, 400)
        break
      }
      case 'curve': {
        if (points && points.length >= 2) this.drawCurve(points, col, style === 'bold' ? 3 : 2.5)
        setTimeout(() => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 300)
        }, 500)
        break
      }
      case 'clear': {
        this.clearSection()
        setTimeout(() => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 100)
        }, 200)
        break
      }
      case 'erase': {
        const ex = x || 0
        const ey = y || 0
        const ew = w || 200
        const eh = h || 100
        this.ctx.fillStyle = '#1a1a2e'
        this.ctx.fillRect(ex, ey, ew, eh)
        setTimeout(() => {
          if (this.onMarkerMove) this.onMarkerMove(null)
          setTimeout(next, 100)
        }, 200)
        break
      }
      default: {
        if (this.onMarkerMove) this.onMarkerMove(null)
        setTimeout(next, 50)
      }
    }
  }

  _animateChars(chars, startX, startY, color, size, interval, onMove, onDone) {
    let i = 0
    this.ctx.font = `${size}px "Segoe UI", system-ui, sans-serif`
    this.ctx.textBaseline = 'top'
    let cursorX = startX
    const lineH = size * 1.4
    let currentY = startY

    const drawNext = () => {
      if (i >= chars.length) { onDone(); return }
      const ch = chars[i]
      if (ch === '\n') {
        cursorX = startX
        currentY += lineH
        i++
        setTimeout(drawNext, interval)
        return
      }
      this.ctx.shadowColor = this.color(color) + '40'
      this.ctx.shadowBlur = 4
      this.ctx.fillStyle = this.color(color)
      this.ctx.fillText(ch, cursorX, currentY)
      this.ctx.shadowBlur = 0
      cursorX += this.ctx.measureText(ch).width
      onMove({ x: cursorX, y: currentY + size })
      i++
      setTimeout(drawNext, interval)
    }
    drawNext()
  }

  _animateStroke(getPos, onMove, onDone, duration) {
    const steps = Math.max(Math.floor(duration / 16), 10)
    let i = 0
    const tick = () => {
      if (i > steps) { onDone(); return }
      const t = i / steps
      const pos = getPos(t)
      onMove(pos)
      i++
      requestAnimationFrame(tick)
    }
    tick()
  }

  stop() {
    this.queue = []
    this.animating = false
    this.markerVisible = false
    if (this.onMarkerMove) this.onMarkerMove(null)
  }

  drawBoardActions(actions) {
    for (const a of actions) {
      const { type, x, y, x1, y1, x2, y2, color, label, text, size, w, h, r, cx, cy, points } = a
      const col = color || 'white'
      switch (type) {
        case 'write':
        case 'text': this.drawText(text || label || '', x || 50, y || 50, col, size || 18); break
        case 'line': this.drawLine(x1, y1, x2, y2, col, 2.5); break
        case 'arrow': this.drawArrow(x1, y1, x2, y2, col, label || ''); break
        case 'box': this.drawBox(x, y, w || 80, h || 60, col, label || '', false); break
        case 'circle': this.drawCircle(cx || x, cy || y, r || 40, col, label || ''); break
        case 'highlight': this.highlight(x || 50, y || 50, a.width || 200, a.height || 30, col); break
        case 'axes': this.drawAxes(x || 100, y || 350, w || 250, h || 200, col); break
        case 'curve': if (points && points.length >= 2) this.drawCurve(points, col, 2.5); break
        case 'vector': this.drawVectorArrow(x1, y1, x2, y2, col, label || ''); break
      }
    }
  }
}
