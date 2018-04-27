package com.archibus.app.sysadmin.updatewizard.schema.dbschema;

import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.datasource.*;

/**
 * Physical database primary key definition.
 * 
 * @author Catalin Purice
 * 
 */
public class DatabaseSchemaPrimaryKeyDef extends DatabaseSchemaFieldDef {
    /**
     * Constraint name.
     */
    private transient String constraintName;
    
    /**
     * Constructor.
     * 
     * @param tableName table name
     */
    public DatabaseSchemaPrimaryKeyDef(final String tableName) {
        super(tableName);
    }
    
    /**
     * Constructor.
     * 
     * @param tableName table name
     * @param fieldName field name
     * @param constraintName constraint name
     */
    public DatabaseSchemaPrimaryKeyDef(final String tableName, final String fieldName,
            final String constraintName) {
        super(tableName, fieldName);
        this.constraintName = constraintName;
    }
    
    /**
     * @return the constraintName
     */
    public String getConstraintName() {
        return this.constraintName;
    }
    
    /**
     * Returns true if the table has PK defined and false otherwise.
     * 
     * @param tableName table name
     * @return true/false
     */
    public static boolean hasPrimaryKey(final String tableName) {
        String primaryKeyStmt = "";
        if (SqlUtils.isSqlServer()) {
            // get primary keys implemented as constraints
            primaryKeyStmt = String.format(SystemSql.PKEY_SQL_MSSQL, tableName);
        } else if (SqlUtils.isOracle()) {
            primaryKeyStmt = String.format(SystemSql.PKEY_SQL_ORACLE, tableName);
        } else {
            primaryKeyStmt = String.format(SystemSql.PKEY_SQL_SYBASE, tableName);
        }
        final DataSource pkDS =
                DataSourceFactory.createDataSource().addTable(SchemaUpdateWizardConstants.AFM_TBLS)
                    .addQuery(primaryKeyStmt);
        
        return (pkDS.getRecords().isEmpty()) ? false : true;
    }
}
