'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface IntroAnimationProps {
    onComplete: () => void
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
    const [animationPhase, setAnimationPhase] = useState<'orbit' | 'accelerate' | 'converge' | 'burst' | 'reveal' | 'fadeout'>('orbit')
    const [rotation, setRotation] = useState(0)
    const [rotationSpeed, setRotationSpeed] = useState(1)
    const [radius, setRadius] = useState(280)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const rotationInterval = setInterval(() => {
            setRotation(prev => (prev + rotationSpeed) % 360)
        }, 20)

        return () => {
            clearInterval(rotationInterval)
        }
    }, [rotationSpeed])

    useEffect(() => {
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
        }, 3800)

        const revealTimer = setTimeout(() => {
            setAnimationPhase('reveal')
        }, 4400)

        const fadeoutTimer = setTimeout(() => {
            setAnimationPhase('fadeout')
        }, 8500)

        const completeTimer = setTimeout(() => {
            onComplete()
        }, 10500)

        return () => {
            clearTimeout(accelerateTimer)
            clearTimeout(convergeTimer)
            clearTimeout(burstTimer)
            clearTimeout(revealTimer)
            clearTimeout(fadeoutTimer)
            clearTimeout(completeTimer)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const spiritualElements = [
        { icon: '✨', label: 'Grâces', angle: 0, color: '#FBBF24' },
        { icon: '🙏', label: 'Prières', angle: 60, color: '#6366F1' },
        { icon: '📖', label: 'Écritures', angle: 120, color: '#10B981' },
        { icon: '🤝', label: 'Rencontres', angle: 180, color: '#F43F5E' },
        { icon: '🌿', label: 'Relecture', angle: 240, color: '#7BA7E1' },
        { icon: '🕊️', label: 'Paroles', angle: 300, color: '#0EA5E9' }
    ]

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
            position: 'fixed',
            top: 0,
            left: 0,
            overflow: 'hidden',
            opacity: animationPhase === 'fadeout' ? 0 : 1,
            transition: 'opacity 2s ease-out',
            zIndex: 9999
        }}>
            {/* Illumination divine */}
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

            {/* Bouton Skip discret */}
            <button
                onClick={onComplete}
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

            {/* Conteneur principal */}
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
                {/* Logo central - Colombe */}
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

                {/* Éléments spirituels en orbite */}
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

            {/* Logo final avec rayons */}
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

                    {/* Logo complet */}
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
