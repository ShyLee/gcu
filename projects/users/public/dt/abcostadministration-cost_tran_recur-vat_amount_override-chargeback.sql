UPDATE afm_flds SET dflt_val = -1.0 WHERE field_name = 'vat_amount_override' AND table_name IN ('cost_tran', 'cost_tran_recur', 'cost_tran_sched');

ALTER TABLE cost_tran MODIFY vat_amount_override DEFAULT  -1;
ALTER TABLE cost_tran_recur MODIFY vat_amount_override DEFAULT  -1;
ALTER TABLE cost_tran_sched MODIFY vat_amount_override DEFAULT  -1;

UPDATE cost_tran SET vat_amount_override = -1.0 WHERE vat_amount_override = 0.0;
UPDATE cost_tran_recur SET vat_amount_override = -1.0 WHERE vat_amount_override = 0.0;
UPDATE cost_tran_sched SET vat_amount_override = -1.0 WHERE vat_amount_override = 0.0;

COMMIT;