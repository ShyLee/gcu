--partialJobStatus=Reservation SQL Views

CREATE OR REPLACE VIEW resview AS (SELECT ac_id,attendees,comments,contact,cost_res,date_cancelled,date_created,date_end,date_last_modified,date_start,doc_event,dp_id,dv_id,email,phone,recurring_date_modified,recurring_rule,res_id,res_parent,res_type,reservation_name,status,time_end,time_start,user_created_by,user_last_modified_by,user_requested_by,user_requested_for FROM reserve) UNION ALL (SELECT ac_id,attendees,comments,contact,cost_res,date_cancelled,date_created,date_end,date_last_modified,date_start,doc_event,dp_id,dv_id,email,phone,recurring_date_modified,recurring_rule,res_id,res_parent,res_type,reservation_name,status,time_end,time_start,user_created_by,user_last_modified_by,user_requested_by,user_requested_for FROM hreserve);

CREATE OR REPLACE VIEW resrmview AS (SELECT bl_id,comments,config_id,cost_rmres,date_cancelled,date_created,date_last_modified,date_rejected,date_start,fl_id,guests_external,guests_internal,recurring_order,res_id,rm_arrange_type_id,rm_id,rmres_id,status,time_end,time_start,user_last_modified_by FROM reserve_rm) UNION ALL (SELECT bl_id,comments,config_id,cost_rmres,date_cancelled,date_created,date_last_modified,date_rejected,date_start,fl_id,guests_external,guests_internal,recurring_order,res_id,rm_arrange_type_id,rm_id,rmres_id,status,time_end,time_start,user_last_modified_by FROM hreserve_rm);

CREATE OR REPLACE VIEW resrsview AS (SELECT bl_id,comments,cost_rsres,date_cancelled,date_created,date_last_modified,date_rejected,date_start,fl_id,quantity,recurring_order,res_id,resource_id,rm_id,rsres_id,status,time_end,time_start,user_last_modified_by FROM reserve_rs) UNION ALL (SELECT bl_id,comments,cost_rsres,date_cancelled,date_created,date_last_modified,date_rejected,date_start,fl_id,quantity,recurring_order,res_id,resource_id,rm_id,rsres_id,status,time_end,time_start,user_last_modified_by FROM hreserve_rs);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view)  SELECT 'resview','SQL view combining reserve and hreserve',20,'All Reservations',1  FROM  DUAL WHERE NOT EXISTS (SELECT 1 FROM afm_tbls WHERE table_name = 'resview');

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view)  SELECT 'resrsview','SQL view combining reserve_rs and hreserve_rs',20,'All Resource Reservations',1  FROM  DUAL WHERE NOT EXISTS (SELECT 1 FROM afm_tbls WHERE table_name = 'resrsview');

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view)  SELECT 'resrmview','SQL view combining reserve_rm and hreserve_rm',20,'All Room Reservations',1  FROM  DUAL WHERE NOT EXISTS (SELECT 1 FROM afm_tbls WHERE table_name = 'resrmview');

INSERT INTO afm_flds ( table_name, field_name,afm_type,allow_null,comments, data_type,decimals,dep_cols,dflt_val,edit_group,edit_mask, enum_list,is_atxt,max_val,min_val,ml_heading,afm_module, num_format,primary_key,ref_table,review_group,afm_size, sl_heading,string_format,is_tc_traceable) SELECT 'resview', field_name,afm_type,allow_null,comments, data_type,decimals,dep_cols,dflt_val,edit_group,edit_mask, enum_list,is_atxt,max_val,min_val,ml_heading,afm_module, num_format,primary_key,ref_table,review_group,afm_size, sl_heading,string_format,is_tc_traceable FROM afm_flds WHERE table_name = 'hreserve' AND NOT EXISTS (SELECT 1 FROM afm_flds  afm_flds_inner WHERE afm_flds_inner.table_name = 'resview' AND afm_flds_inner.field_name = afm_flds.field_name);

INSERT INTO afm_flds ( table_name, field_name,afm_type,allow_null,comments, data_type,decimals,dep_cols,dflt_val,edit_group,edit_mask, enum_list,is_atxt,max_val,min_val,ml_heading,afm_module, num_format,primary_key,ref_table,review_group,afm_size, sl_heading,string_format,is_tc_traceable) SELECT 'resrsview', field_name,afm_type,allow_null,comments, data_type,decimals,dep_cols,dflt_val,edit_group,edit_mask, enum_list,is_atxt,max_val,min_val,ml_heading,afm_module, num_format,primary_key,ref_table,review_group,afm_size, sl_heading,string_format,is_tc_traceable FROM afm_flds WHERE table_name = 'hreserve_rs' AND NOT EXISTS (SELECT 1 FROM afm_flds  afm_flds_inner WHERE afm_flds_inner.table_name = 'resrsview' AND afm_flds_inner.field_name = afm_flds.field_name);

