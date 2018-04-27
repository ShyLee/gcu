package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import junit.framework.TestCase;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.mobile.sync.Constants;
import com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.ViewField;

/**
 * Tests for SyncDataSourceUtilities.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class SyncDataSourceUtilitiesTest extends TestCase {
    private static final String NON_DOCUMENT_FIELD_NAME = "NonDocumentFieldName";
    
    private static final String DOCUMENT_FIELD_NAME = "DocumentFieldName";
    
    private static final String NO_MATCH_USERNAME = "NoMatchUsername";
    
    private static final String TEST_USERNAME = "TestUsername";
    
    /**
     * Test method for
     * {@link SyncDataSourceUtilities#isUserAllowedLockRecordForCheckin(String, String, DataRecord)}
     * .
     */
    public final void testIsUserAllowedLockRecordForCheckin() {
        {
            // Case #1: username matches the record value
            final String username = TEST_USERNAME;
            final String tableName = Constants.WR;
            
            final DataRecord record = new DataRecord();
            {
                final ViewField.Immutable viewField =
                        MockUtilities.createMockViewField(tableName + SyncDataSourceUtilities.DOT
                                + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, false, false);
                record.addField(viewField);
                record.setValue(tableName + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, username);
            }
            
            final boolean actual =
                    SyncDataSourceUtilities.isUserAllowedLockRecordForCheckin(tableName, username,
                        record);
            
            assertEquals(true, actual);
        }
        
        {
            // Case #2: username does not match the record value
            final String username = TEST_USERNAME;
            final String tableName = Constants.WR;
            
            final DataRecord record = new DataRecord();
            {
                final ViewField.Immutable viewField =
                        MockUtilities.createMockViewField(tableName + SyncDataSourceUtilities.DOT
                                + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, false, false);
                record.addField(viewField);
                record.setValue(tableName + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, username);
            }
            
            final boolean actual =
                    SyncDataSourceUtilities.isUserAllowedLockRecordForCheckin(tableName,
                        NO_MATCH_USERNAME, record);
            
            assertEquals(false, actual);
        }
        {
            // Case #3: username is null
            final String username = null;
            final String tableName = Constants.WR;
            
            final DataRecord record = new DataRecord();
            {
                final ViewField.Immutable viewField =
                        MockUtilities.createMockViewField(tableName + SyncDataSourceUtilities.DOT
                                + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, false, false);
                record.addField(viewField);
                record.setValue(tableName + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, username);
            }
            
            final boolean actual =
                    SyncDataSourceUtilities.isUserAllowedLockRecordForCheckin(tableName,
                        TEST_USERNAME, record);
            
            assertEquals(false, actual);
        }
    }
    
    /**
     * Test method for
     * {@link SyncDataSourceUtilities#isUserAllowedLockRecordForCheckout(String, String, DataRecord)}
     * .
     */
    public final void testIsUserAllowedLockRecordForCheckout() {
        {
            // Case #1: username matches the record value
            final String tableName = Constants.WR;
            
            final String username = TEST_USERNAME;
            final DataRecord record = new DataRecord();
            {
                final ViewField.Immutable viewField =
                        MockUtilities.createMockViewField(tableName + SyncDataSourceUtilities.DOT
                                + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, false, false);
                record.addField(viewField);
                record.setValue(tableName + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, username);
            }
            
            final boolean actual =
                    SyncDataSourceUtilities.isUserAllowedLockRecordForCheckout(tableName, username,
                        record);
            
            assertEquals(true, actual);
        }
        {
            // Case #2.1: username does not match the field value, which is not empty
            final String tableName = Constants.WR;
            
            final DataRecord record = new DataRecord();
            {
                final ViewField.Immutable viewField =
                        MockUtilities.createMockViewField(tableName + SyncDataSourceUtilities.DOT
                                + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, false, false);
                record.addField(viewField);
                
                record.setValue(tableName + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, NO_MATCH_USERNAME);
            }
            
            final String username = TEST_USERNAME;
            final boolean actual =
                    SyncDataSourceUtilities.isUserAllowedLockRecordForCheckout(tableName, username,
                        record);
            
            assertEquals(false, actual);
        }
        {
            // Case #2.2: username does not match the field value, which is null
            final String tableName = Constants.WR;
            
            final DataRecord record = new DataRecord();
            {
                final ViewField.Immutable viewField =
                        MockUtilities.createMockViewField(tableName + SyncDataSourceUtilities.DOT
                                + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, false, false);
                record.addField(viewField);
                
                // null field value
                record.setValue(tableName + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, null);
            }
            
            final String username = TEST_USERNAME;
            final boolean actual =
                    SyncDataSourceUtilities.isUserAllowedLockRecordForCheckout(tableName, username,
                        record);
            
            assertEquals(true, actual);
        }
    }
    
    /**
     * Test method for {@link SyncDataSourceUtilities#lockRecord(DataRecord, String, String)} .
     */
    public final void testLockRecord() {
        final String tableName = Constants.WR;
        
        final DataRecord record = new DataRecord();
        {
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(tableName + SyncDataSourceUtilities.DOT
                            + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, false, false);
            record.addField(viewField);
        }
        
        final String username = TEST_USERNAME;
        SyncDataSourceUtilities.lockRecord(record, username, tableName);
        
        assertEquals(
            username,
            record.getValue(tableName + SyncDataSourceUtilities.DOT
                    + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER));
    }
    
    /**
     * Test method for {@link SyncDataSourceUtilities#setChangedByMobileUser(DataRecord, String)} .
     */
    public final void testSetChangedByMobileUser() {
        final String tableName = Constants.WR;
        
        final DataRecord record = new DataRecord();
        {
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(tableName + SyncDataSourceUtilities.DOT
                            + SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER, false, false);
            record.addField(viewField);
        }
        
        SyncDataSourceUtilities.setChangedByMobileUser(record, tableName);
        
        assertEquals(
            1,
            record.getValue(tableName + SyncDataSourceUtilities.DOT
                    + SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER));
    }
    
    /**
     * Test method for {@link SyncDataSourceUtilities#prepareFieldNamesForDataSource(FieldNames)}.
     */
    public final void testPrepareFieldNamesForDataSource() {
        final FieldNames fieldNames = new FieldNames();
        {
            final List<String> documentFieldNames = new ArrayList<String>();
            documentFieldNames.add(DOCUMENT_FIELD_NAME);
            fieldNames.setDocumentFieldNames(documentFieldNames);
            
            final List<String> nonDocumentFieldNames = new ArrayList<String>();
            nonDocumentFieldNames.add(NON_DOCUMENT_FIELD_NAME);
            fieldNames.setNonDocumentFieldNames(nonDocumentFieldNames);
        }
        
        final List<String> actual =
                SyncDataSourceUtilities.prepareFieldNamesForDataSource(fieldNames);
        
        assertEquals(DOCUMENT_FIELD_NAME, actual.get(0));
        assertEquals(NON_DOCUMENT_FIELD_NAME, actual.get(1));
    }
    
    /**
     * Test method for
     * {@link SyncDataSourceUtilities#selectRecordWithPrimaryKeyValues(DataRecord, DataRecord)} .
     */
    public final void testSelectRecordWithPrimaryKeyValues() {
        {
            // case #1: recordToSave is null
            final DataRecord recordSaved = new DataRecord();
            final DataRecord actual =
                    SyncDataSourceUtilities.selectRecordWithPrimaryKeyValues(null, recordSaved);
            
            assertEquals(recordSaved, actual);
        }
        
        {
            // case #1: recordSaved is null
            final DataRecord recordToSave = new DataRecord();
            final DataRecord actual =
                    SyncDataSourceUtilities.selectRecordWithPrimaryKeyValues(recordToSave, null);
            
            assertEquals(recordToSave, actual);
        }
    }
}
