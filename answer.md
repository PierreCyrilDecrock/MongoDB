# PREMIÈRE PARTIE (Un peu de sysadmin...)

1. Vérifiez qu'aucun processus mongo tourne actuellement sur votre machine. Si c’est le cas, arretez le. Ensuite lancez une instance mongod avec le dbpath par défaut. Connectez-vous sur le shell mongo et affichez le port utilisé et les infos du host depuis le shell.

  // Connexion par défaut
  ```
  > mongod
  > mongo
  ```

  // Seconde connexion sur un autre port et un autre dossier
  ```
  > mongod --dbpath /Users/PierreCyril/Documents/Cours/MongoDB/ --port 27018
  > mongo --port 27018
  ```

  // Afficher le port utilisé depuis le shell mongo
  ```
  > myPort()
  ```

  // Afficher les informations du host
  ```
  > db.hostInfo()
  ```

2. Arretez le processus depuis le shell.
```
> use admi
> db.shutdownServer()
```

3. Lancez à nouveau une instance de mongod mais cette fois, modifiez le dbpath et le fichier de sortie de logs. Connectez vous sur le shell et affichez les infos utilisées pour la configuration du processus. Vérifiez aussi que les logs sont bien écrit dans le fichier avec un `tail -f` ou un `cat`.
```
  > mongod --dbpath /Users/PierreCyril/Documents/Cours/MongoDB/ --port 27018 --logpath /Users/PierreCyril/Documents/Cours/MongoDB/logs.txt
```

  // Affichez les infos utilisées pour la configuration du processus
  ```
  > db.serverCmdLineOpts()
  ```


4. Faites l’import des données contenues dans le fichier zip donnée par l’enseignant afin de construire une base de données appelé “music”.
```
  > mongorestore -d music /Users/PierreCyril/Documents/Cours/MongoDB/mymusic/songs.bson
  ```

# DEUXIÈME PARTIE (MongoDB Queries)

1. Affichez les documents de la collection songs.
```
  > db.songs.find()
  ```

2. Comptez le nombre de documents existants dans la collection songs.
```
  > db.songs.find().count()
  ```

3. Affichez exclusivement les titres des chansons du Coldplay de l’album X&Y.
```
  > db.songs.find({artist:"Coldplay",album: "X&Y"},{title:1, _id: 0})
```
4. Affichez le titre et album des chansons de Stromae, ordonnés par année de la plus récente à la plus ancienne, et triés par ordre alphabétique par titre.
```
  > db.songs.find({artist:"Stromae"},{title:1, album: 1, _id: 0}).sort({year: 1}).sort({title: 1})
  ```

5. Affichez les chansons du group Coldplay dans un tableau, où les éléments sont des strings ayant comme format TITRE (ALBUM).
```
  > db.songs.find({artist:"Coldplay"}).map(function(u){return u.title+"("+u.album+")"})
  ```

6. Affichez, une seule fois, le noms des artistes ayant produit des chansons entre 2002 et 2005.
```
  > db.songs.distinct('artist',{'year': {$gte : 2002, $lte : 2005}})
```
7. Créez une collection recordLabel, qui puisse stocker maximum 3 documents ou 1 KB et dont la structure doit être :
- nom: string
- url: string

La validation doit être stricte. Cherchez les regex nécessaires pour les attributes.

> Obligation de passer en version mongoDB 3.2
```
> brew update
> brew unlink mongodb
> brew install mongodb
```
```
  > db.createCollection( "recordLabel",{ capped: true, size: 1000, max: 3, validator: { $or: [{ name: { $type: "string" } },{ url: { $type: "string", $regex: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/ } }  ]}})
  ```

8. Insérez les 3 registres dans la collection. Qu’est ce qui se passe lorsque vous essayez insérer un 4ème ?
```
> db.recordLabel.insert([{'nom': 'one', 'url': 'https://one.fr'},{'nom': 'two', 'url': 'https://two.fr'},{'nom': 'three', 'url': 'https://three.fr'}])
```
> Résultat :
```
BulkWriteResult({
  "writeErrors" : [ ],
  "writeConcernErrors" : [ ],
  "nInserted" : 3,
  "nUpserted" : 0,
  "nMatched" : 0,
  "nModified" : 0,
  "nRemoved" : 0,
  "upserted" : [ ]
})
```
> Insertion d'un 4ème
```
> db.recordLabel.insert({'nom': 'foor', 'url': 'https://foor.fr'})
WriteResult({ "nInserted" : 1 })
> db.recordLabel.find()
{ "_id" : ObjectId("57659399f2e893384645f662"), "nom" : "one", "url" : "https://one.fr" }
{ "_id" : ObjectId("57659399f2e893384645f663"), "nom" : "two", "url" : "https://two.fr" }
{ "_id" : ObjectId("576593a2f2e893384645f664"), "nom" : "foor", "url" : "https://foor.fr" }
```
> La 4ème valeur remplace la dernière pour n'en conserver que 3 au maximum
9. Modifiez le validator sur la collection afin d’ajouter le pays en utilisant le code (ISO 31661 alpha 2)

```
> db.runCommand({"collMod": "recordLabel","validator": {$and: [{"nom": {$type:"string"}},{"url": {$regex: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/}},{"pays":/^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$/}]}})
```

10. Pour allez plus loin:

a. Qu’est ce que le TTL ?

