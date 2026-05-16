# Blainville RP QC - Dashboard

## Lancement

Utilise:

```bat
start-dashboard.bat
```

Ce script lance `server.mjs`. Le serveur:

- lit le fichier `.env` du dossier dashboard;
- sert le site sur `http://127.0.0.1:4173/index.html`;
- lance le bot Discord dans `../discord-bot`;
- connecte le dashboard a l'API du bot sur `http://127.0.0.1:4174`.

## Variables `.env`

Le dashboard attend au minimum:

```env
DISCORD_TOKEN=token_du_bot
CLIENT_ID=id_application_discord
GUILD_ID=id_du_serveur
```

Options:

```env
DASHBOARD_HOST=0.0.0.0
DASHBOARD_PORT=4173
DASHBOARD_API_URL=http://127.0.0.1:4174
DASHBOARD_PUBLIC_API_URL=
DASHBOARD_START_BOT=true
```

Ne mets jamais le token Discord dans le code front. Le dashboard expose seulement `CLIENT_ID`, `GUILD_ID` et l'URL API.

## GitHub et token

Le fichier `.env` ne doit jamais etre envoye sur GitHub. Il est ignore par `.gitignore`.

Pour partager le projet:

1. garde ton vrai `.env` seulement sur ton PC ou ton serveur;
2. publie `.env.example`;
3. sur ton hebergeur, mets `DISCORD_TOKEN`, `CLIENT_ID` et `GUILD_ID` dans les variables d'environnement;
4. ne mets jamais `DISCORD_TOKEN` dans `app.js`, `index.html` ou un fichier public.

Si tu as deja pousse un token sur GitHub, regenere le token du bot dans Discord Developer Portal.

## Hebergement

Sur un hebergeur, configure la commande de demarrage:

```bash
npm start
```

Le serveur utilise automatiquement `PORT` si l'hebergeur le fournit.

Pour Discord OAuth, ajoute aussi l'URL hebergee exacte dans le portail Discord, par exemple:

```txt
https://ton-domaine.com/index.html
```

Laisse `DASHBOARD_PUBLIC_API_URL` vide si le bot est lance par le meme serveur dashboard. Le navigateur utilisera le meme domaine que le site, ce qui evite les problemes avec `127.0.0.1`.

## Discord Developer Portal

Ajoute cette Redirect URI OAuth2:

```txt
http://127.0.0.1:4173/index.html
```

Active aussi:

- Server Members Intent
- Message Content Intent

Ces intents servent a lire les membres, roles, salaires et messages d'arrestation.
