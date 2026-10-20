# Little Wishlist

A simple CRUD app for a shopping wishlist, built with Next.js, Tailwind CSS, and MySQL. It includes two related database tables (`categories` and `wishlist`), search, filters, add/edit/delete, a purchased checklist, and progress tracking.

## 1. Requirements
- Node.js 18 or newer
- A MySQL database (local or Aiven)
- DBeaver (optional, useful for running the SQL)

## 2. Set up the database
1. Open DBeaver and connect to your MySQL server.
2. Open `database/schema.sql` and execute it.
3. If you're using Aiven, run the script in your Aiven database connection. The script creates `categories` and `wishlist`, then adds a few example rows.

If your Aiven account doesn't allow creating a database, select your existing database in DBeaver and run the script after removing the first two lines (`CREATE DATABASE...` and `USE wishlist_db;`). Set `DB_NAME` to the name of the existing database.

## 3. Configure the app
1. Copy `.env.example` and name the copy `.env.local`.
2. Fill in `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` with the values from Aiven's connection information.
3. Keep `DB_SSL=true` for Aiven. The sample config encrypts the connection but does not verify the server certificate; for a production-grade setup, configure Aiven's CA certificate.

Never commit `.env.local` to GitHub. It is ignored by `.gitignore`.

## 4. Run locally
Open a terminal in this folder and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 5. Deploy
1. Push the project to a GitHub repository (do not upload `.env.local`).
2. Import that repository into Vercel.
3. In Vercel → Project → Settings → Environment Variables, add the same five database values and `DB_SSL=true`.
4. Redeploy after adding environment variables.

The Vercel deployment must be able to reach your Aiven database. Keep your database credentials private.
