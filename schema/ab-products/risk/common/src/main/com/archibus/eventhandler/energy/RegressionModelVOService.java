package com.archibus.eventhandler.energy;

/**
 * This Object holds values needed in the weather_model table.
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 */
public class RegressionModelVOService {

    private String _buildingId;
    private String _dataType;
    private String _timePeriod;
    private double _oatH1;
    private double _oatH2;
    private double _oatC1;
    private double _oatC2;
    private double _baseload;
    private double _heating;
    private double _cooling;
    private double _hddCoefficient;
    private double _cddCoefficient;
    private double _residualMean;
    private String _formula;
    
    public String getBuildingId() {
        return _buildingId;
    }

    public void setBuildingId(String buildingId) {
        _buildingId = buildingId;
    }

    public String getDataType() {
        return _dataType;
    }

    public void setDataType(String dataType) {
        _dataType = dataType;
    }

    public String getTimePeriod() {
        return _timePeriod;
    }

    public void setTimePeriod(String timePeriod) {
        _timePeriod = timePeriod;
    }

    public double getBaseload() {
        return _baseload;
    }

    public void setBaseload(double baseload) {
        _baseload = baseload;
    }

    public double getHeating() {
        return _heating;
    }

    public void setHeating(double heating) {
        _heating = heating;
    }

    public double getCooling() {
        return _cooling;
    }

    public void setCooling(double cooling) {
        _cooling = cooling;
    }

    public double getOatH1() {
        return _oatH1;
    }

    public void setOatH1(double oatH1) {
        _oatH1 = oatH1;
    }

    public double getOatH2() {
        return _oatH2;
    }

    public void setOatH2(double oatH2) {
        _oatH2 = oatH2;
    }

    public double getOatC1() {
        return _oatC1;
    }

    public void setOatC1(double oatC1) {
        _oatC1 = oatC1;
    }

    public double getOatC2() {
        return _oatC2;
    }

    public void setOatC2(double oatC2) {
        _oatC2 = oatC2;
    }

    public double getHddCoefficient() {
        return _hddCoefficient;
    }

    public void setHddCoefficient(double hddCoefficient) {
        _hddCoefficient = hddCoefficient;
    }

    public double getCddCoefficient() {
        return _cddCoefficient;
    }

    public void setCddCoefficient(double cddCoefficient) {
        _cddCoefficient = cddCoefficient;
    }

    public double getResidualMean() {
        return _residualMean;
    }

    public void setResidualMean(double residualMean) {
        _residualMean = residualMean;
    }

    public String getFormula() {
        return _formula;
    }

    public void setFormula(String formula) {
        _formula = formula;
    }

}

