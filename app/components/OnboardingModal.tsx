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
        router.push('/graces/new')
    }

    const handleExplore = async () => {
        await handleComplete()
    }

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-backdrop" onClick={handleExplore} />

            <div className="onboarding-modal">
                <div className="onboarding-header-line" />

                <button onClick={handleExplore} className="onboarding-skip-btn">
                    Passer ✕
                </button>

                <div className="onboarding-content">

                    {/* Slide 1: Bienvenue */}
                    {currentSlide === 0 && (
                        <div className="onboarding-slide text-center">
                            <div className="onboarding-emoji-box">
                                <div className="onboarding-emoji-large">🕊️</div>
                            </div>

                            <h1 className="onboarding-title">
                                Bienvenue {userName}
                            </h1>
                            <p className="onboarding-subtitle">
                                Cultivez la présence de Dieu dans votre quotidien
                            </p>

                            <div className="onboarding-info-box">
                                <p className="onboarding-text">
                                    Votre <strong>Carnet Spirituel</strong> vous permettra de noter et relier l'action de Dieu dans votre vie.
                                </p>
                                <p className="onboarding-text">
                                    Découvrez comment <strong>discerner le fil rouge</strong> de l'action divine dans votre quotidien.
                                </p>
                            </div>

                            <p className="onboarding-quote">
                                « Chercher et trouver Dieu en toutes choses »
                                <br />
                                <span className="onboarding-quote-author">- Saint Ignace de Loyola</span>
                            </p>
                        </div>
                    )}

                    {/* Slide 2: Les 5 Modules */}
                    {currentSlide === 1 && (
                        <div className="onboarding-slide">
                            <div className="text-center mb-8">
                                <div className="onboarding-emoji-box-small">
                                    <span className="text-5xl">📝</span>
                                </div>
                                <h2 className="onboarding-section-title">Les 5 modules</h2>
                                <p className="onboarding-section-desc">Notez l'action de Dieu dans votre vie</p>
                            </div>

                            <div className="onboarding-grid">
                                <div className="onboarding-card onboarding-card-grace">
                                    <div className="text-5xl mb-4">✨</div>
                                    <h3 className="onboarding-card-title">Grâces reçues</h3>
                                    <p className="onboarding-card-desc">Notez les bénédictions, les petits miracles du quotidien.</p>
                                </div>

                                <div className="onboarding-card onboarding-card-priere">
                                    <div className="text-5xl mb-4">🙏</div>
                                    <h3 className="onboarding-card-title">Prières</h3>
                                    <p className="onboarding-card-desc">Confiez vos intentions et suivez comment le Seigneur y répond.</p>
                                </div>

                                <div className="onboarding-card onboarding-card-ecriture">
                                    <div className="text-5xl mb-4">📖</div>
                                    <h3 className="onboarding-card-title">Écritures</h3>
                                    <p className="onboarding-card-desc">Méditez la Parole de Dieu et notez ce qui vous touche.</p>
                                </div>

                                <div className="onboarding-card onboarding-card-parole">
                                    <div className="text-5xl mb-4">🕊️</div>
                                    <h3 className="onboarding-card-title">Paroles inspirées</h3>
                                    <p className="onboarding-card-desc">Recueillez les inspirations et messages du Saint-Esprit.</p>
                                </div>
                            </div>

                            <div className="onboarding-card onboarding-card-rencontre mt-6">
                                <div className="text-5xl mb-4">🤝</div>
                                <h3 className="onboarding-card-title">Rencontres missionnaires</h3>
                                <p className="onboarding-card-desc">Gardez mémoire des rencontres providentielles.</p>
                            </div>
                        </div>
                    )}

                    {/* Slide 3: La Relecture */}
                    {currentSlide === 2 && (
                        <div className="onboarding-slide">
                            <div className="text-center mb-8">
                                <div className="onboarding-emoji-box-small">
                                    <span className="text-5xl">🌿</span>
                                </div>
                                <h2 className="onboarding-section-title">LA RELECTURE</h2>
                                <p className="onboarding-section-desc">Contemplez l'action divine</p>
                            </div>

                            <div className="onboarding-feature-box">
                                <p className="onboarding-feature-title">
                                    Reliez spirituellement vos notes pour découvrir le fil rouge de Dieu :
                                </p>
                                <div className="space-y-4">
                                    <div className="onboarding-feature-item">
                                        <span className="onboarding-check">✓</span>
                                        <p>Créez des <strong>liens</strong> entre vos grâces, prières, rencontres</p>
                                    </div>
                                    <div className="onboarding-feature-item">
                                        <span className="onboarding-check">✓</span>
                                        <p>Voyez comment cette prière <strong>exauce</strong> cette grâce</p>
                                    </div>
                                    <div className="onboarding-feature-item">
                                        <span className="onboarding-check">✓</span>
                                        <p>Découvrez comment cette parole <strong>accomplit</strong> cet événement</p>
                                    </div>
                                </div>
                            </div>

                            <div className="onboarding-views-box">
                                <p className="font-bold text-xl mb-6">Contemplez sous 5 angles différents :</p>
                                <div className="space-y-3">
                                    <div className="onboarding-view-item">
                                        <span className="text-3xl mr-4">📅</span>
                                        <div>
                                            <h4 className="font-bold">Chronologique</h4>
                                            <p className="text-sm text-gray-600">Revivez votre parcours spirituel</p>
                                        </div>
                                    </div>
                                    <div className="onboarding-view-item">
                                        <span className="text-3xl mr-4">📖</span>
                                        <div>
                                            <h4 className="font-bold">Thématique</h4>
                                            <p className="text-sm text-gray-600">Par type (grâces, prières...)</p>
                                        </div>
                                    </div>
                                    <div className="onboarding-view-item">
                                        <span className="text-3xl mr-4">❤️</span>
                                        <div>
                                            <h4 className="font-bold">Mouvements spirituels</h4>
                                            <p className="text-sm text-gray-600">Consolations et désolations</p>
                                        </div>
                                    </div>
                                    <div className="onboarding-view-item">
                                        <span className="text-3xl mr-4">🌸</span>
                                        <div>
                                            <h4 className="font-bold">Jardin des grâces</h4>
                                            <p className="text-sm text-gray-600">Vue contemplative</p>
                                        </div>
                                    </div>
                                    <div className="onboarding-view-item">
                                        <span className="text-3xl mr-4">👁️</span>
                                        <div>
                                            <h4 className="font-bold">Vue d'ensemble</h4>
                                            <p className="text-sm text-gray-600">Synthèse de votre cheminement</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 4: Le Jardin des Fioretti */}
                    {currentSlide === 3 && (
                        <div className="onboarding-slide">
                            <div className="text-center mb-8">
                                <div className="onboarding-emoji-box-small">
                                    <span className="text-5xl">🌸</span>
                                </div>
                                <h2 className="onboarding-section-title">Le Jardin des Fioretti</h2>
                                <p className="onboarding-section-desc">Émerveillez-vous ensemble</p>
                            </div>

                            <div className="onboarding-fioretti-box">
                                <p className="onboarding-fioretti-title">
                                    Partagez les œuvres de Dieu et découvrez ce qu'Il fait dans la vie des autres
                                </p>

                                <div className="onboarding-fioretti-grid">
                                    <div className="onboarding-fioretti-card">
                                        <div className="text-5xl mb-4">🌟</div>
                                        <h4 className="font-bold text-lg mb-2">S'émerveiller</h4>
                                        <p className="text-gray-600">De ce que Dieu accomplit</p>
                                    </div>

                                    <div className="onboarding-fioretti-card">
                                        <div className="text-5xl mb-4">🙏</div>
                                        <h4 className="font-bold text-lg mb-2">Rendre grâce</h4>
                                        <p className="text-gray-600">Pour ses bienfaits</p>
                                    </div>

                                    <div className="onboarding-fioretti-card">
                                        <div className="text-5xl mb-4">💝</div>
                                        <h4 className="font-bold text-lg mb-2">Encourager</h4>
                                        <p className="text-gray-600">La communauté</p>
                                    </div>
                                </div>

                                <div className="onboarding-fioretti-note">
                                    <p>
                                        Partage <strong className="text-rose-600">anonyme ou public</strong>, modéré avec bienveillance
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 5: Citation */}
                    {currentSlide === 4 && (
                        <div className="onboarding-slide onboarding-slide-center">
                            <div className="text-center max-w-3xl mx-auto">
                                <div className="onboarding-emoji-box-large mb-8">
                                    <div className="text-8xl">📿</div>
                                </div>

                                <blockquote className="onboarding-blockquote">
                                    <p className="onboarding-quote-text">
                                        Rendez grâce en toute circonstance, car c'est la volonté de Dieu à votre égard dans le Christ Jésus.
                                    </p>
                                </blockquote>

                                <cite className="onboarding-citation">
                                    1 Thessaloniciens 5, 18
                                </cite>
                            </div>
                        </div>
                    )}

                    {/* Slide 6: CTA */}
                    {currentSlide === 5 && (
                        <div className="onboarding-slide text-center">
                            <div className="onboarding-emoji-box-large mb-8">
                                <div className="text-8xl">🎯</div>
                            </div>

                            <h2 className="onboarding-section-title mb-8">
                                Vos premiers pas
                            </h2>

                            <div className="onboarding-steps-box">
                                <ol className="space-y-6">
                                    <li className="onboarding-step-item">
                                        <span className="onboarding-step-number">1</span>
                                        <p className="onboarding-step-text">
                                            📝 Notez votre première grâce
                                        </p>
                                    </li>
                                    <li className="onboarding-step-item">
                                        <span className="onboarding-step-number">2</span>
                                        <p className="onboarding-step-text">
                                            🙏 Confiez une intention
                                        </p>
                                    </li>
                                    <li className="onboarding-step-item">
                                        <span className="onboarding-step-number">3</span>
                                        <p className="onboarding-step-text">
                                            🌿 Découvrez la Relecture
                                        </p>
                                    </li>
                                </ol>
                            </div>

                            <div className="mt-8 space-y-4">
                                <button
                                    onClick={handleStartFirstGrace}
                                    className="onboarding-cta-btn"
                                >
                                    ✨ Noter ma première grâce
                                </button>

                                <div>
                                    <button
                                        onClick={handleExplore}
                                        className="onboarding-explore-btn"
                                    >
                                        Explorer d'abord le carnet →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Navigation */}
                <div className="onboarding-footer">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="onboarding-nav-btn"
                    >
                        ← Précédent
                    </button>

                    <div className="onboarding-dots">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`onboarding-dot ${index === currentSlide ? 'active' : ''}`}
                                aria-label={`Aller à la slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === totalSlides - 1}
                        className="onboarding-nav-btn"
                    >
                        Suivant →
                    </button>
                </div>

            </div>
        </div>
    )
}
