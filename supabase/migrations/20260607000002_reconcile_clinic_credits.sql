-- Reconcile clinic_credits.total_credits_used with actual Completed appointment counts.
-- Only touches clinics where the count differs. Recalculates credit_balance.
-- Uses COUNT(*)::bigint to match clinic_credits column types exactly.

UPDATE clinic_credits cc
SET
  total_credits_used = subq.completed_count,
  credit_balance = cc.total_credits_purchased - subq.completed_count,
  updated_at = NOW()
FROM (
  SELECT clinic_id, COUNT(*)::bigint AS completed_count
  FROM appointments
  WHERE status = 'Completed'
  GROUP BY clinic_id
) subq
WHERE cc.clinic_id = subq.clinic_id
  AND cc.total_credits_used IS DISTINCT FROM subq.completed_count;
