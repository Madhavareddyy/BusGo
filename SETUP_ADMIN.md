# BusGo: Initial Administrator Setup Guide

This document outlines the secure procedure for bootstrapping the first system administrator on your Supabase PostgreSQL instance.

---

### Security Rule
In accordance with production security standards, the **Admin** role can **never** be registered through public frontend forms. The database trigger (`handle_new_user`) strictly downgrades any public sign-up claiming the `admin` role to `customer`.

---

### Procedure to Create the Initial Admin

#### Method A: Direct SQL in Supabase SQL Editor (Recommended)

1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. In the left navigation, click on **Authentication -> Users**, and click **Add User**:
   - **Email**: `admin@busgo.in` (or your preferred admin email)
   - **Password**: Enter a strong password (min. 8 characters, with letters, numbers, and symbols)
   - **Auto-Confirm User**: Check this box so the email is immediately verified.
3. Open the **SQL Editor** from the left navigation and run this SQL query:

```sql
-- Elevate the user profile to 'admin'
UPDATE public.profiles
SET 
  role = 'admin',
  status = 'active',
  full_name = 'System Administrator',
  updated_at = NOW()
WHERE email = 'admin@busgo.in';

-- Verify the elevation
SELECT id, email, full_name, role, status FROM public.profiles WHERE email = 'admin@busgo.in';
```

4. You can now log into the BusGo Admin Portal at:
   `http://localhost:3000/admin/login`

---

### Demo Mode Out-of-the-Box Credentials
When running locally without external Supabase credentials, the local fallback engine comes pre-seeded with these ready-to-test accounts:

| Role | Email | Password | Status | Notes |
|---|---|---|---|---|
| **Customer** | `customer@busgo.in` | `Pass@123` | `active` | Standard verified passenger |
| **Operator** | `operator@sunrisetravels.in` | `Pass@123` | `active` | Sunrise Travels fleet manager |
| **Pending Operator** | `operator@pending.in` | `Pass@123` | `pending_approval` | Demonstrates approval gate |
| **Administrator** | `admin@busgo.in` | `Admin@123` | `active` | Full access to Admin Portal |
