# Urban Men Apparel: documentation

Menswear shop for Ghana: a website, an Android app and one shop backend behind both.

| Read | When |
|---|---|
| [01 Overview](01-overview.md) | What the pieces are and how they fit |
| [02 Local setup](02-local-setup.md) | Run everything on your own computer |
| [03 Backend API](03-backend-api.md) | Routes, product data format, how the website and app talk to the backend |
| [04 Roles and access](04-roles-and-access.md) | Who can do what; the root owner rule |
| [05 Going live](05-going-live.md) | Hosting choice, accounts to create, launch checklist |
| [08 Cloud Run](08-cloud-run.md) | Step-by-step: deploy the backend on Google Cloud Run |
| [06 Running the shop](06-operations.md) | Everyday jobs: products, stock, orders, pre-orders, announcements |
| [07 Status and roadmap](07-status-and-roadmap.md) | What is connected, what is still a demo, what is next |

Deeper backend design notes (why Medusa, notifications, scale plan): [apps/backend/ARCHITECTURE.md](../apps/backend/ARCHITECTURE.md).

Rules of the house: the owner (`kkwesi956@gmail.com`) is the only person who can change the owner sign-in; nothing secret
(passwords, API secrets, `.env` files, `client_secret*.json`) is ever committed.
