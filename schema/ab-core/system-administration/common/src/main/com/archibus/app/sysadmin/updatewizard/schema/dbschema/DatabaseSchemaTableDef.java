package com.archibus.app.sysadmin.updatewizard.schema.dbschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.*;

/**
 * Physical database table definition.
 * 
 * @author Catalin Purice
 * 
 */
public class DatabaseSchemaTableDef {
    
    /**
     * Constant.
     */
    private static final String AFM_FLDS_FIELD_NAME = "afm_flds.field_name";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS_FIELD_NAME = "afm_tbls.field_name";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS_FOREIGN_FIELD = "afm_tbls.foreign_field";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS_FOREIGN_TABLE = "afm_tbls.foreign_table";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS_REF_TABLE = "afm_tbls.ref_table";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS_ROLE_NAME = "afm_tbls.role_name";
    
    /**
     * Constant.
     */
    private static final String COMMA = ",";
    
    /**
     * Constant.
     */
    private static final String POSITION = "position";
    
    /**
     * Constant.
     */
    private static final String ROLE_NAME = "role_name";
    
    /**
     * Constant.
     */
    private static final String SYBASE_SEPARATOR_KEY_DEFN = " IS ";
    
    /**
     * All Fields definition.
     */
    private transient List<DatabaseSchemaFieldDef> fields;
    
    /**
     * Foreign Key definition.
     */
    private transient List<DatabaseSchemaForeignKeyDef> fKeysDefn;
    
    /**
     * Primary key definition.
     */
    private transient List<DatabaseSchemaPrimaryKeyDef> pKeysDefn;
    
    /**
     * table exists in physical DB (true/false).
     */
    private transient boolean tableExists;
    
    /**
     * table name.
     */
    private final transient String tableName;
    
    /**
     * Constructor.
     * 
     * @param tableName table name
     */
    public DatabaseSchemaTableDef(final String tableName) {
        this.tableName = tableName;
        this.tableExists = false;
        this.pKeysDefn = new ArrayList<DatabaseSchemaPrimaryKeyDef>();
        this.fKeysDefn = new ArrayList<DatabaseSchemaForeignKeyDef>();
    }
    
    /**
     * 
     * @return boolean
     */
    public boolean exists() {
        return this.tableExists;
    }
    
    /**
     * @param fieldName field name
     * @return the field definition
     */
    public DatabaseSchemaFieldDef getFieldDef(final String fieldName) {
        DatabaseSchemaFieldDef fieldDef = null;
        for (final DatabaseSchemaFieldDef field : this.fields) {
            final String name = field.getName();
            if (name.equalsIgnoreCase(fieldName)) {
                fieldDef = field;
            }
        }
        return fieldDef;
    }
    
    /**
     * 
     * @return fields names
     */
    public ListWrapper.Immutable<String> getFieldsName() {
        final List<String> names = new ArrayList<String>();
        for (final DatabaseSchemaFieldDef name : this.fields) {
            names.add(name.getName());
        }
        
        return new ListImpl<String>(names);
    }
    
    /**
     * @return the fKeysDefn
     */
    public List<DatabaseSchemaForeignKeyDef> getFKeysDefn() {
        // loadForeignKeys();
        return this.fKeysDefn;
    }
    
    /**
     * @param fieldName field name
     * @return the fk field definition
     */
    public DatabaseSchemaForeignKeyDef getForeignKeyDef(final String fieldName) {
        DatabaseSchemaForeignKeyDef fkey = null;
        final List<DatabaseSchemaForeignKeyDef> fkeys = getFKeysDefn();
        for (final DatabaseSchemaForeignKeyDef fk : fkeys) {
            final String name = fk.getName();
            if (name.equalsIgnoreCase(fieldName)) {
                fkey = fk;
            }
        }
        return fkey;
    }
    
    /**
     * @return the pKeysDefn
     */
    public List<DatabaseSchemaPrimaryKeyDef> getPKeysDefn() {
        // loadPrimaryKeys();
        return this.pKeysDefn;
    }
    