UPDATE afm_flds SET ref_table = 'resview', dep_cols = 'res_id', validate_data = 0 WHERE table_name = 'resrsview' AND field_name = 'res_id';

INSERT INTO afm_flds ( table_name, field_name,afm_type,allow_null,comments, data_type,decimals,dep_cols,dflt_val,edit_group,edit_mask, enum_list,is_atxt,max_val,min_val,ml_heading,afm_module, num_format,primary_key,ref_table,review_group,afm_size, sl_heading,string_format,is_tc_traceable) SELECT 'resrmview', field_name,afm_type,allow_null,comments, data_type,decimals,dep_cols,dflt_val,edit_group,edit_mask, enum_list,is_atxt,max_val,min_val,ml_heading,afm_module, num_format,primary_key,ref_table,review_group,afm_size, sl_heading,string_format,is_tc_traceable FROM afm_flds WHERE table_name = 'hreserve_rm' AND NOT EXISTS (SELECT 1 FROM afm_flds  afm_flds_inner WHERE afm_flds_inner.table_name = 'resrmview' AND afm_flds_inner.field_name = afm_flds.field_name);

UPDATE afm_flds SET ref_table = 'resview', dep_cols = 'res_id', validate_data = 0 WHERE table_name = 'resrmview' AND field_name = 'res_id';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrdayrmresplus';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrdayrmresplus';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrwrrestr';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrwrrestr';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrdayrmres';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrdayrmres';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrcostdet';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrcostdet';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrmoncostdp';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrmoncostdp';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrmonusearr';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrmonusearr';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrdayrmocc';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrdayrmocc';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrdayrresplus';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrdayrresplus';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrmonresrej';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrmonresrej';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrdayresocc';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrdayresocc';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrmonthresquant';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrmonthresquant';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrmonnumrres';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrmonnumrres';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrressheet';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrressheet';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrressheetplus';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrressheetplus';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrappdet';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrappdet';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrmonrmcap';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrmonrmcap';

DELETE FROM afm_flds WHERE  afm_flds.table_name = 'rrmonreq';
DELETE FROM afm_tbls WHERE  afm_tbls.table_name = 'rrmonreq';

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrdayrmresplus','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-day-roomres-plus',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrwrrestr','Reservations-v16.3',20,'Used for Reservation Report: ab-rr-rpt-wr-reservation-trade.axvw',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrdayrmres','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-day-roomres',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrcostdet','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-cost-detail',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrmoncostdp','Reservations-v16.3',20,'Used for Reservation ab-rr-rpt-month-cost-department',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrmonusearr','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-month-use-arrangement',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrdayrmocc','Reservations-v16.3',20,'Used for Reservation Report: ab-rr-rpt-day-room-occupation.axvw',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrdayrresplus','Reservations-v16.3',20,'Used for Reservation Report: ab-rr-rpt-day-resourceres-plus.axvw',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrmonresrej','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-month-resource-reject',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrdayresocc','Reservations-v16.3',20,'Used for Reservation Report: ab-rr-rpt-day-resource-occupation',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrmonthresquant','Reservations-v16.3',20,'Used for Reservation Report: ab-rr-rpt-month-resource-quantity',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrmonnumrres','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-month-number-resourceres',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrressheet','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-ressheet',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrressheetplus','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-ressheet',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrappdet','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-approve-detail',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrmonrmcap','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-month-room-capacity',1);

