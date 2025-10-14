# Guide Complet - CMS RÜMBL

## 🎯 Accès Admin

### Raccourci Clavier
Appuyez sur `Ctrl + Shift + A` depuis n'importe quelle page du site

### Mot de Passe
`RUMBL_ADMIN_2025`

---

## 📊 Section 1: DASHBOARD

Vue d'ensemble avec statistiques en temps réel:
- **Ambassadeurs** actifs/totaux
- **Candidatures** en attente
- **Commandes** produits en attente/totales
- **Ventes totales** en euros
- **Missions actives**
- Aperçu des dernières candidatures
- Aperçu des dernières commandes

---

## 👥 Section 2: GESTION AMBASSADEURS

### Fonctionnalités:
- Liste complète de tous les ambassadeurs
- Affichage: nom, code référence, points, ventes, statut
- **Activer/Désactiver** un ambassadeur
- **Voir le profil** complet de chaque ambassadeur
- Accès direct au dashboard ambassadeur

---

## 📋 Section 3: CANDIDATURES AMBASSADEURS

### Fonctionnalités:
- Liste de toutes les candidatures
- Affichage des détails complets:
  - Informations personnelles
  - Motivation
  - Expérience
  - Disponibilité

### Actions:
- **APPROUVER** → Crée automatiquement un compte ambassadeur avec code référence
- **REJETER** → Marque la candidature comme rejetée
- Statuts visuels: pending (jaune), approved (vert), rejected (rouge)

---

## 🎯 Section 4: MISSIONS AMBASSADEURS

### Créer une Mission:
1. Titre de la mission
2. Description détaillée
3. Points récompense
4. Deadline (optionnelle)

### Gestion:
- Liste de toutes les missions
- Statut: active, completed, expired
- Affichage des points et deadlines

---

## 🎨 Section 5: ÉDITION CONTENU SITE ⭐

### Page ARTISTES

#### Créer un Nouvel Artiste:
1. Cliquez sur "NOUVEL ARTISTE"
2. Remplissez les informations:
   - **Nom** * (obligatoire)
   - **Rôle**: DJ, Producer, DJ/Producer, Live
   - **Bio**: Description de l'artiste
   - **URL Image**: Chemin vers la photo (`/image.jpg`)
   - **Instagram**: Lien Instagram
   - **SoundCloud**: Lien SoundCloud
   - **Spotify**: Lien Spotify
   - **Site Web**: URL du site
   - **Ordre d'affichage**: Position sur la page (0, 1, 2...)
3. Cliquez sur "SAUVEGARDER"

#### Modifier un Artiste:
1. Cliquez sur "Modifier" sur la carte de l'artiste
2. Modifiez les champs souhaités
3. Cliquez sur "SAUVEGARDER"

#### Autres Actions:
- **Cacher/Afficher** : Rend l'artiste visible ou non sur le site
- **Supprimer** : Supprime définitivement l'artiste

#### Mise à Jour Automatique:
✅ **Les changements apparaissent INSTANTANÉMENT sur le site !**

---

### Page ÉVÉNEMENTS

#### Créer un Nouvel Événement:
1. Cliquez sur "NOUVEL ÉVÉNEMENT"
2. Remplissez les informations:
   - **Titre** * (obligatoire)
   - **Date**: Date et heure de l'événement
   - **Description**: Détails de l'événement
   - **Lieu**: Nom du venue
   - **Adresse**: Adresse complète
   - **URL Image**: Chemin vers le poster (`/poster.jpg`)
   - **URL Billets**: Lien Shotgun
   - **Prix**: Ex: "15€ - 20€"
   - **Statut**: À venir, Passé, Annulé
   - ⭐ **Afficher sur la page d'accueil** (checkbox)
3. Cliquez sur "SAUVEGARDER"

#### Modifier un Événement:
1. Cliquez sur "Modifier" sur la carte de l'événement
2. Modifiez les champs souhaités
3. Cliquez sur "SAUVEGARDER"

#### Autres Actions:
- **Supprimer** : Supprime définitivement l'événement

#### Mise à Jour Automatique:
✅ **Les changements apparaissent INSTANTANÉMENT sur toutes les pages !**

---

### Page ACCUEIL (Disponible)

Modifiez le contenu de la page d'accueil:
- Section Hero (titre, sous-titre, tagline, description)
- Section Prochain Événement (titre, événement, lieu, URL Shotgun)

---

### Page À PROPOS (Disponible)

Modifiez:
- Section Hero (titre, description)
- Section Mission (titre, texte)

---

## 📦 Section 6: COMMANDES

### Gestion des Commandes:
- **CDJ YUGI**: Commandes de contrôleurs DJ
- **EXOSKELETON**: Commandes d'exosquelettes custom

### Informations Affichées:
- Type de produit
- Client (nom, email, téléphone)
- Montant total
- Méthode de paiement (crypto/paypal)
- Détails complets de la commande (JSON)
- Date de commande

