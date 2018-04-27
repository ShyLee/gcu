package com.archibus.service.school.tools;

import java.util.Scanner;

import javax.swing.JOptionPane;

public class RMB {
    static String[] digit = { "零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖" };
    
    static String[] segment = { "元", "万", "亿", "万亿" };
    
    static String[] unit = { "仟", "佰", "拾", "" };
    
    static String[] cent = { "角", "分" };
    
    /**
     * 把人民币小写转换为大写
     * 
     * @param value 人民币小写数字 double类型的
     * @return 转换后的人民币大写
     */
    public static String changeToUppercase(double value) {
        value = round(value, 2);
        final String valStr = String.valueOf((long) (value * 100)); // 此处必须是long
        if (valStr.length() > 16) {
            JOptionPane.showMessageDialog(null, "输入的钱数太大了!请重新输入!");
        }
        String zhengShuString = valStr.substring(0, valStr.length() - 2);
        final String xiaoShuString = valStr.substring(valStr.length() - 2);
        boolean isEnd = false;
        int vunitinit = 0;
        String prefixPart = "";
        while (true) {
            int begin = zhengShuString.length() - 4;
            String space = "";
            if (begin < 0) {
                begin = 0;
                for (int i = 0; i < 4 - zhengShuString.length(); i++) {
                    space += "0";
                    isEnd = true;
                }
                zhengShuString = space + zhengShuString;
            }
            final String temp = zhengShuString.substring(begin);
            String result = "";
            for (int i = 0; i < temp.length(); i++) {
                final int index = Integer.parseInt(temp.substring(i, i + 1));
                if (index != 0) {
                    result += digit[index] + unit[i];
                }
            }
            try {
                result += segment[vunitinit++];
            } catch (final Exception e) {
                System.out.println(e.getMessage());
            }
            prefixPart = result + prefixPart;
            zhengShuString = zhengShuString.substring(0, begin);
            if (isEnd || zhengShuString.length() == 0) {
                break;
            }
            
        }
        String suffixPart = "";
        for (int i = 0; i < xiaoShuString.length(); i++) {
            final int index = Integer.parseInt(xiaoShuString.substring(i, i + 1));
            if (index != 0) {
                suffixPart += digit[index] + cent[i];
            }
        }
        final StringBuffer prefixPartShort = new StringBuffer(prefixPart);
        replace(prefixPartShort, "壹拾亿", "拾亿");
        replace(prefixPartShort, "壹拾万", "拾万");
        if (prefixPartShort.length() == 3) {
            replace(prefixPartShort, "壹拾", "拾");
        }
        return prefixPartShort + suffixPart + "整";
    }
    
    /**
     * 替代字符
     * 
     * @param pValue
     * @param pSource
     * @param pDest
     */
    private static void replace(final StringBuffer pValue, final String pSource, final String pDest) {
        if (pValue == null || pSource == null || pDest == null) {
            return;
        }
        /** 记录pSource在pValue中的位置 */
        int intPos = 0;
        do {
            intPos = pValue.toString().indexOf(pSource);
            /** 没有找到pSource */
            if (intPos == -1) {
                break;
            }
            pValue.delete(intPos, intPos + pSource.length());
            pValue.insert(intPos, pDest);
        } while (true);
    }
    
    private static double round(final double value, final int scale) {
        return Math.round(value * Math.pow(10.0, scale)) / (Math.pow(10.0, scale));
    }
    
    public static void main(final String[] args) {
        System.out.println("请输入您要转换的金额数： ");
        final Scanner shu = new Scanner(System.in);
        final String a = changeToUppercase(shu.nextDouble());
        System.out.println("转换输出：" + a);
    }
}