INSERT INTO afm_tbls (table_name,comments,afm_module,title,is_sql_view) VALUES ('rrmonreq','Reservations-v16.3',20,'Used for Reservation Report:ab-rr-rpt-month-requestor',1);

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','comments',12,2000,0,1,0,NULL,2070,40,0,'Reservations-v16.3',20,NULL,'Comments');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','quantity',5,3,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Requested
Quantity');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','rm_arrange_type_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','user_requested_for',1,35,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Requested
For');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','phone',1,20,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Requestor''s
Phone #');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmresplus','total_guest',5,3,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Total Guests');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','bl_id',1,8,0,1,1,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','fl_id',1,4,0,1,2,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','monthtxt',1,20,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','rm_arrange_type_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','rm_id',1,8,0,1,3,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed',NULL);

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','usertype',1,64,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'User Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonreq','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','monthtxt',1,20,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','capacity_use',2,10,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Capacity Use');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','bl_id',1,8,0,1,1,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','rm_arrange_type_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonrmcap','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','resource_std',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Standard');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Resource Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','bl_id',1,8,0,1,1,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonresrej','monthtxt',1,20,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','bl_id',1,8,0,1,1,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','resource_std',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Standard');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonnumrres','monthtxt',1,20,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','fl_id',1,4,0,1,2,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','rm_arrange_type_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','bl_id',1,8,0,1,1,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','monthtxt',1,20,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','rm_id',1,8,0,1,3,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonusearr','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','quantity',5,3,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Quantity or Guests #');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Room Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','rm_arrange_type_id',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','site_id',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','user_requested_by',1,35,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Requested
By');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrappdet','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheet','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheet','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','reservation_name',1,64,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Reservation
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','user_requested_by',1,35,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Requested
By');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrressheetplus','user_requested_for',1,35,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Requested
For');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','total_guest',5,3,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Total Guests');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','tr_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Trade
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','user_requested_for',1,35,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Requested
For');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','vn_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Vendor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','phone',1,20,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Requestor''s
Phone #');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','comments',12,2000,0,1,0,NULL,2070,40,0,'Reservations-v16.3',20,NULL,'Comments');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','name',1,25,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Building
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','reservation_name',1,64,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Reservation
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','rm_arrange_type_id',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','monthtxt',1,20,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmres','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','reservation_name',1,64,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Reservation
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Room Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','rm_arrange_type_id',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','cost',2,10,2,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Cost');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','quantity',5,3,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Quantity or Guests #');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','site_id',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','user_requested_by',1,35,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Requested
By');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrcostdet','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','dv_dp_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code - Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','rm_arrange_type_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','cost',2,10,2,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Cost');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','monthtxt',1,20,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmoncostdp','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','reservation_name',1,64,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Reservation
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','vn_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Vendor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','name',1,25,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Building
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','user_requested_for',1,35,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Requested
For');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','tr_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Trade
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','resource_std',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Standard');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Resource Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','comments',12,2000,0,1,0,NULL,2070,40,0,'Reservations-v16.3',20,NULL,'Comments');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','phone',1,20,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Requestor''s
Phone #');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','quantity',5,3,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Requested
Quantity');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','resource_name',1,32,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Resource
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrresplus','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','name',1,25,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Building
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','tr_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Trade
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','rm_arrange_type_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','total_guest',5,3,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Total Guests');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','phone',1,20,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Requestor''s
Phone #');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','dp_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Department
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','dv_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Division
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','res_id',4,10,0,1,1,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Resource Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','requestor',1,35,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Requested
by');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','description',12,5000,0,1,0,NULL,2070,40,0,'Reservations-v16.3',20,NULL,'Work
Description');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','date_assigned',9,0,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date to
Perform');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','time_assigned',10,0,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time to
Perform Work');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','prob_type',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Problem
Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','quantity',5,3,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Quantity or Guests #');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','resource_name',1,32,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Resource
Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','vn_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Vendor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrwrrestr','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','config_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Configuration
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','fl_id',1,4,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Floor
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','monthtxt',1,7,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','res_id',4,10,0,1,0,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','rm_arrange_type',1,60,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Code Room Arrgmt Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','rm_arrange_type_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Arrangement Type');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','rm_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Room
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','rmres_id',4,10,0,1,1,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Room Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Room Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayrmocc','total_hours',4,10,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Total hours');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','monthtxt',1,7,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','res_id',4,10,0,1,0,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','resource_name',1,32,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Resource
Std. Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','resource_std',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Standard');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','rsres_id',4,10,0,1,1,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Resource Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Resource Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrdayresocc','total_hours',4,10,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Total hours');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','bl_id',1,8,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Building
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','ctry_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Country
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','date_start',9,10,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Date
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','monthtxt',1,7,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Month');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','res_id',4,10,0,1,0,NULL,2070,25,2,'Reservations-v16.3',20,NULL,'Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','resource_id',1,32,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','resource_name',1,32,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Resource
Std. Name');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','resource_std',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Resource
Standard');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','rsres_id',4,10,0,1,1,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Resource Reservation
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','site_id',1,16,0,1,0,NULL,2070,10,0,'Reservations-v16.3',20,NULL,'Site
Code');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','status',1,16,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,'Awaiting App.;Awaiting Approval;Rejected;Rejected;Cancelled;Cancelled;Confirmed;Confirmed;Closed;Closed','Status of
Resource Reservation');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','time_end',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
End');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','time_start',10,8,0,1,0,NULL,2070,5,0,'Reservations-v16.3',20,NULL,'Time
Start');

