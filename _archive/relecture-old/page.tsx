'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Heart, BookOpen, Users, MessageSquare, Filter, Calendar, ChevronRight, Eye, Lightbulb, Zap, Link as LinkIcon, Compass, Cross, Church, Flower, Star, Check, HandHeart, ArrowRight, Trash2 } from 'lucide-react'
import { format, parseISO, isWithinInterval, subMonths, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import LinkBadge from '@/app/components/LinkBadge'

import ConstellationView from '@/app/components/ConstellationView'
import LinkBadge from '@/app/components/LinkBadge'
import LinksList from '@/app/components/LinksList'
import { areEntriesLinked as checkEntriesLinked, getLinkTypeBetween } from '@/app/lib/spiritual-links-helpers'

export default function RelecturePage() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<any[]>([])
  const [filteredEntries, setFilteredEntries] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('3months')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all'])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'chronologique' | 'thematique' | 'consolations' | 'jardin' | 'fleuve' | 'constellation' | 'ensemble' | 'gestion' | 'atelier'>('chronologique')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedEntryForLink, setSelectedEntryForLink] = useState<any>(null)
  const [possibleLinks, setPossibleLinks] = useState<any[]>([])
  const [linkMode, setLinkMode] = useState(false)
  const [firstSelectedEntry, setFirstSelectedEntry] = useState<any>(null)
  const [spiritualLinks, setSpiritualLinks] = useState<any[]>([])
  const [updatingLink, setUpdatingLink] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [hoveredEntry, setHoveredEntry] = useState<any>(null)
  const [gestionFilters, setGestionFilters] = useState({
    typeLien: 'all',
    typeSource: 'all',
    typeCible: 'all',
    recherche: ''
  })
  const [atelierSourceFilter, setAtelierSourceFilter] = useState('all')
  const [atelierDestFilter, setAtelierDestFilter] = useState('all')
  const [selectedSource, setSelectedSource] = useState<any>(null)
  const [selectedDest, setSelectedDest] = useState<any>(null)
  const [selectedLinkType, setSelectedLinkType] = useState('exauce')
  const [linkNotification, setLinkNotification] = useState<{ message: string; type: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadAllEntries()
  }, [])
  useEffect(() => {
  loadAllEntries()
}, [])

