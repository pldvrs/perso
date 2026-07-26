# pierrelouisdivaris.com

Site personnel de Pierre-Louis Divaris, CFA. Page unique, français par défaut
avec bascule anglaise. Pas de build, pas de dépendances : du HTML, du CSS et
une trentaine de lignes de JavaScript.

## Structure

```
index.html              la page
assets/css/tokens.css   couleurs, typographie, espacements
assets/css/site.css     mise en page et composants
assets/js/site.js       bascule FR/EN + apparition au scroll
assets/img/             portrait et favicon
demo.html               démo produit — parcours cliquable en 8 étapes
demo/                   ce dont la démo a besoin (runtime, React, polices, icônes)
cv/                     déposer ici pierre-louis-divaris-cv.pdf
CNAME                   domaine personnalisé
```

## Voir le site en local

Ouvrir `index.html` dans un navigateur suffit. Pour être au plus près de la
production (chemins relatifs, favicon) :

```sh
python3 -m http.server 8000
# puis http://localhost:8000
```

## Déploiement — GitHub Pages

1. Pousser sur `main`.
2. Settings → Pages → Source : `main` / `/ (root)`.
3. Le fichier `CNAME` contient déjà `pierrelouisdivaris.com`. Côté DNS, chez ton
   registrar :
   - un enregistrement `CNAME` pour `www` vers `<utilisateur>.github.io`
   - quatre enregistrements `A` pour le domaine nu vers `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. Une fois le DNS propagé, cocher « Enforce HTTPS ».

Si tu ne veux pas encore du domaine, supprime `CNAME` : le site restera servi
sur l'URL `github.io`.

Vercel, Netlify et Cloudflare Pages fonctionnent aussi tels quels : importer le
repo, aucune commande de build, répertoire de publication à la racine.

## Modifier le contenu

Tout le texte français est directement dans `index.html`. La version anglaise de
chaque phrase vit dans l'attribut `data-en` du même élément :

```html
<h3 class="card-title" data-en="Portfolio construction">Construction de portefeuille</h3>
```

Pour changer une phrase, modifier les deux. Le français est ce que voient les
moteurs de recherche et les lecteurs sans JavaScript ; l'anglais est appliqué au
clic sur « EN » (le choix est mémorisé, et `?lang=en` force la langue dans un
lien).

Les titres de page et descriptions des deux langues sont en haut de
`assets/js/site.js`, avec l'adresse mail.

## La démo produit

`demo.html` est un parcours cliquable en 8 étapes dans une maquette de
téléphone : mini-test, plan de travail, cours manipulable, dossier d'élève,
mock, carte de maîtrise, duel, cockpit. On y accède depuis la carte « IA &
automatisation » du site, et la flèche en haut à gauche ramène à l'accueil.
Les flèches ← et → du clavier changent d'étape.

Contrairement au reste du site, cette page tourne sur le runtime de l'outil de
design (`demo/runtime.js`) et sur React. Les deux sont servis depuis le repo,
pas depuis un CDN — la page ne dépend d'aucun service extérieur. Si tu la
modifies, c'est le HTML de `demo.html` qu'il faut éditer : les styles sont en
ligne, et la logique est dans le `<script type="text/x-dc">` en bas du fichier.

## Design

Le site est une réécriture en HTML/CSS statique d'une maquette faite avec Claude
Design — il n'utilise ni React ni le runtime de l'outil de design. Pour changer
une couleur, une police ou un espacement, c'est `assets/css/tokens.css` qui fait
foi : ce sont les tokens du design system, tout le reste s'y réfère.