INSERT INTO afm_flds (table_name,field_name,data_type,afm_size,decimals,allow_null,primary_key,ref_table,afm_type,string_format,num_format, comments,afm_module,enum_list,ml_heading) VALUES ('rrmonthresquant','total_quantity',4,10,0,1,0,NULL,2070,25,0,'Reservations-v16.3',20,NULL,'Total quantity');

CREATE OR REPLACE VIEW rrdayrmresplus AS (SELECT resrmview.bl_id,resrmview.date_start,resrmview.time_start,resrmview.time_end,     resview.res_id,resrmview.fl_id,resrmview.rm_id,'' AS resource_id,0 AS quantity,     resview.user_requested_for,resview.phone,resview.dv_id,resview.dp_id,resrmview.comments,     resrmview.rm_arrange_type_id,resrmview.guests_internal+resrmview.guests_external AS total_guest,resrmview.status,  	 bl.ctry_id,bl.site_id, resview.reservation_name, rm_arrange_type.tr_id,rm_arrange_type.vn_id FROM     resrmview LEFT OUTER JOIN     resview ON resrmview.res_id = resview.res_id LEFT OUTER JOIN     bl ON resrmview.bl_id = bl.bl_id LEFT OUTER JOIN     rm_arrange_type ON resrmview.rm_arrange_type_id =     rm_arrange_type.rm_arrange_type_id) UNION ALL (SELECT resrsview.bl_id,resrsview.date_start,resrsview.time_start,resrsview.time_end,resview.res_id,     resrsview.fl_id,resrsview.rm_id,resrsview.resource_id,resrsview.quantity,resview.user_requested_for,     resview.phone,resview.dv_id,resview.dp_id,resrsview.comments,'' AS rm_arrange_type_id,0 AS total_guests, resrsview.status ,     bl.ctry_id,bl.site_id, resview.reservation_name, resource_std.tr_id, resource_std.vn_id FROM     resrsview LEFT OUTER JOIN     resview ON resrsview.res_id = resview.res_id LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id LEFT OUTER JOIN     resources ON resrsview.resource_id = resources.resource_id LEFT OUTER JOIN     resource_std ON resources.resource_std = resource_std.resource_std LEFT OUTER JOIN     resrmview ON resrsview.res_id = resrmview.res_id);

CREATE OR REPLACE VIEW rrmonreq AS SELECT      Bl.ctry_id, bl.site_id, resrmview.bl_id, resrmview.fl_id, resrmview.rm_id, resrmview.rm_arrange_type_id,      resrmview.date_start, resview.dv_id, resview.dp_id, resview.status, resrmview.config_id, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt,  DECODE('RESERVATION MANAGER',(SELECT group_name FROM afm_groupsforroles WHERE afm_users.role_name =   afm_groupsforroles.role_name and group_name='RESERVATION MANAGER'),   'RESERVATION MANAGER',   DECODE('RESERVATION SERVICE DESK',(SELECT group_name FROM afm_groupsforroles  WHERE afm_users.role_name =    afm_groupsforroles.role_name and group_name='RESERVATION SERVICE DESK'), 	'RESERVATION SERVICE DESK', 	DECODE('RESERVATION APPROVER',(SELECT group_name FROM afm_groupsforroles WHERE afm_users.role_name = 	 afm_groupsforroles.role_name and group_name='RESERVATION APPROVER'), 	 'RESERVATION APPROVER', 	 DECODE('RESERVATION ASSISTANT',(SELECT group_name FROM afm_groupsforroles WHERE afm_users.role_name = 	  afm_groupsforroles.role_name and group_name='RESERVATION ASSISTANT'), 	  'RESERVATION ASSISTANT', 	  DECODE('RESERVATION TRADES',(SELECT group_name FROM afm_groupsforroles WHERE afm_users.role_name = 	   afm_groupsforroles.role_name and group_name='RESERVATION TRADES'), 	   'RESERVATION TRADES', 	   'RESERVATION HOST' 	   ) 	  )     )    )   ) AS usertype FROM      resrmview      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id      LEFT OUTER JOIN em ON resview.user_created_by = em.em_id      LEFT OUTER JOIN afm_users ON afm_users.email = em.email;

