# LootLoom — Deployment Checklist

## 1. Prerequisites
- Node.js 18+ and npm installed
- Git access to the repository

## 2. Environment Setup
- Copy `.env.example` to `.env`
- Fill in `DATABASE_URL`, `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)
- Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain
- Configure OAuth/SMTP keys if needed

## 3. Database Setup
```bash
npm run db:generate
npm run db:push
npm run seed:all   # optional: seed initial data
```

## 4. Build
```bash
npm run build
```

## 5. Start
```bash
npm start -p 3333
```

## 6. Health Check
Verify `GET /api/stats` returns HTTP 200.

## 7. Backup Instructions
- **Database file**: `prisma/custom.db` (or your configured `DATABASE_URL`)
- **Configuration**: `.env` file
- **Dependencies**: `node_modules/` (reinstallable via `npm ci`)
- **Uploads**: any user-uploaded media directory

## 8. Production Recommendations
- **Reverse proxy**: Use Nginx or Caddy in front of the Node process
- **Process manager**: Run with PM2 (`pm2 start npm --name lootloom -- start -p 3333`)
- **SSL**: Terminate TLS at the reverse proxy (Let's Encrypt)
- **Database**: Consider migrating from SQLite to PostgreSQL for production scale

## 9. Troubleshooting
- **Build fails**: Check Node.js version, run `npm ci` to clean install
- **Prisma errors**: Ensure `DATABASE_URL` is correct and DB is accessible
- **NextAuth issues**: Verify `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches the deployment URL
- **Blank pages**: Check browser console for hydration errors; verify API routes respond correctly
