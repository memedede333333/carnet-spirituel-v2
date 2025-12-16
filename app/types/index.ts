// Types de base pour l'application

export type Visibilite = 'prive' | 'anonyme' | 'public';
export type StatutPartage = 'brouillon' | 'propose' | 'approuve' | 'refuse';

// Type utilisateur
export interface Utilisateur {
  id: string;
  email: string;
  prenom: string;
  nom?: string;
  role: 'user' | 'superadmin';
  createdAt: Date;
}

// Type de base pour tous les éléments spirituels
export interface ElementSpirituel {
  id: string;
  userId: string;
  dateCreation: Date;
  dateModification: Date;
  visibilite: Visibilite;
  statutPartage?: StatutPartage;
  tags?: string[];
}

// Grâce reçue
export interface Grace extends ElementSpirituel {
  texte: string;
  date: Date;
  lieu?: string;
  personnesPresentes?: string[];
  fruits?: string;
}

// Prière (guérison ou des frères)
export interface Priere extends ElementSpirituel {
  type: 'guerison' | 'freres' | 'intercession';
  personne: {
    prenom: string;
    nom?: string;
  };
  date: Date;
  sujet: string;
  sujetDetail?: string;
  nombreFois: number;
  notes?: string;
  suivis?: SuiviPriere[];
}

// Suivi de prière
export interface SuiviPriere {
  id: string;
  date: Date;
  notes: string;
  evolution?: 'amelioration' | 'stable' | 'aggravation' | 'gueri';
  nouvellePriere?: boolean;
}

// Parole de connaissance
export interface ParoleConnaissance extends ElementSpirituel {
  texte: string;
  date: Date;
  contexte: 'personnelle' | 'veillee' | 'mission' | 'priere' | 'autre';
  contexteDetail?: string;
  destinataire: 'moi' | 'inconnu' | 'personne';
  personneDestinataire?: string;
  fruitConstate?: string;
  dateAccomplissement?: Date;
}

// Texte biblique / Parole de l'Écriture
export interface ParoleEcriture extends ElementSpirituel {
  reference: string;
  texteComplet: string;
  traduction: string;
  contexte: 'messe' | 'lectio' | 'retraite' | 'groupe' | 'personnel';
  dateReception: Date;
  ceQuiMaTouche: string;
  pour: string;
  fruits?: string[];
}

// Rencontre missionnaire
export interface RencontreMissionnaire extends ElementSpirituel {
  personne: {
    prenom: string;
    nom?: string;
  };
  date: Date;
  lieu: string;
  contexte: string;
  description: string;
  fruitImmediat?: string;
  fruitEspere?: string;
  suivis?: SuiviRencontre[];
}

// Suivi de rencontre
export interface SuiviRencontre {
  id: string;
  date: Date;
  notes: string;
  fruits?: string;
}

// Lien entre éléments
export interface LienSpirituel {
  id: string;
  elementSourceId: string;
  elementSourceType: string;
  elementCibleId: string;
  elementCibleType: string;
  typeLien: 'decoule' | 'accomplit' | 'exauce' | 'echo' | 'eclaire';
  description?: string;
  dateCreation: Date;
}

// Fioretti (Jardin des partages)
export interface Fioretto {
  id: string;
  user_id: string;
  element_type: 'grace' | 'priere' | 'ecriture' | 'parole' | 'rencontre';
  element_id: string;
  contenu_affiche: any; // JSONB
  message_ajout?: string;
  anonyme: boolean;
  pseudo?: string;
  moderateur_id?: string;
  date_publication?: Date;
  statut: 'propose' | 'approuve' | 'refuse';
  created_at: Date;
  // Relations (pour l'affichage)
  interactions?: FiorettoInteraction[];
  _count?: {
    soutien: number;
    action_grace: number;
  };
}

export interface FiorettoInteraction {
  id: string;
  fioretto_id: string;
  user_id: string;
  type_interaction: 'soutien' | 'action_grace';
  created_at: Date;
}