CREATE OR REPLACE VIEW rrmonrmcap AS SELECT      Bl.ctry_id, bl.site_id, resrmview.bl_id,resrmview.fl_id,resrmview.rm_id, resrmview.rm_arrange_type_id, resrmview.config_id,      resrmview.date_start, resview.dv_id, resview.dp_id, resrmview.time_start, resrmview.time_end, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt, 	  ROUND(CAST((resrmview.guests_internal+resrmview.guests_external) AS real)/rm_arrange.max_capacity * 100,2) AS capacity_use, resview.status FROM      resrmview      LEFT OUTER JOIN rm_arrange ON rm_arrange.bl_id = resrmview.bl_id AND rm_arrange.fl_id = resrmview.fl_id  AND      rm_arrange.rm_id = resrmview.rm_id  AND  rm_arrange.config_id = resrmview.config_id  AND      rm_arrange.rm_arrange_type_id = resrmview.rm_arrange_type_id      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id;

CREATE OR REPLACE VIEW rrmonresrej AS SELECT      Bl.ctry_id, bl.site_id, resrsview.bl_id,resrsview.fl_id,resrsview.resource_id, resources.resource_std,      resrsview.date_start,resview.dv_id, resview.dp_id,resrsview.status, TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM') AS monthtxt FROM      resrsview      LEFT OUTER JOIN resview ON resrsview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrsview.bl_id      LEFT OUTER JOIN resources ON resrsview.resource_id = resources.resource_id;

CREATE OR REPLACE VIEW rrmonnumrres AS SELECT      Bl.ctry_id, bl.site_id, TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM') AS monthtxt, 	 resrsview.date_start, resrsview.bl_id, resrsview.time_start, resrsview.time_end, resrsview.fl_id, resources.resource_id,     resources.resource_std, resview.dv_id, resview.dp_id,resview.status FROM      resrsview LEFT OUTER JOIN resview ON resrsview.res_id = resview.res_id      LEFT OUTER JOIN bl ON resrsview.bl_id = bl.bl_id      LEFT OUTER JOIN resources ON resrsview.resource_id  = resources.resource_id;

CREATE OR REPLACE VIEW rrmonusearr AS SELECT      Bl.ctry_id, bl.site_id, resrmview.bl_id,resrmview.fl_id,resrmview.rm_id,resrmview.date_start,      resrmview.time_start, resrmview.time_end, resrmview.rm_arrange_type_id, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt,       resview.dv_id, resview.dp_id, resview.status, resrmview.config_id FROM      resrmview      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id;

CREATE OR REPLACE VIEW rrappdet AS (SELECT      resrmview.res_id, resrmview.date_start, resrmview.time_start, resrmview.time_end,      resview.user_requested_by, resrmview.bl_id, resrmview.fl_id, resrmview.rm_id,      resrmview.rm_arrange_type_id, '' AS resource_id, (resrmview.guests_internal+resrmview.guests_external) AS quantity,      resrmview.status, bl.ctry_id, bl.site_id, resrmview.config_id FROM      resrmview      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id      LEFT OUTER JOIN rm_arrange ON rm_arrange.bl_id = resrmview.bl_id  AND  rm_arrange.fl_id = resrmview.fl_id  AND      rm_arrange.rm_id = resrmview.rm_id AND rm_arrange.config_id = resrmview.config_id AND      rm_arrange.rm_arrange_type_id = resrmview.rm_arrange_type_id WHERE    resrmview.date_start - sysdate <= rm_arrange.announce_days AND resrmview.date_start - sysdate >= 0 ) UNION ALL ( SELECT      resrsview.res_id, resrsview.date_start, resrsview.time_start, resrsview.time_end,      resview.user_requested_by, resrsview.bl_id, resrsview.fl_id, resrsview.rm_id,      '' AS rm_arrange_type_id, resrsview.resource_id, resrsview.quantity AS quantity, resrsview.status      , bl.ctry_id, bl.site_id,'' AS config_id FROM      resrsview      LEFT OUTER JOIN resview ON resrsview.res_id = resview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrsview.bl_id      LEFT OUTER JOIN resources ON resources.resource_id = resrsview.resource_id WHERE resrsview.date_start - sysdate <= resources.announce_days AND resrsview.date_start - sysdate >= 0 );

