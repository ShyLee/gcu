package com.archibus.app.sysadmin.updatewizard.schema.prepare;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.UpdateArchibusSchema;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaTableDef;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Builds project/schema update wizard objects in ARCHIBUS data dictionary and physical database.
 * 
 * @author Catalin Purice
 *         <p>
 *         Suppress PMD in this class.
 *         <p>
 *         Justification: This class have methods that builds hard-coded INSERT and UPDATE
 *         statements needed to prepare the old database for 20.1 ProjUpWiz to run.
 */
@SuppressWarnings("PMD")
// TODO: (VT): Justification does not reference a particular case from the Wiki. Suppressing ALL PMD
// warnings is not recommended.
// CHECKSTYLE:OFF Justification: Suppress "Multiple String Literals" warnings. This class have
// methods that builds hard-coded INSERT and UPDATE statements
// TODO: (VT): I disagree with the justification. The "Multiple String Literals" warnings should be
// fixed.
public class UpdateArchibusSchemaUtilities {
    // add afm_transfer_set table definition into afm_tbls and afm_flds
    // add afm_flds_table table definition into afm_tbls and afm_flds
    // add table_type field to afm_tbls
    // populate table_type field
    // add transfer status field to each table default value = 'NO ACTION'
    /**
     * Insert into afm_flds with fields.
     */
    public static final String AFMFLDS_FIELDS =
            "INSERT INTO AFM_FLDS(TABLE_NAME,FIELD_NAME,AFM_TYPE,ALLOW_NULL,COMMENTS,DATA_TYPE,DECIMALS,DEP_COLS,DFLT_VAL,EDIT_GROUP,EDIT_MASK,ENUM_LIST,IS_ATXT,MAX_VAL,MIN_VAL,ML_HEADING,AFM_MODULE,NUM_FORMAT,PRIMARY_KEY,REF_TABLE,REVIEW_GROUP,AFM_SIZE,SL_HEADING,STRING_FORMAT,IS_TC_TRACEABLE,FIELD_GROUPING,VALIDATE_DATA) ";
    
    /**
     * Insert into afm_tbls with fields.
     */
    private static final String AFMTBLS_FIELDS =
            "INSERT INTO AFM_TBLS(TABLE_NAME,COMMENTS,AFM_MODULE,TITLE,IS_SQL_VIEW,TITLE_CH,TITLE_DE,TITLE_ES,TITLE_FR,TITLE_IT,TITLE_JP,TITLE_KO,TITLE_NL,TITLE_NO,TITLE_ZH,TITLE_01,TITLE_02,TITLE_03) ";
    
    /**
     * Constant.
     */
    private static final int ENUM_LIST_SIZE = 850;
    
