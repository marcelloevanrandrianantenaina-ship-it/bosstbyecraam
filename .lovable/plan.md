## Refonte Architecture v2 — Séparation totale Client / Admin

Repartir sur une base propre, stable, mobile-first. Garder uniquement ce qui marche (services + dépôts) et reconstruire le reste minimal.

---

### 1. Conservé tel quel (DB + code)

Tables Supabase conservées sans changement de schéma :
- `profiles` (client_id, balance, full_name, email, avatar_url)
- `services` (catalogue Facebook/TikTok/Instagram)
- `orders` (commandes clients)
- `recharges` (dépôts MVola)
- `user_roles` (admin / user)
- `site_settings` (MVola number, branding minimal)

RPC conservées : `approve_recharge`, `reject_recharge`, `transfer_balance`, `is_admin`, `has_role`, `handle_new_user`.

### 2. Supprimé (code uniquement, tables vidées d'usage)

- `admin_logs` — supprimer toute écriture côté client (ErrorComponent, etc.)
- `notifications` — supprimer UI + abonnements realtime
- `announcements` / `pricing_settings` — non utilisés dans la v2
- `balance_transfers` — fonctionnalité transfert retirée de la v2 (table gardée mais page supprimée)
- Tous les channels Supabase realtime (`useSiteSettings` realtime, etc.) → remplacés par simple fetch
- Page `transfer.tsx`, `dashboard.tsx` doublon, `reset-password` reste (utile)

### 3. Nouvelle architecture des routes

```text
src/routes/
  __root.tsx              shell minimal, pas d'écriture admin_logs
  index.tsx               redirige → /auth ou /app
  auth.tsx                CLIENT signup/login (email + Google)
  reset-password.tsx      garder

  _client/                ESPACE CLIENT (layout protégé)
    route.tsx             gate: session présente + role != admin-only
    app.tsx               accueil services (ex-index)
    profile.tsx           profil
    recharge.tsx          dépôt MVola
    orders.tsx            historique commandes
    order.$serviceId.tsx  passer une commande

  _admin/                 ESPACE ADMIN (layout protégé, totalement isolé)
    route.tsx             gate: session + role admin + admin_gate_passed
    login.tsx             /admin/login — auth admin indépendante (email+pwd+3 codes)
    dashboard.tsx         vue d'ensemble
    services.tsx          CRUD services
    recharges.tsx         validation dépôts
    users.tsx             liste utilisateurs + balance
    settings.tsx          paramètres site (MVola, branding)
```

### 4. Deux systèmes d'auth distincts

**Client (`/auth`)** :
- Supabase email/password + Google
- Après login → `/app`
- Si le user est admin ET tente `/app`, autorisé (un admin peut voir le client) mais aucune fonction admin n'apparaît côté client.

**Admin (`/admin/login`)** :
- Étape 1 : email + password Supabase (vérifie `is_admin` via `user_roles`)
- Étape 2 : 3 mots de passe stockés en `site_settings` (colonnes `admin_gate_1/2/3`) lus uniquement après login admin réussi (RLS: SELECT réservé aux admins pour ces colonnes via vue dédiée)
- `sessionStorage.admin_gate_passed = "1"` → expire à la fermeture
- Aucune page `/admin/*` accessible sans les 2 étapes

Les gates client et admin sont indépendants. Un client connecté qui tape `/admin` est redirigé vers `/admin/login`. Un admin connecté côté `/app` n'a aucun lien vers `/admin` visible.

### 5. UI minimale conservée

- Garder `src/styles.css` (couleurs, tokens) et les composants shadcn UI
- Garder `ServiceCard`, `AppHeader` (simplifié, sans lien admin), `AnnouncementBar` retirée
- Garder `WhatsAppFloat`

### 6. Suppressions concrètes de fichiers

```text
src/routes/_authenticated/         tout le dossier (remplacé par _client/ et _admin/)
src/routes/_authenticated/transfer.tsx
src/routes/_authenticated/dashboard.tsx
src/routes/_authenticated/admin.tsx
src/routes/_authenticated/admin.settings.tsx
src/components/AnnouncementBar.tsx
src/hooks/use-site-settings.ts     remplacé par fetch simple sans realtime
```

### 7. Migration DB (1 seule)

- Ajouter colonnes `admin_gate_1`, `admin_gate_2`, `admin_gate_3` à `site_settings` (text)
- Restreindre SELECT de ces colonnes via politique : seuls les admins peuvent lire
- Aucune suppression de table (préserve les données existantes)
- Seed les 3 mots de passe actuels (`26mars2008`, `admin26mars2008`, `26mars2008`)

### 8. Stabilité

- Plus aucune souscription realtime (cause #1 des crashes)
- Plus d'écriture `admin_logs` côté client (cause des 401/erreurs silencieuses)
- Loader-free routes côté `_client` et `_admin` (`ssr: false`), tous les fetchs dans les composants
- Gestion d'erreur simple : `errorComponent` au root sans side-effect

### Détails techniques

- `_client/route.tsx` et `_admin/route.tsx` : `ssr: false`, gate dans `beforeLoad` qui appelle `supabase.auth.getUser()` + `user_roles` pour admin
- `routeTree.gen.ts` : régénéré automatiquement par le plugin Vite, ne pas l'éditer manuellement
- `useAuth` simplifié : enlève la notion de `sub_admin`, garde juste `isAdmin` pour adapter le header
- `AppHeader` client : pas de lien admin
- `AppHeader` admin : sidebar séparée

### Hors scope (Phase suivante)

- Notifications temps réel
- Logs admin
- Stats avancées
- Transferts entre utilisateurs
- Multi-rôles (sub_admin)

---

Validez ce plan pour que je commence l'implémentation. Une fois OK, je ferai d'abord la migration DB, puis je supprimerai/recréerai les routes en lots parallèles, et je testerai dépôt + commande sur mobile avant de clôturer.
