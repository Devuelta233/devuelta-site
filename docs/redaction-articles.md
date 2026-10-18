# Rédiger un article Devuelta (FR · ES · EN)

Série « le formulaire officiel n'a pas marché » : un article par semaine, dans
l'ordre de `docs/plan-articles.json` (premier sujet au statut `a-faire`).

## Règles absolues

- Chaque fait est vérifié en ligne le jour même, sur une source officielle ou
  primaire (centre d'aide de la plateforme, EUR-Lex, Légifrance, BOE, FTC,
  autorités : CNIL, AEPD, Arcom, CNMC…). Pas de source lisible = on ne l'écrit pas.
- FR au « vous », ES au « tú » (espagnol neutre, compris en Espagne et en
  Amérique latine), EN au « you ». Phrases courtes, mots simples, la réponse d'abord.
- Jamais « garantie / garantizado / guaranteed », jamais « conseil juridique /
  asesoramiento jurídico / legal advice ». Aucun chiffre inventé, aucun taux de réussite.
- Mineurs : une phrase d'orientation vers les canaux officiels gratuits
  (3018 en France, Take It Down, Canal prioritario 14-17…), jamais d'offre payante.
- Ne jamais promettre d'identifier un auteur : seule la justice peut obtenir son identité.
- « Devuelta » n'apparaît QUE dans `si_rien_ne_marche`, sans promesse de résultat.
- Titres ≤ 60 caractères, `meta_description` ≤ 155, slugs en minuscules ASCII avec tirets.
- Les tests (`npm test`) refusent un article non conforme : ils doivent passer.

## Écrire pour quelqu'un qui a peur

La personne qui lit est inquiète, souvent sur son téléphone, parfois tard le
soir, parfois honteuse. On écrit pour elle, pas pour un juriste.

- Ton calme, chaleureux et direct. Pas d'humour, pas de quiz, pas de jeu dans
  ces articles. Pas de dramatisation non plus.