    /**
     * Returns ARCHIBUS fields statements for afm_flds_trans table.
     * 
     * @return insert statements
     */
    public List<String> getInsertIntoAfmFldsForAfmFldsTrans() {
        
        final List<String> vString = new ArrayList<String>();
        
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','comments',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Comments',0,0,0,null,null,200,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','autonumbered_id',2070,0,'v19.1 ProjUpWiz',4,0,null,'AUTOINCREMENT','SYSTEM MGR',null,null,0,null,'0','Autonumbered "
                    + "ID',0,2,1,null,null,10,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','rec_action',2050,0,'v19.1 ProjUpWiz',1,0,null,'NO ACTION','SYSTEM MGR',null,'NO ACTION;No Action;APPLY CHANGE;Apply Change;KEEP EXISTING;Keep Existing;DELETE FIELD;Delete Field;',0,null,null,'Action - "
                    + "Recommended',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','allow_null',2050,0,'v19.1 ProjUpWiz',5,0,null,'1','SYSTEM MGR',null,'0;No;1;Yes',0,null,null,'Allow "
                    + "Null',0,0,0,null,null,0,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','afm_module',2050,1,'v19.1 ProjUpWiz',5,0,null,'1','SYSTEM MGR',null,'0;Schema;1;All;2;Space;3;F&E;4;BldgOps;5;Lease;6;T&C;7;Design;8;Space Plus;9;Planning;20;Other',0,null,null,'Domain "
                    + "Name',0,0,0,null,null,1,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','afm_type',2050,0,'v19.1 ProjUpWiz',5,0,null,'2050','SYSTEM MGR',null,'2050;None;2090;Block;2100;Dwgname;2105;Ehandle;2110;Std;2115;Layr;2120;Area;2125;Len;2055;Desc;2075;XDim;2080;YDim;2085;ZDim;2095;Std. Area;2150;Hierarchical;2155;Hierarchical-Concat;2160;Hierarchical Trace;2135;HPattern;2140;HPattern Acad;2145;HPattern Acad Ext;2060;Graphic;2165;Document;2065;Bar code;2070;Calculated;2068;Calc-Bar Code;2200;Tc Level;2210;Tc Container;2220;Tc Multiplexing; 2230;Tc Contained Tbls;2240;Tc nPositions;2241;Tc Ca Std Max Length;2242;Tc Ca Std Layer;2243;Tc Ca Std Width;2244;Tc Ca Std Color;2170;Doc Stg',0,null,null,'ARCHIBUS "
                    + "Type',0,0,0,null,null,0,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','data_type',2050,0,'v19.1 ProjUpWiz',5,0,null,'1','SYSTEM MGR',null,'1;Char;4;Integer;5;Smallint;2;Numeric;6;Float;7;Real;8;Double;9;Date;10;Time;12;Varchar;-1;LongVarchar',0,null,null,'Data "
                    + "Type',0,0,0,null,null,0,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','decimals',2050,0,'v19.1 ProjUpWiz',5,0,null,'0','SYSTEM MGR',null,null,0,'15','0','Decimals',0,0,0,null,null,0,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','dep_cols',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Fields to "
                    + "Validate',0,0,0,null,null,64,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','dflt_val',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Default "
                    + "Value',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','edit_group',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Edit "
                    + "Group',0,0,0,null,null,64,null,20,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','edit_mask',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Edit "
                    + "Mask',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','enum_list',2050,1,'v19.1 ProjUpWiz',12,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Enumeration "
                    + "List',0,0,0,null,null,850,null,40,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','field_grouping',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Field "
                    + "Grouping',0,0,0,null,null,16,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','field_name',2050,0,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Field "
                    + "Name',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','is_atxt',2050,0,'v19.1 ProjUpWiz',5,0,null,'0','SYSTEM MGR',null,'0;0;1;1;2;2;3;3;4;4;5;5;6;6;7;7;8;8;9;9;10;10;11;11;12;12;13;13;14;14;15;15;16;16;17;17;18;18;19;19;20;20',0,null,null,'Is Asset "
                    + "Text?',0,0,0,null,null,0,null,25,0,null,1)");
        
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','is_tc_traceable',2050,0,'v19.1 ProjUpWiz',5,0,null,'0','SYSTEM MGR',null,'0;0;1;1;2;2;3;3;4;4;5;5;6;6;7;7;8;8;9;9;10;10;11;11;12;12;13;13;14;14;15;15;16;16;17;17;18;18;19;19;20;20',0,null,null,'Is Telecom "
                    + "Traceable?',0,0,0,null,null,2,null,25,0,null,1)");
        
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','max_val',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Maximum "
                    + "Value',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','min_val',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Minimum "
                    + "Value',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','ml_heading',2055,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Multi-Line "
                    + "Heading',0,0,0,null,null,128,null,30,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','num_format',2050,0,'v19.1 ProjUpWiz',5,0,null,'0','SYSTEM MGR',null,'0;Default;1;Money;2;NoSeparator',0,null,null,'Numeric "
                    + "Format',0,0,0,null,null,0,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','primary_key',2050,0,'v19.1 ProjUpWiz',5,0,null,'0','SYSTEM MGR',null,'0;0;1;1;2;2;3;3;4;4;5;5;6;6;7;7;8;8;9;9;10;10;11;11;12;12;13;13;14;14;15;15',0,null,null,'Primary "
                    + "Key',0,0,0,null,null,0,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','ref_table',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Validating "
                    + "Table',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','review_group',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Review "
                    + "Group',0,0,0,null,null,64,null,20,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','sl_heading',2050,1,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Single-Line "
                    + "Heading',0,0,0,null,null,64,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','string_format',2050,0,'v19.1 ProjUpWiz',5,0,null,'5','SYSTEM MGR',null,'5;AnyChar;10;Upper;15;UpperAlpha;20;UpperAlphaNum;25;Numbers;30;Multiline;35;Mask;40;Memo',0,null,null,'String "
                    + "Format',0,0,0,null,null,0,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','table_name',2050,0,'v19.1 ProjUpWiz',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Table "
                    + "Name',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','validate_data',2050,0,'v19.1 ProjUpWiz',5,0,null,'1','SYSTEM MGR',null,'0;No;1;Yes',0,null,null,'Validate "
                    + "Data?',0,0,0,null,null,1,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','transfer_status',2050,0,'v19.1 ProjUpWiz',1,0,null,'NO CHANGE','SYSTEM MGR',null,'INSERTED;Inserted;UPDATED;Updated;NO CHANGE;No Change;MISSING;Missing;PENDING;Pending;ERROR;Error;',0,null,null,'Data Transfer Status',1,0,0,null,null,10,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','change_type',2050,0,'v19.1 ProjUpWiz',1,0,null,'NONE','SYSTEM MGR',null,'NONE;None;NO_DEFAULT;Default Value not in Enum;NEW;Field is new;PROJECT_ONLY;Field is only in project;ALLOW_NULL;Is Null?;AFM_TYPE;AFM Type;ATTRIBUTES;Attributes;COMMENTS;Comments;DATA_TYPE;Data Type;"
                    + "DECIMALS;Decimals;DEP_COLS;Dependent Columns;DFLT_VAL;Default Value;EDIT_GROUP;Edit Group;EDIT_MASK;Edit Mask;ENUM_LIST;Enum "
                    + "List;FIELD_GROUPING;Field Grouping;IS_ATXT;Is Asset Text;IS_TC_TRACEABLE;Is Tc_Traceable;MAX_VAL;Maximum Val;MIN_VAL;Minimum Val;ML_HEADING;Multiline Heading;NUM_FORMAT;Numeric Format;PRIMARY_KEY;Primary "
                    + "Key;REF_TABLE;Reference Table;REVIEW_GROUP;Review Group;SIZE;Size;SL_HEADING;Single Line Heading;STRING_FORMAT;String Format;VALIDATE;Validate Data;',0,null,null,'Field "
                    + "Differs In',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','data_dict_diffs',2050,1,'v19.1 ProjUpWiz',12,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Data Dictionary "
                    + "Differences',0,0,0,null,null,256,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','sql_table_diffs',2050,1,'v19.1 ProjUpWiz',12,0,null,null,'SYSTEM MGR',null,null,0,null,null,'SQL Table "
                    + "Differences',0,0,0,null,null,256,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','chosen_action',2050,0,'v19.1 ProjUpWiz',1,0,null,'NO ACTION','SYSTEM MGR',null,'NO ACTION;No Action;APPLY CHANGE;Apply Change;KEEP EXISTING;Keep Existing;DELETE FIELD;Delete Field;',0,null,null,'Action - "
                    + "Chosen',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','afm_size',2050,0,'v19.1 ProjUpWiz',5,0,null,'1','SYSTEM MGR',null,null,0,'32767','0','Size',0,0,0,null,null,0,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_flds_trans','attributes',2050,1,'v19.1 ProjUpWiz',12,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Field "
                    + "Attributes',0,0,0,null,null,2000,null,40,0,null,1)");
        
        return vString;
    }
    
    /**
     * Returns ARCHIBUS fields statements for afm_transfer_set table.
     * 
     * @return insert statements
     */
    public List<String> getInsertIntoAfmFldsForAfmTransferSetStmt() {
        
        final List<String> vString = new ArrayList<String>();
        
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','nrecords_inserted',2070,0,'v19.1 ProjUpWiz',4,0,null,0,null,null,null,0,null,0,'RecordsInserted',0,0,0,null,null,10,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','nrecords_missing',2070,0,'v19.1 ProjUpWiz',4,0,null,0,null,null,null,0,null,0,'RecordsMissing',0,0,0,null,null,10,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','table_type',2070,1,'v19.1 ProjUpWiz',1,0,null,null,null,null,null,0,null,null,'TableType',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','table_name',2070,0,'v19.1 ProjUpWiz',1,0,null,0,null,null,null,0,null,null,'TableName',0,0,0,null,null,32,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','autonumbered_id',2070,0,'v19.1 ProjUpWiz',4,0,null,'AUTOINCREMENT',null,null,null,0,null,0,'AutonumberedID',0,2,1,null,null,10,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','set_name',2070,0,'v19.1 ProjUpWiz',1,0,null,0,null,null,null,0,null,null,'DataTransfer Set',0,0,0,null,null,64,null,5,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','nrecords_source',2070,0,'v19.1 ProjUpWiz',4,0,null,0,null,null,null,0,null,0,'Records inSource Extract File',0,0,0,null,null,10,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','nrecords_dest',2070,0,'v19.1 ProjUpWiz',4,0,null,0,null,null,null,0,null,0,'Records inDestination Table',0,0,0,null,null,10,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','nrecords_updated',2070,0,'v19.1 ProjUpWiz',4,0,null,0,null,null,null,0,null,0,'RecordsUpdated',0,0,0,null,null,10,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','processing_order',2070,0,'v19.1 ProjUpWiz',5,0,null,0,null,null,null,0,null,0,'ProcessingOrder',0,0,0,null,null,10,null,25,0,null,1)");
        vString
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_transfer_set','status',2070,0,'v19.1 ProjUpWiz',1,0,null,'NONE',null,null,'NONE;None;PENDING;Pending;IN PROCESS;In Process;EXPORTED;Exported;COMPARED;Compared;IMPORTED;Imported;NO EXTRACT FILE;No Extract File;NO PROJECT TABLE;No Project Table;NOT PROCESSED;Not Processed;UPDATED;Updated',0,null,null,'Status',0,0,0,null,null,17,null,5,0,null,1)");
        
        return vString;
    }
    
    /**
     * Adds default_view and transfer status and table_type fields.
     * 
     * @return INSERT statements
     */
    
    public List<String> getInsertIntoAfmFldsStmt() {
        final List<String> vString = new ArrayList<String>();
        
        if (!ProjectUpdateWizardUtilities.isFieldInArchibus(ProjectUpdateWizardConstants.AFM_TBLS,
            "default_view")) {
            final String sqlInsert1 =
                    AFMFLDS_FIELDS
                            + " VALUES ('afm_tbls','default_view',2050,1,'v19.1',1,0,null,null,null,null,null,0,null,null,'Default View',0,0,0,null,null,64,null,5,0,null,1)";
            vString.add(sqlInsert1);
        }
        if (!ProjectUpdateWizardUtilities.isFieldInArchibus(ProjectUpdateWizardConstants.AFM_TBLS,
            "table_type")) {
            final String sqlInsert2 =
                    AFMFLDS_FIELDS
                            + " VALUES ('afm_tbls','table_type',2050,0,'v19.1 ProjUpWiz',1,0,null,'PROJECT DATA',null,null,'PROJECT SECURITY;Project Security;PROJECT APPLICATION DATA;Project Application Data;PROJECT DATA;Project Data;DATA DICTIONARY;Data Dictionary;APPLICATION DICTIONARY;Application Dictionary;PROCESS NAVIGATOR;Process Navigator;',0,null,null,'TableType',0,0,0,null,null,32,null,5,0,null,1)";
            vString.add(sqlInsert2);
        }
        if (!ProjectUpdateWizardUtilities.isFieldInArchibus(ProjectUpdateWizardConstants.AFM_TBLS,
            "transfer_status")) {
            final String sqlInsert3 =
                    AFMFLDS_FIELDS
                            + " VALUES ('afm_tbls','transfer_status',2050,0,'v19.1',1,0,null,'NO CHANGE',null,null,'INSERTED;Inserted;UPDATED;Updated;NO CHANGE;No Change;MISSING;Missing;PENDING;Pending;ERROR;Error;',0,null,null,'Data Transfer Status',1,0,0,null,null,10,null,5,0,null,1)";
            vString.add(sqlInsert3);
        }
        if (!ProjectUpdateWizardUtilities.isFieldInArchibus(ProjectUpdateWizardConstants.AFM_FLDS,
            "transfer_status")) {
            final String sqlInsert3 =
                    AFMFLDS_FIELDS
                            + " VALUES ('afm_flds','transfer_status',2050,0,'v19.1',1,0,null,'NO CHANGE',null,null,'INSERTED;Inserted;UPDATED;Updated;NO CHANGE;No Change;MISSING;Missing;PENDING;Pending;ERROR;Error;',0,null,null,'Data Transfer Status',1,0,0,null,null,10,null,5,0,null,1)";
            vString.add(sqlInsert3);
        }
        
        return vString;
    }
    
    /**
     * Adds afm_transfer_set and afm_flds_trans tables.
     * 
     * @return insert statements
     */
    public List<String> getInsertProjUpWizTablesStmt() {
        
        final List<String> vString = new ArrayList<String>();
        if (!ProjectUpdateWizardUtilities
            .isTableInArchibus(ProjectUpdateWizardConstants.AFM_TRANSFER_SET)) {
            final String sqlInsert1 =
                    AFMTBLS_FIELDS
                            + " VALUES ('afm_transfer_set','v19.1 ProjUpWiz',0,'ARCHIBUS Fields Definition Transfer',0,null,null,null,null,null,null,null,null,null,null,null,null,null)";
            vString.add(sqlInsert1);
            vString.addAll(getInsertIntoAfmFldsForAfmTransferSetStmt());
        }
        if (!ProjectUpdateWizardUtilities
            .isTableInArchibus(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)) {
            final String sqlInsert2 =
                    AFMTBLS_FIELDS
                            + " VALUES ('afm_flds_trans','v19.1 ProjUpWiz',0,'ARCHIBUS Transfer Set',0,null,null,null,null,null,null,null,null,null,null,null,null,null)";
            vString.add(sqlInsert2);
            vString.addAll(getInsertIntoAfmFldsForAfmFldsTrans());
        }
        return vString;
    }
    
    /**
     * add work-flows rules.
     */
    public void addGetJobStatusWfRuleId() {
        final String[] fields =
                { "xml_rule_props", "is_active", "rule_type", "description", "activity_id",
                        "rule_id" };
        final DataSource wfrDs =
                DataSourceFactory.createDataSourceForFields("afm_wf_rules", fields);
        final DataRecord record = wfrDs.createNewRecord();
        record
            .setValue(
                "afm_wf_rules.xml_rule_props",
                "<xml_rule_properties description=\"Get job status\">\r\n"
                        + "            <eventHandlers>\r\n"
                        + "                <eventHandler class=\"com.archibus.eventhandler.JobHandlers\" method=\"getJobStatus\">\r\n"
                        + "                    <inputs>\r\n" + "                    </inputs>\r\n"
                        + "                </eventHandler>\r\n"
                        + "            </eventHandlers>\r\n" + "        </xml_rule_properties>");
        
        record.setValue("afm_wf_rules.is_active", 1);
        record.setValue("afm_wf_rules.rule_type", "Message");
        record.setValue("afm_wf_rules.description", "Get job status");
        record.setValue("afm_wf_rules.activity_id", "AbCommonResources");
        record.setValue("afm_wf_rules.rule_id", "getJobStatus");
        wfrDs.saveRecord(record);
        wfrDs.commit();
    }
    
    /**
     * add stopJob workflow rule.
     */
    public void addStopJobWfRuleId() {
        final String[] fields =
                { "xml_rule_props", "is_active", "rule_type", "description", "activity_id",
                        "rule_id" };
        final DataSource wfrDs =
                DataSourceFactory.createDataSourceForFields("afm_wf_rules", fields);
        final DataRecord record = wfrDs.createNewRecord();
        record
            .setValue(
                "afm_wf_rules.xml_rule_props",
                "<xml_rule_properties description=\"Stop Job\">\r\n"
                        + "            <eventHandlers>\r\n"
                        + "                <eventHandler class=\"com.archibus.eventhandler.JobHandlers\" method=\"stopJob\">\r\n"
                        + "                    <inputs>\r\n" + "                    </inputs>\r\n"
                        + "                </eventHandler>\r\n"
                        + "            </eventHandlers>\r\n" + "        </xml_rule_properties>");
        
        record.setValue("afm_wf_rules.is_active", 1);
        record.setValue("afm_wf_rules.rule_type", "Message");
        record.setValue("afm_wf_rules.description", "Get job status");
        record.setValue("afm_wf_rules.activity_id", "AbCommonResources");
        record.setValue("afm_wf_rules.rule_id", "stopJob");
        wfrDs.saveRecord(record);
        wfrDs.commit();
    }
    
    /**
     * add workflow rules.
     */
    public void addGetDataRecordsWfRuleId() {
        final String[] fields =
                { "xml_rule_props", "is_active", "rule_type", "description", "activity_id",
                        "rule_id" };
        final DataSource wfrDs =
                DataSourceFactory.createDataSourceForFields("afm_wf_rules", fields);
        final DataRecord record = wfrDs.createNewRecord();
        record
            .setValue(
                "afm_wf_rules.xml_rule_props",
                "<xml_rule_properties description=\"Returns data records for the report grid\">\r\n"
                        + "            <eventHandlers>\r\n"
                        + "                <eventHandler class=\"com.archibus.eventhandler.ViewHandlers\" method=\"getDataRecords\">\r\n"
                        + "                    <inputs>\r\n" + "                    </inputs>\r\n"
                        + "                </eventHandler>\r\n"
                        + "            </eventHandlers>\r\n" + "        </xml_rule_properties>");
        record.setValue("afm_wf_rules.is_active", 1);
        record.setValue("afm_wf_rules.rule_type", "Message");
        record.setValue("afm_wf_rules.description", "Returns data records for the report grid");
        record.setValue("afm_wf_rules.activity_id", "AbCommonResources");
        record.setValue("afm_wf_rules.rule_id", "getDataRecords");
        wfrDs.saveRecord(record);
        wfrDs.commit();
    }
    
    /**
     * add workflow rules.
     */
    public void addGetDataRecordWfRuleId() {
        final String[] fields =
                { "xml_rule_props", "is_active", "rule_type", "description", "activity_id",
                        "rule_id" };
        final DataSource wfrDs =
                DataSourceFactory.createDataSourceForFields("afm_wf_rules", fields);
        final DataRecord record = wfrDs.createNewRecord();
        record
            .setValue(
                "afm_wf_rules.xml_rule_props",
                "<xml_rule_properties description=\"Returns data record for the form\">\r\n"
                        + "            <eventHandlers>\r\n"
                        + "                <eventHandler class=\"com.archibus.eventhandler.ViewHandlers\" method=\"getDataRecord\">\r\n"
                        + "                    <inputs>\r\n" + "                    </inputs>\r\n"
                        + "                </eventHandler>\r\n"
                        + "            </eventHandlers>\r\n" + "        </xml_rule_properties>");
        record.setValue("afm_wf_rules.is_active", 1);
        record.setValue("afm_wf_rules.rule_type", "Message");
        record.setValue("afm_wf_rules.description", "Returns data record for the form");
        record.setValue("afm_wf_rules.activity_id", "AbCommonResources");
        record.setValue("afm_wf_rules.rule_id", "getDataRecord");
        wfrDs.saveRecord(record);
        wfrDs.commit();
    }
    
    /**
     * updates afm_flds_trans.enum_list.
     */
    public void updateChangeTypeEnumList() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        EventHandlerBase
            .executeDbSql(
                context,
                "UPDATE afm_flds SET enum_list='NONE;None;CIRC_REF;Field has circular reference;NO_DEFAULT;Default Value not in Enum;NO_DB_VAL_IN_ENUM;Database Value not in Enum;NEW;Field is new;TBL_IS_NEW;Table is new;TBL_IN_PROJ_ONLY;Table is only in project;PROJECT_ONLY;Field is only in project;ALLOW_NULL;Is Null?;AFM_TYPE;AFM Type;ATTRIBUTES;Attributes;COMMENTS;Comments;DATA_TYPE;Data Type;DECIMALS;Decimals;DEP_COLS;Dependent Columns;DFLT_VAL;Default Value;EDIT_GROUP;Edit Group;EDIT_MASK;Edit Mask;ENUM_LIST;Enum List;FIELD_GROUPING;Field Grouping;IS_ATXT;Is Asset Text;IS_TC_TRACEABLE;Is Tc_Traceable;MAX_VAL;Maximum Val;MIN_VAL;Minimum Val;ML_HEADING;Multiline Heading;NUM_FORMAT;Numeric Format;PRIMARY_KEY;Primary Key;REF_TABLE;Reference Table;REVIEW_GROUP;Review Group;SIZE;Size;SL_HEADING;Single Line Heading;STRING_FORMAT;String Format;VALIDATE;Validate Data' WHERE table_name='afm_flds_trans' AND field_name='change_type'",
                false);
        SqlUtils.commit();
    }
    
    /**
     * Adds "In Process" status because for v19.3 DB versions is missing.
     */
    public void addInProcessStatus() {
        SqlUtils
            .executeUpdate(
                ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
                "UPDATE afm_flds SET enum_list='NONE;None;PENDING;Pending;IN PROCESS;In Process;EXPORTED;Exported;COMPARED;Compared;IMPORTED;Imported;NO EXTRACT FILE;No Extract File;NO PROJECT TABLE;No Project Table;NOT PROCESSED;Not Processed;UPDATED;Updated' WHERE table_name='afm_transfer_set' and field_name='status'");
        SqlUtils.commit();
    }
    
    /**
     * Adds "REVIEW ERROR" recommended action because for v19.3 DB versions is missing.
     */
    public void addReviewErrorRecAction() {
        SqlUtils
            .executeUpdate(
                ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
                "UPDATE afm_flds SET enum_list='NO ACTION;No Action;APPLY CHANGE;Apply Change;KEEP EXISTING;Keep Existing;DELETE FIELD;Delete Field;REVIEW ERROR;Review error' WHERE table_name='afm_flds_trans' and field_name='rec_action'");
        SqlUtils.commit();
    }
    
    /**
     * updates afm_tbls.table_type for data dictionary.
     */
    public void setDataDictionaryTables() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        EventHandlerBase
            .executeDbSql(
                context,
                "UPDATE afm_tbls SET table_type='DATA DICTIONARY' WHERE table_name IN ('afm_tbls', 'afm_flds', 'afm_flds_lang')",
                false);
        SqlUtils.commit();
    }
    
    /**
     * Gets afm_wf_rules insert statements.
     * 
     * @return insert statements
     */
    public List<String> getWfRulesTableStmts() {
        final List<String> sqlStmts = new ArrayList<String>();
        sqlStmts
            .add(AFMTBLS_FIELDS
                    + " VALUES ('afm_wf_rules','v15.1',0,'Workflow Rules',0,null,null,null,null,null,null,null,null,null,null,null,null,null)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','activity_id',2050,0,'Trinidad',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'PrimaryActivity',"
                    + "0,0,1,'afm_activities',null,32,null,5,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','description',2050,1,'Trinidad',12,0,null,null,'SYSTEM MGR',null,null,0,null,null,'Description',"
                    + "0,0,0,null,null,500,null,40,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','dwgname',2100,1,'Trinidad',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'DrawingName',"
                    + "0,0,0,null,null,64,null,10,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','ehandle',2105,1,'Trinidad',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'EntityHandle',"
                    + "0,0,0,null,null,16,null,20,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','group_name',2050,1,'Trinidad',1,0,null,null,'SYSTEM MGR',null,null,0,null,null,'SecurityGroup',"
                    + "0,0,0,'afm_groups',null,64,null,10,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','is_active',2050,0,'Trinidad',5,0,null,0,'SYSTEM MGR',null,'0;No;1;Yes',0,null,null,'Active?',"
                    + "0,0,0,null,null,1,null,5,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','rule_id',2050,0,'Trinidad',1,0,null,null,'SYSTEM MGR',null,null,2,null,null,'RuleName',"
                    + "0,0,2,null,null,64,null,5,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','rule_type',2050,0,'Trinidad',1,0,null,'Message','SYSTEM MGR',null,'Message;Message;Notification;Notification;Scheduled;Scheduled;',0,null,null,'RuleType',"
                    + "0,0,0,null,null,20,null,5,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','transfer_status',2050,0,'v19.1',1,0,null,'NO CHANGE',null,null,'INSERTED;Inserted;UPDATED;Updated;NO CHANGE;No Change;MISSING;Missing;PENDING;Pending;ERROR;Error;',0,null,null,'DataTransferStatus',"
                    + "1,0,0,null,null,10,null,5,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','xml_rule_props',2050,1,'Trinidad',12,0,null,null,'SYSTEM MGR',null,null,0,null,null,'XML RuleProperties',"
                    + "0,0,0,null,null,4000,null,40,0,null,1)");
        sqlStmts
            .add(AFMFLDS_FIELDS
                    + " VALUES ('afm_wf_rules','xml_sched_props',2050,1,'Trinidad',12,0,null,null,'SYSTEM MGR',null,null,0,null,null,'XML ScheduleProperties',"
                    + "0,0,0,null,null,3000,null,40,0,null,1)");
        
        return sqlStmts;
    }
    
    /**
     * 
     * @param activityId activity id
     * @param ruleId rule id
     * @return true if the wfr is defined in afm_wf_rules table and false otherwise
     */
    public boolean wfrExists(final String activityId, final String ruleId) {
        final DataSource wfrDs =
                DataSourceFactory.createDataSource().addTable("afm_wf_rules")
                    .addField("activity_id")
                    .addRestriction(Restrictions.eq("afm_wf_rules", "activity_id", activityId))
                    .addRestriction(Restrictions.eq("afm_wf_rules", "rule_id", ruleId));
        final List<DataRecord> records = wfrDs.getRecords();
        boolean ruleFound = true;
        if (records.isEmpty()) {
            ruleFound = false;
        }
        return ruleFound;
    }
    
    /**
     * @param tableName table name Increase enum_list size.
     * @return true if the size changed and false otherwise.
     */
    public boolean increaseEnumListSizeForTable(final String tableName) {
        final DataSource sizeEnumListDs =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_FLDS)
                    .addField("table_name")
                    .addField("field_name")
                    .addField("afm_size")
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, "table_name",
                            tableName))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, "field_name",
                            UpdateArchibusSchema.ENUM_LIST));
        final DataRecord record = sizeEnumListDs.getRecord();
        boolean changeSize = true;
        if (record.getInt("afm_flds.afm_size") == ENUM_LIST_SIZE) {
            changeSize = false;
        }
        if (changeSize) {
            record.setValue("afm_flds.afm_size", ENUM_LIST_SIZE);
            sizeEnumListDs.saveRecord(record);
        }
        
        final DatabaseSchemaTableDef sqlTableDef =
                new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
        if (sqlTableDef.exists() && !sqlTableDef.isNewField(UpdateArchibusSchema.ENUM_LIST)) {
            final int sqlSize = sqlTableDef.getFieldDef(UpdateArchibusSchema.ENUM_LIST).getSize();
            if (sqlSize < ENUM_LIST_SIZE) {
                changeSize = true;
            }
        }
        return changeSize;
    }
    
    /**
     * Added to avoid rebuilding database (KB 3031934).
     */
    public void refreshDataDictionary() {
        ContextStore.get().getProject().clearCachedTableDefs();
    }
}