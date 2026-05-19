import { useState, useEffect, useRef } from 'react'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  words.forEach((word, i) => {
    const test = line + (line ? ' ' : '') + word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = test
    }
    if (i === words.length - 1) ctx.fillText(line, x, currentY)
  })
}

export default function CertificateModal({ course, user, onClose }) {
  const [show, setShow] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t) }, [])

  useEffect(() => {
    if (!show) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#0d0d18')
    bg.addColorStop(1, '#12121f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = course.color
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.5
    roundRect(ctx, 20, 20, W - 40, H - 40, 16)
    ctx.stroke()
    ctx.globalAlpha = 1

    ctx.strokeStyle = course.color
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.2
    roundRect(ctx, 28, 28, W - 56, H - 56, 12)
    ctx.stroke()
    ctx.globalAlpha = 1

    const corners = [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]]
    corners.forEach(([cx, cy]) => {
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI * 2)
      ctx.fillStyle = course.color
      ctx.globalAlpha = 0.6
      ctx.fill()
      ctx.globalAlpha = 1
    })

    ctx.font = 'bold 52px serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = course.color
    ctx.fillText('🎓', W / 2, 110)

    ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = course.color
    ctx.letterSpacing = '3px'
    ctx.fillText('CERTIFICADO DE CONCLUSÃO', W / 2, 148)
    ctx.letterSpacing = '0px'

    const grad = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0)
    grad.addColorStop(0, 'transparent')
    grad.addColorStop(0.5, course.color)
    grad.addColorStop(1, 'transparent')
    ctx.strokeStyle = grad
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.5
    ctx.beginPath(); ctx.moveTo(W * 0.2, 162); ctx.lineTo(W * 0.8, 162); ctx.stroke()
    ctx.globalAlpha = 1

    ctx.font = '14px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('Este certificado é conferido a', W / 2, 198)

    ctx.font = 'bold 30px "Segoe UI", Georgia, serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(user?.name ?? user?.nome ?? 'Estudante', W / 2, 240)

    ctx.strokeStyle = course.color
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.35
    ctx.beginPath(); ctx.moveTo(W * 0.25, 252); ctx.lineTo(W * 0.75, 252); ctx.stroke()
    ctx.globalAlpha = 1

    ctx.font = '14px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('pela conclusão do curso', W / 2, 278)

    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = course.color
    wrapText(ctx, course.name, W / 2, 308, W - 120, 28)

    ctx.font = '13px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = '#6b7280'
    ctx.fillText(`Oferecido por: ${course.institution || 'Instituição'}`, W / 2, 360)

    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    ctx.font = '12px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = '#4b5563'
    ctx.fillText(today, W / 2, 386)

    ctx.strokeStyle = grad
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    ctx.beginPath(); ctx.moveTo(W * 0.15, 406); ctx.lineTo(W * 0.85, 406); ctx.stroke()
    ctx.globalAlpha = 1

    ctx.font = '11px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = '#374151'
    ctx.fillText('GamifyPro · Plataforma de Aprendizado Gamificado', W / 2, 426)
  }, [show, course, user])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `certificado-${course.name.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(16,16,24,0.99), rgba(20,20,32,0.99))',
        border: `1px solid ${course.color}40`,
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '540px', width: '100%',
        textAlign: 'center',
        boxShadow: `0 0 80px ${course.color}20, 0 32px 80px rgba(0,0,0,0.7)`,
        transform: show ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        opacity: show ? 1 : 0,
        transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', color: course.color, textTransform: 'uppercase', marginBottom: '1rem' }}>
          🏅 Seu certificado
        </div>

        <canvas
          ref={canvasRef}
          width={500}
          height={450}
          style={{ width: '100%', borderRadius: '12px', border: `1px solid ${course.color}30`, marginBottom: '1.25rem' }}
        />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDownload}
            style={{
              flex: 1, padding: '0.85rem',
              background: course.color, border: 'none', borderRadius: '10px',
              color: '#000', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              boxShadow: `0 0 24px ${course.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            ⬇ Baixar certificado
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#9ca3af', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
