package com.archibus.eventhandler.energy;

import java.io.ByteArrayOutputStream;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.utility.ExceptionBase;

/**
 * UpdateWeatherStationAllList - This is a scheduled Work Flow rule that gets a listing of degree
 * data files available in NOAA's FTP server, cross references it with a ish-history.csv file to
 * obtain weather station details only of weather stations that actually have data files associated
 * with it, and then inserts the records into the weather_station_all table.
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 */
public class UpdateWeatherStationAllList {

    /**
     * Logger to write messages to archibus.log.
     */
    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * populateWeatherStationList connects to NOAA's ftp server fetches data needed for cross
     * referencing the weather station list
     * 
     * @throws ExceptionBase
     */

    public void populateWeatherStationList() {
        if (this.log.isDebugEnabled()) {
            this.log.info("POPULATE WEAHTER STATION LIST JOB STARTS... ");
        }
        // TODO: one call when web c is initializing???
        com.enterprisedt.util.license.License
            .setLicenseDetails("ARCHIBUSInc", "382-5943-6920-1248");

        // TODO: replace by calling service???

        com.enterprisedt.net.ftp.FTPClient ftp = null;
        com.enterprisedt.net.ftp.FTPFile[] fileList = null;
        ByteArrayOutputStream csvDataStream = null;
        // TODO: host should be configurable???
        final String host = "ftp.ncdc.noaa.gov";
        try {
            ftp = new com.enterprisedt.net.ftp.FTPClient();
            ftp.setRemoteHost(host);
            ftp.connect();
            // TODO: username and password should be configurable???
            ftp.login("ftp", "");

            ftp.setConnectMode(com.enterprisedt.net.ftp.FTPConnectMode.PASV);
            ftp.setType(com.enterprisedt.net.ftp.FTPTransferType.BINARY);

            // TODO: year should be passed from client???
            final Calendar cal = Calendar.getInstance();
            int year = cal.get(Calendar.YEAR);

            // get file listing
            final String pathName = "/pub/data/gsod/" + Integer.toString(year);
            ftp.chdir(pathName);
            fileList = ftp.dirDetails(".");

            // get csv file
            ftp.cdup();
            String csvFile = "ish-history.csv";
            if (this.log.isDebugEnabled()) {
                this.log.debug("CSV RETURN");
            }

            csvDataStream = new ByteArrayOutputStream();
            ftp.get(csvDataStream, csvFile);
            if (this.log.isDebugEnabled()) {
                this.log.debug("CSV RETURN END");
            }

            ftp.quit();
        } catch (Exception e) {
            // @translatable
            String message = "Could not read from FTP: " + host;
            throw new ExceptionBase(null, message, e);

        } finally {
            if (ftp != null && ftp.connected()) {
                try {
                    ftp.quit();
                } catch (Exception ioe) {
                    this.log.error("Error disconnecting from ftp server.");
                }
            }
        }

        // TODO: refactor into a function
        try {
            // parse nooa's weather station CSV list
            // TODO: why turn object into string for parsing????
            final String csvDataString = new String(csvDataStream.toByteArray());
            csvDataStream.close();

            final JSONObject allStationList = CSVtoJSON(csvDataString);

            final String[] flds = { "weather_station_id", "weather_source_id", "units_of_measure",
                    "ctry_id", "elevation", "lat", "lon", "state_id" };
            final DataSource dataSource = DataSourceFactory.createDataSourceForFields(
                "weather_station", flds);

            // parse directory file listing
            if (this.log.isDebugEnabled()) {
                this.log.debug("fileList.length: " + fileList.length);
            }
            for (int i = 0; i < fileList.length; i++) {
                final com.enterprisedt.net.ftp.FTPFile ftpFile = fileList[i];
                if (ftpFile.isFile()) {
                    // TODO: check???
                    final String[] names = ftpFile.getName().split("-");
                    if (names.length == 1) {
                        continue;
                    }
                    final String weather_station_id = names[0] + "-" + names[1];
                    this.log.warn("Update Weather Station All List current iteration:  " + i);

                    try {
                        final JSONObject activeWeatherStationRecord = allStationList
                            .getJSONObject(weather_station_id);

                        if (activeWeatherStationRecord == null) {
                            continue;
                        }

                        if (isNotExisting(weather_station_id)) {
                            updateWeatherStationAllData(activeWeatherStationRecord,
                                weather_station_id, dataSource);
                        }
                    } catch (NoSuchElementException e) {
                        final String message = "JSON entry for weather station id :"
                                + weather_station_id + " not found.";
                        this.log.warn(message);
                    }
                }
            }
        } catch (Exception e1) {
            // @translatable
            final String message = "Error processing weather stations all list. getWeatherStationAllData()";
            throw new ExceptionBase(null, message, e1);
        }
        if (this.log.isDebugEnabled()) {
            this.log.info("completed updates from getWeatherStationAllData()");
        }

        if (this.log.isDebugEnabled()) {
            this.log.info("POPULATE WEAHTER STATION LIST JOB ENDS. ");
        }
    }

