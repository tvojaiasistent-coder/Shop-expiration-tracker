# Shop Expiration Tracker V4

Supabase-backed shop expiration tracker with secure RLS, expiration alerts, and fast barcode stock entry.

V4 flow: scan/type barcode -> find existing product -> enter quantity and expiry -> save a new batch. If the barcode is new, enter product details once. Existing products can therefore have multiple expiration batches.

Deploy by replacing the files in the connected GitHub repository. No new SQL migration is required for V4.
