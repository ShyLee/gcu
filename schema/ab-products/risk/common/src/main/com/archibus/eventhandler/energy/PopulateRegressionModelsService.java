package com.archibus.eventhandler.energy;

import java.util.*;

import org.apache.commons.math.linear.*;
import org.apache.log4j.Logger;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

/**
 * populateRegressionModels calculates all the consumption and demand regression models and writes
 * them to the database
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 * 
 */

public class PopulateRegressionModelsService {
    /**
     * Logger to write messages to archibus.log.
     */
    private final static Logger log = Logger.getLogger(PopulateRegressionModelsService.class);
    
    /**
     * @param BlList
     */
    public static void run(final List<DataRecord> BlList) {
        runRegression(BlList, RegressionConstantsService.CONSUMPTION);
        runRegression(BlList, RegressionConstantsService.DEMAND);
    }
    
    /**
     * @param BlList
     * @param measurementType
     */
    private static void runRegression(final List<DataRecord> BlList, final String measurementType) {
        if (log.isDebugEnabled()) {
            log.info("PopulateRegressionModels");
        }
        // for each bl with a weather station
        for (final DataRecord blRecord : BlList) {
            // get bl values
            final String bl_id = blRecord.getValue("bl.bl_id").toString();
            final String utility_type_cool = blRecord.getValue("bl.utility_type_cool").toString();
            final String utility_type_heat = blRecord.getValue("bl.utility_type_heat").toString();
            final Double cooling_balance_point =
                    Double.parseDouble(blRecord.getValue("bl.cooling_balance_point").toString());
            final Double heating_balance_point =
                    Double.parseDouble(blRecord.getValue("bl.heating_balance_point").toString());
            
            // create energy_bl_svc_period DS
            final String[] svcPeriodFlds =
                    { "date_start", "date_end", "cost", "demand", "consumption", "num_days",
                            "time_period", "bill_type_id", "bl_id", "period_oat", "period_hdd",
                            "period_cdd" };
            final DataSource svcPeriodDS =
                    DataSourceFactory.createDataSourceForFields("energy_bl_svc_period",
                        svcPeriodFlds);
            svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period", "bl_id", bl_id));
            svcPeriodDS.addSort("energy_bl_svc_period", "date_start");
            final List<DataRecord> svcPeriodRecords = svcPeriodDS.getRecords();
            
            /**
             * TODO: Break down date ranges by utility types (utility_type_cool and
             * utility_type_heat) to prevent blank spaces at the start of the measurement and
             * verification charts
             * 
             * svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
             * "utility_type_cool", utility_type_cool));
             * 
             * svcPeriodDS.addSort("energy_bl_svc_period", "date_start"); final List<DataRecord>
             * coolingSvcPeriodRecords = svcPeriodDS.getRecords();
             * 
             * 
             * svcPeriodDS.clearRestrictions();
             * 
             * svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period", "bl_id", bl_id));
             * 
             * svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
             * "utility_type_heat", utility_type_heat));
             * 
             * svcPeriodDS.addSort("energy_bl_svc_period", "date_start"); final List<DataRecord>
             * heatingSvcPeriodRecords = svcPeriodDS.getRecords();
             * 
             * //call the encapsulated method a.k.a mojo() runMojo(coolingSvcPeriodRecords);
             * runMojo(heatingSvcPeriodRecords);
             * 
             */
            // encapsulate this section into a methof a.k.a mojo()
            
            if (svcPeriodRecords.size() > 0) {// no point in continuing if there aren't any records
            
                // get the earliest start date and latest end date
                // to determine the range
                final String date_start =
                        svcPeriodRecords.get(0).getValue("energy_bl_svc_period.date_start")
                            .toString();
                final String date_end =
                        svcPeriodRecords.get(svcPeriodRecords.size() - 1)
                            .getValue("energy_bl_svc_period.date_end").toString();
                final String firstTimePeriod = date_start.substring(0, 7);
                final String lastTimePeriod = date_end.substring(0, 7);
                Integer firstIndex =
                        TimePeriodUtilService.convertTimePeriodToIndex(firstTimePeriod);
                firstIndex = firstIndex;// in case time period assigned is delayed by a month
                final Integer lastIndex =
                        TimePeriodUtilService.convertTimePeriodToIndex(lastTimePeriod);
                
                String timePeriod;
                final ArrayList<RegressionModelVOService> models =
                        new ArrayList<RegressionModelVOService>();
                for (Integer i = firstIndex; i < lastIndex; i++) {
                    
                    // create a one year date range
                    timePeriod = TimePeriodUtilService.convertIndexToTimePeriod(i);
                    final List<Date> dateRange =
                            TimePeriodUtilService.getDateRange(timePeriod, -14);
                    final Date startDate = dateRange.get(0);
                    final Date endDate = dateRange.get(1);
                    
                    // create cooling series
                    svcPeriodDS.clearRestrictions();
                    svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period", "bl_id",
                        bl_id));
                    svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
                        "bill_type_id", utility_type_cool.toUpperCase()));
                    svcPeriodDS.addRestriction(Restrictions.gte("energy_bl_svc_period",
                        "date_start", startDate));
                    svcPeriodDS.addRestriction(Restrictions.lte("energy_bl_svc_period", "date_end",
                        endDate));
                    // determine what outliers to exclude
                    if (measurementType.equals(RegressionConstantsService.CONSUMPTION)) {
                        svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
                            "outlier_consumption", 0));
                    } else if (measurementType.equals(RegressionConstantsService.DEMAND)) {
                        svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
                            "outlier_demand", 0));
                    }
                    final List<DataRecord> coolingSeries = svcPeriodDS.getRecords();
                    
                    if (utility_type_cool.equals(utility_type_heat)) {
                        final RegressionResultService result =
                                performRegression(coolingSeries,
                                    RegressionConstantsService.HDD_CDD, measurementType);
                        if (result != null) {
                            models.add(getModel(RegressionConstantsService.HDD_CDD,
                                utility_type_cool, measurementType, result, timePeriod, bl_id,
                                cooling_balance_point, heating_balance_point));
                        }
                    } else {
                        // create heating series
                        svcPeriodDS.clearRestrictions();
                        svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period", "bl_id",
                            bl_id));
                        svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
                            "bill_type_id", utility_type_heat.toUpperCase()));
                        svcPeriodDS.addRestriction(Restrictions.lte("energy_bl_svc_period",
                            "date_end", endDate));
                        svcPeriodDS.addRestriction(Restrictions.gte("energy_bl_svc_period",
                            "date_start", startDate));
                        // determine what outliers to exclude
                        if (measurementType.equals(RegressionConstantsService.CONSUMPTION)) {
                            svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
                                "outlier_consumption", 0));
                        } else if (measurementType.equals(RegressionConstantsService.DEMAND)) {
                            svcPeriodDS.addRestriction(Restrictions.eq("energy_bl_svc_period",
                                "outlier_demand", 0));
                        }
                        final List<DataRecord> heatingSeries = svcPeriodDS.getRecords();
                        
                        if (heatingSeries.size() > 0) {
                            RegressionResultService cResult = null;
                            if (measurementType.equals(RegressionConstantsService.CONSUMPTION)) {
                                cResult =
                                        performRegression(heatingSeries,
                                            RegressionConstantsService.HDD, measurementType);
                            }
                            if (cResult != null) {
                                models.add(getModel(RegressionConstantsService.HDD,
                                    utility_type_heat, measurementType, cResult, timePeriod, bl_id,
                                    cooling_balance_point, heating_balance_point));
                            }
                            
                        }
                        
                        if (coolingSeries.size() > 0) {
                            RegressionResultService cResult = null;
                            RegressionResultService dResult = null;
                            if (measurementType.equals(RegressionConstantsService.CONSUMPTION)) {
                                cResult =
                                        performRegression(coolingSeries,
                                            RegressionConstantsService.CDD, measurementType);
                            } else {
                                dResult =
                                        performRegression(coolingSeries,
                                            RegressionConstantsService.CDD, measurementType);
                            }
                            if (cResult != null) {
                                models.add(getModel(RegressionConstantsService.CDD,
                                    utility_type_cool, measurementType, cResult, timePeriod, bl_id,
                                    cooling_balance_point, heating_balance_point));
                            }
                            if (dResult != null) {
                                models.add(getModel(RegressionConstantsService.CDD,
                                    utility_type_cool, measurementType, dResult, timePeriod, bl_id,
                                    cooling_balance_point, heating_balance_point));
                            }
                        }
                    }
                    
                }
                
                // insert values in the weather_model table
                final String[] weatherModelFlds =
                        { "bl_id", "model_type", "time_period", "coefficient_base_load",
                                "coefficient_cdd", "coefficient_hdd", "cooling", "heating",
                                "oat_c1", "oat_c2", "oat_h1", "oat_h2", "aggregation_type" };
                final DataSource weatherModelDS =
                        DataSourceFactory.createDataSourceForFields("weather_model",
                            weatherModelFlds);
                
                final Iterator<RegressionModelVOService> it = models.iterator();
                while (it.hasNext()) {
                    final RegressionModelVOService currentModel = it.next();
                    // ejm 26.07.2012, KB#3037014 - Temporary fix until more significant revision to
                    // hard-coded data type handling in RegressionConstantService.java
                    if (currentModel.getDataType() != null) {
                        insertRegressions(currentModel, weatherModelDS);
                    } else {
                        log.warn("No data type defined for model.  Building = " + bl_id
                                + ".  Service start date = " + date_start + ".");
                    }
                }
            } else {
                log.warn("No service period found for building: " + bl_id);
            }
        }
    }
    
    /**
     * performRegression performs a linear regression on the series and calculates the residuals
     * 
     * @param series
     * @param degreeDaysSelected
     * @param measurementType
     * 
     */
    private static RegressionResultService performRegression(final List<DataRecord> series,
            final String degreeDaysSelected, final String measurementType) {
        
        RealVector measurementVector;
        RealMatrix degreeDayMatrix;
        RealVector dayVector;
        RealVector coeffs = null;
        RealVector residuals = null;
        double residualMean;
        RegressionResultService result = null;
        
        try {
            measurementVector = RegressionUtilService.getMeasurementVector(series, measurementType);
            degreeDayMatrix =
                    RegressionUtilService.getDegreeDayMatrix(series, degreeDaysSelected,
                        measurementType);
            dayVector = RegressionUtilService.getDayVector(degreeDayMatrix);
            coeffs =
                    RegressionUtilService.performLinearRegression(degreeDayMatrix,
                        measurementVector);
            residuals =
                    RegressionUtilService.getResiduals(degreeDayMatrix, measurementVector, coeffs);
            
            // divide residuals by the number of days to get the error per day
            residuals = residuals.ebeDivide(dayVector);
            residualMean = RegressionUtilService.getVectorAbsMean(residuals);
            
            result = new RegressionResultService(coeffs, residualMean);
        } catch (final ExceptionBase webCentralException) {
            String msg =
                    "Error performing regression, setting result to null. "
                            + webCentralException.toStringForLogging();
            if (series.size() > 0) {
                msg += "  First record of data series: " + series.get(0);
            }
            log.warn(msg);
            result = null;
        }
        
        return result;
    }
    
    /**
     * getModel builds a new RegressionModelVO based on the results of a regression
     * 
     * @param degreeDaysSelected
     * @param utilityType
     * @param measurementType
     * @param result
     * @param timePeriod
     * @param bl_id
     * @param cooling_balance_point
     * @param heating_balance_point
     * @return RegressionModelVO
     */
    private static RegressionModelVOService getModel(final String degreeDaysSelected,
            final String utilityType, final String measurementType,
            final RegressionResultService result, final String timePeriod, final String bl_id,
            final Double cooling_balance_point, final Double heating_balance_point) {
        
        final StringBuffer formula = new StringBuffer("");
        final RealVector coeffs = result.getCoeffs();
        
        final RegressionModelVOService model = new RegressionModelVOService();
        
        model.setBuildingId(bl_id);
        
        if (measurementType.equals(RegressionConstantsService.DEMAND)) {
            model.setDataType(RegressionConstantsService.DEMAND_REGRESSION_TYPE);
        } else {
            model.setDataType(RegressionConstantsService.CONSUMPTION_REGRESSION_TYPE
                .get(utilityType));
        }
        
        if (degreeDaysSelected.equals(RegressionConstantsService.HDD_CDD)) {
            model.setBaseload(coeffs.getEntry(2));
            model.setHddCoefficient(coeffs.getEntry(0));
            model.setCddCoefficient(coeffs.getEntry(1));
        } else if (degreeDaysSelected.equals(RegressionConstantsService.HDD)) {
            model.setBaseload(coeffs.getEntry(1));
            model.setHddCoefficient(coeffs.getEntry(0));
            model.setCddCoefficient(0.0);
        } else if (degreeDaysSelected.equals(RegressionConstantsService.CDD)) {
            model.setBaseload(coeffs.getEntry(1));
            model.setHddCoefficient(0.0);
            model.setCddCoefficient(coeffs.getEntry(0));
        } else {
            log.warn("Invalid regression parameter. Parameter = " + degreeDaysSelected);
            throw new ExceptionBase("Invalid regression parameter.");
        }
        model.setResidualMean(result.getResidualMean());
        
        model.setOatH1(20.0);
        model.setOatH2(heating_balance_point);
        model.setOatC1(cooling_balance_point);
        model.setOatC2(90.0);
        
        if (measurementType.equals(RegressionConstantsService.DEMAND)) {
            formula.append("kW = ");
            if (model.getHddCoefficient() != 0.0) {
                formula.append(NumberUtilService.roundString(model.getHddCoefficient(), 2));
                formula.append(" x HDD + ");
            }
            if (model.getCddCoefficient() != 0.0) {
                formula.append(NumberUtilService.roundString(model.getCddCoefficient(), 2));
                formula.append(" x CDD + ");
            }
            formula.append(NumberUtilService.roundString(model.getBaseload(), 2));
        } else if (utilityType.equals(RegressionConstantsService.ELECTRIC)) {
            formula.append("kWh = ");
            if (model.getHddCoefficient() != 0.0) {
                formula.append(NumberUtilService.roundString(model.getHddCoefficient(), 3));
                formula.append(" x HDD + ");
            }
            if (model.getCddCoefficient() != 0.0) {
                formula.append(NumberUtilService.roundString(model.getCddCoefficient(), 3));
                formula.append(" x CDD + ");
            }
            formula.append(NumberUtilService.roundString(model.getBaseload(), 3));
            formula.append(" x DAYS");
        } else if (utilityType.equals(RegressionConstantsService.GASNATURAL)
                || utilityType.equals(RegressionConstantsService.GASPROPANE)) {
            formula.append("MMBTU = ");
            if (model.getHddCoefficient() != 0.0) {
                formula.append(NumberUtilService.roundString(model.getHddCoefficient(), 3));
                formula.append(" x HDD + ");
            }
            if (model.getCddCoefficient() != 0.0) {
                formula.append(NumberUtilService.roundString(model.getCddCoefficient(), 3));
                formula.append(" x CDD + ");
            }
            formula.append(NumberUtilService.roundString(model.getBaseload(), 3));
            formula.append(" x DAYS");
        }
        model.setFormula(formula.toString());
        
        if (measurementType.equals(RegressionConstantsService.DEMAND)) {
            // for demand formula, multiply by hdd or cdd per month - not per day
            model
                .setHeating(model.getBaseload()
                        + (model.getHddCoefficient()
                                * RegressionConstantsService.AVG_DAYS_PER_MONTH * (heating_balance_point - 20.0)));
            model
                .setCooling(model.getBaseload()
                        + (model.getCddCoefficient()
                                * RegressionConstantsService.AVG_DAYS_PER_MONTH * (90.0 - cooling_balance_point)));
        } else {
            model.setHeating(model.getBaseload()
                    + (model.getHddCoefficient() * (heating_balance_point - 20.0)));
            model.setCooling(model.getBaseload()
                    + (model.getCddCoefficient() * (90.0 - cooling_balance_point)));
        }
        
        model.setTimePeriod(timePeriod);
        
        return model;
    }
    
    /**
     * Inserts a record in the weather_model table with the values provided by the RegressionModelVO
     * 
     * @param currentModel
     * @param weatherModelDS
     */
    private static void insertRegressions(final RegressionModelVOService currentModel,
            final DataSource weatherModelDS) {
        final DataRecord newRecord = weatherModelDS.createNewRecord();
        
        newRecord.setValue("weather_model.bl_id", currentModel.getBuildingId());
        newRecord.setValue("weather_model.time_period", currentModel.getTimePeriod());
        newRecord.setValue("weather_model.model_type", currentModel.getDataType());
        newRecord.setValue("weather_model.aggregation_type", "MONTHLY");
        newRecord.setValue("weather_model.coefficient_base_load", currentModel.getBaseload());
        newRecord.setValue("weather_model.coefficient_cdd", currentModel.getCddCoefficient());
        newRecord.setValue("weather_model.coefficient_hdd", currentModel.getHddCoefficient());
        newRecord.setValue("weather_model.cooling", currentModel.getCooling());
        newRecord.setValue("weather_model.heating", currentModel.getHeating());
        newRecord.setValue("weather_model.oat_c1", currentModel.getOatC1());
        newRecord.setValue("weather_model.oat_c2", currentModel.getOatC2());
        newRecord.setValue("weather_model.oat_h1", currentModel.getOatH1());
        newRecord.setValue("weather_model.oat_h2", currentModel.getOatH2());
        // newRecord.setValue("weather_model.formula", currentModel.getFormula());
        weatherModelDS.saveRecord(newRecord);
    }
}
