--partialJobStatus=Re-create Buldings Operations and Work Order Index
BEGIN EXECUTE IMMEDIATE 'DROP INDEX HWR_PMS_ID'; EXCEPTION WHEN OTHERS THEN null;END;;

CREATE INDEX hwr_pms_id on hwr (pms_id);