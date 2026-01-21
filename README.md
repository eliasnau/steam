# Steamengine

[Steamengine](https://steamdb.codity.net) ist eine Datenbank, die eine Sammlung von auf Steam erhältlichen Computerspielen enthält.

Das DB Schema befindet sich in [packages/db/src/schema/index.ts](https://github.com/eliasnau/steam/blob/main/packages/db/src/schema/index.ts)

## Projekt einrichten

### 1 Dependencies installieren

- Öffne ein Terminal im Projektordner:

```bash
pnpm install
```

---

### 2 Datenbank (PostgreSQL) einrichten

#### 2.1 `.env` Datei anpassen

- Trage in `apps/web/.env` deine PostgreSQL-Verbindungsdaten

---

#### 2.2 Datenbankschema in die DB pushen

- Führe aus:

```bash
pnpm run db:push
```

---

### 3 Entwicklungsserver starten

- Starte die App mit:

```bash
pnpm run dev
```

---

### 4 App im Browser öffnen

[http://localhost:3001](http://localhost:3001)

---