// Fermer le dropdown au clic externe
useEffect(() => {
  const handleClickOutside = () => {
    setOpenDropdown(null);
  };
  
  if (openDropdown) {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }
}, [openDropdown])

  useEffect(() => {
    filterEntries()
  }, [entries, selectedPeriod, selectedTypes])

  async function loadAllEntries() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [graces, prieres, ecritures, paroles, rencontres] = await Promise.all([
        supabase.from('graces').select('*').eq('user_id', user.id),
        supabase.from('prieres').select('*').eq('user_id', user.id),
        supabase.from('paroles_ecriture').select('*').eq('user_id', user.id),
        supabase.from('paroles_connaissance').select('*').eq('user_id', user.id),
        supabase.from('rencontres_missionnaires').select('*').eq('user_id', user.id)
      ])

      const allEntries = [
        ...(graces.data || []).map(g => ({ ...g, type: 'grace', date: g.date })),
        ...(prieres.data || []).map(p => ({ ...p, type: 'priere', date: p.date })),
        ...(ecritures.data || []).map(e => ({ ...e, type: 'ecriture', date: e.date_reception })),
        ...(paroles.data || []).map(p => ({ ...p, type: 'parole', date: p.date })),
        ...(rencontres.data || []).map(r => ({ ...r, type: 'rencontre', date: r.date }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      
      
      // Charger aussi les liens spirituels
      const { data: liens } = await supabase
        .from('liens_spirituels')
        .select('*')
        .eq('user_id', user.id)
      
      // Ajouter le nombre de liens à chaque entrée
      allEntries.forEach(entry => {
        entry.linksCount = (liens || []).filter(l => 
          (l.element_source_id === entry.id && l.element_source_type === entry.type) ||
          (l.element_cible_id === entry.id && l.element_cible_type === entry.type)
        ).length
      })
      
      setEntries(allEntries)

      // Charger les liens spirituels
      const { data: liensData } = await supabase
        .from('liens_spirituels')
        .select('*')
        .eq('user_id', user.id)
      
      setSpiritualLinks(liensData || [])    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  function filterEntries() {
    let filtered = [...entries]

    // Filtre par période
    const periodMap: Record<string, number | null> = {
      '1week': 7,
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365,
      'all': null
    }

    if (periodMap[selectedPeriod]) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - periodMap[selectedPeriod])
      filtered = filtered.filter(e => new Date(e.date) >= startDate)
    }

    // Filtre par type
    if (!selectedTypes.includes('all')) {
      filtered = filtered.filter(e => selectedTypes.includes(e.type))
    }

    setFilteredEntries(filtered)
  }

  const getTypeConfig = (type: string) => {
    const configs: Record<string, any> = {
      grace: { emoji: "✨", icon: Sparkles, color: '#fbbf24', gradient: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', label: 'Grâce' },
      priere: { emoji: "🙏", icon: HandHeart, color: '#6366f1', gradient: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)', label: 'Prière' },
      ecriture: { emoji: "📖", icon: BookOpen, color: '#10b981', gradient: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', label: 'Écriture' },
      parole: { emoji: "🕊️", icon: MessageSquare, color: '#0ea5e9', gradient: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', label: 'Parole' },
      rencontre: { emoji: "🤝", icon: Users, color: '#f43f5e', gradient: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)', label: 'Rencontre' }
    }
    return configs[type] || { emoji: "✨", icon: Sparkles, color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)', label: 'Autre' }
  }

  const getSuggestions = () => {
    const suggestions = []
    const now = new Date()
    
    // Analyser les patterns
    const graceCount = filteredEntries.filter(e => e.type === 'grace').length
    const accomplishedParoles = filteredEntries.filter(e => e.type === 'parole' && e.date_accomplissement).length
    
    if (graceCount > 5) {
      suggestions.push({
        emoji: "✨",
        text: `${graceCount} grâces reçues sur cette période. Deo gratias !`,
        color: '#FCD34D'
      })
    }
    
    if (accomplishedParoles > 0) {
      suggestions.push({
        emoji: "🕊️",
        text: `${accomplishedParoles} parole${accomplishedParoles > 1 ? 's' : ''} accomplie${accomplishedParoles > 1 ? 's' : ''}. L'Esprit Saint est à l'œuvre.`,
        color: '#60A5FA'
      })
    }
    
    // Suggestions de suivi - Rappels doux
    const oldPrayers = entries.filter(e => 
      e.type === 'priere' && 
      differenceInDays(now, new Date(e.date)) > 90
    )
    
    if (oldPrayers.length > 0 && Math.random() < 0.3) { // 30% de chance d'afficher
      const prayer = oldPrayers[Math.floor(Math.random() * oldPrayers.length)]
      suggestions.push({
        emoji: "🙏",
        text: `${prayer.personne_prenom}, pour qui tu as prié, traverse peut-être ton esprit aujourd'hui...`,
        color: '#6366f1',
        action: 'Prendre des nouvelles'
      })
    }
    
    // Détecter les liens possibles
    const recentPrayers = filteredEntries.filter(e => e.type === 'priere' && new Date(e.date) > subMonths(now, 1))
    const recentGraces = filteredEntries.filter(e => e.type === 'grace' && new Date(e.date) > subMonths(now, 1))
    
    if (recentPrayers.length > 0 && recentGraces.length > 0) {
      suggestions.push({
        icon: LinkIcon,
        text: "Certaines prières récentes semblent avoir porté du fruit...",
        color: '#D6E5F5',
        action: 'Discerner les liens'
      })
    }
    
    // Pattern spirituel détecté
    const rencontresWithSimilarContext = entries.filter(e => e.type === 'rencontre').reduce((acc, r) => {
      acc[r.contexte] = (acc[r.contexte] || 0) + 1
      return acc
    }, {})
    
    const mostFrequentContext = Object.entries(rencontresWithSimilarContext)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (mostFrequentContext && mostFrequentContext[1] > 3) {
      suggestions.push({
        icon: Compass,
        text: `L'Esprit semble t'envoyer souvent ${mostFrequentContext[0] === 'rue' ? 'dans la rue' : mostFrequentContext[0]}...`,
        color: '#F87171'
      })
    }
    
    return suggestions
  }

  const findPossibleLinks = (entry: any) => {
    const links = []
    const entryDate = new Date(entry.date)
    
    // Chercher des liens potentiels
    entries.forEach(e => {
      if (e.id === entry.id) return
      
      const eDate = new Date(e.date)
      const daysDiff = Math.abs(differenceInDays(entryDate, eDate))
      
      // Prière exaucée par une grâce
      if (entry.type === 'priere' && e.type === 'grace' && daysDiff < 90 && eDate > entryDate) {
        // Vérifier si les sujets correspondent
        const prayerKeywords = entry.sujet?.toLowerCase().split(' ') || []
        const graceText = (e.texte || '').toLowerCase()
        const hasMatch = prayerKeywords.some(word => word.length > 3 && graceText.includes(word))
        
        if (hasMatch || daysDiff < 30) {
          links.push({
            entry: e,
            type: 'exauce',
            label: 'Cette prière semble avoir été exaucée dans...',
            strength: hasMatch ? 'fort' : 'possible',
            explanation: `Prière du ${format(entryDate, 'dd MMM', { locale: fr })} → Grâce du ${format(eDate, 'dd MMM', { locale: fr })} (${daysDiff} jours après)`
          })
        }
      }
      
      // Parole accomplie dans un événement
      if (entry.type === 'parole' && !entry.date_accomplissement && daysDiff < 180 && eDate > entryDate) {
        links.push({
          entry: e,
          type: 'accomplit',
          label: 'Cette parole pourrait s\'être accomplie dans...',
          strength: 'possible',
          explanation: `Parole reçue il y a ${daysDiff} jours`
        })
      }
      
      // Écriture qui éclaire une situation
      if (entry.type === 'ecriture' && daysDiff < 7) {
        links.push({
          entry: e,
          type: 'eclaire',
          label: 'Cette Parole de Dieu éclaire peut-être...',
          strength: 'possible',
          explanation: `Lecture et événement séparés de ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`
        })
      }
      
      // Grâce qui découle d'une prière
      if (entry.type === 'grace' && e.type === 'priere' && daysDiff < 90 && eDate < entryDate) {
        links.push({
          entry: e,
          type: 'decoule',
          label: 'Cette grâce pourrait être le fruit de...',
          strength: daysDiff < 30 ? 'fort' : 'possible',
          explanation: `${daysDiff} jours après la prière`
        })
      }
    })
    
    return links.sort((a, b) => {
      // Trier par force puis par date
      if (a.strength === 'fort' && b.strength !== 'fort') return -1
      if (a.strength !== 'fort' && b.strength === 'fort') return 1
      return 0
    })
  }

    const navigateToDetail = (entry: any) => {
    // Sauvegarder l'état actuel
    const currentState = {
      viewMode,
      selectedPeriod,
      selectedTypes,
      scrollPosition: window.scrollY
    };
    sessionStorage.setItem('relecture-state', JSON.stringify(currentState));
    
    // Naviguer vers le module approprié
    switch (entry.type) {
      case 'grace':
        router.push(`/graces/${entry.id}`);
        break;
      case 'priere':
        router.push(`/prieres/${entry.id}`);
        break;
      case 'ecriture':
        router.push(`/ecritures/${entry.id}`);
        break;
      case 'parole':
        router.push(`/paroles/${entry.id}`);
        break;
      case 'rencontre':
        router.push(`/rencontres/${entry.id}`);
        break;
    }
  }

  const handleLinkClick = (entry: any) => {
    if (linkMode) {
      if (!firstSelectedEntry) {
        setFirstSelectedEntry(entry)
      } else {
        // Créer le lien entre les deux entrées
        setSelectedEntryForLink(firstSelectedEntry)
        setPossibleLinks([{
          entry: entry,
          type: 'echo',
          label: 'Lien créé manuellement',
          strength: 'fort',
          explanation: 'Vous avez identifié un lien spirituel'
        }])
        setShowLinkModal(true)
        setLinkMode(false)
        setFirstSelectedEntry(null)
      }
    } else {
      setSelectedEntryForLink(entry)
      setShowLinkModal(true)
    }
  }

  const getFilteredLinks = () => {
    return spiritualLinks.filter(link => {
      // Filtre par type de lien
      if (gestionFilters.typeLien !== 'all' && link.type_lien !== gestionFilters.typeLien) {
        return false;
      }
      
      // Filtre par type de source
      if (gestionFilters.typeSource !== 'all') {
        const sourceEntry = entries.find(e => e.id === link.element_source_id);
        if (!sourceEntry || sourceEntry.type !== gestionFilters.typeSource) {
          return false;
        }
      }
      
      // Filtre par recherche
      if (gestionFilters.recherche) {
        const sourceEntry = entries.find(e => e.id === link.element_source_id);
        const cibleEntry = entries.find(e => e.id === link.element_cible_id);
        const searchLower = gestionFilters.recherche.toLowerCase();
        
        const sourceText = getEntryText(sourceEntry).toLowerCase();
        const cibleText = getEntryText(cibleEntry).toLowerCase();
        
        if (!sourceText.includes(searchLower) && !cibleText.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('liens_spirituels')
        .delete()
        .eq('id', linkId);
        
      if (error) throw error;
      
      // Recharger les liens
      const { data: links } = await supabase
        .from('liens_spirituels')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
        
      setSpiritualLinks(links || []);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du lien');
    }
  }


  const saveSpiritualLink = async (fromEntry: Entry, toEntry: Entry, linkType: string, label: string, notes?: string) => {
    try {
      // Vérifier si un lien existe déjà
      if (checkEntriesLinked(fromEntry.id, toEntry.id, spiritualLinks)) {
        const existingType = getLinkTypeBetween(fromEntry.id, toEntry.id, spiritualLinks);
        setLinkNotification({ 
          message: `Un lien "${existingType}" existe déjà entre ces éléments`, 
          type: 'warning' 
        });
        setTimeout(() => setLinkNotification(null), 5000);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('liens_spirituels')
        .insert({
          user_id: user.id,
          element_source_type: fromEntry.type,
          element_source_id: fromEntry.id,
          element_cible_type: toEntry.type,
          element_cible_id: toEntry.id,
          type_lien: linkType,
          description: `${label}${notes ? ' - ' + notes : ''}`
        })

      if (error) {
        console.error('Erreur lors de la sauvegarde du lien:', error)
        setLinkNotification({ message: 'Erreur lors de la sauvegarde du lien', type: 'error' });
        setTimeout(() => setLinkNotification(null), 5000)
      } else {
        setLinkNotification({ message: 'Lien spirituel créé avec succès !', type: 'success' });
        setTimeout(() => setLinkNotification(null), 3000)
        setShowLinkModal(false)
        loadAllEntries()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }
  const updateLinkType = async (linkId: string, newType: string) => {
    try {
      setUpdatingLink(linkId)
      
      const { error } = await supabase
        .from('liens_spirituels')
        .update({ type_lien: newType })
        .eq('id', linkId)
        
      if (error) throw error
      
      setSpiritualLinks(prev => 
        prev.map(link => 
          link.id === linkId ? { ...link, type_lien: newType } : link
        )
      )
      
      setLinkNotification({ 
        message: 'Type de lien modifié avec succès', 
        type: 'success' 
      })
      
      setTimeout(() => {
        setUpdatingLink(null)
      }, 1000)
      
    } catch (error: any) {
      console.error('Erreur:', error)
      setLinkNotification({ 
        message: 'Erreur lors de la modification', 
        type: 'error' 
      })
      setUpdatingLink(null)
    }
  }

  const getEntryText = (entry: any) => {
    // Version améliorée avec plus de contexte
    if (entry.type === 'ecriture' && entry.reference) {
      const preview = entry.texte_complet ? ': ' + entry.texte_complet.substring(0, 60) + '...' : '';
      return `📖 ${entry.reference}${preview}`;
    }
    if (entry.type === 'priere' && entry.personne_prenom) {
      const sujet = entry.sujet ? ' - ' + entry.sujet : '';
      return `🙏 Prière pour ${entry.personne_prenom}${sujet}`;
    }
    if (entry.type === 'parole') {
      let dest = 'Pour un inconnu';
      if (entry.destinataire === 'moi') dest = 'Pour moi';
      else if (entry.destinataire === 'personne' && entry.personne_destinataire) {
        dest = `Pour ${entry.personne_destinataire}`;
      }
      const preview = entry.texte ? ': ' + entry.texte.substring(0, 50) + '...' : '';
      return `🕊️ Parole ${dest}${preview}`;
    }
    if (entry.type === 'rencontre' && entry.personne_prenom) {
      const lieu = entry.lieu ? ' à ' + entry.lieu : '';
      return `🤝 Rencontre avec ${entry.personne_prenom}${lieu}`;
    }
    if (entry.type === 'grace' && entry.texte) {
      return `✨ Grâce: ${entry.texte.substring(0, 80)}...`;
    }
    
    // Par défaut
    return entry.texte || entry.description || entry.sujet || entry.reference || 
           (entry.type === 'priere' ? `Prière pour ${entry.personne_prenom}` : 'Entrée');
  }

  const areEntriesLinked = (entry1: any, entry2: any) => {
    return spiritualLinks.some(link => 
      (link.element_source_id === entry1.id && link.element_source_type === entry1.type &&
       link.element_cible_id === entry2.id && link.element_cible_type === entry2.type) ||
      (link.element_source_id === entry2.id && link.element_source_type === entry2.type &&
       link.element_cible_id === entry1.id && link.element_cible_type === entry1.type)
    )
  }

  // Obtenir tous les liens d'une entrée
  const getLinksForEntry = (entryId: string) => {
    return spiritualLinks.filter(link => 
      link.element_source_id === entryId || 
      link.element_cible_id === entryId
    );
  }

  // Vérifier si deux entrées sont directement liées
  const areDirectlyLinked = (entry1Id: string, entry2Id: string) => {
    return spiritualLinks.some(link => 
      (link.element_source_id === entry1Id && link.element_cible_id === entry2Id) ||
      (link.element_source_id === entry2Id && link.element_cible_id === entry1Id)
    );
  }

  // Obtenir le type de lien entre deux entrées
  const getLinkTypeBetween = (entry1Id: string, entry2Id: string) => {
    const link = spiritualLinks.find(l => 
      (l.element_source_id === entry1Id && l.element_cible_id === entry2Id) ||
      (l.element_source_id === entry2Id && l.element_cible_id === entry1Id)
    );
    return link?.type_lien || null;
  }




  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#E0F2FE',
        padding: '2rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Sparkles size={48} style={{ color: '#D6E5F5', margin: '0 auto 1rem', animation: 'pulse 2s ease-in-out infinite' }} />
          <p style={{ color: '#6b7280' }}>Préparation de votre relecture spirituelle...</p>
        </div>
      </div>
    )
  }

  const suggestions = getSuggestions()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#E0F2FE',
      paddingBottom: '4rem'
    }}>      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* En-tête avec fond bleu pastel */}
        <div style={{
          background: 'linear-gradient(135deg, #E0F2FE, #D6E5F5)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#4B6BAF',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}>
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#4B6BAF',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    background: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    marginRight: '1rem'
                  }}>
                    🌿
                  </div>
                  Relecture spirituelle
                </div>
              </h1>
              <p style={{ color: '#5B7BBF', opacity: 0.9, fontStyle: 'italic' }}>
                "Chercher et trouver Dieu en toutes choses"
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4B6BAF' }}>
                  {entries.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#5B7BBF' }}>
                  moments notés
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4B6BAF' }}>
                  {filteredEntries.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#5B7BBF' }}>
                  dans cette période
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Barre d'outils */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setLinkMode(!linkMode)
                setFirstSelectedEntry(null)
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: linkMode ? '#7BA7E1' : '#f3f4f6',
                color: linkMode ? 'white' : '#4b5563',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <LinkIcon size={16} />
              Mode Lien {linkMode && '(actif)'}
            </button>
            <button
            onClick={() => setViewMode('gestion')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: viewMode === 'gestion' ? '#7BA7E1' : 'transparent',
              color: viewMode === 'gestion' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 'fit-content'
            }}
          >
            <LinkIcon size={16} />
            Gestion des liens
          </button>
          
          <button
            onClick={() => setViewMode('atelier')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: viewMode === 'atelier' ? '#7BA7E1' : 'transparent',
              color: viewMode === 'atelier' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 'fit-content'
            }}
          >
            <LinkIcon size={16} />
            Tisser les liens
          </button>
          </div>
          {linkMode && (
            <p style={{ fontSize: '0.875rem', color: '#A3C4E8', fontStyle: 'italic' }}>
              {firstSelectedEntry 
                ? `Sélectionnez le second élément à relier avec "${getEntryText(firstSelectedEntry).substring(0, 30)}..."`
                : 'Cliquez sur un premier élément à relier'}
            </p>
          )}
        </div>

        {/* Modes de vue */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setViewMode('chronologique')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: viewMode === 'chronologique' ? '#7BA7E1' : 'transparent',
              color: viewMode === 'chronologique' ? 'white' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={16} />
            Vue chronologique
          </button>
          <button
            onClick={() => setViewMode('thematique')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: viewMode === 'thematique' ? '#7BA7E1' : 'transparent',
              color: viewMode === 'thematique' ? 'white' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <BookOpen size={16} />
            Vue thématique
          </button>
          <button
            onClick={() => setViewMode('consolations')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: viewMode === 'consolations' ? '#7BA7E1' : 'transparent',
              color: viewMode === 'consolations' ? 'white' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <span style={{fontSize: "16px"}}>❤️</span>
            Consolations & désolations
          </button>
          <button
            onClick={() => setViewMode('jardin')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: viewMode === 'jardin' ? '#7BA7E1' : 'transparent',
              color: viewMode === 'jardin' ? 'white' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Flower size={16} />
            Jardin des grâces
          </button>
          <button
            onClick={() => setViewMode('ensemble')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: viewMode === 'ensemble' ? '#7BA7E1' : 'transparent',
              color: viewMode === 'ensemble' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 'fit-content'
            }}
          >
            <Eye size={16} />
            Vue d'ensemble
          </button>
          
          
          
        </div>

        {/* Filtres élégants */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Filter size={20} style={{ color: '#6b7280' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Filtrer ma relecture</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>Période</label>
              <select 
                className="select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="1week">Cette semaine</option>
                <option value="1month">Ce mois</option>
                <option value="3months">3 derniers mois</option>
                <option value="6months">6 derniers mois</option>
                <option value="1year">Cette année</option>
                <option value="all">Tout voir</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>Types d'entrées</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedTypes(['all'])}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: selectedTypes.includes('all') ? '#7BA7E1' : '#e5e7eb',
                    color: selectedTypes.includes('all') ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Tout
                </button>
                {['grace', 'priere', 'ecriture', 'parole', 'rencontre'].map(type => {
                  const config = getTypeConfig(type)
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        if (selectedTypes.includes('all')) {
                          setSelectedTypes([type])
                        } else if (selectedTypes.includes(type)) {
                          setSelectedTypes(selectedTypes.filter(t => t !== type))
                        } else {
                          setSelectedTypes([...selectedTypes, type])
                        }
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        border: 'none',
                        background: selectedTypes.includes(type) || selectedTypes.includes('all') ? config.color : '#e5e7eb',
                        color: selectedTypes.includes(type) || selectedTypes.includes('all') ? 'white' : '#6b7280',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section "L'Esprit Saint est à l'œuvre" - Plus visible */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            marginBottom: '2rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            {/* En-tête coloré */}
            <div style={{
              background: 'linear-gradient(135deg, #A3C4E8, #D6E5F5)',
              padding: '1rem 1.5rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: 0
              }}>
                <span style={{fontSize: "20px"}}>🕊️</span>
                L'Esprit Saint est à l'œuvre
              </h3>
              <button
                onClick={() => setShowSuggestions(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  opacity: 0.8
                }}
              >
                ×
              </button>
            </div>
            
            {/* Contenu des suggestions */}
            <div style={{ padding: '1.5rem' }}>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem', 
                marginBottom: '1rem',
                fontStyle: 'italic'
              }}>
                L'Esprit souffle et révèle des connexions dans votre vie spirituelle...
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {suggestions.map((suggestion, index) => {
                  // Icon remplacé par emoji
                  return (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: '#f9fafb',
                        borderRadius: '0.75rem',
                        border: '1px solid #e5e7eb',
                        cursor: suggestion.action ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        ':hover': {
                          borderColor: suggestion.color,
                          transform: 'translateY(-1px)'
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = suggestion.color
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{
                        background: suggestion.color + '20',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        flexShrink: 0
                      }}>
                        <span style={{fontSize: "20px", color: suggestion.color}}>{suggestion.emoji || "✨"}</span>
                      </div>
                      <p style={{ color: '#1f2937', fontSize: '0.875rem', margin: 0, flex: 1 }}>
                        {suggestion.text}
                      </p>
                      {suggestion.action && (
                        <ChevronRight size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Timeline spirituelle - Vue chronologique */}
        {viewMode === 'chronologique' && (
          <div style={{ position: 'relative' }}>
            {/* Ligne centrale */}
            {filteredEntries.length > 0 && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'linear-gradient(to bottom, #e5e7eb, #A3C4E8, #e5e7eb)',
                transform: 'translateX(-50%)'
              }} />
            )}

            {/* Entrées */}
            {filteredEntries.map((entry, index) => {
              const config = getTypeConfig(entry.type)
              const Icon = config.icon
              const isExpanded = expandedEntry === entry.id
              const isLeft = index % 2 === 0
              const isSelected = firstSelectedEntry?.id === entry.id

              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    justifyContent: isLeft ? 'flex-end' : 'flex-start',
                    marginBottom: '2rem',
                    position: 'relative'
                  }}
                >
                  {/* Connecteur */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '2rem',
                    width: '20px',
                    height: '20px',
                    background: config.gradient,
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 0 4px white, 0 0 0 6px ' + config.color + '30',
                    zIndex: 1
                  }} />

                  {/* Carte */}
                  <div 
                    style={{
                      width: '45%',
                      background: 'white',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      boxShadow: isSelected ? `0 0 0 3px ${config.color}40` : '0 4px 6px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                      marginRight: isLeft ? '2.5rem' : '0',
                      marginLeft: isLeft ? '0' : '2.5rem'
                    }}
                    onClick={() => {
                      if (linkMode) {
                        handleLinkClick(entry)
                      } else {
                        setExpandedEntry(isExpanded ? null : entry.id)
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      <div style={{
                        background: config.gradient,
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        <span style={{fontSize: "20px"}}>{config.emoji}</span>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'start',
                          marginBottom: '0.5rem'
                        }}>
                          <h4 style={{ 
                            color: '#1f2937', 
                            fontWeight: '600',
                            fontSize: '1rem'
                          }}>
                            {config.label}
                          </h4>
                          <time style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280' 
                          }}>
                            {format(parseISO(entry.date), 'dd MMM', { locale: fr })}
                          </time>
                        </div>
                        
                        <p style={{ 
                          color: '#4b5563',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          marginBottom: isExpanded ? '1rem' : '0',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'none' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {getEntryText(entry)}
                        </p>
                        
                        {isExpanded && (
                          <div style={{
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: '1rem',
                            marginTop: '1rem'
                          }}>
                            {entry.lieu && (
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                📍 {entry.lieu}
                              </p>
                            )}
                            {entry.tags && entry.tags.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                {entry.tags.map((tag: string, i: number) => (
                                  <span 
                                    key={i}
                                    style={{
                                      background: config.color + '20',
                                      color: config.color,
                                      padding: '0.125rem 0.5rem',
                                      borderRadius: '9999px',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <Link
                                href={`/${entry.type}s/${entry.id}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  color: config.color,
                                  fontSize: '0.875rem',
                                  textDecoration: 'none'
                                }}
                              >
                                <Eye size={14} />
                                Voir le détail
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedEntryForLink(entry)
                                  setShowLinkModal(true)
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  color: '#D6E5F5',
                                  fontSize: '0.875rem',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  transition: 'background 0.2s'
                                }}
                              >
                                <LinkIcon size={14} />
                                Relier
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Vue thématique */}
        {viewMode === 'thematique' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {['grace', 'priere', 'ecriture', 'parole', 'rencontre'].map(type => {
              const config = getTypeConfig(type)
              const Icon = config.icon
              const typeEntries = filteredEntries.filter(e => e.type === type)
              
              if (typeEntries.length === 0) return null
              
              return (
                <div
                  key={type}
                  style={{
                    background: 'white',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    background: config.gradient,
                    padding: '1.5rem',
                    color: 'white'
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{fontSize: "24px"}}>{config.emoji}</span>
                      {config.label}s ({typeEntries.length})
                    </h3>
                  </div>
                  <div style={{ padding: '1rem', maxHeight: '400px', overflow: 'auto' }}>
                    {typeEntries.slice(0, 5).map(entry => {
                      const isSelected = firstSelectedEntry?.id === entry.id
                      return (
                        <div
                          key={entry.id}
                          style={{
                            padding: '0.75rem',
                            borderBottom: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isSelected ? config.color + '10' : 'transparent',
                            borderLeft: isSelected ? `4px solid ${config.color}` : '4px solid transparent'
                          }}
                          onClick={() => handleLinkClick(entry)}
                        >
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#4b5563',
                            marginBottom: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {getEntryText(entry)}
                          </p>
                          <time style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {format(parseISO(entry.date), 'dd MMM yyyy', { locale: fr })}
                          </time>
                        </div>
                      )
                    })}
                    {typeEntries.length > 5 && (
                      <p style={{
                        textAlign: 'center',
                        padding: '0.75rem',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                      }}>
                        Et {typeEntries.length - 5} autres...
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Vue Consolations & Désolations */}
        {viewMode === 'consolations' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Consolations */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{fontSize: "24px"}}>❤️</span>
                Consolations
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Moments où j'ai senti la présence de Dieu
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredEntries
                  .filter(e => e.type === 'grace' || (e.type === 'parole' && e.date_accomplissement))
                  .slice(0, 5)
                  .map(entry => {
                    const config = getTypeConfig(entry.type)
                    const Icon = config.icon
                    const isSelected = firstSelectedEntry?.id === entry.id
                    return (
                      <div
                        key={entry.id}
                        style={{
                          border: '2px solid',
                          borderColor: isSelected ? config.color : '#d1fae5',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isSelected ? config.color + '10' : 'white'
                        }}
                        onClick={() => handleLinkClick(entry)}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                          <span style={{fontSize: "16px",  color: config.color, marginTop: '2px' }}>{config.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                              {getEntryText(entry)}
                            </p>
                            <time style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              {format(parseISO(entry.date), 'dd MMM', { locale: fr })}
                            </time>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Désolations / Attentes */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#818CF8',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Cross size={24} />
                En attente
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Prières et paroles en cours
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredEntries
                  .filter(e => e.type === 'priere' || (e.type === 'parole' && !e.date_accomplissement))
                  .slice(0, 5)
                  .map(entry => {
                    const config = getTypeConfig(entry.type)
                    const Icon = config.icon
                    const isSelected = firstSelectedEntry?.id === entry.id
                    return (
                      <div
                        key={entry.id}
                        style={{
                          border: '2px solid',
                          borderColor: isSelected ? config.color : '#e0e7ff',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isSelected ? config.color + '10' : 'white'
                        }}
                        onClick={() => handleLinkClick(entry)}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                          <span style={{fontSize: "16px",  color: config.color, marginTop: '2px' }}>{config.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                              {getEntryText(entry)}
                            </p>
                            <time style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              {format(parseISO(entry.date), 'dd MMM', { locale: fr })}
                            </time>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Vue Jardin des grâces - Avec bulles animées */}
        {viewMode === 'jardin' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '2rem',
            perspective: '1000px'
          }}>
            {filteredEntries.map((entry, index) => {
              const config = getTypeConfig(entry.type)
              const Icon = config.icon
              const delay = index * 0.1
              const isSelected = firstSelectedEntry?.id === entry.id
              
              return (
                <div
                  key={entry.id}
                  style={{
                    background: 'white',
                    borderRadius: '50%',
                    width: '200px',
                    height: '200px',
                    padding: '2rem',
                    boxShadow: isSelected ? `0 0 0 4px ${config.color}` : '0 8px 16px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    transform: 'rotateY(0deg)',
                    transformStyle: 'preserve-3d',
                    animation: `float ${3 + Math.random() * 2}s ease-in-out ${delay}s infinite`,
                    position: 'relative'
                  }}
                  onClick={() => handleLinkClick(entry)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    width: '40px',
                    height: '40px',
                    background: config.gradient,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <span style={{fontSize: "20px"}}>{config.emoji}</span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginTop: '2rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {getEntryText(entry)}
                  </p>
                  <time style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginTop: 'auto'
                  }}>
                    {format(parseISO(entry.date), 'dd MMM', { locale: fr })}
                  </time>
                </div>
              )
            })}
          </div>
        )}

        {/* Vue Fleuve de vie - Améliorée */}
        {viewMode === 'fleuve' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #F3E8FF, #D6E5F5)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#A3C4E8', marginBottom: '0.5rem' }}>Le Fleuve de Vie</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Visualisez le cours de votre vie spirituelle, comme un fleuve qui s'écoule dans le temps.
                Chaque moment est une goutte d'eau qui rejoint le courant de la grâce divine.
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              minHeight: '500px',
              position: 'relative',
              overflow: 'auto'
            }}>
              {/* Fleuve ondulant */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0
                }}
                viewBox="0 0 1200 500"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="fleuveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D6E5F5" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 0 250 Q 300 ${200 + Math.sin(Date.now() / 1000) * 30} 600 250 T 1200 250`}
                  fill="none"
                  stroke="url(#fleuveGradient)"
                  strokeWidth="120"
                />
              </svg>
              
              {/* Entrées flottantes avec plus d'infos */}
              {filteredEntries.map((entry, index) => {
                const config = getTypeConfig(entry.type)
                const Icon = config.icon
                const position = (index / (filteredEntries.length - 1 || 1)) * 90 + 5
                const yOffset = Math.sin(index * 0.8) * 80
                const isSelected = firstSelectedEntry?.id === entry.id
                
                return (
                  <div
                    key={entry.id}
                    style={{
                      position: 'absolute',
                      left: `${position}%`,
                      top: `${50 + yOffset}%`,
                      transform: 'translate(-50%, -50%)',
                      background: 'white',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      boxShadow: isSelected ? `0 0 0 3px ${config.color}40` : '0 4px 6px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      zIndex: 1,
                      minWidth: '200px',
                      maxWidth: '250px'
                    }}
                    onClick={() => handleLinkClick(entry)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.05)'
                      e.currentTarget.style.zIndex = '10'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                      e.currentTarget.style.zIndex = '1'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        background: config.gradient,
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        <span style={{fontSize: "18px"}}>{config.emoji}</span>
                      </div>
                      <div>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: config.color,
                          margin: 0
                        }}>
                          {config.label}
                        </p>
                        <time style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {format(parseISO(entry.date), 'dd MMMM', { locale: fr })}
                        </time>
                      </div>
                    </div>
                    <p style={{
                      fontSize: '0.813rem',
                      color: '#4b5563',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4'
                    }}>
                      {getEntryText(entry)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Vue Constellation */}
        {viewMode === 'constellation' && (
          <ConstellationView 
            entries={filteredEntries}
            links={spiritualLinks}
            onEntryClick={handleLinkClick}
            getTypeConfig={getTypeConfig}
          />
        )}


        
        {/* Vue d'ensemble */}
        {viewMode === 'ensemble' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#7BA7E1', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Vue d'ensemble de votre parcours spirituel
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Visualisez tous vos éléments spirituels avec leurs connexions et suivis
              </p>
            </div>

            {filteredEntries && filteredEntries.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem'
              }}>
                {filteredEntries.map((entry, index) => {
                  const config = getTypeConfig(entry.type);
                  const relatedLinks = spiritualLinks.filter(
                    l => l.element_source_id === entry.id || l.element_cible_id === entry.id
                  );
                  
                  // Informations spécifiques selon le type
                  let statusBadge = null;
                  let extraDetails = [];
                  
                  // Pour les prières avec suivis
                  if (entry.type === 'priere' && entry.suivis_priere && entry.suivis_priere.length > 0) {
                    const lastSuivi = entry.suivis_priere[entry.suivis_priere.length - 1];
                    const evolutionColors = {
                      gueri: '#10b981',
                      guerison_partielle: '#10b981',
                      amelioration: '#3b82f6',
                      stable: '#f59e0b',
                      aggravation: '#ef4444',
                      paix: '#8b5cf6',
                      conversion: '#ec4899',
                      reconciliation: '#06b6d4',
                      reponse_claire: '#10b981',
                      signe_encourageant: '#3b82f6',
                      dans_mystere: '#6b7280',
                      en_cours: '#6366f1'
                    };
                    
                    statusBadge = (
                      <div style={{
                        background: evolutionColors[lastSuivi.evolution] || '#6366f1',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span style={{ fontSize: '0.625rem' }}>📋</span>
                        {entry.suivis_priere.length} suivi{entry.suivis_priere.length > 1 ? 's' : ''}
                      </div>
                    );
                  }
                  
                  // Pour les paroles accomplies
                  if (entry.type === 'parole' && entry.date_accomplissement) {
                    statusBadge = (
                      <div style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        ✓ Accomplie
                      </div>
                    );
                  }
                  
                  // Détails supplémentaires selon le type
                  if (entry.type === 'priere' && entry.type_priere) {
                    extraDetails.push({
                      icon: entry.type_priere === 'guerison' ? '🏥' : entry.type_priere === 'freres' ? '👥' : '🙏',
                      text: entry.type_priere === 'guerison' ? 'Guérison' : entry.type_priere === 'freres' ? 'Prière des frères' : 'Intercession'
                    });
                  }
                  
                  if (entry.type === 'ecriture' && entry.reference) {
                    extraDetails.push({
                      icon: '📖',
                      text: entry.reference
                    });
                  }
                  
                  if (entry.type === 'parole' && entry.destinataire) {
                    extraDetails.push({
                      icon: '📨',
                      text: entry.destinataire === 'moi' ? 'Pour moi' : entry.destinataire === 'personne' ? entry.personne_destinataire : 'Inconnu'
                    });
                  }
                  
                  return (
                    <div
                      key={entry.id}
                      style={{
                        background: 'white',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                        border: '2px solid transparent',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = config.color + '40';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                      onClick={() => handleLinkClick(entry)}
                    >
                      {/* Barre de couleur en haut */}
                      <div style={{
                        position: 'relative',
                        height: '4px',
                        background: config.gradient
                      }} />
                      
                      {/* Contenu principal */}
                      <div style={{ padding: '1.5rem' }}>
                        {/* Header avec emoji et type */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '1rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: config.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                              color: 'white',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                              {config.emoji}
                            </div>
                            <div>
                              <span style={{ 
                                color: config.color, 
                                fontSize: '0.875rem', 
                                fontWeight: '600',
                                display: 'block'
                              }}>
                                {config.label}
                              </span>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                color: '#9ca3af' 
                              }}>
                                {entry.date ? new Date(entry.date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                }) : new Date(entry.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {statusBadge}
                        </div>
                        
                        {/* Texte principal */}
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#4b5563',
                          marginBottom: '0.75rem',
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {getEntryText(entry)}
                        </p>
                        
                        {/* Infos supplémentaires */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginTop: '0.75rem'
                        }}>
                          {/* Personne liée */}
                          {(entry.type === 'priere' || entry.type === 'rencontre') && entry.personne_prenom && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem'
                            }}>
                              <span>👤</span>
                              <span>{entry.personne_prenom} {entry.personne_nom || ''}</span>
                            </div>
                          )}
                          
                          {/* Lieu */}
                          {entry.lieu && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem'
                            }}>
                              <span>📍</span>
                              <span>{entry.lieu}</span>
                            </div>
                          )}
                          
                          {/* Détails supplémentaires */}
                          {extraDetails.map((detail, i) => (
                            <div key={i} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem'
                            }}>
                              <span>{detail.icon}</span>
                              <span>{detail.text}</span>
                            </div>
                          ))}
                          
                          {/* Nombre de liens */}
                          {relatedLinks.length > 0 && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              color: '#7BA7E1',
                              background: '#E6EDFF',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontWeight: '500'
                            }}>
                              <span>🔗</span>
                              <span>{relatedLinks.length} lien{relatedLinks.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          
                          {/* Tags */}
                          {entry.tags && entry.tags.length > 0 && (
                            <>
                              {entry.tags.slice(0, 2).map((tag, i) => (
                                <div key={i} style={{
                                  fontSize: '0.75rem',
                                  color: config.color,
                                  background: config.color + '20',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.375rem'
                                }}>
                                  #{tag}
                                </div>
                              ))}
                              {entry.tags.length > 2 && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  background: '#f3f4f6',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.375rem'
                                }}>
                                  +{entry.tags.length - 2}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                          
                          {/* Boutons d'action */}
                          <div style={{
                            position: 'absolute',
                            bottom: '0.75rem',
                            right: '0.75rem',
                            display: 'flex',
                            gap: '0.25rem'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToDetail(entry);
                              }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                color: '#6b7280',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = config.color;
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = config.color;
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.color = '#6b7280';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              title="Voir les détails"
                            >
                              <Eye size={12} />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLinkClick(entry);
                              }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                color: '#6b7280',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#7BA7E1';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = '#7BA7E1';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.color = '#6b7280';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              title="Gérer les liens"
                            >
                              <LinkIcon size={12} />
                            </button>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem',
                color: '#6b7280'
              }}>
                <p>Aucun élément spirituel pour cette période.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Changez les filtres pour voir plus d'éléments.
                </p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'gestion' && (
          <div>
            {/* En-tête avec statistiques */}
            <div style={{
              background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ 
                color: '#7BA7E1', 
                marginBottom: '1rem', 
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <LinkIcon size={24} />
                Gestion des liens spirituels
              </h3>
              
              {/* Statistiques */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap',
                marginTop: '1rem'
              }}>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total</span>
                  <p style={{ color: '#7BA7E1', fontSize: '1.5rem', fontWeight: '600', margin: '0' }}>
                    {spiritualLinks.length} liens
                  </p>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Types</span>
                  <p style={{ color: '#7BA7E1', fontSize: '1.5rem', fontWeight: '600', margin: '0' }}>
                    {new Set(spiritualLinks.map(l => l.type_lien)).size} différents
                  </p>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Éléments connectés</span>
                  <p style={{ color: '#7BA7E1', fontSize: '1.5rem', fontWeight: '600', margin: '0' }}>
                    {new Set([
                      ...spiritualLinks.map(l => l.element_source_id),
                      ...spiritualLinks.map(l => l.element_cible_id)
                    ]).size}
                  </p>
                </div>
              </div>
            </div>

            {/* Barre de filtres */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <select
                value={gestionFilters.typeLien}
                onChange={(e) => setGestionFilters({...gestionFilters, typeLien: e.target.value})}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="all">Tous les types</option>
                <option value="exauce">🙏 Exauce</option>
                <option value="accomplit">✓ Accomplit</option>
                <option value="decoule">→ Découle</option>
                <option value="eclaire">💡 Éclaire</option>
                <option value="echo">🔄 Écho</option>
              </select>

              <select
                value={gestionFilters.typeSource}
                onChange={(e) => setGestionFilters({...gestionFilters, typeSource: e.target.value})}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="all">Toutes les sources</option>
                <option value="grace">✨ Grâces</option>
                <option value="priere">🙏 Prières</option>
                <option value="ecriture">📖 Écritures</option>
                <option value="parole">🕊️ Paroles</option>
                <option value="rencontre">🤝 Rencontres</option>
              </select>

              <input
                type="text"
                placeholder="Rechercher..."
                value={gestionFilters.recherche}
                onChange={(e) => setGestionFilters({...gestionFilters, recherche: e.target.value})}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  flex: 1,
                  minWidth: '200px'
                }}
              />
            </div>

            {/* Liste des liens */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {getFilteredLinks().length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#6b7280'
                }}>
                  <LinkIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Aucun lien spirituel trouvé</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Utilisez le "Mode Lien" pour créer des connexions entre vos éléments
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'grid',
                    gap: '1rem'
                  }}>
                    {getFilteredLinks().map((link) => {
                      const sourceEntry = entries.find(e => e.id === link.element_source_id);
                      const cibleEntry = entries.find(e => e.id === link.element_cible_id);
                      
                      if (!sourceEntry || !cibleEntry) return null;
                      
                      const sourceConfig = getTypeConfig(sourceEntry.type);
                      const cibleConfig = getTypeConfig(cibleEntry.type);
                      
                      return (
                        <div 
                          key={link.id}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                            ,
overflow: 'visible',
zIndex: link.id === openDropdown ? 100 : 1,
position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#7BA7E1';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(123, 167, 225, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Source */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.25rem'
                            }}>
                              <span>{sourceConfig.emoji}</span>
                              <span style={{ 
                                color: sourceConfig.color, 
                                fontWeight: '500',
                                fontSize: '0.875rem'
                              }}>
                                {sourceConfig.label}
                              </span>
                            </div>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '0.875rem',
                              color: '#1f2937',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {getEntryText(sourceEntry).substring(0, 50)}...
                            </p>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginTop: '0.25rem'
                            }}>
                              {format(new Date(sourceEntry.date || sourceEntry.created_at), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                          </div>

                          {/* Type de lien - Modifiable */}
                          <div onClick={() => {
  if (updatingLink !== link.id) {
    setOpenDropdown(openDropdown === link.id ? null : link.id);
  }
}} data-link-id={link.id} style={{
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: updatingLink === link.id 
                              ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)'
                              : '#f3f4f6',
                            borderRadius: '2rem',
                            padding: '0.25rem 0.5rem 0.25rem 1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                           border: '2px solid transparent',
zIndex: openDropdown === link.id ? 1001 : 1,
                            boxShadow: updatingLink === link.id 
                              ? '0 2px 8px rgba(16, 185, 129, 0.2)'
                              : 'none'
                          ,
overflow: 'visible' }}
                          onMouseEnter={(e) => {
                            if (updatingLink !== link.id) {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #E0E7FF, #D6E5F5)';
                              e.currentTarget.style.borderColor = '#7BA7E1';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(123, 167, 225, 0.15)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (updatingLink !== link.id) {
                              e.currentTarget.style.background = '#f3f4f6';
                              e.currentTarget.style.borderColor = 'transparent';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                          title="Cliquer pour modifier le type de lien"
                        >
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: updatingLink === link.id ? '#065f46' : '#4b5563',
                            marginRight: '0.5rem',
                            transition: 'color 0.2s'
                          }}>
                            {link.type_lien === 'exauce' && '🙏 exauce'}
                            {link.type_lien === 'accomplit' && '✓ accomplit'}
                            {link.type_lien === 'decoule' && '→ découle'}
                            {link.type_lien === 'eclaire' && '💡 éclaire'}
                            {link.type_lien === 'echo' && '🔄 écho'}
                          </span>
                          
                          <select
                            value={link.type_lien}
                            onChange={(e) => updateLinkType(link.id, e.target.value)}
                            disabled={updatingLink === link.id}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: updatingLink === link.id ? 'wait' : 'pointer',
zIndex: -1,
pointerEvents: 'none'
                            }}
                          >
                            <option value="exauce">🙏 exauce</option>
                            <option value="accomplit">✓ accomplit</option>
                            <option value="decoule">→ découle</option>
                            <option value="eclaire">💡 éclaire</option>
                            <option value="echo">🔄 écho</option>
                          </select>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            background: updatingLink === link.id 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : 'rgba(107, 114, 128, 0.1)',
                            borderRadius: '50%',
                            marginLeft: '0.25rem',
                            transition: 'all 0.2s'
                          }}>
                            {updatingLink === link.id ? (
                              // Icône de chargement
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                                style={{
                                  animation: 'spin 1s linear infinite'
                                }}
                              >
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path d="M9 12l2 2 4-4" style={{ opacity: 0.3 }} />
                              </svg>
                            ) : (
                             
                              // Icône flèche
<svg
  width="12"
  height="12"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#6b7280"
  strokeWidth="2"
  style={{
    transform: openDropdown === link.id ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s'
  }}
>
  <path d="M6 9l6 6 6-6" />
</svg>
                            )}
                          </div>
                          {/* Dropdown personnalisé */}
{openDropdown === link.id && (
  <div style={{
  position: 'absolute',
top: 'calc(100% + 0.5rem)',
left: '50%',
transform: 'translateX(-50%)',
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    minWidth: '160px',
    zIndex: 2000,
    overflow: 'hidden'
  }}>
    {['exauce', 'accomplit', 'decoule', 'eclaire', 'echo'].map((type) => (
      <div
        key={type}
        onClick={(e) => {
          e.stopPropagation();
          updateLinkType(link.id, type);
          setOpenDropdown(null);
        }}
        style={{
          padding: '0.75rem 1rem',
          fontSize: '0.75rem',
          fontWeight: '500',
          color: link.type_lien === type ? '#7BA7E1' : '#4b5563',
          background: link.type_lien === type ? '#F0F4FF' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
        onMouseEnter={(e) => {
          if (link.type_lien !== type) {
            e.currentTarget.style.background = '#f9fafb';
          }
        }}
        onMouseLeave={(e) => {
          if (link.type_lien !== type) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {type === 'exauce' && '🙏 exauce'}
        {type === 'accomplit' && '✓ accomplit'}
        {type === 'decoule' && '→ découle'}
        {type === 'eclaire' && '💡 éclaire'}
        {type === 'echo' && '🔄 écho'}
      </div>
    ))}
  </div>
)}
                        </div>

                          {/* Cible */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.25rem'
                            }}>
                              <span>{cibleConfig.emoji}</span>
                              <span style={{ 
                                color: cibleConfig.color, 
                                fontWeight: '500',
                                fontSize: '0.875rem'
                              }}>
                                {cibleConfig.label}
                              </span>
                            </div>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '0.875rem',
                              color: '#1f2937',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {getEntryText(cibleEntry).substring(0, 50)}...
                            </p>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginTop: '0.25rem'
                            }}>
                              {format(new Date(cibleEntry.date || cibleEntry.created_at), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToDetail(sourceEntry);
                              }}
                              title="Voir la source"
                              style={{
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#7BA7E1';
                                e.currentTarget.style.background = '#f0f9ff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = 'white';
                              }}
                            >
                              <Eye size={16} color="#6b7280" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Supprimer ce lien spirituel ?')) {
                                  deleteLink(link.id);
                                }
                              }}
                              title="Supprimer le lien"
                              style={{
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ef4444';
                                e.currentTarget.style.background = '#fef2f2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = 'white';
                              }}
                            >
                              <Trash2 size={16} color="#6b7280" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Message d'encouragement si vide */}
        {filteredEntries.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <Sparkles size={48} style={{ 
              margin: '0 auto 1rem', 
              color: '#D6E5F5',
              opacity: 0.5
            }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>
              Aucune entrée pour cette période
            </h3>
            <p style={{ color: '#6b7280' }}>
              Ajustez vos filtres ou commencez à noter les merveilles de Dieu !
            </p>
          </div>
        )}


        {viewMode === 'atelier' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                color: '#7BA7E1', 
                fontSize: '1.5rem',
                marginBottom: '0.5rem'
              }}>
                🔗 Tisser les liens spirituels
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                L'Esprit révèle les connexions dans votre vie
              </p>
            </div>
            
            {/* Container principal avec 3 colonnes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px 1fr',
              gap: '1rem',
              minHeight: '500px'
            }}>
              {/* Colonne Sources */}
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h4 style={{ 
                  color: '#4b5563', 
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  Sources ({entries.filter(e => atelierSourceFilter === 'all' || e.type === atelierSourceFilter).length})
                </h4>
                
                <select
                  value={atelierSourceFilter}
                  onChange={(e) => setAtelierSourceFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="all">Tous les types</option>
                  <option value="grace">✨ Grâces</option>
                  <option value="priere">🙏 Prières</option>
                  <option value="ecriture">📖 Écritures</option>
                  <option value="parole">🕊️ Paroles</option>
                  <option value="rencontre">🤝 Rencontres</option>
                </select>

                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  paddingRight: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {entries
                    .filter(e => atelierSourceFilter === 'all' || e.type === atelierSourceFilter)
                    .map(entry => {
                      const config = getTypeConfig(entry.type);
                      const isSelected = selectedSource?.id === entry.id;
                      
                      return (
                        <div
                          key={entry.id}
                          onClick={() => setSelectedSource(entry)}
                          style={{
                            padding: '0.875rem',
                            borderRadius: '0.5rem',
                            border: isSelected ? `2px solid ${config.color}` : '1px solid #e5e7eb',
                            background: isSelected ? config.color + '10' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            zIndex: 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = config.color;
                              e.currentTarget.style.zIndex = '10';
                              e.currentTarget.style.transform = 'translateX(2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.zIndex = '1';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{config.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ 
                                fontSize: '0.875rem', 
                                color: '#1f2937',
                                marginBottom: '0.25rem'
                              }}>
                                {getEntryText(entry).substring(0, 80)}...
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {format(new Date(entry.date || entry.created_at), 'dd/MM/yyyy', { locale: fr })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Zone centrale */}
              <div style={{
                background: 'linear-gradient(to bottom, #F0F9FF, white)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '2px dashed #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                {selectedSource ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    width: '100%',
                    position: 'relative'
                  }}>
                    <button
                      onClick={() => setSelectedSource(null)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: '1.25rem'
                      }}
                    >
                      ×
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>{getTypeConfig(selectedSource.type).emoji}</span>
                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                        {getEntryText(selectedSource).substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <LinkIcon size={48} style={{ color: '#e5e7eb', marginBottom: '1rem' }} />
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Sélectionnez une source
                    </p>
                  </div>
                )}

                <p style={{ color: '#9ca3af', fontSize: '1.5rem' }}>↓</p>

                <select
                  value={selectedLinkType}
                  onChange={(e) => setSelectedLinkType(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                    background: 'white',
                    minWidth: '200px'
                  }}
                >
                  <option value="exauce">🙏 Exauce</option>
                  <option value="accomplit">✓ Accomplit</option>
                  <option value="decoule">→ Découle de</option>
                  <option value="eclaire">💡 Éclaire</option>
                  <option value="echo">🔄 Fait écho à</option>
                </select>

                <p style={{ color: '#9ca3af', fontSize: '1.5rem' }}>↓</p>

                {selectedDest ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    width: '100%',
                    position: 'relative'
                  }}>
                    <button
                      onClick={() => setSelectedDest(null)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: '1.25rem'
                      }}
                    >
                      ×
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>{getTypeConfig(selectedDest.type).emoji}</span>
                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                        {getEntryText(selectedDest).substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Sélectionnez une destination
                    </p>
                  </div>
                )}

                {selectedSource && selectedDest && (
                  <button
                    onClick={() => {
                      
                      // Vérifier si un lien existe déjà
                      if (checkEntriesLinked(selectedSource.id, selectedDest.id, spiritualLinks)) {
                        const existingType = getLinkTypeBetween(selectedSource.id, selectedDest.id, spiritualLinks);
                        setLinkNotification({ 
                          message: `Un lien "${existingType}" existe déjà entre ces éléments`, 
                          type: 'warning' 
                        });
                        setTimeout(() => setLinkNotification(null), 5000);
                        return;
                      }
                      saveSpiritualLink(selectedSource, selectedDest, selectedLinkType, 
                        `${getTypeConfig(selectedSource.type).label} ${selectedLinkType} ${getTypeConfig(selectedDest.type).label}`
                      );
                      setSelectedSource(null);
                      setSelectedDest(null);
                    }}
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 2rem',
                      background: 'linear-gradient(135deg, #7BA7E1, #5B8BC6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            zIndex: 1
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(123, 167, 225, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Créer le lien spirituel
                  </button>
                )}
              </div>

              {/* Colonne Destinations */}
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h4 style={{ 
                  color: '#4b5563', 
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  Destinations ({entries.filter(e => atelierDestFilter === 'all' || e.type === atelierDestFilter).length})
                </h4>
                
                <select
                  value={atelierDestFilter}
                  onChange={(e) => setAtelierDestFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="all">Tous les types</option>
                  <option value="grace">✨ Grâces</option>
                  <option value="priere">🙏 Prières</option>
                  <option value="ecriture">📖 Écritures</option>
                  <option value="parole">🕊️ Paroles</option>
                  <option value="rencontre">🤝 Rencontres</option>
                </select>

                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  paddingRight: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {entries
                    .filter(e => atelierDestFilter === 'all' || e.type === atelierDestFilter)
                    .map(entry => {
                      const config = getTypeConfig(entry.type);
                      const isSelected = selectedDest?.id === entry.id;
                      
                      return (
                        <div
                          key={entry.id}
                          onClick={() => {
                            setSelectedDest(entry);
                            // Vérifier si un lien existe déjà
                            if (selectedSource && checkEntriesLinked(selectedSource.id, entry.id, spiritualLinks)) {
                              const existingType = getLinkTypeBetween(selectedSource.id, entry.id, spiritualLinks);
                              setLinkNotification({ 
                                message: `Un lien "${existingType}" existe déjà entre ces éléments`, 
                                type: 'warning' 
                              });
                              setTimeout(() => setLinkNotification(null), 5000);
                            }
                          }}
                          style={{
                            padding: '0.875rem',
                            borderRadius: '0.5rem',
                            border: isSelected ? `2px solid ${config.color}` : '1px solid #e5e7eb',
                            background: isSelected ? config.color + '10' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            zIndex: 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = config.color;
                              e.currentTarget.style.zIndex = '10';
                              e.currentTarget.style.transform = 'translateX(2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.zIndex = '1';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{config.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ 
                                fontSize: '0.875rem', 
                                color: '#1f2937',
                                marginBottom: '0.25rem'
                              }}>
                                {getEntryText(entry).substring(0, 80)}...
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {format(new Date(entry.date || entry.created_at), 'dd/MM/yyyy', { locale: fr })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            {/* Zone des liens récents */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
              borderRadius: '1rem',
              border: '1px solid #BAE6FD'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2345',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📌 Liens récents
                <span style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  fontWeight: 'normal'
                }}>
                  (5 derniers créés)
                </span>
              </h3>
              
              {spiritualLinks.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {spiritualLinks.slice(-5).reverse().map((link, index) => {
                    const sourceEntry = entries.find(e => e.id === link.element_source_id);
                    const targetEntry = entries.find(e => e.id === link.element_cible_id);
                    
                    if (!sourceEntry || !targetEntry) return null;
                    
                    return (
                      <div
                        key={link.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: 'white',
                          borderRadius: '0.5rem',
                          fontSize: '0.9rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>
                          {sourceEntry.type === 'grace' && '✨'}
                          {sourceEntry.type === 'priere' && '🙏'}
                          {sourceEntry.type === 'ecriture' && '📖'}
                          {sourceEntry.type === 'parole' && '🕊️'}
                          {sourceEntry.type === 'rencontre' && '🤝'}
                        </span>
                        
                        <span style={{ 
                          flex: 1,
                          color: '#4b5563',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {getEntryText(sourceEntry).substring(0, 50)}...
                        </span>
                        
                        <span style={{
                          background: '#7BA7E1',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          whiteSpace: 'nowrap'
                        }}>
                          {link.type_lien === 'exauce' && '🙏 exauce'}
                          {link.type_lien === 'accomplit' && '✓ accomplit'}
                          {link.type_lien === 'decoule' && '→ découle'}
                          {link.type_lien === 'eclaire' && '💡 éclaire'}
                          {link.type_lien === 'echo' && '🔄 écho'}
                        </span>
                        
                        <span style={{ fontSize: '1.2rem' }}>
                          {targetEntry.type === 'grace' && '✨'}
                          {targetEntry.type === 'priere' && '🙏'}
                          {targetEntry.type === 'ecriture' && '📖'}
                          {targetEntry.type === 'parole' && '🕊️'}
                          {targetEntry.type === 'rencontre' && '🤝'}
                        </span>
                        
                        <span style={{ 
                          flex: 1,
                          color: '#4b5563',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {getEntryText(targetEntry).substring(0, 50)}...
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  padding: '2rem'
                }}>
                  Aucun lien créé pour le moment. Commencez à tisser les connexions spirituelles !
                </p>
              )}
            </div>
          </div>
        )}

        {/* Modal de liens spirituels amélioré */}
        {/* Notification globale flottante */}
        {linkNotification && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: linkNotification.type === 'success' ? '#10b981' : 
                       linkNotification.type === 'error' ? '#ef4444' : '#f59e0b',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            animation: 'slideDown 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>
              {linkNotification.type === 'success' ? '✅' : 
               linkNotification.type === 'error' ? '❌' : '⚠️'}
            </span>
            {linkNotification.message}
          </div>
        )}

        {showLinkModal && selectedEntryForLink && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Créer des liens spirituels
              </h3>
              
              {/* Élément sélectionné */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Élément de départ :
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {(() => {
                    const config = getTypeConfig(selectedEntryForLink.type)
                    const Icon = config.icon
                    return (
                      <>
                        <span style={{fontSize: "16px",  color: config.color }}>{config.emoji}</span>
                        <span style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                          {getEntryText(selectedEntryForLink)}
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>
              
              {/* Onglets */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <button
                  onClick={() => setPossibleLinks(findPossibleLinks(selectedEntryForLink))}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: '2px solid #A3C4E8',
                    color: '#A3C4E8',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Suggestions automatiques
                </button>
                <button
                  onClick={() => setPossibleLinks(entries.filter(e => e.id !== selectedEntryForLink.id).map(e => ({
                    entry: e,
                    type: 'echo',
                    label: 'Créer un lien manuel',
                    strength: 'manuel',
                    explanation: ''
                  })))}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: '2px solid transparent',
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  Tous les éléments
                </button>
              </div>
              
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                L'Esprit Saint tisse des liens entre les événements de votre vie. Sélectionnez un élément à relier :
              </p>
              
              {possibleLinks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflow: 'auto' }}>
                  {possibleLinks.map((link, index) => {
                    const config = getTypeConfig(link.entry.type)
                    const Icon = config.icon
                    
                    return (
                      <div
                        key={index}
                        style={{
                          border: '2px solid',
                          borderColor: link.strength === 'fort' ? config.color : '#e5e7eb',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            zIndex: 1,
                          background: link.strength === 'fort' ? config.color + '10' : 'white'
                        }}
                        onClick={() => {
                          // Ici on pourrait sauvegarder le lien dans la base de données
                          saveSpiritualLink(selectedEntryForLink, link.entry, link.type, link.label, link.explanation)
                          setShowLinkModal(false)
                        }}
                      >
                        {link.label && (
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#A3C4E8',
                            marginBottom: '0.5rem',
                            fontStyle: 'italic'
                          }}>
                            {link.label}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{fontSize: "16px",  color: config.color }}>{config.emoji}</span>
                          <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                            {getEntryText(link.entry)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <time style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {format(parseISO(link.entry.date), 'dd MMMM yyyy', { locale: fr })}
                          </time>
                          {link.explanation && (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {link.explanation}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                  Aucun lien évident pour le moment. Laissez le temps à l'Esprit Saint de révéler les connexions...
                </p>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => {
                    setShowLinkModal(false)
                    setPossibleLinks([])
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e5e7eb',
                    background: 'white',
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Citation finale - Psaume uniquement */}
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          <p style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>
            "Souviens-toi des merveilles qu'il a faites."
          </p>
          <p style={{ fontSize: '0.875rem' }}>Psaume 105, 5</p>
        </div>
      </div>

      {/* Animation float pour le jardin */}
      
      <style jsx global>{`

        @keyframes slideDown {
          0% { opacity: 0; transform: translateX(-50%) translateY(-100%); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
                @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.5); }
          50% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.8), 0 0 30px rgba(168, 85, 247, 0.6); }
          100% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.5); }
        }
        
        .linked-card {
          animation: glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
