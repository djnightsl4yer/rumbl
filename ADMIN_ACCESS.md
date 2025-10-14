# Accès Administration RÜMBL

## Panel CMS Admin

Pour accéder au panneau d'administration complet du site:

1. **URL**: Tapez manuellement dans la barre d'adresse ou ajoutez `#admin-cms` à l'URL
   - Exemple: `https://votre-site.com` puis dans le code, naviguer vers la page `admin-cms`

2. **Mot de passe**: `RUMBL_ADMIN_2025`

3. **Fonctionnalités disponibles**:
   - Vue d'ensemble avec statistiques
   - Gestion des événements
   - Gestion des artistes
   - Gestion des ambassadeurs
   - Édition du contenu des pages
   - Paramètres du site

## Panel Ambassadeurs

Pour gérer uniquement les ambassadeurs:

1. **URL**: Naviguer vers `admin-ambassadors`
2. **Mot de passe**: `RUMBL_ADMIN_2025`

## Accès rapide depuis le code

Dans `App.tsx`, vous pouvez changer temporairement:
```typescript
const [currentPage, setCurrentPage] = useState<Page>('admin-cms');
```

Ou créer un bouton caché avec Ctrl+Shift+A pour ouvrir l'admin.

## URLs directes (après déploiement)

- CMS Admin: `/admin-cms`
- Ambassadeurs Admin: `/admin-ambassadors`
- Profil ambassadeur: `/ambassador-profile` (nécessite authentification)
- Dashboard ambassadeur: `/ambassador-dashboard?code=refcode`