CREATE OR REPLACE VIEW rrressheetplus AS (SELECT 	resview.res_id,	resview.date_start,bl.ctry_id,	bl.site_id,	resrmview.bl_id, 	resrmview.fl_id,resrmview.rm_id,resview.user_created_by,resview.user_requested_by,resview.user_requested_for, 	resview.dv_id,resview.dp_id,resview.reservation_name,resview.status FROM    resview LEFT OUTER JOIN    resrmview ON resview.res_id = resrmview.res_id LEFT OUTER JOIN    bl ON resrmview.bl_id = bl.bl_id) UNION ALL (SELECT resview.res_id,resview.date_start,     bl.ctry_id,bl.site_id,resrsview.bl_id,resrsview.fl_id,resrsview.rm_id,resview.user_created_by,     resview.user_requested_by,resview.user_requested_for,resview.dv_id,resview.dp_id,     resview.reservation_name,resview.status FROM     resview LEFT OUTER JOIN     resrsview ON resview.res_id = resrsview.res_id LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id);

CREATE OR REPLACE VIEW rrressheet AS SELECT DISTINCT res_id, date_start FROM rrressheetplus;

CREATE OR REPLACE VIEW rrdayrmres AS SELECT 	resrmview.bl_id,bl.name,resrmview.date_start,resrmview.time_start, 	resrmview.time_end,resrmview.fl_id,resrmview.rm_id,resrmview.rm_arrange_type_id, 	resrmview.guests_internal+resrmview.guests_external AS total_guest,resview.res_id, 	resview.user_requested_for,resview.phone,resview.dv_id, 	resview.dp_id,resrmview.comments,bl.ctry_id,bl.site_id,resview.reservation_name, 	rm_arrange_type.tr_id,rm_arrange_type.vn_id,resview.status,resrmview.config_id, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt  FROM     resrmview LEFT OUTER JOIN     resview ON resrmview.res_id = resview.res_id LEFT OUTER JOIN     bl ON resrmview.bl_id = bl.bl_id LEFT OUTER JOIN     rm_arrange_type ON resrmview.rm_arrange_type_id = rm_arrange_type.rm_arrange_type_id;

CREATE OR REPLACE VIEW rrcostdet AS   (SELECT 		Resview.dv_id,resview.dp_id,resview.res_id,	resrmview.date_start,resrmview.time_start,resrmview.time_end,resview.user_requested_by, 		resrmview.bl_id,resrmview.fl_id,resrmview.rm_id,resrmview.rm_arrange_type_id, '' AS resource_id, 		(resrmview.guests_internal+resrmview.guests_external) AS quantity,resrmview.cost_rmres AS cost,resrmview.status,bl.ctry_id, 		bl.site_id,	resview.reservation_name, resrmview.config_id FROM     resrmview LEFT OUTER JOIN     resview ON resrmview.res_id = resview.res_id LEFT OUTER JOIN     bl ON bl.bl_id = resrmview.bl_id )	UNION ALL   (SELECT Resview.dv_id,resview.dp_id,resview.res_id,resrsview.date_start,resrsview.time_start,     resrsview.time_end,resview.user_requested_by,resrsview.bl_id,resrsview.fl_id,resrsview.rm_id,     '' AS rm_arrange_type_id, resrsview.resource_id,resrsview.quantity AS quantity,resrsview.cost_rsres AS cost,     resrsview.status,     bl.ctry_id,bl.site_id, resview.reservation_name, '' AS config_id FROM     resrsview LEFT OUTER JOIN     resview ON resrsview.res_id = resview.res_id LEFT OUTER JOIN     bl ON bl.bl_id = resrsview.bl_id );