- `essentiel` (« L'essentiel en 30 secondes », affiché en haut) : 3 ou 4 gestes
  à faire maintenant, dans l'ordre, une phrase chacun (160 caractères au plus),
  qui commence par un verbe.
- Une phrase rassurante tôt dans l'article quand elle est vraie pour la
  situation (« Ce n'est pas de votre faute », « Vous pouvez agir sans compte »),
  sans en faire trop.
- Longueur : 700 à 1 000 mots en français (1 100 au plus ; espagnol 1 200 au
  plus). Phrases de 20 mots au plus. Un paragraphe = une idée.
- Compréhensible par tous, sans infantiliser : les mots de tous les jours, une
  idée par phrase, le sujet et le verbe au début. Les tests le vérifient dans les
  3 langues : 600 mots au moins, aucune phrase de plus de 25 mots, au plus 15 %
  de phrases de plus de 20 mots.
- Chaque mot technique est expliqué en une phrase la première fois (exemple :
  « le DSA, la loi européenne qui oblige les grandes plateformes à traiter vos
  signalements »). Les numéros d'articles de loi vont entre parenthèses ou dans
  les sources, jamais au cœur d'une phrase importante.
- Dernière section, juste avant « Si rien ne marche » : « Pour que ça ne
  recommence pas » (2 à 4 conseils concrets de prévention).
- Les exemples sont bienvenus s'ils sont présentés comme des exemples
  (« Par exemple : … »), jamais comme de vrais témoignages.
- Quand c'est pertinent, mettre en garde contre les arnaques qui visent les
  victimes : faux « hackers » qui récupèrent un compte, services qui promettent
  de tout supprimer en 24 heures.

## Format (un fichier par article : `shared/articles/<id>.json`)

```json
{
  "id": "identifiant-du-plan",
  "publie_le": "AAAA-MM-JJ",
  "verifie_le": "AAAA-MM-JJ",
  "situation": "usurpation",
  "plateformes": ["instagram"],
  "slug": {"fr": "...", "es": "...", "en": "..."},
  "titre": {"fr": "...", "es": "...", "en": "..."},
  "meta_description": {"fr": "...", "es": "...", "en": "..."},
  "chapo": {"fr": "2 ou 3 phrases : la réponse d'abord", "es": "...", "en": "..."},
  "essentiel": {"fr": ["Geste 1", "Geste 2", "Geste 3"], "es": ["..."], "en": ["..."]},
  "sections": [
    {
      "titre": {"fr": "...", "es": "...", "en": "..."},
      "paragraphes": {"fr": ["..."], "es": ["..."], "en": ["..."]},
      "etapes": {"fr": ["..."], "es": ["..."], "en": ["..."]}
    }
  ],
  "si_rien_ne_marche": {"fr": "...", "es": "...", "en": "..."},
  "sources": [{"url": "https://...", "titre": "nom de la page"}],
  "liens_internes": [{"type": "situation", "id": "usurpation"}, {"type": "guide", "id": "ue-dsa-notification-art16"}]
}
```

- 4 ou 5 sections, la dernière étant « Pour que ça ne recommence pas » ;
  `etapes` peut valoir `null`.
- Situations : contenu-intime, deepfake, usurpation, piratage-compte, faux-avis,
  diffamation, donnees-personnelles, droit-auteur, chantage.
- Guides existants (pour `liens_internes`) : voir les `id` de `shared/guides.json`.
- Ce qui n'a pas pu être vérifié n'entre pas dans l'article : le noter dans la
  description de la demande de fusion (pull request), pas dans le fichier.

## Publication

1. Branche `article-<id>` créée depuis `main`, fichier `shared/articles/<id>.json`
   ajouté (le nom du fichier = l'`id`), statut du sujet passé à `a-valider` dans
   `docs/plan-articles.json`. Ne jamais modifier le fichier d'un autre article.
2. `npm ci && npm test && npm run build` doivent réussir.
3. Demande de fusion vers `main` par l'API REST de GitHub (`gh api
   repos/Devuelta233/devuelta-site/pulls -f title=… -f head=article-<id> -f base=main
   -F body=@description.md` ; `gh pr create` n'est pas disponible), avec dans la
   description la version française lisible (titre, chapô, sections) et la liste
   des sources : Steven lit, puis « Merge » publie le site automatiquement. Après
   fusion, le statut passe à `publie` (fait par la tâche de la semaine suivante).

## Kit réseaux sociaux (un par article : `docs/reseaux/<id>.md`)

Chaque article a son kit pour les 6 réseaux (Instagram, TikTok, Facebook,
YouTube, Threads, Pinterest). But : aider tout de suite, puis amener vers
l'article et le diagnostic gratuits du site.

### Le ton : naturellement humain (consigne de Steven, 18/10/2026)

On écrit comme on parlerait à un proche qui vient d'appeler, inquiet. Le texte
doit parler au plus grand nombre : un ado, une mère de famille, un commerçant à
Kumasi, une grand-mère à Lyon, un étudiant à Bogotá.

- Commencer par ce que la personne vit, avec ses mots (« Ton WhatsApp marche…
  mais quelqu'un lit tes messages ? »). Jamais par une loi, une institution ou un
  sigle (FTC, OSA, RGPD, DSA) : la loi vient ensuite, comme une bonne nouvelle,
  en mots simples.
- Les mots que les gens tapent et disent : « on m'a piraté », « quelqu'un menace
  de publier mes photos », « me hackearon », « someone is threatening to leak my
  photos ». Pas de jargon (GhostPairing, doxxing, OSINT…), même en mot-clé.
- Une phrase = une idée ; environ 15 mots par écran. Pas de liste de trois
  adjectifs, pas de majuscules pour crier, pas de série de points
  d'exclamation, un seul émoji au plus (⚠️ pour l'alerte).
- Rassurer sans dramatiser : « ce n'est pas ta faute », « tu n'es pas seul·e »,
  « tu as le droit de la faire retirer ». Pas de peur gratuite.
- Des exemples du quotidien de tous les publics : Mobile Money (Ghana), Orange
  Money ou Wave (Afrique francophone), Bizum (Espagne), un virement. Anglais
  simple, compris au Ghana, au Nigeria, au Royaume-Uni et aux États-Unis.
  Espagnol neutre, compris en Espagne et en Amérique latine.
- Tics d'IA interdits : « Voici… », « Découvre… », « N'hésite pas »,
  « Dans un monde où… », « crucial », « essentiel », « en tant que », tirets
  longs à répétition, phrases qui commencent toutes de la même façon.
- Test final : lire à voix haute. Si on ne le dirait pas comme ça à un proche
  au téléphone, on réécrit.

### Ce que contient le kit

Format maison (celui des vidéos du lancement du 18/10/2026) : vidéo verticale
de 30 à 40 secondes, **sans voix**, texte à l'écran en grand, fond bleu (FR),
violet (ES), turquoise (EN). Musique : Bach, Variations Goldberg (enregistrement
« Open Goldberg Variations », domaine public), une variation par sujet, le même
passage pour les 3 langues ; un sujet déjà traité reprend sa variation, un
nouveau sujet prend une variation libre (liste dans le document du projet
`claude/reseaux-sociaux-devuelta.md`, section 7). Dernière image : la fiche
« À garder ».

En tête du fichier : la variation de Bach, la langue du Short YouTube (une
seule langue par sujet), le tableau Pinterest, la date conseillée. Puis trois
parties `## FR`, `## ES`, `## EN`, chacune avec :

1. **Vidéo** : 6 ou 7 écrans (moment + texte à l'écran). Écran 1 (0 à 3 s) : la
   situation telle que la personne la vit. Puis les 3 gestes de « L'essentiel ».
   « Ce n'est pas ta faute » au plus tard sur l'avant-dernier écran. Fin :
   « Guide gratuit : getdevuelta.com ».
2. **Fiche « À garder »** (5 lignes au plus) : ce qu'on veut que la personne
   enregistre ou envoie à un proche.
3. **Légende** (300 caractères au plus, hors mots-clés) : 1re ligne = la phrase
   que les gens tapent ; 2 phrases simples ; « Guide gratuit : getdevuelta.com »
   en toutes lettres (jamais « lien en bio ») ; la phrase d'aide « Si quelqu'un
   autour de toi vit ça, envoie-lui cette vidéo. » (ES : « Si alguien a tu
   alrededor está pasando por esto, envíaselo. » ; EN : « If someone you know is
   going through this, send them this. ») ; puis 3 ou 4 mots-clés (#) simples,
   ceux que les gens cherchent vraiment.
4. **Premier commentaire** : le texte anti-arnaque maison, identique partout
   (« ⚠️ Méfie-toi des faux « hackers » en commentaire : ce sont des arnaques.
   Devuelta ne t'écrira jamais en premier et ne te demandera jamais de photos
   privées ni de paiement en crypto. Notre seul site : getdevuelta.com »).
5. **Threads** : 3 ou 4 phrases + la fiche en image + un seul mot-clé.
6. **Pinterest** : titre (100 caractères au plus) et description, avec le lien
   de l'article.
7. **YouTube** (une seule langue) : le titre = la question que les gens tapent.
8. **Lien** : l'adresse complète de l'article dans la langue
   (https://getdevuelta.com/articles/..., /es/articulos/..., /en/articles/...).

Règles : « tu » en français et en espagnol, « you » en anglais ; mêmes lignes
rouges que l'article (aucune garantie, aucun chiffre inventé, mineurs vers les
canaux officiels gratuits) ; jamais de vraie victime, jamais de corps, même
flouté ; « photos privées », jamais « intimes », « nude » ni « sextorsion » à
l'écran et dans les légendes ; pas de prix ni d'offre payante dans la vidéo :
on donne d'abord l'aide gratuite ; ne jamais inviter les gens à raconter leur
histoire en commentaire (les faux « hackers » y cherchent leurs cibles).
