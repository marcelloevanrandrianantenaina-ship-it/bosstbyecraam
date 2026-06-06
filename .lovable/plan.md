# Refonte complète UI/UX – Client & Admin

## 1. Nouvelle identité visuelle (`src/styles.css`)

Remplacer la palette orange par une identité premium:

- **Fond**: noir profond + bleu nuit (`oklch(0.10 0.02 260)`)
- **Primary (Vert Émeraude)**: solde, recharge, validation — `oklch(0.72 0.18 155)`
- **Secondary (Cyan électrique)**: boutons, navigation, icônes — `oklch(0.78 0.14 210)`
- **Accent (Violet néon)**: promos, annonces — `oklch(0.68 0.22 295)`
- **Gold doux**: VIP / TOP — `oklch(0.82 0.12 90)`
- **Destructive (Rouge moderne)**: erreurs/suppression — `oklch(0.62 0.22 25)`

Mettre à jour `--gradient-primary`, `--shadow-glow`, et toutes les classes utilitaires (`glass`, `glow`, `gradient-primary`).

## 2. Mode "Économiser des données"

- Nouvelle migration: ajouter `data_saver boolean default false` à `profiles`.
- Nouveau hook `src/hooks/use-data-saver.ts` qui lit/écrit `profiles.data_saver`, met en cache localStorage, et ajoute la classe `data-saver` sur `<html>`.
- Dans `styles.css`: sous `.data-saver`, désactiver animations (`* { animation: none !important; transition: none !important; }`), particules, glow, marquee.
- Toggle accessible dans le menu client.

## 3. Schéma DB — Annonces épinglées

Migration: ajouter `is_pinned boolean default false` à `announcements`. Tri client: `is_pinned DESC, sort_order ASC, created_at DESC`. UI admin: bouton 📌 toggle pin.

## 4. Client — Restructuration

### `_client/app.tsx` (Accueil)
- Hero solde (Émeraude) + bouton "Recharger" (Cyan).
- **Bannière annonces** (Violet) avec annonces épinglées en tête.
- Sections Services groupés par catégorie: **Facebook / TikTok / Instagram**.
- Animations `fade-in` staggered (désactivées en mode économie).

### `_client/profile.tsx` (refonte)
- Avatar + Nom + Email + ID Client + Solde.
- Boutons: Recharger, Mes commandes, Mes dépôts, Déconnexion.
- Toggle "Économiser des données".

### `AppHeader.tsx`
- Avatar cliquable → `/profile` (déjà le cas, vérifier).
- Solde en Émeraude.
- Menu hamburger réduit à: Suivi commandes, Groupe discussion (lien WhatsApp), Tutoriel, Économiser des données.

### `_client/recharge.tsx`
- Afficher: numéro MVola, propriétaire, montant min, **instructions** (markdown), upload capture, formulaire.
- Récupère depuis `site_settings`.

## 5. Admin — Parité visuelle

Tous les écrans admin reprennent le design client. Différences = icônes ✏️ ➕ 🗑️ ✅ ❌ uniquement.

- `admin.index.tsx`: hero revenus (Émeraude) + alerte dépôts pending (Cyan).
- `admin.announcements.tsx`: ajouter toggle 📌 "Épingler".
- `admin.settings.tsx`: sections déjà bonnes — vérifier que tous les champs sont éditables (nom, logo, slogan, réseaux, MVola, instructions).
- `admin.services.tsx`, `admin.recharges.tsx`, `admin.users.tsx`: harmoniser cartes (mêmes classes `glass`, `rounded-2xl`).

## 6. Composants partagés

- `ServiceCard`: badge "TOP" en Gold, badge "PROMO" en Violet.
- `PageHeader`: déjà unifié.
- Nouveau `AnnouncementBanner.tsx` (client) qui lit `announcements` actives, tri pinned first.

## 7. Détails techniques

- Pas de nouvelles fonctionnalités hors scope.
- Conserver: services, recharges, comptes, login admin, RLS existantes.
- Mobile-first: garder le grid 2-col sur mobile, espacements compacts.
- Toutes les requêtes existantes (Supabase) restent inchangées sauf ajout `is_pinned` / `data_saver`.

## Livrables

1. Migration SQL (`is_pinned`, `data_saver`).
2. `styles.css` refondu (nouvelle palette).
3. Hook `use-data-saver.ts`.
4. Composant `AnnouncementBanner.tsx`.
5. Refonte `_client/app.tsx`, `profile.tsx`, `recharge.tsx`, `AppHeader.tsx`.
6. Ajustements admin: `announcements`, `index`, cartes harmonisées.

Une fois ce plan validé, j'implémente en une passe.
