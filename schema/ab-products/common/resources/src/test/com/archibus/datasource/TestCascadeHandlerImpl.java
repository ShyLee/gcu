package com.archibus.datasource;

import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;

/**
 * Unit test for cascadeHandlerImpl
 */
public class TestCascadeHandlerImpl extends DataSourceTestBase {

    // Delete from a table with foreign key dependents
    public void testCascadeDeleteFK() {

        String sql = "INSERT into port(port_id,port_std,description,fl_id,bl_id,rm_id,tc_use_status,rack_id,tc_level) values('00001', 'AUI-PORT-A', 'description', '17', 'HQ', '129','tc_use', '1', '100-WA')";

        SqlUtils.executeUpdate("port", sql);
        SqlUtils.commit();

        // create the data source for the parent table
        String mainTableName = "port";
        String[] fieldNames = { "port_id" };
        DataSource ds = DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);

        DataRecord record = ds.createNewRecord();
        record.setValue("port.port_id", "00001");
        // DataRecord pkRecord = ds.saveRecord(record);

        // call the cascade handler to delete children table records
        CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeDelete(record);

        // commit all changes
        ds.commit();

        // TODO: verify that the test children records have been deleted, for example:
        Restriction restriction = Restrictions.sql("port_id = '00001'");
        int childrenCount = DataStatistics.getInt("port", "port_id", "COUNT", restriction);
        assertEquals(0, childrenCount);
    }

    // Delete from a table with single primary key dependents
    public void testCascadeDeleteSinglePK() {
        // create the data source for the parent table
        String mainTableName = "bl";
        String[] fieldNames = { "bl_id" };
        DataSource ds = DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);

        // insert the parent record
        DataRecord record = ds.createNewRecord();
        record.setValue("bl.bl_id", "HQ");
        // DataRecord pkRecord = ds.saveRecord(record);

        // call the cascade handler to delete children table records
        CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeDelete(record);

        // commit all changes
        ds.commit();

        // TODO: verify that the test children records have been deleted, for example:
        Restriction restriction = Restrictions.sql("bl_id = 'HQ'");
        int parentCount = DataStatistics.getInt("bl", "bl_id", "COUNT", restriction);
        assertEquals(0, parentCount);

        int childrenCount = DataStatistics.getInt("fl", "bl_id", "COUNT", restriction);
        assertEquals(0, childrenCount);
    }

    // Delete from a table with multiple primary key dependents
    public void testCascadeDeleteMultiPK() {
        // create the data source for the parent table
        String mainTableName = "rm";
        String[] fieldNames = { "bl_id", "fl_id", "rm_id", "area" };
        DataSource ds = DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);

        // insert the parent record
        DataRecord record = ds.createNewRecord();
        record.setValue("rm.bl_id", "HQ");
        record.setValue("rm.fl_id", "17");
        record.setValue("rm.rm_id", "172");
        record.setValue("rm.area", 0.0);
        // DataRecord pkRecord = ds.saveRecord(record);

        // TODO: create data source and insert test children records, for example into the eq table

        // call the cascade handler to delete children table records
        CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeDelete(record);

        // commit all changes
        ds.commit();

        // TODO: verify that the test children records have been deleted, for example:
        Restriction restriction = Restrictions.sql("rm_id = '172'");
        int childrenCount = DataStatistics.getInt("eq", "rm_id", "COUNT", restriction);
        assertEquals(4, childrenCount);
    }

    // Update from a table with foreign key dependents
    public void testCascadeUpdateFK() {

        // create the data source for the parent table
        String mainTableName = "port";
        String[] fieldNames = { "port_id", "port_std", "description", "fl_id", "bl_id", "rm_id",
                "tc_use_status", "rack_id", "tc_level" };

        DataSource ds = DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);

        DataRecord record = ds.createNewRecord();
        record.setValue("port.port_id", "00001");
        record.setOldValue("port.port_id", "00001-NEW");

        String sql = "INSERT into port(port_id,port_std,description,fl_id,bl_id,rm_id,tc_use_status,rack_id,tc_level) values('00001', 'AUI-PORT-A', 'description', '17', 'HQ', '129','tc_use', '1', '100-WA')";

        SqlUtils.executeUpdate("port", sql);
        new SqlUtils().commit();

        // DataRecord pkRecord = ds.saveRecord(record);

        // call the cascade handler to delete children table records

        CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeUpdate(record);

        // commit all changes
        ds.commit();

        // TODO: verify that the test children records have been updated, for example eq table:
        Restriction restriction = Restrictions.sql("port_id = '00001'");
        int count = DataStatistics.getInt("port", "port_id", "COUNT", restriction);
        assertEquals(0, count);

        restriction = Restrictions.sql("port_id = '00001-NEW'");
        assertEquals(1, count);

    }

    // Update from a table with single primary key dependents
    public void testCascadeUpdateSinglePK() {
        // create the data source for the parent table
        String mainTableName = "bl";
        String[] fieldNames = { "bl_id" };
        DataSource ds = DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);

        // insert the parent record
        DataRecord record = ds.createNewRecord();

        // set new and old value
        record.setValue("bl.bl_id", "HQ");
        record.setOldValue("bl.bl_id", "NEWHQ");

        // DataRecord pkRecord = ds.saveRecord(record);

        // call the cascade handler to delete children table records
        CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeUpdate(record);

        // commit all changes
        ds.commit();

        // TODO: verify that the parent record have been updated
        Restriction restriction = Restrictions.sql("bl_id = 'HQ'");
        int dataCount = DataStatistics.getInt("bl", "bl_id", "COUNT", restriction);
        assertEquals(1, dataCount);

        // TODO: verify that the parent record doesn't exist
        restriction = Restrictions.sql("bl_id = 'NEWHQ'");
        dataCount = DataStatistics.getInt("bl", "bl_id", "COUNT", restriction);
        assertEquals(0, dataCount);

    }

    // Update from a table with single primary key dependents
    public void testCascadeUpdateMultiPK() {
        // create the data source for the parent table
        String mainTableName = "rm";
        String[] fieldNames = { "bl_id", "fl_id", "rm_id", "area" };
        DataSource ds = DataSourceFactory.createDataSourceForFields(mainTableName, fieldNames);

        DataRecord record = ds.createNewRecord();

        // set new and old value
        record.setValue("rm.bl_id", "JFK A");
        record.setValue("rm.fl_id", "01");
        record.setValue("rm.rm_id", "17222");
        record.setValue("rm.area", 0.0);

        record.setOldValue("rm.bl_id", "NEWHQ");
        record.setOldValue("rm.fl_id", "19");
        record.setOldValue("rm.rm_id", "172");
        // record.setOldValue("rm.area", 0.0);

        // DataRecord pkRecord = ds.saveRecord(record);

        // call the cascade handler to delete children table records
        CascadeHandler handler = new CascadeHandlerImpl();
        handler.cascadeUpdate(record);

        // commit all changes
        ds.commit();

        // TODO: verify that the parent record have been updated, for example fl table:
        Restriction restriction = Restrictions.sql("bl_id = 'HQ-NEW'");
        int dataCount = DataStatistics.getInt("fl", "bl_id", "COUNT", restriction);
        assertEquals(1, dataCount);

        // 2nd level verification
        restriction = Restrictions.sql("bl_id = 'HQ-NEW'");
        dataCount = DataStatistics.getInt("rm_arrange", "bl_id", "COUNT", restriction);
        assertEquals(1, dataCount);

        // TODO: verify that the parent record doesn't exist, for example:
        restriction = Restrictions.sql("bl_id = 'HQ'");
        dataCount = DataStatistics.getInt("fl", "bl_id", "COUNT", restriction);
        assertEquals(0, dataCount);

    }

}
