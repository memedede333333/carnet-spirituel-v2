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

    const totalSlides = 6

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
                <div className="onboarding-header-line" />

                <button onClick={handleExplore} className="onboarding-skip">
                    Passer ✕
                </button>

                <div className="onboarding-content">

                    {/* Slide 1: Bienvenue + Aperçu */}
                    {currentSlide === 0 && (
                        <div className="onboarding-slide">
                            <h1 className="onboarding-main-title">Bienvenue {userName}</h1>
                            <p className="onboarding-main-subtitle">
                                Discerner l'action de Dieu dans votre quotidien
                            </p>

                            <div className="onboarding-mini-modules">
                                <div className="mini-module grace">
                                    <div className="mini-icon-wrapper">
                                        <span className="mini-icon">✨</span>
                                    </div>
                                    <span className="mini-label">Grâces</span>
                                </div>
                                <div className="mini-module priere">
                                    <div className="mini-icon-wrapper">
                                        <span className="mini-icon">🙏</span>
                                    </div>
                                    <span className="mini-label">Prières</span>
                                </div>
                                <div className="mini-module ecriture">
                                    <div className="mini-icon-wrapper">
                                        <span className="mini-icon">📖</span>
                                    </div>
                                    <span className="mini-label">Écritures</span>
                                </div>
                                <div className="mini-module parole">
                                    <div className="mini-icon-wrapper">
                                        <span className="mini-icon">🕊️</span>
                                    </div>
                                    <span className="mini-label">Paroles</span>
                                </div>
                                <div className="mini-module rencontre">
                                    <div className="mini-icon-wrapper">
                                        <span className="mini-icon">🤝</span>
                                    </div>
                                    <span className="mini-label">Rencontres</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 2: Grâces + Prières */}
                    {currentSlide === 1 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-title">Votre carnet spirituel</h2>

                            <div className="onboarding-module-detail grace">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">✨</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Grâces reçues</h3>
                                    <p>Notez les bénédictions, les petits miracles du quotidien et les moments où vous reconnaissez la main de Dieu.</p>
                                </div>
                            </div>

                            <div className="onboarding-module-detail priere">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">🙏</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Prières</h3>
                                    <p>Confiez vos intentions de prière et suivez comment le Seigneur y répond dans votre vie et celle des autres.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 3: Écritures + Paroles + Rencontres */}
                    {currentSlide === 2 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-title">Votre carnet spirituel</h2>

                            <div className="onboarding-module-detail ecriture">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">📖</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Paroles d'Écriture</h3>
                                    <p>Gardez les passages bibliques qui vous touchent et méditez la Parole de Dieu.</p>
                                </div>
                            </div>

                            <div className="onboarding-module-detail parole">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">🕊️</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Paroles inspirées</h3>
                                    <p>Recueillez les inspirations et messages du Saint-Esprit, et notez leur accomplissement.</p>
                                </div>
                            </div>

                            <div className="onboarding-module-detail rencontre">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">🤝</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Rencontres missionnaires</h3>
                                    <p>Documentez vos rencontres d'évangélisation et gardez mémoire des rencontres providentielles.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 4: La Relecture */}
                    {currentSlide === 3 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-title">🌿 La Relecture</h2>
                            <p className="onboarding-subtitle">Reliez vos notes pour discerner le fil rouge de Dieu</p>

                            <div className="onboarding-module-detail relecture">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">🔗</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Créez des liens spirituels</h3>
                                    <p>Reliez vos grâces, prières, écritures et rencontres pour découvrir comment Dieu tisse votre histoire.</p>
                                </div>
                            </div>

                            <div className="onboarding-module-detail relecture">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">👁️</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Contemplez votre parcours</h3>
                                    <p>Visualisez votre cheminement spirituel sous différents angles : chronologique, thématique, ou en constellation.</p>
                                </div>
                            </div>

                            <p className="onboarding-quote">
                                « Chercher et trouver Dieu en toutes choses »
                                <br />
                                <span className="quote-author">— Saint Ignace de Loyola</span>
                            </p>
                        </div>
                    )}

                    {/* Slide 5: Le Jardin des Fioretti */}
                    {currentSlide === 4 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-title">🌸 Le Jardin des Fioretti</h2>
                            <p className="onboarding-subtitle">Partagez et découvrez les œuvres de Dieu</p>

                            <div className="onboarding-module-detail fioretti">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">🌟</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Partagez vos grâces</h3>
                                    <p>Partagez vos grâces, prières et rencontres avec la communauté de manière anonyme ou publique.</p>
                                </div>
                            </div>

                            <div className="onboarding-module-detail fioretti">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">🛡️</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Modération bienveillante</h3>
                                    <p>Tous les partages sont modérés avec bienveillance avant publication pour préserver un espace de contemplation.</p>
                                </div>
                            </div>

                            <div className="onboarding-module-detail fioretti">
                                <div className="detail-icon-wrapper">
                                    <span className="detail-icon">💝</span>
                                </div>
                                <div className="detail-content">
                                    <h3>Rendez grâce ensemble</h3>
                                    <p>Émerveillez-vous de ce que Dieu accomplit dans la vie des autres et encouragez la communauté.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 6: Premiers pas */}
                    {currentSlide === 5 && (
                        <div className="onboarding-slide">
                            <h2 className="onboarding-title">Commencez votre cheminement</h2>

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
