'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

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
        // Marquer l'onboarding comme vu
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header avec bouton Skip */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={handleExplore}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Passer
                    </button>
                </div>

                {/* Contenu des slides */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12">

                    {/* Slide 1: Bienvenue */}
                    {currentSlide === 0 && (
                        <div className="text-center space-y-6 animate-fadeIn">
                            <div className="text-6xl mb-4">🕊️</div>
                            <h1 className="text-4xl font-crimson font-bold text-gray-900">
                                Bienvenue {userName} !
                            </h1>
                            <p className="text-xl text-sky-600 font-medium">
                                Cultivez la présence de Dieu dans votre quotidien
                            </p>
                            <div className="bg-sky-50 rounded-xl p-6 mt-8">
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Votre <strong>Carnet Spirituel</strong> vous permettra de noter et relier l'action de Dieu dans votre vie.
                                </p>
                                <p className="text-lg text-gray-700 leading-relaxed mt-4">
                                    Découvrez comment <strong className="text-sky-600">discerner le fil rouge</strong> de l'action divine dans votre quotidien.
                                </p>
                            </div>
                            <div className="text-sm text-gray-500 italic mt-6">
                                « Chercher et trouver Dieu en toutes choses » - Saint Ignace de Loyola
                            </div>
                        </div>
                    )}

                    {/* Slide 2: Les 5 Modules */}
                    {currentSlide === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <h2 className="text-3xl font-crimson font-bold text-gray-900 mb-2">
                                    📝 Les 5 modules
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Notez l'action de Dieu dans votre vie
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                                    <div className="text-3xl mb-3">✨</div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Grâces reçues</h3>
                                    <p className="text-gray-700">Notez les bénédictions, les petits miracles du quotidien.</p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                    <div className="text-3xl mb-3">🙏</div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Prières</h3>
                                    <p className="text-gray-700">Confiez vos intentions et suivez comment le Seigneur y répond.</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                    <div className="text-3xl mb-3">📖</div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Écritures</h3>
                                    <p className="text-gray-700">Méditez la Parole de Dieu et notez ce qui vous touche.</p>
                                </div>

                                <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-6 border border-sky-200">
                                    <div className="text-3xl mb-3">🕊️</div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Paroles inspirées</h3>
                                    <p className="text-gray-700">Recueillez les inspirations et messages du Saint-Esprit.</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 mt-4">
                                <div className="text-3xl mb-3">🤝</div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Rencontres missionnaires</h3>
                                <p className="text-gray-700">Gardez mémoire des rencontres providentielles.</p>
                            </div>
                        </div>
                    )}

                    {/* Slide 3: La Relecture */}
                    {currentSlide === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <h2 className="text-3xl font-crimson font-bold text-gray-900 mb-2">
                                    🌿 LA RELECTURE
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Contemplez l'action divine
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-8 border border-emerald-200">
                                <p className="text-lg text-gray-800 font-medium mb-4">
                                    <strong>Reliez spirituellement vos notes</strong> pour découvrir le fil rouge de Dieu :
                                </p>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-emerald-600 mr-2">✓</span>
                                        <span>Créez des <strong>liens</strong> entre vos grâces, prières, rencontres</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-emerald-600 mr-2">✓</span>
                                        <span>Voyez comment cette prière <strong>exauce</strong> cette grâce</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-emerald-600 mr-2">✓</span>
                                        <span>Découvrez comment cette parole <strong>accomplit</strong> cet événement</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                                <p className="font-semibold text-gray-900 mb-4">Contemplez sous 5 angles différents :</p>
                                <div className="space-y-3 text-gray-700">
                                    <div className="flex items-start">
                                        <span className="mr-3">📅</span>
                                        <div>
                                            <strong>Chronologique</strong> - Revivez votre parcours spirituel
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="mr-3">📖</span>
                                        <div>
                                            <strong>Thématique</strong> - Par type (grâces, prières...)
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="mr-3">❤️</span>
                                        <div>
                                            <strong>Mouvements spirituels</strong> - Consolations et désolations
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="mr-3">🌸</span>
                                        <div>
                                            <strong>Jardin des grâces</strong> - Vue contemplative
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="mr-3">👁️</span>
                                        <div>
                                            <strong>Vue d'ensemble</strong> - Synthèse de votre cheminement
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 4: Le Jardin des Fioretti */}
                    {currentSlide === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <h2 className="text-3xl font-crimson font-bold text-gray-900 mb-2">
                                    🌸 Le Jardin des Fioretti
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Émerveillez-vous ensemble
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-8 border border-rose-200">
                                <p className="text-lg text-gray-800 font-medium mb-6">
                                    <strong>Partagez les œuvres de Dieu</strong> et <strong>découvrez ce que Dieu fait dans la vie des autres</strong>.
                                </p>

                                <div className="space-y-4">
                                    <div className="bg-white/70 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <span className="text-2xl mr-3">🌟</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">S'émerveiller</h4>
                                                <p className="text-gray-700">De ce que Dieu accomplit</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <span className="text-2xl mr-3">🙏</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">Rendre grâce ensemble</h4>
                                                <p className="text-gray-700">Pour ses bienfaits</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <span className="text-2xl mr-3">💝</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">Encourager</h4>
                                                <p className="text-gray-700">La communauté</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-white/70 rounded-lg p-4">
                                    <p className="text-gray-700">
                                        Partage <strong>anonyme ou public</strong>, modéré avec bienveillance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 5: Citation inspirante */}
                    {currentSlide === 4 && (
                        <div className="space-y-6 animate-fadeIn flex items-center justify-center min-h-[400px]">
                            <div className="text-center max-w-2xl">
                                <div className="text-6xl mb-8">📿</div>
                                <blockquote className="text-2xl md:text-3xl font-crimson text-gray-800 leading-relaxed mb-6">
                                    « Rendez grâce en toute circonstance, car c'est la volonté de Dieu à votre égard dans le Christ Jésus. »
                                </blockquote>
                                <cite className="text-lg text-sky-600 font-medium">
                                    1 Thessaloniciens 5, 18
                                </cite>
                            </div>
                        </div>
                    )}

                    {/* Slide 6: CTA Final */}
                    {currentSlide === 5 && (
                        <div className="space-y-8 animate-fadeIn text-center">
                            <div className="text-6xl mb-4">🎯</div>
                            <h2 className="text-3xl font-crimson font-bold text-gray-900">
                                Vos premiers pas
                            </h2>

                            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-8 border border-sky-200">
                                <ol className="space-y-4 text-left max-w-md mx-auto text-lg">
                                    <li className="flex items-start">
                                        <span className="font-semibold text-sky-600 mr-3">1.</span>
                                        <span className="text-gray-800">📝 <strong>Notez votre première grâce</strong></span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-semibold text-sky-600 mr-3">2.</span>
                                        <span className="text-gray-800">🙏 <strong>Confiez une intention</strong></span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-semibold text-sky-600 mr-3">3.</span>
                                        <span className="text-gray-800">🌿 <strong>Découvrez la Relecture</strong></span>
                                    </li>
                                </ol>
                            </div>

                            <div className="space-y-4 mt-8">
                                <button
                                    onClick={handleStartFirstGrace}
                                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                >
                                    ✨ Noter ma première grâce
                                </button>
                                <div>
                                    <button
                                        onClick={handleExplore}
                                        className="text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Explorer d'abord le carnet →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer: Navigation */}
                <div className="border-t bg-gray-50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Précédent
                        </button>

                        {/* Indicateurs de progression */}
                        <div className="flex gap-2">
                            {Array.from({ length: totalSlides }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all ${index === currentSlide
                                            ? 'w-8 bg-sky-600'
                                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    aria-label={`Aller à la slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextSlide}
                            disabled={currentSlide === totalSlides - 1}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Suivant →
                        </button>
                    </div>
                </div>

            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
        </div>
    )
}
