package com.archibus.basic.data.service;

import java.text.DecimalFormat;

public class DataServiceUtils {
    public static final String SUM = "sum";
    
    public static final String COUNT = "count";
    
    public static final String FORMAT = "#,###.00";
    
    public static String get2Double(double a) {
        DecimalFormat df = new DecimalFormat(FORMAT);
        return df.format(a);
    }
    
    public static double roundToNDecimals(double input, int decimals) {
        String pattern = "#.";
        for (int i = 0; i < decimals - 1; i++) {
            pattern += "#";
        }
        DecimalFormat formatter = new DecimalFormat(pattern);
        
        return Double.valueOf(formatter.format(input));
    }
}
