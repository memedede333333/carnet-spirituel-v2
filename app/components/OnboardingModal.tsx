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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop avec blur */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
                onClick={handleExplore}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-slideUp">

                {/* Gradient décoratif header */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500" />

                {/* Bouton Skip élégant */}
                <button
                    onClick={handleExplore}
                    className="absolute top-6 right-6 z-10 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                    Passer ✕
                </button>

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">

                    {/* Slide 1: Bienvenue */}
                    {currentSlide === 0 && (
                        <div className="text-center space-y-8 animate-slideIn">
                            <div className="inline-block p-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl">
                                <div className="text-7xl md:text-8xl animate-float">🕊️</div>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-crimson font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                                    Bienvenue {userName}
                                </h1>
                                <p className="text-xl md:text-2xl text-sky-600 font-medium">
                                    Cultivez la présence de Dieu dans votre quotidien
                                </p>
                            </div>

                            <div className="max-w-2xl mx-auto bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl p-8 md:p-10 shadow-inner border border-sky-100">
                                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-4">
                                    Votre <strong className="text-sky-700">Carnet Spirituel</strong> vous permettra de noter et relier l'action de Dieu dans votre vie.
                                </p>
                                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                                    Découvrez comment <strong className="text-sky-600">discerner le fil rouge</strong> de l'action divine dans votre quotidien.
                                </p>
                            </div>

                            <p className="text-base md:text-lg text-gray-500 italic font-crimson">
                                « Chercher et trouver Dieu en toutes choses »
                                <br />
                                <span className="text-sm">- Saint Ignace de Loyola</span>
                            </p>
                        </div>
                    )}

                    {/* Slide 2: Les 5 Modules */}
                    {currentSlide === 1 && (
                        <div className="space-y-8 animate-slideIn">
                            <div className="text-center space-y-3">
                                <div className="inline-block p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                                    <span className="text-5xl">📝</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-crimson font-bold text-gray-900">
                                    Les 5 modules
                                </h2>
                                <p className="text-lg md:text-xl text-gray-600">
                                    Notez l'action de Dieu dans votre vie
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                                    <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">✨</div>
                                    <h3 className="font-bold text-xl md:text-2xl text-amber-900 mb-3">Grâces reçues</h3>
                                    <p className="text-gray-700 leading-relaxed">Notez les bénédictions, les petits miracles du quotidien.</p>
                                </div>

                                <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 md:p-8 border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                                    <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🙏</div>
                                    <h3 className="font-bold text-xl md:text-2xl text-indigo-900 mb-3">Prières</h3>
                                    <p className="text-gray-700 leading-relaxed">Confiez vos intentions et suivez comment le Seigneur y répond.</p>
                                </div>

                                <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                                    <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📖</div>
                                    <h3 className="font-bold text-xl md:text-2xl text-emerald-900 mb-3">Écritures</h3>
                                    <p className="text-gray-700 leading-relaxed">Méditez la Parole de Dieu et notez ce qui vous touche.</p>
                                </div>

                                <div className="group bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 md:p-8 border-2 border-sky-100 hover:border-sky-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                                    <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🕊️</div>
                                    <h3 className="font-bold text-xl md:text-2xl text-sky-900 mb-3">Paroles inspirées</h3>
                                    <p className="text-gray-700 leading-relaxed">Recueillez les inspirations et messages du Saint-Esprit.</p>
                                </div>
                            </div>

                            <div className="group bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 md:p-8 border-2 border-rose-100 hover:border-rose-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                                <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🤝</div>
                                <h3 className="font-bold text-xl md:text-2xl text-rose-900 mb-3">Rencontres missionnaires</h3>
                                <p className="text-gray-700 leading-relaxed">Gardez mémoire des rencontres providentielles.</p>
                            </div>
                        </div>
                    )}

                    {/* Slide 3: La Relecture */}
                    {currentSlide === 2 && (
                        <div className="space-y-8 animate-slideIn">
                            <div className="text-center space-y-3">
                                <div className="inline-block p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                                    <span className="text-5xl">🌿</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-crimson font-bold text-gray-900">
                                    LA RELECTURE
                                </h2>
                                <p className="text-lg md:text-xl text-gray-600">
                                    Contemplez l'action divine
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-8 md:p-10 border-2 border-emerald-200 shadow-lg">
                                <p className="text-xl md:text-2xl text-gray-800 font-semibold mb-6">
                                    Reliez spirituellement vos notes pour découvrir le fil rouge de Dieu :
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                                        <span className="text-2xl text-emerald-600 flex-shrink-0">✓</span>
                                        <p className="text-lg text-gray-700">Créez des <strong>liens</strong> entre vos grâces, prières, rencontres</p>
                                    </div>
                                    <div className="flex items-start gap-4 bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                                        <span className="text-2xl text-emerald-600 flex-shrink-0">✓</span>
                                        <p className="text-lg text-gray-700">Voyez comment cette prière <strong>exauce</strong> cette grâce</p>
                                    </div>
                                    <div className="flex items-start gap-4 bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                                        <span className="text-2xl text-emerald-600 flex-shrink-0">✓</span>
                                        <p className="text-lg text-gray-700">Découvrez comment cette parole <strong>accomplit</strong> cet événement</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 md:p-10 border-2 border-gray-200 shadow-lg">
                                <p className="text-xl font-bold text-gray-900 mb-6">Contemplez sous 5 angles différents :</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: '📅', title: 'Chronologique', desc: 'Revivez votre parcours spirituel' },
                                        { icon: '📖', title: 'Thématique', desc: 'Par type (grâces, prières...)' },
                                        { icon: '❤️', title: 'Mouvements spirituels', desc: 'Consolations et désolations' },
                                        { icon: '🌸', title: 'Jardin des grâces', desc: 'Vue contemplative' },
                                        { icon: '👁️', title: 'Vue d\'ensemble', desc: 'Synthèse de votre cheminement', className: 'sm:col-span-2' }
                                    ].map((item, idx) => (
                                        <div key={idx} className={`flex items-start gap-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 ${item.className || ''}`}>
                                            <span className="text-3xl flex-shrink-0">{item.icon}</span>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                                                <p className="text-sm text-gray-600">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 4: Le Jardin des Fioretti */}
                    {currentSlide === 3 && (
                        <div className="space-y-8 animate-slideIn">
                            <div className="text-center space-y-3">
                                <div className="inline-block p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                    <span className="text-5xl">🌸</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-crimson font-bold text-gray-900">
                                    Le Jardin des Fioretti
                                </h2>
                                <p className="text-lg md:text-xl text-gray-600">
                                    Émerveillez-vous ensemble
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-2xl p-8 md:p-10 border-2 border-rose-200 shadow-lg">
                                <p className="text-xl md:text-2xl text-gray-800 font-semibold mb-8 text-center">
                                    Partagez les œuvres de Dieu et découvrez ce qu'Il fait dans la vie des autres
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-shadow duration-300">
                                        <div className="text-5xl mb-4">🌟</div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">S'émerveiller</h4>
                                        <p className="text-gray-600">De ce que Dieu accomplit</p>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-shadow duration-300">
                                        <div className="text-5xl mb-4">🙏</div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Rendre grâce</h4>
                                        <p className="text-gray-600">Pour ses bienfaits</p>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-shadow duration-300">
                                        <div className="text-5xl mb-4">💝</div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Encourager</h4>
                                        <p className="text-gray-600">La communauté</p>
                                    </div>
                                </div>

                                <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
                                    <p className="text-lg text-gray-700">
                                        Partage <strong className="text-rose-600">anonyme ou public</strong>, modéré avec bienveillance
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide 5: Citation */}
                    {currentSlide === 4 && (
                        <div className="flex items-center justify-center min-h-[400px] md:min-h-[500px] animate-slideIn">
                            <div className="text-center max-w-3xl space-y-8">
                                <div className="inline-block p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full">
                                    <div className="text-7xl md:text-8xl animate-float">📿</div>
                                </div>

                                <blockquote className="relative">
                                    <div className="text-6xl md:text-7xl text-sky-200 absolute -top-8 -left-4 md:-left-8 font-serif">"</div>
                                    <p className="text-2xl md:text-3xl lg:text-4xl font-crimson text-gray-800 leading-relaxed relative z-10 px-6">
                                        Rendez grâce en toute circonstance, car c'est la volonté de Dieu à votre égard dans le Christ Jésus.
                                    </p>
                                    <div className="text-6xl md:text-7xl text-sky-200 absolute -bottom-8 -right-4 md:-right-8 font-serif">"</div>
                                </blockquote>

                                <cite className="block text-xl md:text-2xl text-sky-600 font-medium mt-6">
                                    1 Thessaloniciens 5, 18
                                </cite>
                            </div>
                        </div>
                    )}

                    {/* Slide 6: CTA */}
                    {currentSlide === 5 && (
                        <div className="space-y-8 md:space-y-10 animate-slideIn text-center">
                            <div className="inline-block p-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-full">
                                <div className="text-7xl md:text-8xl animate-float">🎯</div>
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-crimson font-bold text-gray-900">
                                Vos premiers pas
                            </h2>

                            <div className="max-w-2xl mx-auto bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl p-8 md:p-10 border-2 border-sky-200 shadow-lg">
                                <ol className="space-y-6 text-left">
                                    {[
                                        { num: '1', icon: '📝', text: 'Notez votre première grâce' },
                                        { num: '2', icon: '🙏', text: 'Confiez une intention' },
                                        { num: '3', icon: '🌿', text: 'Découvrez la Relecture' }
                                    ].map((step) => (
                                        <li key={step.num} className="flex items-start gap-4 bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                                            <span className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                                {step.num}
                                            </span>
                                            <div className="flex-1 pt-1">
                                                <p className="text-lg md:text-xl font-semibold text-gray-800">
                                                    {step.icon} {step.text}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={handleStartFirstGrace}
                                    className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg md:text-xl shadow-2xl hover:shadow-sky-500/50 hover:scale-105 transition-all duration-300"
                                >
                                    ✨ Noter ma première grâce
                                </button>

                                <div>
                                    <button
                                        onClick={handleExplore}
                                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300 underline decoration-dotted underline-offset-4"
                                    >
                                        Explorer d'abord le carnet →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Navigation */}
                <div className="border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 md:px-12 py-6">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                        >
                            ← Précédent
                        </button>

                        <div className="flex gap-2.5">
                            {Array.from({ length: totalSlides }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'w-10 h-3 bg-gradient-to-r from-sky-500 to-blue-600'
                                        : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-125'
                                        }`}
                                    aria-label={`Aller à la slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextSlide}
                            disabled={currentSlide === totalSlides - 1}
                            className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                        >
                            Suivant →
                        </button>
                    </div>
                </div>

            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