### Actions:
- **Marquer payé** : Change le statut à "paid"
- **Marquer expédié** : Change le statut à "shipped" et enregistre la date
- **Annuler** : Annule la commande

### Statuts:
- 🟡 **pending** : En attente de paiement
- 🟢 **paid** : Payé
- 🔵 **shipped** : Expédié
- 🔴 **cancelled** : Annulé

---

## 📈 Section 7: ANALYTICS

Section prévue pour statistiques détaillées (à développer)

---

## ⚡ MISES À JOUR EN TEMPS RÉEL

### Comment ça fonctionne:

1. **Admin modifie** un artiste/événement dans le CMS
2. **Sauvegarde** les modifications
3. **Base de données** est mise à jour
4. **Supabase Realtime** détecte le changement
5. **Site se met à jour automatiquement** pour tous les visiteurs
6. **Aucun délai** - c'est instantané !

### Technologies:
- Supabase PostgreSQL pour stockage
- Supabase Realtime Subscriptions pour les mises à jour
- RLS (Row Level Security) pour la sécurité

---

## 🎯 WORKFLOW TYPIQUE

### Ajouter un Nouvel Artiste:

1. `Ctrl + Shift + A` → Accès au CMS
2. Cliquez sur "Contenu Site"
3. Onglet "Artistes"
4. "NOUVEL ARTISTE"
5. Remplir le formulaire:
   ```
   Nom: TECHNO MASTER
   Rôle: DJ
   Bio: Description cool de l'artiste...
   URL Image: /techno-master.jpg
   Instagram: https://instagram.com/technomaster
   Ordre: 4
   ```
6. "SAUVEGARDER"
7. ✅ L'artiste apparaît immédiatement sur la page Artistes !

### Créer un Événement:

1. CMS → "Contenu Site" → "Événements"
2. "NOUVEL ÉVÉNEMENT"
3. Remplir:
   ```
   Titre: RÜMBL RAVE #5
   Date: 2025-11-15 23:00
   Description: La plus grosse soirée techno de l'année...
   Lieu: Warehouse 404
   Adresse: 15 Rue de la Techno, Paris
   URL Image: /rumbl-rave-5.jpg
   URL Billets: https://shotgun.live/...
   Prix: 15€ - 20€
   Statut: À venir
   ☑ Afficher sur la page d'accueil
   ```
4. "SAUVEGARDER"
5. ✅ L'événement apparaît sur la page Événements ET sur la page d'accueil !

### Gérer une Candidature Ambassadeur:

1. CMS → "Candidatures"
2. Lire les détails de la candidature
3. **Si OK**: Cliquez "APPROUVER"
   - ✅ Un nouveau compte ambassadeur est créé automatiquement
   - ✅ Code référence généré automatiquement
   - ✅ L'ambassadeur peut maintenant se connecter
4. **Si KO**: Cliquez "REJETER"

---

## 🔒 SÉCURITÉ

- Toutes les tables ont RLS activé
- Seuls les utilisateurs authentifiés peuvent modifier
- Public peut seulement voir le contenu actif
- Logs d'activité pour traçabilité
- Pas de suppression accidentelle (confirmation requise)

---

## 💡 TIPS & ASTUCES

### Images:
- Placez vos images dans le dossier `/public`
- Utilisez des chemins relatifs: `/mon-image.jpg`
- Formats supportés: JPG, PNG, WebP
- Taille recommandée: max 2MB

### Ordre d'Affichage:
- Les artistes sont triés par `order_index`
- 0 = premier, 1 = deuxième, etc.
- Vous pouvez réorganiser en changeant les numéros

### Slug:
- Généré automatiquement depuis le nom
- Utilisé pour les URLs
- Ex: "DJ TECHNO" → "dj-techno"

### Statut Événement:
- **À venir** : Affiché en premier
- **Passé** : Dans l'historique
- **Annulé** : Marqué comme annulé

### Featured Event:
- Cochez "Afficher sur la page d'accueil"
- L'événement apparaît dans le bloc principal

---

## 🆘 PROBLÈMES COURANTS

### "Erreur: slug already exists"
→ Un artiste/événement avec ce nom existe déjà
→ Changez le nom ou modifiez l'existant

### "Les changements n'apparaissent pas"
→ Rafraîchissez la page (F5)
→ Vérifiez que l'artiste est "actif"
→ Vérifiez la connexion internet

### "Je ne vois pas mes images"
→ Vérifiez le chemin: doit commencer par `/`
→ Vérifiez que l'image existe dans `/public`
→ Vérifiez l'extension (jpg, png, webp)

---

## 📞 CONTACT

Pour toute question sur l'utilisation du CMS:
- Contactez l'équipe technique RÜMBL
- Documentation complète disponible

---

**Version**: 1.0
**Dernière mise à jour**: 14 Octobre 2025
**Développé pour**: RÜMBL - Hard & Groovy Techno