CREATE OR REPLACE VIEW rrmoncostdp AS (SELECT      bl.ctry_id, bl.site_id, resrmview.bl_id,resrmview.fl_id, resrmview.rm_id, resrmview.rm_arrange_type_id, resrmview.config_id,  	  resrmview.date_start, resview.dv_id, resview.dp_id, RTRIM(resview.dv_id) || ' - ' || RTRIM(resview.dp_id) AS dv_dp_id, 	resrmview.res_id, '' AS resource_id,  resrmview.cost_rmres AS cost, TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') AS monthtxt FROM      resrmview      LEFT OUTER JOIN resview ON resrmview.res_id = resview.res_id      LEFT OUTER JOIN resrsview ON resrsview.res_id = resrmview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrmview.bl_id GROUP BY      bl.ctry_id, bl.site_id,      resrmview.bl_id, resrmview.fl_id, resrmview.date_start,      resview.dv_id, resview.dp_id, resview.dv_id, resrmview.cost_rmres,     resrmview.res_id, resrmview.rm_id, resrmview.rm_arrange_type_id, resrmview.config_id,      resrmview.rm_arrange_type_id)  UNION (SELECT      bl.ctry_id, bl.site_id, resrsview.bl_id,resrsview.fl_id, resrsview.rm_id, '' AS rm_arrange_type_id, '' AS config_id,      resrsview.date_start, resview.dv_id, resview.dp_id, RTRIM(resview.dv_id) || ' - ' || RTRIM(resview.dp_id) AS dv_dp_id,  resrsview.res_id, resrsview.resource_id, 	resrsview.cost_rsres AS cost, TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM') AS monthtxt FROM      resrsview      LEFT OUTER JOIN resview ON resrsview.res_id = resview.res_id      LEFT OUTER JOIN resrmview ON resrsview.res_id = resrmview.res_id      LEFT OUTER JOIN bl ON bl.bl_id = resrsview.bl_id GROUP BY      bl.ctry_id, bl.site_id, resrsview.bl_id,resrsview.fl_id, resrsview.rm_id, rm_arrange_type_id, config_id,      resrsview.date_start, resview.dv_id, resview.dp_id,resrsview.cost_rsres,resrsview.res_id, resrsview.resource_id);

CREATE OR REPLACE VIEW rrdayrresplus AS SELECT resrsview.bl_id,bl.name,resrsview.date_start,resrsview.time_start,resrsview.time_end,resrsview.fl_id,     resrsview.rm_id,resources.resource_name,resrsview.quantity,resview.user_requested_for,resview.phone,     resview.dv_id,resview.dp_id,resrsview.comments,resrsview.status,bl.ctry_id,bl.site_id, resrsview.res_id,     resview.reservation_name,resource_std.tr_id,resource_std.vn_id,resources.resource_std,resources.resource_id FROM     resrsview LEFT OUTER JOIN     resview ON resrsview.res_id = resview.res_id LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id LEFT OUTER JOIN     resources ON resrsview.resource_id = resources.resource_id LEFT OUTER JOIN     resource_std ON resources.resource_std = resource_std.resource_std;

CREATE OR REPLACE VIEW rrwrrestr AS (SELECT wrhwr.bl_id,bl.name,wrhwr.tr_id,wrhwr.date_assigned,wrhwr.time_assigned,wrhwr.prob_type,wrhwr.fl_id, wrhwr.rm_id,'' AS resource_name,0 AS quantity,resrmview.rm_arrange_type_id,resrmview.guests_internal+resrmview.guests_external AS total_guest, wrhwr.requestor,wrhwr.phone,wrhwr.dv_id,wrhwr.dp_id,wrhwr.description,bl.ctry_id,bl.site_id,wrhwr.res_id,wrhwr.status, wrhwr.vn_id,resrmview.config_id FROM     wrhwr LEFT OUTER JOIN     resview ON wrhwr.res_id = resview.res_id LEFT OUTER JOIN     resrmview ON wrhwr.rmres_id = resrmview.rmres_id LEFT OUTER JOIN     bl ON wrhwr.bl_id = bl.bl_id WHERE      (wrhwr.tr_id IS NOT NULL OR wrhwr.vn_id IS NOT NULL) AND      wrhwr.rmres_id IS NOT NULL) UNION ALL (SELECT    wrhwr.bl_id,bl.name,wrhwr.tr_id,wrhwr.date_assigned,wrhwr.time_assigned,wrhwr.prob_type,wrhwr.fl_id,wrhwr.rm_id, 	resources.resource_name,resrsview.quantity,'' AS rm_arrange_type_id, 0 AS total_guest,wrhwr.requestor,wrhwr.phone,wrhwr.dv_id, 	wrhwr.dp_id,wrhwr.description,bl.ctry_id,bl.site_id,wrhwr.res_id,wrhwr.status, wrhwr.vn_id,'' AS config_id FROM     wrhwr LEFT OUTER JOIN     resview ON wrhwr.res_id = resview.res_id LEFT OUTER JOIN     resrsview ON wrhwr.rsres_id = resrsview.rsres_id LEFT OUTER JOIN     bl ON wrhwr.bl_id = bl.bl_id LEFT OUTER JOIN     resources ON resrsview.resource_id = resources.resource_id WHERE     (wrhwr.tr_id IS NOT NULL OR wrhwr.vn_id IS NOT NULL) AND 	 wrhwr.rsres_id IS NOT NULL);

