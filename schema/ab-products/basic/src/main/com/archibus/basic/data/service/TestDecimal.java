package com.archibus.basic.data.service;

import java.text.DecimalFormat;

public class TestDecimal {
    public static void main(String[] args) {
        DecimalFormat df = new DecimalFormat("#.00");
        double d = 9876543.198;
        
        System.out.println(df.format(d));
    }
}
