Inventory management system built with Next.js (App Router), Prisma, Neon (Postgres), NextAuth, Tailwind, and Ant Design.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set values:

```bash
cp .env.example .env
```

3. Run Prisma migration and generate client:

```bash
npx prisma migrate dev --name init
```

4. Start the dev server:

```bash
npm run dev
```

5. Bootstrap the first admin user (only works if no users exist yet):

```bash
curl -X POST http://localhost:3000/api/bootstrap ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@store.com\",\"password\":\"admin123\",\"name\":\"Admin\"}"
```

Then log in at `/login`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
