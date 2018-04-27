package com.archibus.service.school.equipment;

public class treeTest {
    
    public static String getConvertTreeLevel(final String treeId) {
        String treeLevelString = "0";// 初始化最终生成的层级字符串
        // 将层级字符串进行两两拆分，存入数组
        final String[] ArrayLevel = new String[treeId.length() / 2];
        int k = 0;// 数组的索引值
        for (int i = 0; i < treeId.length() - 1; i = i + 2) {
            if (k < ArrayLevel.length) {
                ArrayLevel[k] = treeId.substring(i, i + 2);
                k = k + 1;
            }
        }
        String nodeT = "";// 递增追加单个节点
        // 依次向后遍历数组，当值不为00时，就追加到层级字符串中，当遇到00时就退出
        for (int i = 0; i < ArrayLevel.length; i++) {
            final String node = ArrayLevel[i];
            if (!node.equals("00")) {
                String nodeLevel = nodeT.concat(node);// 初始化节点字符串
                nodeT = nodeT.concat(node);
                final int bulingshu = (8 - (i + 1) * 2);// 设置每个节点补零的个数
                for (int j = 0; j < bulingshu; j++) {
                    nodeLevel = nodeLevel.concat("0");
                }
                // 将节点字符串拼接到层级字符串中
                treeLevelString = treeLevelString.concat("|" + nodeLevel);
            } else if (node.equals("00")) {
                break;
            }
        }
        treeLevelString = treeLevelString.concat("|");
        return treeLevelString;
    }
    
    /**
     * @param args
     */
    public static void main(final String[] args) {
        // TODO Auto-generated method stub
        final String teeLevel = treeTest.getConvertTreeLevel("02010405");
        final String teeLevel2 = treeTest.getConvertTreeLevel("0201040501");
        final String teeLevel3 = treeTest.getConvertTreeLevel("0800000001");
        System.out.println(teeLevel);
        System.out.println(teeLevel2);
        System.out.println(teeLevel3);
    }
    
}
