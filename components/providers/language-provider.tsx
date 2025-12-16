"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'it' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  it: {
    // Common
    'common.welcome': 'Benvenuto',
    'common.login': 'Accedi',
    'common.register': 'Registrati',
    'common.logout': 'Esci',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.name': 'Nome',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
    'common.search': 'Cerca',
    'common.loading': 'Caricamento...',
    'common.settings': 'Impostazioni',
    
    // Login
    'login.identifierPlaceholder': 'nome@esempio.com o nickname',
    'login.passwordPlaceholder': '••••••••',
    
    // Landing
    'landing.hero.title': 'La Piattaforma per la Cultura Artistica',
    'landing.hero.subtitle': 'Connetti artisti, recruiter e appassionati in un unico spazio creativo',
    'landing.hero.cta': 'Inizia ora',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.feed': 'Feed',
    'dashboard.map': 'Mappa',
    'dashboard.profile': 'Profilo',
    'dashboard.events': 'Eventi',
    'dashboard.messages': 'Messaggi',
    'dashboard.portfolio': 'Portfolio',
    'dashboard.quests': 'Missioni',
    'dashboard.minigames': 'Minigames',
    
    // Events
    'events.title': 'Eventi',
    'events.create': 'Crea Evento',
    'events.upcoming': 'Prossimi',
    'events.active': 'In Corso',
    'events.completed': 'Completati',
    'events.saved': 'Salvati',
    
    // Profile
    'profile.level': 'Livello',
    'profile.reputation': 'Reputazione',
    'profile.experience': 'Esperienza',
    'profile.followers': 'Seguaci',
    'profile.following': 'Seguiti',
    
    // Settings
    'settings.title': 'Impostazioni',
    'settings.description': 'Gestisci le tue preferenze e configurazioni',
    'settings.profile.title': 'Informazioni Profilo',
    'settings.profile.description': 'Modifica le tue informazioni personali e anagrafiche',
    'settings.profile.name': 'Nome Completo',
    'settings.profile.username': 'Username',
    'settings.profile.email': 'Email',
    'settings.profile.emailNote': 'L\'email non può essere modificata',
    'settings.profile.bio': 'Bio',
    'settings.profile.bioPlaceholder': 'Racconta qualcosa di te...',
    'settings.profile.location': 'Posizione',
    'settings.profile.locationPlaceholder': 'La tua città o paese',
    'settings.profile.website': 'Sito Web / Link',
    'settings.profile.websitePlaceholder': 'https://...',
    'settings.profile.websiteNote': 'Link al tuo sito web, portfolio o social',
    'settings.profile.uploadImage': 'Carica Immagine',
    'settings.profile.save': 'Salva Modifiche',
    'settings.profile.saving': 'Salvataggio...',
    'settings.profile.imageTypes': 'JPG, PNG o GIF. Max 5MB',
    'settings.appearance.title': 'Aspetto',
    'settings.appearance.description': 'Personalizza l\'aspetto dell\'applicazione',
    'settings.appearance.theme': 'Tema',
    'settings.appearance.themeDesc': 'Cambia tra tema chiaro e scuro',
    'settings.appearance.language': 'Lingua',
    'settings.appearance.languageDesc': 'Seleziona la lingua dell\'interfaccia',
    'settings.notifications.title': 'Notifiche',
    'settings.notifications.description': 'Gestisci le tue preferenze di notifica',
    'settings.notifications.email': 'Notifiche Email',
    'settings.notifications.emailDesc': 'Ricevi notifiche via email',
    'settings.notifications.push': 'Notifiche Push',
    'settings.notifications.pushDesc': 'Ricevi notifiche push nel browser',
    'settings.account.title': 'Account',
    'settings.account.description': 'Gestisci le informazioni del tuo account',
    'settings.account.changePassword': 'Cambia Password',
    'settings.account.deleteAccount': 'Elimina Account',
    'settings.roles.title': 'Gestione Ruoli',
    'settings.roles.description': 'Aggiungi o rimuovi ruoli dal tuo account',
    'settings.roles.artist': 'Artista',
    'settings.roles.recruiter': 'Recruiter',
    'settings.roles.addArtist': '+ Aggiungi Artista',
    'settings.roles.addRecruiter': '+ Aggiungi Recruiter',
    'settings.roles.active': 'Ruoli attivi',
    
    // Profile
    'profile.edit': 'Modifica Profilo',
    'profile.follow': 'Segui',
    'profile.unfollow': 'Non seguire più',
    'profile.stats': 'Statistiche',
    'profile.portfolio': 'Portfolio',
    'profile.portfolio.empty': 'Il portfolio è vuoto',
    'profile.portfolio.addFirst': 'Aggiungi la tua prima opera',
    'profile.portfolio.add': 'Aggiungi Opera',
    'profile.events.title': 'I Miei Eventi',
    'profile.events.description': 'Gestisci i tuoi eventi e partecipazioni',
    'profile.events.create': 'Crea Evento',
    'profile.events.completed': 'Completati',
    'profile.events.ongoing': 'In Corso',
    'profile.events.saved': 'Salvati',
    'profile.events.created': 'Creati',
    'profile.avatar.title': 'Personalizza Avatar',
    'profile.avatar.description': 'Personalizza il tuo avatar 3D con outfit e accessori',
    'profile.avatar.open': 'Apri Fitting Room',
    
    // Portfolio
    'portfolio.title': 'Portfolio',
    'portfolio.description': 'Mostra la tua arte al mondo',
    'portfolio.add': 'Aggiungi Opera',
    'portfolio.empty': 'Il tuo portfolio è vuoto',
    'portfolio.loading': 'Caricamento portfolio...',
    'portfolio.onlyArtists': 'Questa sezione è disponibile solo per gli artisti',
    
    // Events
    'events.loading': 'Caricamento eventi...',
    'events.noCompleted': 'Nessun evento completato',
    'events.noOngoing': 'Nessun evento in corso',
    'events.noSaved': 'Nessun evento salvato',
    'events.noCreated': 'Nessun evento creato',
    'events.participants': 'partecipanti',
    
    // Common placeholders
    'placeholder.search': 'Cerca utenti, post, eventi...',
    'placeholder.comment': 'Scrivi un commento...',
    'placeholder.post': 'Cosa vuoi condividere?',
    'placeholder.searchMap': 'Cerca artista, città, opportunità...',
    'placeholder.title': 'Titolo',
    'placeholder.description': 'Descrizione',
    'placeholder.city': 'Città',
    'placeholder.location': 'Luogo o indirizzo',
    'placeholder.latitude': 'Latitudine',
    'placeholder.longitude': 'Longitudine',
    
    // Toast messages
    'toast.success': 'Successo',
    'toast.error': 'Errore',
    'toast.emailVerified': 'Email verificata',
    'toast.emailVerifiedDesc': 'Ora puoi accedere al tuo account',
    'toast.verifyError': 'Errore verifica',
    'toast.invalidToken': 'Token di verifica non valido',
    'toast.expiredToken': 'Token di verifica scaduto',
    'toast.verifyGenericError': 'Errore durante la verifica',
    'toast.eventCreated': 'Evento creato con successo',
    'toast.eventCreateError': 'Errore nella creazione dell\'evento',
    'toast.markerCreated': 'Marker creato con successo',
    'toast.markerCreateError': 'Errore nella creazione del marker',
    'toast.profileUpdated': 'Profilo aggiornato con successo',
    'toast.profileUpdateError': 'Errore nell\'aggiornamento del profilo',
    'toast.roleAdded': 'Ruolo aggiunto',
    'toast.roleAddedDesc': 'Ruolo aggiunto con successo',
    'toast.loading': 'Caricamento...',
    'toast.imageUploaded': 'Immagine caricata',
    'toast.imageUploadSuccess': 'L\'immagine è stata caricata con successo',
    'toast.imageUploadError': 'Errore nel caricamento dell\'immagine',
    'toast.imageTypeError': 'Il file deve essere un\'immagine',
    'toast.imageSizeError': 'L\'immagine non deve superare 5MB',
    'toast.roleAddError': 'Errore nell\'aggiunta del ruolo',
    'toast.loginSuccess': 'Login riuscito',
    'toast.loginError': 'Errore login',
    'toast.genericError': 'Errore generale',
    'toast.validationError': 'Errore validazione',
    'toast.serverError': 'Errore server',
    'toast.registrationAttempt': 'Tentativo di registrazione',
    'toast.registrationSuccess': 'Registrazione completata',
    'toast.registrationError': 'Errore nella registrazione',
    'toast.purchaseSuccess': 'Acquisto completato',
    'toast.purchaseError': 'Errore acquisto',
    'toast.avatarSaved': 'Avatar salvato',
    'toast.avatarError': 'Errore nel salvataggio dell\'avatar',
    'toast.quizCompleted': 'Quiz completato!',
    'toast.loginRedirect': 'Reindirizzamento alla dashboard...',
    'toast.invalidCredentials': 'Email o password non corretti, oppure email non verificata',
    'toast.registrationSending': 'Invio dei dati al server...',
    'toast.checkEmail': 'Controlla la tua email per confermare l\'account',
    'toast.passwordMismatch': 'Le password non corrispondono',
    'toast.passwordTooShort': 'La password deve essere di almeno 8 caratteri',
    'toast.validationOk': 'Validazione OK',
    'toast.formValid': 'Form valido, invio richiesta...',
    'toast.wheelError': 'Errore nel girare la ruota',
    'toast.wheelWarning': 'Attenzione',
    'toast.quizUnlockOutfit': 'Hai sbloccato un nuovo outfit nel fitting room!',
    'toast.avatarConfigSaved': 'La configurazione del tuo avatar è stata salvata',
    'toast.avatarSaveError': 'Errore durante il salvataggio',
    
    // Avatar
    'avatar.itemNotOwned': 'Devi acquistare questo oggetto prima di usarlo',
    'avatar.purchaseSuccess': 'Acquisto completato',
    'avatar.purchaseSuccessDesc': 'Oggetto acquistato con successo!',
    'avatar.purchaseError': 'Errore durante l\'acquisto',
    
    // Map
    'map.loading': 'Caricamento mappa...',
    'map.newAnnouncement': 'Nuovo Annuncio',
    'map.newMarker': 'Nuovo Marker',
    'map.newMarkerShort': 'Nuovo',
    'map.artists': 'Artisti',
    'map.opportunities': 'Opportunità',
    'map.all': 'Tutti',
    'map.new': 'Nuovo',
    'map.search': 'Cerca',
    'map.filter': 'Filtra',
    'map.filter.artists': 'Artisti',
    'map.filter.opportunity': 'Opportunità',
    'map.createAnnouncement': 'Crea Annuncio',
    'map.opportunity': 'Opportunità',
    'map.collaboration': 'Collaborazione',
    'map.clickToAdd': 'Clicca sulla mappa per aggiungere un marker',
    'map.searchPlace': 'Cerca un luogo',
    'map.selectPlace': 'Seleziona un luogo dalla ricerca',
    'map.selectLocation': 'Luogo selezionato',
    'map.latitude': 'Latitudine',
    'map.longitude': 'Longitudine',
    'map.candidate': 'Candidati',
    'map.contact': 'Contatta',
    'map.organizer': 'Organizzatore',
    'map.noResults': 'Nessun risultato trovato',
    'map.enterLocation': 'Inserisci un luogo',
    'map.detail.apply': 'Candidati',
    'map.detail.contact': 'Contatta',
    'map.searchPlaceholder': 'Cerca luogo, città, artista...',
    'map.marker.typeOpportunity': 'Opportunità',
    'map.marker.typeCollaboration': 'Collaborazione',
    'map.marker.create': 'Crea Marker',
    
    // Search
    'search.users': 'Utenti',
    'search.posts': 'Post',
    'search.events': 'Eventi',
    'search.user': 'Utente',
    'search.noResults': 'Nessun risultato trovato',
    'search.loading': 'Caricamento...',
    'search.like': 'like',
    'search.comments': 'commenti',
  },
  en: {
    // Common
    'common.welcome': 'Welcome',
    'common.login': 'Login',
    'common.register': 'Register',
    'common.logout': 'Logout',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.name': 'Name',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.settings': 'Settings',
    
    // Login
    'login.identifierPlaceholder': 'email@example.com or nickname',
    'login.passwordPlaceholder': '••••••••',
    
    // Landing
    'landing.hero.title': 'The Platform for Artistic Culture',
    'landing.hero.subtitle': 'Connect artists, recruiters and enthusiasts in a single creative space',
    'landing.hero.cta': 'Get Started',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.feed': 'Feed',
    'dashboard.map': 'Map',
    'dashboard.profile': 'Profile',
    'dashboard.events': 'Events',
    'dashboard.messages': 'Messages',
    'dashboard.portfolio': 'Portfolio',
    'dashboard.quests': 'Quests',
    'dashboard.minigames': 'Minigames',
    
    // Events
    'events.title': 'Events',
    'events.create': 'Create Event',
    'events.upcoming': 'Upcoming',
    'events.active': 'Active',
    'events.completed': 'Completed',
    'events.saved': 'Saved',
    
    // Profile
    'profile.level': 'Level',
    'profile.reputation': 'Reputation',
    'profile.experience': 'Experience',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    
    // Settings
    'settings.title': 'Settings',
    'settings.description': 'Manage your preferences and configurations',
    'settings.profile.title': 'Profile Information',
    'settings.profile.description': 'Edit your personal and biographical information',
    'settings.profile.name': 'Full Name',
    'settings.profile.username': 'Username',
    'settings.profile.email': 'Email',
    'settings.profile.emailNote': 'Email cannot be changed',
    'settings.profile.bio': 'Bio',
    'settings.profile.bioPlaceholder': 'Tell us something about yourself...',
    'settings.profile.location': 'Location',
    'settings.profile.locationPlaceholder': 'Your city or country',
    'settings.profile.website': 'Website / Link',
    'settings.profile.websitePlaceholder': 'https://...',
    'settings.profile.websiteNote': 'Link to your website, portfolio or social media',
    'settings.profile.uploadImage': 'Upload Image',
    'settings.profile.save': 'Save Changes',
    'settings.profile.saving': 'Saving...',
    'settings.profile.imageTypes': 'JPG, PNG or GIF. Max 5MB',
    'settings.appearance.title': 'Appearance',
    'settings.appearance.description': 'Customize the application appearance',
    'settings.appearance.theme': 'Theme',
    'settings.appearance.themeDesc': 'Switch between light and dark theme',
    'settings.appearance.language': 'Language',
    'settings.appearance.languageDesc': 'Select the interface language',
    'settings.notifications.title': 'Notifications',
    'settings.notifications.description': 'Manage your notification preferences',
    'settings.notifications.email': 'Email Notifications',
    'settings.notifications.emailDesc': 'Receive email notifications',
    'settings.notifications.push': 'Push Notifications',
    'settings.notifications.pushDesc': 'Receive push notifications in browser',
    'settings.account.title': 'Account',
    'settings.account.description': 'Manage your account information',
    'settings.account.changePassword': 'Change Password',
    'settings.account.deleteAccount': 'Delete Account',
    'settings.roles.title': 'Role Management',
    'settings.roles.description': 'Add or remove roles from your account',
    'settings.roles.artist': 'Artist',
    'settings.roles.recruiter': 'Recruiter',
    'settings.roles.addArtist': '+ Add Artist',
    'settings.roles.addRecruiter': '+ Add Recruiter',
    'settings.roles.active': 'Active roles',
    
    // Profile
    'profile.edit': 'Edit Profile',
    'profile.follow': 'Follow',
    'profile.unfollow': 'Unfollow',
    'profile.stats': 'Statistics',
    'profile.portfolio': 'Portfolio',
    'profile.portfolio.empty': 'Portfolio is empty',
    'profile.portfolio.addFirst': 'Add your first artwork',
    'profile.portfolio.add': 'Add Artwork',
    'profile.events.title': 'My Events',
    'profile.events.description': 'Manage your events and participations',
    'profile.events.create': 'Create Event',
    'profile.events.completed': 'Completed',
    'profile.events.ongoing': 'Ongoing',
    'profile.events.saved': 'Saved',
    'profile.events.created': 'Created',
    'profile.avatar.title': 'Customize Avatar',
    'profile.avatar.description': 'Customize your 3D avatar with outfits and accessories',
    'profile.avatar.open': 'Open Fitting Room',
    
    // Portfolio
    'portfolio.title': 'Portfolio',
    'portfolio.description': 'Show your art to the world',
    'portfolio.add': 'Add Artwork',
    'portfolio.empty': 'Your portfolio is empty',
    'portfolio.loading': 'Loading portfolio...',
    'portfolio.onlyArtists': 'This section is only available for artists',
    
    // Events
    'events.loading': 'Loading events...',
    'events.noCompleted': 'No completed events',
    'events.noOngoing': 'No ongoing events',
    'events.noSaved': 'No saved events',
    'events.noCreated': 'No created events',
    'events.participants': 'participants',
    
    // Common placeholders
    'placeholder.search': 'Search users, posts, events...',
    'placeholder.comment': 'Write a comment...',
    'placeholder.post': 'What do you want to share?',
    'placeholder.searchMap': 'Search artist, city, opportunity...',
    'placeholder.title': 'Title',
    'placeholder.description': 'Description',
    'placeholder.city': 'City',
    'placeholder.location': 'Location or address',
    'placeholder.latitude': 'Latitude',
    'placeholder.longitude': 'Longitude',
    
    // Toast messages
    'toast.success': 'Success',
    'toast.error': 'Error',
    'toast.emailVerified': 'Email verified',
    'toast.emailVerifiedDesc': 'You can now access your account',
    'toast.verifyError': 'Verification error',
    'toast.invalidToken': 'Invalid verification token',
    'toast.expiredToken': 'Verification token expired',
    'toast.verifyGenericError': 'Error during verification',
    'toast.eventCreated': 'Event created successfully',
    'toast.eventCreateError': 'Error creating event',
    'toast.markerCreated': 'Marker created successfully',
    'toast.markerCreateError': 'Error creating marker',
    'toast.profileUpdated': 'Profile updated successfully',
    'toast.profileUpdateError': 'Error updating profile',
    'toast.roleAdded': 'Role added',
    'toast.roleAddedDesc': 'Role added successfully',
    'toast.loading': 'Loading...',
    'toast.imageUploaded': 'Image uploaded',
    'toast.imageUploadSuccess': 'Image uploaded successfully',
    'toast.imageUploadError': 'Error uploading image',
    'toast.imageTypeError': 'File must be an image',
    'toast.imageSizeError': 'Image must not exceed 5MB',
    'toast.roleAddError': 'Error adding role',
    'toast.loginSuccess': 'Login successful',
    'toast.loginError': 'Login error',
    'toast.genericError': 'General error',
    'toast.validationError': 'Validation error',
    'toast.serverError': 'Server error',
    'toast.registrationAttempt': 'Registration attempt',
    'toast.registrationSuccess': 'Registration completed',
    'toast.registrationError': 'Registration error',
    'toast.purchaseSuccess': 'Purchase completed',
    'toast.purchaseError': 'Purchase error',
    'toast.avatarSaved': 'Avatar saved',
    'toast.avatarError': 'Error saving avatar',
    'toast.quizCompleted': 'Quiz completed!',
    'toast.loginRedirect': 'Redirecting to dashboard...',
    'toast.invalidCredentials': 'Incorrect email or password, or email not verified',
    'toast.registrationSending': 'Sending data to server...',
    'toast.checkEmail': 'Check your email to confirm your account',
    'toast.passwordMismatch': 'Passwords do not match',
    'toast.passwordTooShort': 'Password must be at least 8 characters',
    'toast.validationOk': 'Validation OK',
    'toast.formValid': 'Form valid, sending request...',
    'toast.wheelError': 'Error spinning the wheel',
    'toast.wheelWarning': 'Warning',
    'toast.quizUnlockOutfit': 'You unlocked a new outfit in the fitting room!',
    'toast.avatarConfigSaved': 'Your avatar configuration has been saved',
    'toast.avatarSaveError': 'Error saving',
    
    // Avatar
    'avatar.itemNotOwned': 'You must purchase this item before using it',
    'avatar.purchaseSuccess': 'Purchase completed',
    'avatar.purchaseSuccessDesc': 'Item purchased successfully!',
    'avatar.purchaseError': 'Error during purchase',
    
    // Map
    'map.loading': 'Loading map...',
    'map.newAnnouncement': 'New Announcement',
    'map.newMarker': 'New Marker',
    'map.newMarkerShort': 'New',
    'map.artists': 'Artists',
    'map.opportunities': 'Opportunities',
    'map.all': 'All',
    'map.new': 'New',
    'map.search': 'Search',
    'map.filter': 'Filter',
    'map.filter.artists': 'Artists',
    'map.filter.opportunity': 'Opportunities',
    'map.createAnnouncement': 'Create Announcement',
    'map.opportunity': 'Opportunity',
    'map.collaboration': 'Collaboration',
    'map.clickToAdd': 'Click on the map to add a marker',
    'map.searchPlace': 'Search for a place',
    'map.selectPlace': 'Select a place from search',
    'map.selectLocation': 'Selected location',
    'map.latitude': 'Latitude',
    'map.longitude': 'Longitude',
    'map.candidate': 'Apply',
    'map.contact': 'Contact',
    'map.organizer': 'Organizer',
    'map.noResults': 'No results found',
    'map.enterLocation': 'Enter a location',
    'map.detail.apply': 'Apply',
    'map.detail.contact': 'Contact',
    'map.searchPlaceholder': 'Search place, city, artist...',
    'map.marker.typeOpportunity': 'Opportunity',
    'map.marker.typeCollaboration': 'Collaboration',
    'map.marker.create': 'Create Marker',
    
    // Search
    'search.users': 'Users',
    'search.posts': 'Posts',
    'search.events': 'Events',
    'search.user': 'User',
    'search.noResults': 'No results found',
    'search.loading': 'Loading...',
    'search.like': 'likes',
    'search.comments': 'comments',
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('it')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'it' || saved === 'en')) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['it']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

