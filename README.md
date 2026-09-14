# Shop Expiration Tracker — V1

A free, mobile-friendly prototype for tracking food, drinks and other shop stock by expiration date.

## Run immediately

No installation is required for the prototype.

1. Unzip this folder.
2. Open `index.html` in a browser.
3. Add/edit/delete products.
4. Data is saved in the browser's localStorage.

The sample products can be deleted and replaced with your real stock.

## Important

This first prototype is intentionally zero-cost and works without a server. The `schema.sql` file contains the database design for moving the app to Supabase's free tier when you want multiple devices/users and cloud storage.

## V1 database model

- shops — stores
- profiles — employees/users
- products — product master data
- batches — quantity + expiration date for each delivery/batch
- reminder_settings — warning rules

The batch model is important: the same product can have multiple expiration dates.

## Next upgrade

Connect the interface to Supabase, add login, multi-user access, cloud data, and scheduled email/push reminders. The app can remain a web app/PWA and be used from phones and computers.
