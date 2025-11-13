# Post-its App (Front-end)

Questa è la parte **front-end** di un'applicazione web sviluppata con **React** e **React-Bootstrap**, che permette agli utenti di gestire i propri post-it digitali e il profilo personale.

---

## Descrizione

L’app consente agli utenti di:

- **Autenticarsi** e visualizzare i propri dati profilo.
- **Visualizzare, creare, modificare e cancellare post-it personali**, con colori casuali per differenziare visivamente i contenuti.
- **Gestire il proprio profilo**: aggiornare nome, email, password e immagine del profilo.
- **Effettuare logout** manuale o automatico in caso di cambio email/password.
- **Navigazione responsive**: i contenuti si adattano a diversi dispositivi, con bottoni che si dispongono in colonna su schermi piccoli.

Il front-end comunica con un **backend API REST** (non incluso in questo repository) per autenticazione, gestione utenti e gestione dei post-it.

---

## Funzionalità principali

### Post-its

- Mostra tutti i post-it dell’utente in una griglia responsive.
- Ogni post-it può essere selezionato per **modifica** o **cancellazione** tramite un modal.
- Possibilità di aggiungere nuovi post-it tramite un modal dedicato.
- Scroll funzionante anche su dispositivi piccoli grazie a un wrapper flessibile.

### Profilo

- Visualizzazione dei dati utente: nome, email e immagine.
- Modifica del profilo tramite form con validazioni base (es. password obbligatoria).
- Cancellazione account con conferma password.
- Logout automatico se cambia email o password.
- Freccia di navigazione verso la pagina dei post-it.

---

## Tecnologie principali

- **React** – libreria front-end per componenti e gestione dello stato.
- **React Router** – routing lato client tra `/postits` e `/profile`.
- **React-Bootstrap** – componenti UI predefiniti (Card, Button, Modal, Form, Alert, Spinner).
- **Fetch API** – comunicazione con il backend tramite chiamate REST.
- **CSS personalizzato** – gestione responsive, overflow e layout dei post-it.

---

## Struttura dei componenti

- **`Postits.jsx`** – visualizzazione e gestione dei post-it, modali di aggiunta/modifica.
- **`Profile.jsx`** – gestione del profilo utente, modali di modifica/cancellazione.
- **`App.jsx` / `.app-wrapper`** – wrapper principale con layout responsivo e gestione overflow.

---

## Come usare

1. Clonare il repository front-end:

```bash
git clone <url-repo-frontend>
cd <cartella-progetto>
```
