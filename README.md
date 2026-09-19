# ☀️ Hélios Solaire — Simulateur & Optimiseur Photovoltaïque

Application d'ingénierie et de calcul pour dimensionner, optimiser l'autoconsommation et maximiser la rentabilité d'une installation solaire photovoltaïque résidentielle.

---

## ⚠️ Pourquoi la page GitHub Pages s'affichait blanche ?

Sur **GitHub Pages**, le lien `https://votre-pseudo.github.io/nom-du-depot/` affichait une page blanche pour deux raisons :
1. **Chemins absolus des scripts** : Par défaut, Vite cherchait `/assets/...` à la racine au lieu de `./assets/...` (ce point a été corrigé avec `base: './'` dans `vite.config.ts`).
2. **Dossier de publication** : GitHub Pages a besoin du contenu du dossier de compilation `dist/` (HTML, JS, CSS compilés), et non pas du code source brut.
3. **Le backend Node.js / Express** : GitHub Pages ne fait que de l'hébergement statique. Si vous voulez la totalité des fonctions (dont le scan IA de facture d'électricité), un hébergeur Node.js gratuit comme **Render** ou **Vercel** est la solution idéale !

---

## 🚀 Option 1 : Déploiement Gratuit Recommandé sur Render.com (Full-Stack avec API & IA)

C'est la solution la plus simple, 100% gratuite et compatible avec le serveur Node.js :

1. Rendez-vous sur **[render.com](https://render.com)** et créez un compte gratuit (connectez-vous avec votre compte GitHub).
2. Cliquez sur **New +** puis sélectionnez **Web Service**.
3. Choisissez votre dépôt GitHub contenant le projet.
4. Remplissez les champs de configuration :
   - **Name** : `helios-solaire` (ou le nom de votre choix)
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Plan** : Sélectionner **Free**
5. Dans l'onglet **Environment Variables**, ajoutez :
   - `GEMINI_API_KEY` : votre clé d'API Google AI Studio (si vous souhaitez le scanner de facture IA).
   - `VITE_GOOGLE_MAPS_API_KEY` : `AIzaSyAg2iHgGMMr21myDEMbqWRQZTu9ChfJbHU` (la clé de démo).
6. Cliquez sur **Deploy Web Service**.
7. En 2 minutes, votre application est en ligne avec un lien HTTPS public fonctionnel (ex: `https://helios-solaire.onrender.com`) !

---

## ⚡ Option 2 : Déploiement Gratuit sur Vercel

1. Rendez-vous sur **[vercel.com](https://vercel.com)** et connectez-vous avec GitHub.
2. Cliquez sur **Add New...** > **Project**.
3. Importez votre dépôt GitHub.
4. Framework Preset : **Vite**
5. Cliquez sur **Deploy**.

---

## 📄 Option 3 : Corriger GitHub Pages (pour la partie simulateur statique)

Si vous tenez absolument à utiliser **GitHub Pages** :

1. Dans votre projet local, lancez :
   ```bash
   npm run build
   ```
2. Cela génère le dossier `dist/` qui contient les fichiers finaux.
3. Vous pouvez déployer ce dossier `dist/` sur la branche `gh-pages` grâce à l'outil `gh-pages` :
   ```bash
   npx gh-pages -d dist
   ```
4. Dans votre dépôt GitHub :
   - Allez dans **Settings** > **Pages**
   - Source : **Deploy from a branch**
   - Branch : Choisissez `gh-pages` et `/ (root)`, puis validez.
   - Votre page ne sera plus blanche !

---

## 💻 Lancer le projet en local sur votre machine

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/VOTRE_UTILISATEUR/VOTRE_DEPOT.git
   cd VOTRE_DEPOT
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer en mode développement :
   ```bash
   npm run dev
   ```
4. Ouvrir : **[http://localhost:3000](http://localhost:3000)**