CREATE OR REPLACE VIEW rrdayrmocc  AS SELECT  NVL(resrmview.status,'') AS status,						(CASE WHEN TO_CHAR(resrmview.date_start, 'YYYY') IS NULL THEN NULL 						ELSE 						TO_CHAR(resrmview.date_start, 'YYYY') || '-' || TO_CHAR(resrmview.date_start, 'MM') 						END ) AS monthtxt,						(CASE WHEN  to_char(resrmview.time_end, 'HH24:MI:SS') = '00:00:00' THEN 						(resrmview.time_end + 1 - resrmview.time_start)*24  						ELSE  (resrmview.time_end - resrmview.time_start)*24 END) AS total_hours,	rm_arrange.rm_arrange_type_id,resrmview.rmres_id,resrmview.res_id,rm_arrange.config_id,resrmview.date_start,    (rm_arrange.bl_id || ' ' || rm_arrange.fl_id || ' ' || rm_arrange.rm_id || ' ' || rm_arrange.config_id || ' ' || rm_arrange.rm_arrange_type_id) AS rm_arrange_type,    resrmview.time_start,resrmview.time_end,bl.ctry_id,bl.site_id,rm_arrange.bl_id,	rm_arrange.fl_id,rm_arrange.rm_id FROM     rm_arrange LEFT OUTER JOIN     resrmview ON rm_arrange.bl_id = resrmview.bl_id AND 	rm_arrange.fl_id = resrmview.fl_id AND 	rm_arrange.rm_id = resrmview.rm_id AND    rm_arrange.config_id = resrmview.config_id 	 AND rm_arrange.rm_arrange_type_id = resrmview.rm_arrange_type_id 	LEFT OUTER JOIN rm ON rm.bl_id = resrmview.bl_id AND 	rm.fl_id = resrmview.fl_id AND rm.rm_id = resrmview.rm_id 	LEFT OUTER JOIN bl ON rm_arrange.bl_id = bl.bl_id;

CREATE OR REPLACE VIEW rrdayresocc AS SELECT  (CASE WHEN TO_CHAR(resrsview.date_start, 'YYYY') IS NULL THEN NULL  ELSE  TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM')  END ) AS monthtxt,  resource_std.resource_name || ' (' || (SELECT COUNT(resource_id) FROM resources res2  WHERE res2.resource_std = resources.resource_std) || ')' AS resource_name,(CASE WHEN  to_char(resrsview.time_end, 'HH24:MI:SS') = '00:00:00' THEN 						(resrsview.time_end + 1 - resrsview.time_start)*24  						ELSE  (resrsview.time_end - resrsview.time_start)*24 END) AS total_hours,	resrsview.resource_id,resrsview.status,resrsview.time_start,resrsview.time_end,bl.ctry_id,bl.site_id,resrsview.bl_id, 	resrsview.date_start,resrsview.rsres_id,resrsview.res_id,resource_std.resource_std FROM    resrsview LEFT OUTER JOIN     resources ON resources.resource_id = resrsview.resource_id LEFT OUTER JOIN     resource_std ON resource_std.resource_std = resources.resource_std LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id;

CREATE OR REPLACE VIEW rrmonthresquant AS SELECT  (CASE WHEN TO_CHAR(resrsview.date_start, 'YYYY') IS NULL THEN NULL  ELSE  TO_CHAR(resrsview.date_start, 'YYYY') || '-' || TO_CHAR(resrsview.date_start, 'MM')  END ) AS monthtxt,  resource_std.resource_name || ' (' || (SELECT COUNT(resource_id) FROM resources res2  WHERE res2.resource_std = resources.resource_std) || ')' AS resource_name, resrsview.quantity as total_quantity,	resrsview.resource_id,resrsview.status,resrsview.time_start,resrsview.time_end,bl.ctry_id,bl.site_id,resrsview.bl_id, 	resrsview.date_start,resrsview.rsres_id,resrsview.res_id,resource_std.resource_std FROM    resrsview LEFT OUTER JOIN     resources ON resources.resource_id = resrsview.resource_id LEFT OUTER JOIN     resource_std ON resource_std.resource_std = resources.resource_std LEFT OUTER JOIN     bl ON resrsview.bl_id = bl.bl_id;