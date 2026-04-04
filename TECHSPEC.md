# Technical Specification: Shosha Mart B2B Internal Marketplace

## 1. Tech Stack & Tools
* **Core Framework:** Laravel 13+ (PHP 8.2/8.3)
* **Frontend Bridge:** Laravel Inertia.js (The "Glue" between Laravel & React)
* **Frontend Library:** React 19
* **Styling & UI:** TailwindCSS + DaisyUI
* **Database:** Mysql
* **ORM:** Eloquent ORM
* **Authentication:** Laravel Breeze (Session-based, No Public Signup)
* **Worker/Queue:** Laravel Jobs + Upstash (Redis/QStash)
* **Notification:** Fonte API (WhatsApp Gateway)

---

## 2. Database Schema (Eloquent / Turso)

### `users` Table
| Column | Type | Constraints | Note |
| :--- | :--- | :--- | :--- |
| **id** | uuid | Primary Key | Standard UUID |
| **username** | string | Unique | Login identifier |
| **phone** | string | Unique | WhatsApp number for notifications |
| **password** | string | - | Hashed (Bcrypt) |
| **role** | string | - | `SUPERADMIN`, `ADMIN_TIER`, `BUYER` |
| **tier_id** | uuid | Foreign Key | Relation to `tiers` (Nullable for SuperAdmin) |
| **branch_name** | string | - | Branch name identifier for `BUYER` |

### `tiers` Table (Pricing Groups)
| Column | Type | Constraints | Note |
| :--- | :--- | :--- | :--- |
| **id** | uuid | Primary Key | UUID |
| **name** | string | Unique | e.g., 'L24J', 'SHOSHA' |

### `products` Table
| Column | Type | Note |
| :--- | :--- | :--- |
| **id** | uuid | Primary Key | UUID |
| **name** | string | Product Name |
| **sku** | string | Unique SKU |
| **base_price** | bigInteger | Cost price (Only visible to SuperAdmin) |
| **stock** | integer | Global stock count |

### `tier_prices` Table (The Pricing Matrix)
| Column | Type | Note |
| :--- | :--- | :--- |
| **id** | uuid | Primary Key | UUID |
| **product_id** | uuid | Foreign Key to `products` |
| **tier_id** | uuid | Foreign Key to `tiers` |
| **price** | bigInteger | Custom price for this specific tier |

### `orders` Table
| Column | Type | Note |
| :--- | :--- | :--- |
| **id** | uuid | Primary Key | UUID |
| **buyer_id** | uuid | Foreign Key to `users` |
| **tier_id** | uuid | Foreign Key to `tiers` |
| **total_amount** | bigInteger | Calculated based on Tier Price |
| **status** | string | `PENDING`, `APPROVED`, `REJECTED`, `PROCESSED` |
| **rejection_reason**| text | Optional feedback for Buyer |

---

## 3. Core Workflow Implementation

### A. Authentication & Access Control
* **Strict Access:** Route `/register` dinonaktifkan secara permanen di `web.php`. Akun hanya bisa dibuat oleh SuperAdmin melalui Form Admin.
* **Role Protection:** Menggunakan Laravel Middleware.
    * `SuperAdmin`: Akses penuh (Manajemen User, Tier, Produk, & Base Price).
    * `Admin Tier`: Menyetujui/Menolak pesanan dari Buyer di bawah Tier-nya.
    * `Buyer`: Hanya melihat produk dengan harga sesuai Tier-nya dan melakukan order.
* **Session Management:** Menggunakan session bawaan Laravel (lebih stabil di Hostinger dibanding JWT).

### B. Dynamic Pricing Logic
Data dikirim dari Controller ke React via Inertia Props. Query dipastikan hanya mengambil harga yang relevan dengan `tier_id` user yang sedang login.

```php
// Contoh Query di Controller
$products = Product::with(['tier_prices' => function($query) {
    $query->where('tier_id', auth()->user()->tier_id);
}])->get();