> Ça signifie "Time To Live". C'est une sorte de date d'expiration que l'on peut ajouter à nos éléments. On peut spécifier qu'au bout de 3600 secondes (1h), l'éléments soit supprimé.

# TROISIÈME PARTIE (Driver MongoDB pour NodeJS)
1. Voir --> populate.js
2. Voir --> favorite.js (Problème, la liste des favoris de dépasse pas 2 de longueur, pourtant le random est bon sur le nombre de favoris)
3. Voir --> note.js
4. Voir --> noFavorite.js et findColdplay.js

# QUATRIÈME PARTIE

**Conceptes de** `CV` **et** `Personne`

## Embbeded Design

Pour le `CV`:
```
{
    id: "X_42"
    name: “Template graphique”
    (...)
    owners: {
        1: {username: "Jon", mail: "jon@mail.com" }
        2: {username: "Peter", mail: "peter@mail.com" }
        (...)
    }
}
```
**Cas d'utilisation:** Une plateforme permettant de choisir un template pour son CV. Un template pourra être utilisé par plusieurs personnes.

Pour la `Personne`:
```
{
    username: "Jon"
    mail: “Template graphique”
    (...)
    cv: {
        title: "CDI Web Designer"
        cursus: {
            (...)
        }
        (...)
    }
}
```
**Cas d'utilisation:** Sur un site de recherche d'emploi où chaque utilisateur à son profil avec son CV ou pour un ATS (Applicant Tracking System).

## Separated Collection Design

On va utiliser deux tables séparées pour les deux éléments. On utilisera ensuite le système de clé étrangère pour les relier.

### Trois possibilités :

##### Première façon:

Table `CV`:
```
{
    id: 42
    title: "CDI Web Designer"
    (...)
}
```
Table `Personne`:
```
{
    id: 24
    username: "Jon"
    (...)
    cv_id: 42
}
```
**Cas d'utilisation :** Lorsque l'on a beaucoup de CV et que les informations associées sont plus souvant amenés à changer. Je reprend l'exemple de la vente de template sur une plateforme candidat.
##### Deuxième façon:

Table `Personne`:
```
{
    id: 24
    username: "Jon"
    (...)
}
```
Table `CV`:
```
{
    id: 42
    Title: "CDI Web Designer"
    (...)
    user_id: 24
}
```
**Cas d'utilisation :** Lorsque l'on a beaucoup de personne et que les informations associées sont plus souvant amenés à changer. Ici le CV sera mis en avant.
##### Troisième façon:
Table `Personne`:
```
{
    id: 24
    username: "Jon"
    (...)
}
```
Table `CV`:
```
{
    id: 42
    Title: "CDI Web Designer"
    (...)
}
```
Table `candidat`:
```
{
    id: 1
    name: "Candidat 1"
    cv_id: 42
    user_id: 24
    (...)
}
```
**Cas d'utilisation :** Ici les deux entités sont séparées et ont utilise leur clé étrangère dans une autre table. C'est utile lorsque les deux entités ont des données qui changent fréquemment. On pourrait imaginer un outil qui met en lien des CV et des profils, pour un système de matching automatique entre type de personne et type de CV par exemple.

## PARTIE FINALE

1. Exportez la collections des chansons.

```
> mongodump --db music --collection songs --out /Users/PierreCyril/Documents/Cours/MongoDB
2016-06-19T01:56:28.863+0200  writing music.songs to
2016-06-19T01:56:28.863+0200  done dumping music.songs (19 documents)
```
2. Exportez la collection des utilisateurs de la base des données n’ayant aucune chanson dans la liste des favorites.
```
> mongodump --db music --collection users --query '{favoriteSongs: {$size: 0}}' --out /Users/PierreCyril/Documents/Cours/MongoDB
2016-06-19T01:58:09.920+0200  writing music.users to
2016-06-19T01:58:09.923+0200  done dumping music.users (93 documents)
```
3. Créez une nouvelle base de données appelé ‘nofavorites’ contenant les utilisateurs exportés.

```
> mongorestore --db no-favorites --collection users /Users/PierreCyril/Documents/Cours/MongoDB/music/users.bson
2016-06-19T02:02:05.645+0200  checking for collection data in /Users/PierreCyril/Documents/Cours/MongoDB/music/users.bson
2016-06-19T02:02:05.646+0200  reading metadata for no-favorites.users from /Users/PierreCyril/Documents/Cours/MongoDB/music/users.metadata.json
2016-06-19T02:02:05.956+0200  restoring no-favorites.users from /Users/PierreCyril/Documents/Cours/MongoDB/music/users.bson
2016-06-19T02:02:06.028+0200  restoring indexes for collection no-favorites.users from metadata
2016-06-19T02:02:06.031+0200  finished restoring no-favorites.users (93 documents)
2016-06-19T02:02:06.031+0200  done
```

4. Recherche: Quelles autres commandes permettent sur mongodb de faire export et import ? Quelles sont les différences avec mongodump et mongorestore ?

**Export :** `mongoexport` et `mongodump`

**Import :** `mongoimport` et `mongorestore,`

La différence entre `mongoexport` et `mongodump` c'est le format qui est utilisé. En effet `mongodump` va créer un fichier BSON qui contiendra toute les informations de la collection y compris tout les typages de données. Pour `mongoexport` c'est un fichier JSON ou CSV qui sera créé. C'est pour celà que Mongo recommande l'utilisation de `mongodump`.

Sources : https://docs.mongodb.com/manual/reference/program/mongoexport/
