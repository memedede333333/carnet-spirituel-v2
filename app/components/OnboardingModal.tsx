'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import './OnboardingModal.css'

interface OnboardingModalProps {
    userName: string
    userId: string
    onComplete: () => void
}

export default function OnboardingModal({ userName, userId, onComplete }: OnboardingModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const router = useRouter()

    const totalSlides = 5

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1)
        }
    }

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1)
        }
    }

    const handleComplete = async () => {
        await supabase
            .from('profiles')
            .update({ has_seen_onboarding: true })
            .eq('id', userId)

        onComplete()
    }

    const handleStartFirstGrace = async () => {
        await handleComplete()
        router.push('/graces/nouvelle')
    }

    const handleExplore = async () => {
        await handleComplete()
    }

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-backdrop" onClick={handleExplore} />

            <div className="onboarding-modal">
                <div className="onboarding-header-gradient" />

                <button onClick={handleExplore} className="onboarding-skip">
                    Passer ✕
                </button>

                <div className="onboarding-slides">

                    {/* Slide 1: Bienvenue */}
                    {currentSlide === 0 && (
                        <div className="onboarding-slide">
                            <div className="onboarding-welcome">
                                <h1>Bienvenue {userName}</h1>
                                <p className="onboarding-tagline">
                                    Discerner l'action de Dieu dans votre quotidien
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Slide 2: Les 5 Modules */}
                    {currentSlide === 1 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-section-title">Votre carnet spirituel</h2>
                            <p className="onboarding-section-subtitle">Notez l'action de Dieu dans votre vie</p>

                            <div className="onboarding-modules-grid">
                                <div className="onboarding-module grace">
                                    <span className="module-emoji">✨</span>
                                    <h3>Grâces reçues</h3>
                                </div>

                                <div className="onboarding-module priere">
                                    <span className="module-emoji">🙏</span>
                                    <h3>Prières</h3>
                                </div>

                                <div className="onboarding-module ecriture">
                                    <span className="module-emoji">📖</span>
                                    <h3>Écritures</h3>
                                </div>

                                <div className="onboarding-module parole">
                                    <span className="module-emoji">🕊️</span>
                                    <h3>Paroles inspirées</h3>
                                </div>

                                <div className="onboarding-module rencontre full-width">
                                    <span className="module-emoji">🤝</span>
                                    <h3>Rencontres missionnaires</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 3: La Relecture */}
                    {currentSlide === 2 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-section-title">🌿 La Relecture</h2>
                            <p className="onboarding-section-subtitle">Reliez vos notes pour discerner le fil rouge de Dieu</p>

                            <div className="onboarding-feature-list">
                                <div className="feature-item">
                                    <strong>Créez des liens</strong> entre vos grâces, prières et rencontres
                                </div>
                                <div className="feature-item">
                                    <strong>Découvrez</strong> comment une prière exauce une grâce
                                </div>
                                <div className="feature-item">
                                    <strong>Contemplez</strong> votre parcours spirituel dans différentes vues
                                </div>
                            </div>

                            <p className="onboarding-quote">
                                « Chercher et trouver Dieu en toutes choses »
                                <br />
                                <span className="quote-author">— Saint Ignace de Loyola</span>
                            </p>
                        </div>
                    )}

                    {/* Slide 4: Le Jardin des Fioretti */}
                    {currentSlide === 3 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-section-title">🌸 Le Jardin des Fioretti</h2>
                            <p className="onboarding-section-subtitle">Partagez et découvrez les œuvres de Dieu</p>

                            <div className="onboarding-fioretti-desc">
                                <p>
                                    Partagez vos grâces, prières et rencontres avec la communauté
                                    de manière <strong>anonyme ou publique</strong>.
                                </p>
                                <p>
                                    Tous les partages sont <strong>modérés avec bienveillance</strong>
                                    avant publication pour préserver un espace de contemplation.
                                </p>
                                <p>
                                    Rendez grâce ensemble et émerveillez-vous de ce que Dieu accomplit
                                    dans la vie des autres.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Slide 5: Premiers pas */}
                    {currentSlide === 4 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-section-title">Commencez votre cheminement</h2>

                            <div className="onboarding-steps">
                                <div className="step-item">
                                    <span className="step-number">1</span>
                                    <span>Notez votre première grâce</span>
                                </div>
                                <div className="step-item">
                                    <span className="step-number">2</span>
                                    <span>Faites l'expérience de Dieu au quotidien</span>
                                </div>
                                <div className="step-item">
                                    <span className="step-number">3</span>
                                    <span>Découvrez la Relecture pour discerner Son action</span>
                                </div>
                            </div>

                            <div className="onboarding-actions">
                                <button onClick={handleStartFirstGrace} className="btn-primary">
                                    ✨ Noter ma première grâce
                                </button>
                                <button onClick={handleExplore} className="btn-secondary">
                                    Explorer le carnet
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Navigation */}
                <div className="onboarding-nav">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="nav-btn"
                    >
                        ← Précédent
                    </button>

                    <div className="nav-dots">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === totalSlides - 1}
                        className="nav-btn"
                    >
                        Suivant →
                    </button>
                </div>

            </div>
        </div>
    )
}
