'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function TestAnimation() {
  const [animationPhase, setAnimationPhase] = useState<'orbit' | 'accelerate' | 'converge' | 'burst' | 'reveal' | 'fadeout'>('orbit')
  const [restart, setRestart] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [rotationSpeed, setRotationSpeed] = useState(1)
  const [radius, setRadius] = useState(280)
  const [mounted, setMounted] = useState(false)

  // Éviter l'erreur d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Animation de rotation avec accélération
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + rotationSpeed) % 360)
    }, 20)

    return () => {
      clearInterval(rotationInterval)
    }
  }, [rotationSpeed])

  useEffect(() => {
    // Convergence progressive du rayon
    const radiusInterval = setInterval(() => {
      if (animationPhase === 'converge') {
        setRadius(prev => Math.max(0, prev - 8))
      }
    }, 20)

    return () => {
      clearInterval(radiusInterval)
    }
  }, [animationPhase])

  useEffect(() => {
    // Timers de changement de phase
    const accelerateTimer = setTimeout(() => {
      setAnimationPhase('accelerate')
      setRotationSpeed(2.5)
    }, 2000)

    const convergeTimer = setTimeout(() => {
      setAnimationPhase('converge')
      setRotationSpeed(6)
    }, 3000)

    const burstTimer = setTimeout(() => {
      setAnimationPhase('burst')
    }, 3800) // Illumination dès que les éléments touchent le centre

    const revealTimer = setTimeout(() => {
      setAnimationPhase('reveal')
    }, 4400)

    const fadeoutTimer = setTimeout(() => {
      setAnimationPhase('fadeout')
    }, 8500)

    const redirectTimer = setTimeout(() => {
      window.location.href = '/'
    }, 10500)

    return () => {
      clearTimeout(accelerateTimer)
      clearTimeout(convergeTimer)
      clearTimeout(burstTimer)
      clearTimeout(revealTimer)
      clearTimeout(fadeoutTimer)
      clearTimeout(redirectTimer)
    }
  }, [restart])

  const spiritualElements = [
    { icon: '✨', label: 'Grâces', angle: 0, color: '#FBBF24' },
    { icon: '🙏', label: 'Prières', angle: 60, color: '#6366F1' },
    { icon: '📖', label: 'Écritures', angle: 120, color: '#10B981' },
    { icon: '🤝', label: 'Rencontres', angle: 180, color: '#F43F5E' },
    { icon: '🌿', label: 'Relecture', angle: 240, color: '#7BA7E1' },
    { icon: '🕊️', label: 'Paroles', angle: 300, color: '#0EA5E9' }
  ]

  const handleRestart = () => {
    setAnimationPhase('orbit')
    setRotation(0)
    setRotationSpeed(1)
    setRadius(280)
    setRestart(prev => prev + 1)
  }

  if (!mounted) return null

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F4FF 50%, #FCE7F3 100%)',
      position: 'relative',
      overflow: 'hidden',
      opacity: animationPhase === 'fadeout' ? 0 : 1,
      transition: 'opacity 2s ease-out'
    }}>
      {/* Illumination divine qui prend toute la page */}
      {animationPhase === 'burst' && (
        <>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(255, 252, 240, 0.95), rgba(251, 191, 36, 0.7), rgba(251, 191, 36, 0.3), transparent)',
            animation: 'divineLight 1s ease-out forwards',
            zIndex: 100
          }} />

          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '3px solid rgba(251, 191, 36, 0.4)',
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.6)',
                animation: `lightWave 1.2s ease-out ${i * 0.2}s forwards`,
                zIndex: 99
              }}
            />
          ))}
        </>
      )}

      {/* Bouton de redémarrage */}
      <button
        onClick={handleRestart}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          padding: '0.75rem 1.5rem',
          background: 'white',
          border: '2px solid #0EA5E9',
          borderRadius: '12px',
          color: '#0EA5E9',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)',
          transition: 'all 0.3s',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#0EA5E9'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.color = '#0EA5E9'
        }}
      >
        ↻ Rejouer
      </button>

      {/* Bouton Skip Intro - Discret */}
      <button
        onClick={() => window.location.href = '/'}
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          right: '1.5rem',
          padding: '0.4rem 0.8rem',
          background: 'rgba(255, 255, 255, 0.5)',
          border: 'none',
          borderRadius: '6px',
          color: '#9ca3af',
          fontSize: '0.75rem',
          fontWeight: '400',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s',
          opacity: 0.6,
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
          e.currentTarget.style.color = '#0EA5E9'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'
          e.currentTarget.style.color = '#9ca3af'
        }}
      >
        Passer →
      </button>

      {/* Indicateur de phase */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        padding: '0.75rem 1.5rem',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#4b5563',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}>
        <strong>
          {animationPhase === 'orbit' ? '0-2s : Orbite' :
            animationPhase === 'accelerate' ? '2-3s : Accélération' :
              animationPhase === 'converge' ? '3-4s : Convergence' :
                animationPhase === 'burst' ? '3.8s : ILLUMINATION ✨' : 'Révélation'}
        </strong>
      </div>

      {/* Conteneur principal - VISIBLE jusqu'à l'explosion */}
      <div style={{
        position: 'relative',
        width: '700px',
        height: '700px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: animationPhase === 'burst' ? 0 : 1,
        transition: 'opacity 0.3s ease-out'
      }}>
        {/* Logo central - COLOMBE avec fond bleu complet */}
        {(animationPhase !== 'burst' && animationPhase !== 'reveal' && animationPhase !== 'fadeout') && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(14, 165, 233, 0.3)',
            zIndex: 10,
            animation: 'breathe 4s ease-in-out infinite'
          }}>
            <Image
              src="/dove-center.png"
              alt="Colombe"
              width={200}
              height={200}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        )}

        {/* Éléments spirituels en orbite avec apparition progressive */}
        {(animationPhase !== 'burst' && animationPhase !== 'reveal' && animationPhase !== 'fadeout') && spiritualElements.map((element, index) => {
          const currentAngle = (element.angle + rotation) % 360
          const currentRadius = radius
          const convergenceOpacity = currentRadius < 50 ? 0 : 1

          const x = Math.cos((currentAngle - 90) * Math.PI / 180) * currentRadius
          const y = Math.sin((currentAngle - 90) * Math.PI / 180) * currentRadius
          const scale = animationPhase === 'converge' ? Math.max(0.3, currentRadius / 280) : 1

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                opacity: convergenceOpacity,
                transition: convergenceOpacity === 0 ? 'opacity 0.2s ease-out' : 'none',
                zIndex: 5
              }}
            >
              <div style={{
                transform: `scale(${scale})`,
                animation: `elementAppear 0.6s ease-out ${index * 0.12}s both`
              }}>
                {/* Traînée lumineuse en convergence */}
                {animationPhase === 'converge' && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${element.color}60, transparent 60%)`,
                    animation: 'pulse 0.4s ease-in-out infinite',
                    zIndex: -1
                  }} />
                )}

                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: `0 12px 35px ${element.color}50, inset 0 2px 8px rgba(255, 255, 255, 0.5)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  border: `3px solid ${element.color}40`,
                  animation: animationPhase === 'orbit' ? 'float 3s ease-in-out infinite' : 'none'
                }}>
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                    {element.icon}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: element.color,
                    textAlign: 'center'
                  }}>
                    {element.label}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Logo final avec rayons - après l'illumination */}
      {(animationPhase === 'reveal' || animationPhase === 'fadeout') && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'revealFromBurst 1s ease-out forwards'
        }}>
          {/* Rayons de lumière */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            zIndex: 1
          }}>
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '6px',
                  height: '280px',
                  background: `linear-gradient(to top, transparent, rgba(251, 191, 36, ${0.5 + (i % 4) * 0.15}), transparent)`,
                  transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)`,
                  transformOrigin: '50% 50%',
                  animation: `shimmerRays ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>

          {/* Halo doré pulsant */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.1) 45%, transparent 70%)',
            animation: 'pulseHalo 3s ease-in-out infinite',
            zIndex: 2
          }} />

          {/* Logo COMPLET UNIQUEMENT - ROND comme sur le site */}
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 35px 100px rgba(251, 191, 36, 0.7), 0 0 60px rgba(251, 191, 36, 0.5)',
            zIndex: 10
          }}>
            <Image
              src="/logo-esprit-saint-web.png"
              alt="Logo complet"
              width={280}
              height={280}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        </div>
      )}

      {/* Titre en bas */}
      {(animationPhase === 'reveal' || animationPhase === 'fadeout') && (
        <div style={{
          position: 'absolute',
          bottom: '6rem',
          textAlign: 'center',
          animation: 'fadeInUp 1.5s ease-out 1.5s forwards',
          opacity: 0
        }}>
          <h1 style={{
            fontSize: '2.6rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #F43F5E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
            animation: 'shimmer 3s ease-in-out infinite',
            backgroundSize: '200% 100%'
          }}>
            Carnet de grâces & de missions
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            Contemplez l'action de Dieu dans votre vie
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.04); }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        @keyframes divineLight {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          40% {
            opacity: 0.95;
            transform: scale(1.3);
          }
          100% {
            opacity: 0;
            transform: scale(2.8);
          }
        }

        @keyframes lightWave {
          from {
            width: 80px;
            height: 80px;
            opacity: 0.6;
          }
          to {
            width: 1000px;
            height: 1000px;
            opacity: 0;
          }
        }

        @keyframes revealFromBurst {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes shimmerRays {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes pulseHalo {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 0.9;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes elementAppear {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
