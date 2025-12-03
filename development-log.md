## 2025-12-03 - Fix Credit Validation Bug for Doctors

### Focus
Fix the issue where doctors see "You don't have enough credits to start this consultation" even when credits are available.

### Root Cause Analysis
The bug was caused by **RLS (Row Level Security) policy restrictions**:

1. **RLS Policy Issue**: The `payment_transactions_admin_read` policy only allowed users with `'staff'` or `'superadmin'` roles to read from the `payment_transactions` table.
2. **Doctor Access Denied**: Doctors (`role = 'doctor'`) were blocked by RLS when `canBookAppointment()` tried to query `payment_transactions` to calculate credit balance.
3. **Silent Failure**: The function caught the error and returned `false`, showing "insufficient credits" even when credits existed.

### Changes Made

#### 1. Database Migration (`20251203161000_fix_payment_transactions_rls_for_doctors.sql`)
- **Created new RLS policy**: `payment_transactions_read_for_clinic_members`
- **Added doctor role**: Policy now includes `'doctor'` in addition to `'staff'` and `'superadmin'`
- **Applied to production**: Using MCP Supabase tool

#### 2. Code Improvements (`src/hooks/usePayments.ts`)
- **Enhanced error logging**: Added specific RLS policy error detection
- **Better debugging**: Added console.debug for credit calculation values
- **Error handling**: Separated transaction and appointment query errors

### Technical Details

**Credit Calculation Logic** (unchanged but now accessible to doctors):
- **Total Purchased**: Sum of `credits_purchased` from `payment_transactions` where:
  - `transaction_type = 'credit_purchase'`
  - `payment_status = 'completed'`
  - `clinic_id` matches active clinic
- **Total Used**: Count of appointments with status `"In Progress"` or `"Completed"`
- **Balance**: `total_purchased - total_used`

**Security Context**:
- Multi-tenant isolation preserved (still filters by `clinic_id`)
- Doctors can only read, not modify payment transactions
- RLS policies maintain data isolation between clinics

### Verification
- **Type check passed**: `npx tsc --noEmit --noEmitOnError --project tsconfig.app.json`
- **Migration applied**: Successfully applied to production database
- **Code changes**: Added proper error handling and debugging

### Outcome
The fix should resolve the credit validation issue for doctors. Doctors can now:
1. Read payment transactions to calculate credit balance
2. Start consultations when sufficient credits are available
3. See proper error messages if genuine credit shortages occur

**Next Steps**: Monitor browser console for any remaining RLS errors and verify doctors can start consultations successfully.