    /**
     * 
     * @return primary keys
     */
    public List<DatabaseSchemaPrimaryKeyDef> getPrimaryKeys() {
        return this.pKeysDefn;
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * @return true if the table is AUTOINCREMENT.
     */
    public boolean isAutoNumber() {
        boolean isAutoNum = false;
        for (final String fieldName : getFieldNames()) {
            if (getFieldDef(fieldName).isAutonum()) {
                isAutoNum = true;
                break;
            }
        }
        return isAutoNum;
    }
    
    /**
     * 
     * @param fieldName field name
     * @return true if the field is doesn't exist in physical database
     */
    public boolean isNewField(final String fieldName) {
        boolean isNew = true;
        final List<String> tableFields = getFieldNames();
        for (final String fname : tableFields) {
            if (fieldName.equalsIgnoreCase(fname)) {
                isNew = false;
                break;
            }
        }
        return isNew;
    }
    
    /**
     * Load the physical table definition.
     * 
     * @return current object
     */
    public DatabaseSchemaTableDef loadTableFieldsDefn() {
        final List<String> fieldNames = getFieldNames();
        if (!fieldNames.isEmpty()) {
            this.tableExists = true;
            
            final String sql = loadQuery(getTableName());
            
            final DataSource fieldPropDS =
                    DataSourceFactory
                        .createDataSource()
                        .addTable(SchemaUpdateWizardConstants.AFM_TBLS)
                        .addQuery(sql)
                        .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS,
                            ProjectUpdateWizardUtilities.FIELD_NAME, DataSource.DATA_TYPE_TEXT)
                        .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "data_type",
                            DataSource.DATA_TYPE_TEXT)
                        .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "afm_size",
                            DataSource.DATA_TYPE_TEXT)
                        .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "decimals",
                            DataSource.DATA_TYPE_TEXT)
                        .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "allow_null",
                            DataSource.DATA_TYPE_TEXT)
                        .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "dflt_val",
                            DataSource.DATA_TYPE_TEXT);
            final List<DataRecord> records = fieldPropDS.getRecords();
            
            this.fields = new ArrayList<DatabaseSchemaFieldDef>();
            for (final DataRecord record : records) {
                final String fieldName =
                        record.getValue(AFM_TBLS_FIELD_NAME).toString().toLowerCase();
                final DatabaseSchemaFieldDef fieldDef =
                        new DatabaseSchemaFieldDef(this.tableName, fieldName);
                fieldDef.setDataType(record.getValue("afm_tbls.data_type").toString());
                fieldDef.setSize(Integer.valueOf(record.getValue("afm_tbls.afm_size").toString()));
                fieldDef.setDecimals(Integer.valueOf(record.getValue("afm_tbls.decimals")
                    .toString()));
                fieldDef.setAllowNull(record.getValue("afm_tbls.allow_null").toString());
                fieldDef.setSqlTypes();
                final Object dfltVal = record.getValue("afm_tbls.dflt_val");
                String defaultValue = "";
                if (StringUtil.notNullOrEmpty(dfltVal)) {
                    defaultValue = fieldDef.processDefaultValue(dfltVal.toString());
                }
                fieldDef.setDfltVal(defaultValue);
                
                this.fields.add(fieldDef);
            }
            
            this.pKeysDefn = loadPKeysDefn();
            this.fKeysDefn = loadFKeysDefn();
        }
        return this;
    }
    
    /**
     * Returns field names.
     * 
     * @return field names
     */
    private List<String> getFieldNames() {
        String tableFieldsStmt = "";
        if (SqlUtils.isSqlServer()) {
            tableFieldsStmt = String.format(SystemSql.FLDS_NAMES_MSSQL, this.tableName);
        } else if (SqlUtils.isOracle()) {
            tableFieldsStmt = String.format(SystemSql.FLDS_NAMES_ORACLE, this.tableName);
        } else {
            tableFieldsStmt =
                    String.format(SystemSql.FLDS_NAMES_FOR_TABLE_SQL_SYBASE, this.tableName);
        }
        final List<DataRecord> records =
                SqlUtils.executeQuery("afm_flds",
                    new String[] { ProjectUpdateWizardUtilities.FIELD_NAME }, tableFieldsStmt);
        final List<String> fieldNameList = new ArrayList<String>();
        for (final DataRecord record : records) {
            fieldNameList.add(record.getValue(AFM_FLDS_FIELD_NAME).toString());
        }
        return fieldNameList;
    }
    
    /**
     * 
     * @param records list of table definition records
     */
    private void getForeignFieldsForOrclAndMsSql(final List<DataRecord> records) {
        this.fKeysDefn = new ArrayList<DatabaseSchemaForeignKeyDef>();
        List<String> foreignFields = null;
        List<String> foreignPkFields = null;
        DatabaseSchemaForeignKeyDef fKeyDefn = null;
        int oldPosition = 0;
        int pos = 0;
        for (final DataRecord record : records) {
            final int currPosition =
                    Integer.valueOf(record.getValue("afm_tbls.position").toString());
            if (oldPosition == 1 && currPosition == 1 || oldPosition > 1 && currPosition == 1) {
                fKeyDefn.setForeignFields(foreignFields);
                this.fKeysDefn.add(fKeyDefn);
            }
            
            fKeyDefn = new DatabaseSchemaForeignKeyDef(this.tableName);
            final String foreignFieldName = record.getValue(AFM_TBLS_FIELD_NAME).toString();
            fKeyDefn.setForeignTableName(record.getValue(AFM_TBLS_FOREIGN_TABLE).toString());
            fKeyDefn.setFieldName(record.getValue(AFM_TBLS_FIELD_NAME).toString());
            fKeyDefn.setReferencedTableName(record.getValue(AFM_TBLS_REF_TABLE).toString());
            fKeyDefn.setRole(record.getValue(AFM_TBLS_ROLE_NAME).toString());
            final String foreignPkField = record.getValue(AFM_TBLS_FOREIGN_FIELD).toString();
            
            fKeyDefn.setForeignKey(true);
            getFieldDef(foreignFieldName).setForeignKey(true);
            
            if (currPosition == 1) {
                foreignFields = new ArrayList<String>();
                foreignPkFields = new ArrayList<String>();
            }
            foreignFields.add(foreignFieldName);
            foreignPkFields.add(foreignPkField);
            
            oldPosition = currPosition;
            
            if (pos == records.size() - 1) {
                fKeyDefn.setForeignFields(foreignFields);
                fKeyDefn.setPrimaryColumns(foreignPkFields);
                this.fKeysDefn.add(fKeyDefn);
            }
            pos++;
            setRefTableForField(fKeyDefn.getName(), fKeyDefn.getReferencedTableName());
        }
    }
    
    /**
     * 
     * @param foreignKeyFields in format <fk_field> IS <pk_field>, <fk_field2> IS <pk_field2>
     * @return first group of fields
     */
    private List<String> getForeignFieldsforSybase(final String foreignKeyFields) {
        final List<String> fFields = new ArrayList<String>();
        final String[] arrayFKPK = foreignKeyFields.split(COMMA);
        for (final String element : arrayFKPK) {
            final String[] fkFields = element.split(SYBASE_SEPARATOR_KEY_DEFN);
            fFields.add(fkFields[0]);
        }
        return fFields;
    }
    
    /**
     * 
     * @param records list of table definition records
     */
    private void getForeignFieldsForSybase(final List<DataRecord> records) {
        this.fKeysDefn = new ArrayList<DatabaseSchemaForeignKeyDef>();
        for (final DataRecord record : records) {
            final DatabaseSchemaForeignKeyDef fKeyDefn =
                    new DatabaseSchemaForeignKeyDef(this.tableName);
            final String fieldName = record.getValue(AFM_TBLS_FIELD_NAME).toString();
            fKeyDefn.setForeignTableName(record.getValue(AFM_TBLS_FOREIGN_TABLE).toString());
            fKeyDefn.setFieldName(fieldName);
            fKeyDefn.setReferencedTableName(record.getValue(AFM_TBLS_REF_TABLE).toString());
            fKeyDefn.setRole(record.getValue(AFM_TBLS_ROLE_NAME).toString());
            final String fkpkFields = record.getValue(AFM_TBLS_FOREIGN_FIELD).toString();
            final List<String> fkFields = getForeignFieldsforSybase(fkpkFields);
            fKeyDefn.setForeignFields(fkFields);
            final List<String> pkFields = getPrimaryFieldsForSybase(fkpkFields);
            fKeyDefn.setPrimaryColumns(pkFields);
            fKeyDefn.setForeignKey(true);
            this.fKeysDefn.add(fKeyDefn);
            setRefTableForField(fKeyDefn.getName(), fKeyDefn.getReferencedTableName());
            getFieldDef(fieldName).setForeignKey(true);
        }
    }
    
    /**
     * Transform the Primary keys string from Sybase format into ArrayList.
     * 
     * @param primaryKeyfields in format <fk_field> IS <pk_field>, <fk_field2> IS <pk_field2>
     * @return the second group of fields
     */
    private List<String> getPrimaryFieldsForSybase(final String primaryKeyfields) {
        final List<String> pFields = new ArrayList<String>();
        final String[] arrayFKPK = primaryKeyfields.split(COMMA);
        for (final String element : arrayFKPK) {
            final String[] pkFields = element.split(SYBASE_SEPARATOR_KEY_DEFN);
            pFields.add(pkFields[0]);
        }
        return pFields;
    }
    
    /**
     * @return the fKeysDefn
     */
    private List<DatabaseSchemaForeignKeyDef> loadFKeysDefn() {
        loadForeignKeys();
        return this.fKeysDefn;
    }
    
    /**
     * loads foreign keys from sql database.
     */
    private void loadForeignKeys() {
        String foreignKeyStmt = "";
        if (SqlUtils.isSqlServer()) {
            // get foreign keys implemented as constraints
            foreignKeyStmt = String.format(SystemSql.FKEY_SQL_MSSQL, this.tableName);
        } else if (SqlUtils.isOracle()) {
            foreignKeyStmt = String.format(SystemSql.FKEY_SQL_ORACLE, this.tableName);
        } else {
            foreignKeyStmt = String.format(SystemSql.FKEY_SQL_SYBASE, this.tableName);
        }
        final DataSource fkDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(SchemaUpdateWizardConstants.AFM_TBLS)
                    .addQuery(foreignKeyStmt)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "foreign_table",
                        DataSource.DATA_TYPE_TEXT)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "field_name",
                        DataSource.DATA_TYPE_TEXT)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "ref_table",
                        DataSource.DATA_TYPE_TEXT)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "foreign_field",
                        DataSource.DATA_TYPE_TEXT)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, ROLE_NAME,
                        DataSource.DATA_TYPE_TEXT)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, POSITION,
                        DataSource.DATA_TYPE_TEXT).addSort(ROLE_NAME).addSort(POSITION);
        
        final List<DataRecord> records = fkDS.getRecords();
        if (SqlUtils.isSybase()) {
            getForeignFieldsForSybase(records);
        } else {
            getForeignFieldsForOrclAndMsSql(records);
        }
    }
    
    /**
     * @return the pKeysDefn
     */
    private List<DatabaseSchemaPrimaryKeyDef> loadPKeysDefn() {
        loadPrimaryKeys();
        return this.pKeysDefn;
    }
    
    /**
     * Loads primary keys for table.
     */
    private void loadPrimaryKeys() {
        String primaryKeyStmt = "";
        if (SqlUtils.isSqlServer()) {
            // get primary keys implemented as constraints
            primaryKeyStmt = String.format(SystemSql.PKEY_SQL_MSSQL, this.tableName);
        } else if (SqlUtils.isOracle()) {
            primaryKeyStmt = String.format(SystemSql.PKEY_SQL_ORACLE, this.tableName);
        } else {
            primaryKeyStmt = String.format(SystemSql.PKEY_SQL_SYBASE, this.tableName);
        }
        final DataSource pkDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(SchemaUpdateWizardConstants.AFM_TBLS)
                    .addQuery(primaryKeyStmt)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS,
                        ProjectUpdateWizardUtilities.TABLE_NAME, DataSource.DATA_TYPE_TEXT)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, POSITION,
                        DataSource.DATA_TYPE_TEXT)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "column_name",
                        DataSource.DATA_TYPE_TEXT)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "constraint_name",
                        DataSource.DATA_TYPE_TEXT).addSort(POSITION);
        
        final List<DataRecord> records = pkDS.getRecords();
        
        this.pKeysDefn = new ArrayList<DatabaseSchemaPrimaryKeyDef>();
        for (final DataRecord record : records) {
            final String fieldName = record.getValue("afm_tbls.column_name").toString();
            final String constraintName = record.getValue("afm_tbls.constraint_name").toString();
            final DatabaseSchemaPrimaryKeyDef pKeyDefn =
                    new DatabaseSchemaPrimaryKeyDef(this.tableName, fieldName, constraintName);
            this.pKeysDefn.add(pKeyDefn);
            final DatabaseSchemaFieldDef fDef = this.getFieldDef(fieldName);
            fDef.setAutonum(fDef.getDfltVal());
            fDef.setPrimaryKey(true);
        }
    }
    
    /**
     * Gets query for field properties.
     * 
     * @param name table name
     * @return query
     */
    private String loadQuery(final String name) {
        String query = "";
        if (SqlUtils.isOracle()) {
            query = String.format(SystemSql.FLDS_PROP_SQL_ORACLE, name);
        } else if (SqlUtils.isSqlServer()) {
            query = String.format(SystemSql.FLDS_PROP_SQL_MSSQL, name);
        } else {
            query = String.format(SystemSql.FLDS_PROP_SQL_SYBASE, name);
        }
        return query;
    }
    
    /**
     * Sets reference table for SqlFieldDef field type.
     * 
     * @param fieldName field name
     * @param refTable reference table
     */
    private void setRefTableForField(final String fieldName, final String refTable) {
        for (final DatabaseSchemaFieldDef field : this.fields) {
            if (fieldName.equalsIgnoreCase(field.getName())) {
                field.setRefTable(refTable);
            }
        }
    }
}