    private boolean isNotExisting(final String weather_station_id) {
        final List<Clause> clauses = new ArrayList<Clause>(1);
        clauses.add(Restrictions.eq("weather_station", "weather_station_id", weather_station_id));

        int dataCount = DataStatistics.getInt("weather_station", "weather_station_id", "COUNT",
            new Restrictions.Restriction(Restrictions.REL_OP_AND, clauses));

        return (dataCount == 0);
    }

    /**
     * updateWeatherStationAllData parses the data from NOAA into the weather_station table
     * 
     * @param activeWeatherStationRecord
     * @param weather_station_id
     * @param dataSource
     */
    private void updateWeatherStationAllData(final JSONObject activeWeatherStationRecord,
            final String weather_station_id, final DataSource dataSource) {
        // define fields
        String weather_source_id = "NOAA";
        String ctry_id = activeWeatherStationRecord.getString("CTRY");
        String elevationRaw = activeWeatherStationRecord.getString("ELEVATION");
        elevationRaw = elevationRaw.replaceAll("[\"]", "");
        elevationRaw = elevationRaw.replaceAll("[+]", "");
        elevationRaw = (elevationRaw.length() == 1 || elevationRaw.length() == 0) ? "0"
                : elevationRaw;
        Double elevation = Double.parseDouble(elevationRaw);
        String latRaw = activeWeatherStationRecord.getString("LAT");
        latRaw = latRaw.replaceAll("[\"]", "");
        latRaw = latRaw.replaceAll("[+]", "");
        latRaw = (latRaw.length() == 1 || latRaw.length() == 0) ? "0" : latRaw;
        Double lat = Double.parseDouble(latRaw) / 1000;
        String lonRaw = activeWeatherStationRecord.getString("LON");
        lonRaw = lonRaw.replaceAll("[\"]", "");
        lonRaw = lonRaw.replaceAll("[+]", "");
        lonRaw = (lonRaw.length() == 1 || lonRaw.length() == 0) ? "0" : lonRaw;
        Double lon = Double.parseDouble(lonRaw) / 1000;
        String state_id = activeWeatherStationRecord.getString("STATE");

        // insert record
        DataRecord record = dataSource.createNewRecord();
        record.setValue("weather_station.weather_station_id", weather_station_id);
        record.setValue("weather_station.weather_source_id", weather_source_id);
        record.setValue("weather_station.units_of_measure", "F");
        record.setValue("weather_station.ctry_id", ctry_id);
        record.setValue("weather_station.elevation", elevation);
        record.setValue("weather_station.lat", lat);
        record.setValue("weather_station.lon", lon);
        record.setValue("weather_station.state_id", state_id);
        dataSource.saveRecord(record);
    }

    /**
     * CSVtoJSON takes a CSV file stream and returns a json object equivalent to it
     * 
     * @param csv
     * @throws ExceptionBase
     * @return new JSON object
     */
    public JSONObject CSVtoJSON(final String csvDataRaw) throws ExceptionBase {
        // Assumes the first line is the header row
        // Using JSON object in case we want to pass this object to the browser at some point.
        // TODO: replace JSON by LIST(MAP);
        // TODO: a better way to parse csv data object rather than its string value

        final String csvData = csvDataRaw.replaceAll("[\"]", "");

        String[] csvRecords = csvData.split("\n");
        String[] headers = csvRecords[0].split(",");
        headers[9] = "ELEVATION";// standard header contains invalid characters
        JSONObject json = new JSONObject();
        for (int i = 1; csvRecords.length > i; i++) {
            String[] csvRecordFields = csvRecords[i].split(",");
            JSONObject entry = new JSONObject();
            if (csvRecordFields.length == 12) {// some records have invalid commas
                for (int j = 0; csvRecordFields.length > j; j++) {
                    entry.put(headers[j], csvRecordFields[j]);
                }
                // create the pk
                String USAF = csvRecordFields[0].toString();
                String WBAN = csvRecordFields[1].toString();
                String key = USAF + "-" + WBAN;
                json.put(key, entry);
            }
        }
        return json;
    }
}
