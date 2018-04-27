package com.archibus.eventhandler.waste;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;
import com.aspose.pdf.kit.Form;

/**
 * Waste Management Manifest PDF form class.
 * 
 * 
 * @author ASC-BJ
 *         <p>
 *         Suppress PMD.TooManyMethods warning.
 *         <p>
 *         Justification: This class contains necessary small methods to fill different part of a
 *         complicated PDF Form.
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
// TODO: (VT) I disagree with the suppression. This class should be re-factored. -KB3038954
public final class WasteManifestPdfFormWriter {
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String PAGE1 = "p1";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_PROFILES_WASTE_PROFILE = "waste_profiles.waste_profile";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_PROFILE = "waste_profile_reg_codes.waste_profile='";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_REGULATED_CODE = "waste_profile_reg_codes.regulated_code";
    
    /**
     * Indicates x.
     * 
     */
    private static final String XVALUE = "X";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String CONTACT_ADDRESS2 = "contact.address2";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String CONTACT_ADDRESS1 = "contact.address1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String PROPERTY_ADDRESS2 = "property.address2";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String PROPERTY_ADDRESS1 = "property.address1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String BL_ADDRESS2 = "bl.address2";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String BL_ADDRESS1 = "bl.address1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_GENERATORS_PR_ID = "waste_generators.pr_id";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_GENERATORS_BL_ID = "waste_generators.bl_id";
    
    /**
     * Indicates the format.
     * 
     */
    private static final String QTY = "0.00";
    
    /**
     * Indicates check box.
     * 
     */
    private static final String BOXY = "Y";
    
    /**
     * Indicates the EPAID name.
     * 
     */
    private static final String EPAID = "vn.insurance_cert1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_OUT_QUANTITY = "waste_out.quantity";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String CEC_GEN_PHONE = "cec_gen_phone";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_GENERATORS_CONTACT_ID = "waste_generators.contact_id";
    
    /**
     * Indicates check box.
     * 
     */
    private static final String BOXE = "E";
    
    /**
     * Indicates check box.
     * 
     */
    private static final String BOXI = "I";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_CONTACTNOTES = "teams_contactnotes";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_FAC_SIGN = "teams_fac_sign";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_ALT_SIGN = "teams_alt_sign";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String FULL_REJECTION = "waste_manifests.discrepancy_full_rejection";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String PARTIAL_REJECTION = "waste_manifests.discrepancy_partial_rejection";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_MANIFESTS_DISCREPANCY_TYPE =
            "waste_manifests.discrepancy_type";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_MANIFESTS_DISCREPANCY_QTY = "waste_manifests.discrepancy_qty";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_MANIFESTS_DISCREPANCY_RESIDUE =
            "waste_manifests.discrepancy_residue";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String BL_CONTACT_PHONE = "bl.contact_phone";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String COMPANY = "company";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String VN_VN_ID = "vn.vn_id='";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_FACILITY_NUMBER =
            "waste_facilities.facility_number";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_ZIP = "waste_facilities.zip";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_STATE_ID = "waste_facilities.state_id";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_CITY_ID = "waste_facilities.city_id";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_FACILITY_ID = "waste_facilities.facility_id='";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_ADDRESS2 = "waste_facilities.address2";
    
    /**
     * Indicates the record size.
     * 
     */
    private static final int FIRST_PAGE_WASTE_SIZE = 4;
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_ADDRESS1 = "waste_facilities.address1";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String VN_COMPANY = "vn.company";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_MEN_NUM = "waste_manifests.manifest_number";
    
    /**
     * Indicates the field name of 'waste_out.generator_id'.
     * 
     */
    private static final String WASTE_OUT_GENERATOR_ID = "waste_out.generator_id";
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteManifestPdfFormWriter() {
        
    }
    
    /**
     * fill pdf value.
     * 
     * 
     * @param pdf WasteManifestPdf object
     * @param wasteOutRecords List<DataRecord>
     * @param manifestRecord DataRecord
     * @param form Form
     * @param page int
     */
    public static void fillPdf(final WasteManifestPdf pdf, final List<DataRecord> wasteOutRecords,
            final DataRecord manifestRecord, final Form form, final int page) {
        try {
            // fill totalPages
            form.setField("totalPagesp1", String.valueOf(page));
            // fill the manifest info
            fillBasicManifestInfo(pdf, manifestRecord, form);
            // fill the check box info
            fillCheckBoxField(manifestRecord, form, page);
            // fill the fac info
            fillFacInfo(pdf, manifestRecord, form);
            if (!wasteOutRecords.isEmpty()) {
                // fill waste out info
                fillOut(pdf, wasteOutRecords, form, page);
                final String gId =
                        WasteUtility.isNull(String.valueOf(wasteOutRecords.get(0).getValue(
                            WASTE_OUT_GENERATOR_ID)));
                if (!"".equals(gId) && null != gId) {
                    // fill generator info
                    fillGenerator(pdf, form, gId);
                }
            }// CHECKSTYLE:OFF
             // Suppress IllegalCatch warnings.
             // Justification: third-party API method throws a checked Exception, which needs to be
             // wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * Fill basic ManifestInfo.
     * 
     * @param pdf WasteManifestPdf object
     * @param manifestRecord DataRecord
     * @param form manifestRecord
     */
    public static void fillBasicManifestInfo(final WasteManifestPdf pdf,
            final DataRecord manifestRecord, final Form form) {
        final String[] fieldName =
                { WASTE_MEN_NUM, "waste_manifests.handling_instructions",
                        "waste_manifests.signed_by", "waste_manifests.port",
                        "waste_manifests.sign_transporter", "waste_manifests.sign_transporter_2",
                        "waste_manifests.manifest_reference_num",
                        WASTE_MANIFESTS_DISCREPANCY_RESIDUE,
                        "waste_manifests.sign_alternate_facility", "waste_manifests.sign_facility",
                        WASTE_MANIFESTS_DISCREPANCY_QTY, WASTE_MANIFESTS_DISCREPANCY_TYPE,
                        PARTIAL_REJECTION, FULL_REJECTION,
                        "waste_manifests.facility_contact_notes",
                        "waste_manifests.exception_notes", "waste_manifests.ship_month",
                        "waste_manifests.ship_day", "waste_manifests.ship_year",
                        "waste_manifests.trans1_month", "waste_manifests.trans1_day",
                        "waste_manifests.trans1_year", "waste_manifests.trans2_month",
                        "waste_manifests.trans2_day", "waste_manifests.trans2_year",
                        "waste_manifests.fac_month", "waste_manifests.fac_day",
                        "waste_manifests.fac_year", "waste_manifests.leave_date_month",
                        "waste_manifests.leave_date_day", "waste_manifests.leave_date_year",
                        "waste_manifests.alt_ship_month", "waste_manifests.alt_ship_day",
                        "waste_manifests.alt_ship_year" };
        final String[] pdfName =
                { "teams_manifest_no", "teams_handling", "teams_signature", "teams_port",
                        "teams_trans1_sign", "teams_trans2_sign", "teams_manifest_ref",
                        WasteManifestPdfConstant.TEAMS_DIS_RESIDUE, TEAMS_ALT_SIGN, TEAMS_FAC_SIGN,
                        WasteManifestPdfConstant.TEAMS_DIS_QTY,
                        WasteManifestPdfConstant.TEAMS_DIS_TYPE,
                        WasteManifestPdfConstant.TEAMS_DIS_PART,
                        WasteManifestPdfConstant.TEAMS_DIS_FULL, TEAMS_CONTACTNOTES,
                        "teams_excnotes", "ship_month", "ship_day", "ship_year", "trans1_month",
                        "trans1_day", "trans1_year", "trans2_month", "trans2_day", "trans2_year",
                        "fac_month", "fac_day", "fac_year", "leave_date_month", "leave_date_day",
                        "leave_date_year", "alt_ship_month", "alt_ship_day", "alt_ship_year" };
        pdf.setBlank(WasteUtility.checkBlank(manifestRecord, fieldName, pdf.isBlank()));
        // set value to pdf
        try {
            for (int i = 0; i < pdfName.length; i++) {
                form.setField(pdfName[i],
                    WasteUtility.isNull(String.valueOf(manifestRecord.getValue(fieldName[i]))));
            }
            final DataSource vnDs =
                    DataSourceFactory.createDataSourceForFields("vn", new String[] { "vn_id",
                            "insurance_cert1", COMPANY });
            // fill vn info
            final String vnId = manifestRecord.getString("waste_manifests.transporter_id");
            final String vnId2 = manifestRecord.getString("waste_manifests.transporter_id_2");
            if (StringUtil.notNullOrEmpty(vnId)) {
                final DataRecord vnRecord =
                        vnDs.getRecord(VN_VN_ID + vnId + WasteManifestPdfConstant.STRING_1);
                form.setField("teams_trans_no", WasteUtility.isNull(vnRecord.getString(EPAID)));
                form.setField("teams_trans_name",
                    WasteUtility.isNull(vnRecord.getString(VN_COMPANY)));
            }
            if (StringUtil.notNullOrEmpty(vnId2)) {
                final DataRecord vnRecord2 =
                        vnDs.getRecord(VN_VN_ID + vnId2 + WasteManifestPdfConstant.STRING_1);
                form.setField("teams_trans_no2", WasteUtility.isNull(vnRecord2.getString(EPAID)));
                form.setField("teams_trans_name2",
                    WasteUtility.isNull(vnRecord2.getString(VN_COMPANY)));
            }
            // CHECKSTYLE:OFF
            // TODO: (VT): No justification.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * fill CheckBox field.
     * 
     * @param manifestRecord DataRecord
     * @param form manifestRecord
     * @param page int
     */
    public static void fillCheckBoxField(final DataRecord manifestRecord, final Form form,
            final int page) {
        
        final String international =
                manifestRecord.getString("waste_manifests.international_shipments");
        
        try {
            if (BOXI.equals(international)) {
                form.setField("txtImport", BOXI);
            }
            if (BOXE.equals(international)) {
                form.setField("txtExport", BOXE);
            }
            
            // CHECKSTYLE:OFF
            // TODO: (VT): No justification.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
        
        setCheckBoxFields(new String[] { FULL_REJECTION, PARTIAL_REJECTION,
                WASTE_MANIFESTS_DISCREPANCY_TYPE, WASTE_MANIFESTS_DISCREPANCY_QTY,
                WASTE_MANIFESTS_DISCREPANCY_RESIDUE }, new String[] {
                WasteManifestPdfConstant.TEAMS_DIS_FULL, WasteManifestPdfConstant.TEAMS_DIS_PART,
                WasteManifestPdfConstant.TEAMS_DIS_TYPE, WasteManifestPdfConstant.TEAMS_DIS_QTY,
                WasteManifestPdfConstant.TEAMS_DIS_RESIDUE }, form, manifestRecord);
        
        for (int num = 2; num <= page; num++) {
            
            setCheckBoxFields(new String[] { FULL_REJECTION, PARTIAL_REJECTION,
                    WASTE_MANIFESTS_DISCREPANCY_TYPE, WASTE_MANIFESTS_DISCREPANCY_QTY,
                    WASTE_MANIFESTS_DISCREPANCY_RESIDUE },
                new String[] {
                        WasteManifestPdfConstant.TEAMS_DIS_FULL + WasteManifestPdfConstant.P2_STR
                                + num,
                        WasteManifestPdfConstant.TEAMS_DIS_PART + WasteManifestPdfConstant.P2_STR
                                + num,
                        WasteManifestPdfConstant.TEAMS_DIS_TYPE + WasteManifestPdfConstant.P2_STR
                                + num,
                        WasteManifestPdfConstant.TEAMS_DIS_QTY + WasteManifestPdfConstant.P2_STR
                                + num,
                        WasteManifestPdfConstant.TEAMS_DIS_RESIDUE
                                + WasteManifestPdfConstant.P2_STR + num }, form, manifestRecord);
        }
    }
    
    /**
     * fill Generator.
     * 
     * 
     * @param pdf WasteManifestPdf object
     * @param form Form
     * @param gId String
     */
    public static void fillGenerator(final WasteManifestPdf pdf, final Form form, final String gId) {
        final DataRecord genRecord =
                pdf.getGenDs().getRecord(
                    "waste_generators.generator_id='" + gId + WasteManifestPdfConstant.STRING_1);
        final String[] fieldName =
                { "waste_generators.generator_id", "waste_generators.generator_name",
                        BL_CONTACT_PHONE, "contact.email" };
        final String[] pdfName =
                { "teams_generator_id", "teams_gen_name", "teams_gen_phone", "teams_mail_name" };
        // check have null or "" value
        pdf.setBlank(WasteUtility.checkBlank(genRecord, fieldName, pdf.isBlank()));
        try {
            // set value to pdf
            for (int i = 0; i < pdfName.length; i++) {
                form.setField(pdfName[i],
                    WasteUtility.isNull(String.valueOf(genRecord.getValue(fieldName[i]))));
            }
            form.setField("teams_emp_phone",
                WasteUtility.isNull(String.valueOf(genRecord.getValue(BL_CONTACT_PHONE))));
            fillGeneratorAddress(genRecord, form);
            final String contact = genRecord.getString(WASTE_GENERATORS_CONTACT_ID);
            if (null == contact) {
                form.setField(CEC_GEN_PHONE,
                    WasteUtility.isNull(String.valueOf(genRecord.getValue(BL_CONTACT_PHONE))));
                
            } else {
                form.setField(CEC_GEN_PHONE,
                    WasteUtility.isNull(String.valueOf(genRecord.getValue("contact.phone"))));
            }
            // CHECKSTYLE:OFF
            // TODO: (VT): No justification.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * fill facInfo.
     * 
     * @param pdf WasteManifestPdf object
     * @param manifestRecord DataRecord
     * @param form Form
     */
    public static void fillFacInfo(final WasteManifestPdf pdf, final DataRecord manifestRecord,
            final Form form) {
        // get fac value from record
        final String fac = manifestRecord.getString("waste_manifests.facility_id");
        final String fac2 = manifestRecord.getString("waste_manifests.facility_id_alt");
        final String[] fieldName =
                { VN_COMPANY, WASTE_FACILITIES_ADDRESS1, WASTE_FACILITIES_ADDRESS2,
                        WASTE_FACILITIES_CITY_ID, WASTE_FACILITIES_STATE_ID, WASTE_FACILITIES_ZIP,
                        WASTE_FACILITIES_FACILITY_NUMBER, "waste_facilities.phone",
                        "waste_facilities.ctry_id" };
        final String[] pdfName =
                { COMPANY, "address1", "address2", "city_id", "state_id", "zip", "teams_fac_no",
                        "phone", "country" };
        final String[] pdfName2 =
                { "company_fac2", "address1_fac2", "address2_fac2", "city_id_fac2",
                        "state_id_fac2", "zip_fac2", "teams_fac_no2", "phone_fac2", "country_fac2" };
        try {
            if (StringUtil.notNullOrEmpty(fac)) {
                // get fac record info and set to pdf
                final DataRecord facRecord1 =
                        pdf.getFacDs().getRecord(
                            WASTE_FACILITIES_FACILITY_ID + fac + WasteManifestPdfConstant.STRING_1);
                pdf.setBlank(WasteUtility.checkBlank(facRecord1, fieldName, pdf.isBlank()));
                for (int i = 0; i < fieldName.length; i++) {
                    form.setField(pdfName[i], facRecord1.getString(fieldName[i]));
                }
            }
            if (StringUtil.notNullOrEmpty(fac2)) {
                // get second fac record info and set to pdf
                final DataRecord facRecord2 =
                        pdf.getFacDs()
                            .getRecord(
                                WASTE_FACILITIES_FACILITY_ID + fac2
                                        + WasteManifestPdfConstant.STRING_1);
                pdf.setBlank(WasteUtility.checkBlank(facRecord2, fieldName, pdf.isBlank()));
                for (int i = 0; i < fieldName.length; i++) {
                    form.setField(pdfName2[i], facRecord2.getString(fieldName[i]));
                }
            }// CHECKSTYLE:OFF
             // TODO: (VT): No justification.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * Fill waste out info.
     * 
     * @param pdf WasteManifestPdf object
     * @param wasteOutRecords List<DataRecord>
     * @param form Form
     * @param page int
     */
    public static void fillOut(final WasteManifestPdf pdf, final List<DataRecord> wasteOutRecords,
            final Form form, final int page) {
        final String[] fieldNames =
                { "waste_profiles.transp_shipping_name", "waste_profiles.waste_name",
                        "waste_profiles.transp_classification", "waste_out.number_containers",
                        "waste_out.container_cat", WASTE_OUT_QUANTITY, "waste_out.units",
                        "waste_out.method_code" };
        // fill single page
        fillSinglePageOut(pdf, wasteOutRecords, form, fieldNames,
            WasteManifestPdfConstant.OUT_PDF_NAMES);
        if (page > 1) {
            // fill mutiple page
            fillMultiplePageOut(pdf, wasteOutRecords, form, page, fieldNames,
                WasteManifestPdfConstant.OUT_PDF_NAMES);
        }
    }
    
    /**
     * Fill generator Site address according to new logic.
     * 
     * @param genRecord DataRecord
     * @param form Form
     * @param mailAddress1 String
     * @param mailAddress2 String
     * @param prFieldName String[]
     * @param blFieldName String[]
     * 
     */
    public static void fillGeneratorSite(final DataRecord genRecord, final Form form,
            final String mailAddress1, final String mailAddress2, final String[] prFieldName,
            final String[] blFieldName) {
        final String[] siteAddress =
                { "teams_gen_address1", "teams_gen_address2", "teams_gen_city", "teams_gen_state",
                        "teams_gen_zip", "teams_gen_country" };
        final String blId = genRecord.getString(WASTE_GENERATORS_BL_ID);
        final String prId = genRecord.getString(WASTE_GENERATORS_PR_ID);
        try {
            if (StringUtil.notNullOrEmpty(blId)) {
                fillAddressByBuilding(genRecord, form, mailAddress1, mailAddress2, blFieldName,
                    siteAddress);
                
            } else if (StringUtil.notNullOrEmpty(prId)) {
                // set value to pdf
                fillAddressByProperty(form, mailAddress1, mailAddress2, prFieldName, siteAddress,
                    genRecord);
            }
            
            // CHECKSTYLE:OFF
            // TODO: (VT): No justification.
            // TODO: (VT): Which method throws Exception?
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * Fill generator Info of Property according to new logic.
     * 
     * @param form Form
     * @param mailAddress1 String
     * @param mailAddress2 String
     * @param prFieldName String[]
     * @param address String[]
     * @param genRecord DataRecord
     * 
     */
    public static void fillAddressByProperty(final Form form, final String mailAddress1,
            final String mailAddress2, final String[] prFieldName, final String[] address,
            final DataRecord genRecord) {
        String address1;
        String address2;
        address1 = WasteUtility.isNull(genRecord.getString(PROPERTY_ADDRESS1));
        address2 = WasteUtility.isNull(genRecord.getString(PROPERTY_ADDRESS2));
        if (!(address1.equals(mailAddress1) && address2.equals(mailAddress2))) {
            try {
                for (int i = 0; i < address.length; i++) {
                    form.setField(address[i],
                        WasteUtility.isNull(String.valueOf(genRecord.getValue(prFieldName[i]))));
                }
                // CHECKSTYLE:OFF
                // TODO: (VT): No justification.
            } catch (final Exception originalException) {
                // CHECKSTYLE:ON
                WasteUtility.wrapAndThrowException(originalException);
            }
        }
    }
    
    /**
     * Fill address Building Info according.
     * 
     * 
     * @param genRecord DataRecord
     * @param form Form
     * @param mailAddress1 String
     * @param mailAddress2 String
     * @param siteAddress String[]
     * @param blFieldName String[]
     * 
     */
    public static void fillAddressByBuilding(final DataRecord genRecord, final Form form,
            final String mailAddress1, final String mailAddress2, final String[] blFieldName,
            final String[] siteAddress) {
        String address1;
        String address2;
        // set value to pdf
        address1 = WasteUtility.isNull(genRecord.getString(BL_ADDRESS1));
        address2 = WasteUtility.isNull(genRecord.getString(BL_ADDRESS2));
        if (!(address1.equals(mailAddress1) && address2.equals(mailAddress2))) {
            try {
                for (int i = 0; i < siteAddress.length; i++) {
                    form.setField(siteAddress[i],
                        WasteUtility.isNull(String.valueOf(genRecord.getValue(blFieldName[i]))));
                }
                // CHECKSTYLE:OFF
                // TODO: (VT): No justification.
            } catch (final Exception originalException) {
                // CHECKSTYLE:ON
                WasteUtility.wrapAndThrowException(originalException);
            }
        }
    }
    
    /**
     * Fill generator Address Info.
     * 
     * 
     * @param genRecord DataRecord
     * @param form Form
     */
    public static void fillGeneratorAddress(final DataRecord genRecord, final Form form) {
        final String[] blFieldName =
                { BL_ADDRESS1, BL_ADDRESS2, "bl.city_id", "bl.state_id", "bl.zip", "bl.ctry_id" };
        final String[] prFieldName =
                { PROPERTY_ADDRESS1, PROPERTY_ADDRESS2, "property.city_id", "property.state_id",
                        "property.zip", "property.ctry_id" };
        final String[] contactFieldName =
                { CONTACT_ADDRESS1, CONTACT_ADDRESS2, "contact.city_id", "contact.state_id",
                        "contact.zip", "contact.ctry_id" };
        final String[] mailAddress =
                { "teams_mail_address1", "teams_mail_address2", "teams_mail_city",
                        "teams_mail_state", "teams_mail_zip", "teams_mail_country" };
        final String contact = genRecord.getString(WASTE_GENERATORS_CONTACT_ID);
        final String blId = genRecord.getString(WASTE_GENERATORS_BL_ID);
        final String prId = genRecord.getString(WASTE_GENERATORS_PR_ID);
        String mAddress1 = "";
        String mAddress2 = "";
        try {
            if (StringUtil.notNullOrEmpty(contact)) {
                // set value to pdf
                mAddress1 = WasteUtility.isNull(genRecord.getString(CONTACT_ADDRESS1));
                mAddress2 = WasteUtility.isNull(genRecord.getString(CONTACT_ADDRESS2));
                for (int i = 0; i < mailAddress.length; i++) {
                    form.setField(mailAddress[i], WasteUtility.isNull(String.valueOf(genRecord
                        .getValue(contactFieldName[i]))));
                }
            } else if (StringUtil.notNullOrEmpty(blId)) {
                // set value to pdf
                mAddress1 = WasteUtility.isNull(genRecord.getString(BL_ADDRESS1));
                mAddress2 = WasteUtility.isNull(genRecord.getString(BL_ADDRESS2));
                for (int i = 0; i < mailAddress.length; i++) {
                    form.setField(mailAddress[i],
                        WasteUtility.isNull(String.valueOf(genRecord.getValue(blFieldName[i]))));
                }
            } else if (StringUtil.notNullOrEmpty(prId)) {
                // set value to pdf
                mAddress1 = WasteUtility.isNull(genRecord.getString(PROPERTY_ADDRESS1));
                mAddress2 = WasteUtility.isNull(genRecord.getString(PROPERTY_ADDRESS2));
                for (int i = 0; i < mailAddress.length; i++) {
                    form.setField(mailAddress[i],
                        WasteUtility.isNull(String.valueOf(genRecord.getValue(prFieldName[i]))));
                }
            }
            
            // CHECKSTYLE:OFF
            // TODO: (VT): No justification.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
        fillGeneratorSite(genRecord, form, mAddress1, mAddress2, prFieldName, blFieldName);
    }
    
    /**
     * Fill Multiple Page Out.
     * 
     * 
     * @param pdf WasteManifestPdf object
     * @param wasteOutRecords List<DataRecord>
     * @param form Form
     * @param page int
     * @param fieldNames String[]
     * @param pdfNames String[]
     */
    public static void fillMultiplePageOut(final WasteManifestPdf pdf,
            final List<DataRecord> wasteOutRecords, final Form form, final int page,
            final String[] fieldNames, final String[] pdfNames) {
        DataRecord outRecord = null;
        try {
            for (int pnum = 2; pnum <= page; pnum++) {
                form.setField(WasteManifestPdfConstant.CURRENT_PAGE
                        + WasteManifestPdfConstant.P2_STR + pnum, String.valueOf(pnum));
                form.setField(WasteManifestPdfConstant.TOTAL_PAGES
                        + WasteManifestPdfConstant.P2_STR + pnum, String.valueOf(page));
                int inum = 0;
                for (int outNum =
                        FIRST_PAGE_WASTE_SIZE + WasteManifestPdfConstant.CONT_PAGE_WASTE_SIZE
                                * (pnum - 2); outNum < wasteOutRecords.size(); outNum++) {
                    outRecord = wasteOutRecords.get(outNum);
                    pdf.setBlank(WasteUtility.checkBlank(outRecord, fieldNames, pdf.isBlank()));
                    inum =
                            outNum - FIRST_PAGE_WASTE_SIZE
                                    - WasteManifestPdfConstant.CONT_PAGE_WASTE_SIZE * (pnum - 2)
                                    + 1;
                    final List<DataRecord> codeRecords =
                            pdf.getCodeDS().getRecords(
                                WASTE_PROFILE + outRecord.getValue(WASTE_PROFILES_WASTE_PROFILE)
                                        + WasteManifestPdfConstant.STRING_1);
                    // set out info to pdf
                    for (int s = 0; s < fieldNames.length; s++) {
                        if (WASTE_OUT_QUANTITY.equals(fieldNames[s])) {
                            final double quantity = outRecord.getDouble(fieldNames[s]);
                            final String squantity =
                                    new java.text.DecimalFormat(QTY).format(quantity);
                            form.setField(pdfNames[s] + inum + WasteManifestPdfConstant.P2_STR
                                    + pnum, squantity);
                        } else {
                            form.setField(pdfNames[s] + inum + WasteManifestPdfConstant.P2_STR
                                    + pnum, WasteUtility.isNull(String.valueOf(outRecord
                                .getValue(fieldNames[s]))));
                        }
                    }
                    if (pdf.isBoth()) {
                        final String hazardous =
                                outRecord.getString(WasteManifestPdfConstant.WASTE_TYPE);
                        if (WasteManifestPdfConstant.HAZ.equals(hazardous)) {
                            form.setField(WasteManifestPdfConstant.A9A + inum
                                    + WasteManifestPdfConstant.P2_STR + pnum, XVALUE);
                        }
                    }
                    // set code info to pdf
                    for (int t = 0; t < codeRecords.size(); t++) {
                        final int mnum = t + 1;
                        final DataRecord code = codeRecords.get(t);
                        final String[] fields = { WASTE_REGULATED_CODE };
                        pdf.setBlank(WasteUtility.checkBlank(code, fields, pdf.isBlank()));
                        form.setField(WasteManifestPdfConstant.TEAMS_HAZ_CODE + inum + mnum
                                + WasteManifestPdfConstant.P2_STR + pnum, WasteUtility
                            .isNull(String.valueOf(code.getValue(WASTE_REGULATED_CODE))));
                        
                    }
                    
                }
            }
            // CHECKSTYLE:OFF
            // TODO: (VT): No justification.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * Fill Single Page Out.
     * 
     * @param pdf WasteManifestPdf object
     * @param wasteOutRecords List<DataRecord>
     * @param form Form
     * @param fieldNames String[]
     * @param pdfNames String[]
     */
    public static void fillSinglePageOut(final WasteManifestPdf pdf,
            final List<DataRecord> wasteOutRecords, final Form form, final String[] fieldNames,
            final String[] pdfNames) {
        DataRecord outRecord = null;
        try {
            for (int i = 0; i < wasteOutRecords.size() && i < FIRST_PAGE_WASTE_SIZE; i++) {
                final int inum = i + 1;
                outRecord = wasteOutRecords.get(i);
                pdf.setBlank(WasteUtility.checkBlank(outRecord, fieldNames, pdf.isBlank()));
                final List<DataRecord> codeRecords =
                        pdf.getCodeDS().getRecords(
                            WASTE_PROFILE + outRecord.getValue(WASTE_PROFILES_WASTE_PROFILE)
                                    + WasteManifestPdfConstant.STRING_1);
                // set code info to pdf
                for (int t = 0; t < codeRecords.size(); t++) {
                    final int mnum = t + 1;
                    final DataRecord code = codeRecords.get(t);
                    final String[] fields = { WASTE_REGULATED_CODE };
                    pdf.setBlank(WasteUtility.checkBlank(code, fields, pdf.isBlank()));
                    form.setField(WasteManifestPdfConstant.TEAMS_HAZ_CODE + inum + mnum + PAGE1,
                        WasteUtility.isNull(String.valueOf(code.getValue(WASTE_REGULATED_CODE))));
                    
                }
                // set out info to pdf
                for (int s = 0; s < fieldNames.length; s++) {
                    if (WASTE_OUT_QUANTITY.equals(fieldNames[s])) {
                        final double quantity = outRecord.getDouble(fieldNames[s]);
                        final String squantity = new java.text.DecimalFormat(QTY).format(quantity);
                        form.setField(pdfNames[s] + inum + PAGE1, squantity);
                    } else {
                        form.setField(pdfNames[s] + inum + PAGE1,
                            WasteUtility.isNull(String.valueOf(outRecord.getValue(fieldNames[s]))));
                    }
                }
                if (pdf.isBoth()) {
                    final String hazardous =
                            outRecord.getString(WasteManifestPdfConstant.WASTE_TYPE);
                    if (WasteManifestPdfConstant.HAZ.equals(hazardous)) {
                        form.setField(WasteManifestPdfConstant.A9A + inum + PAGE1, XVALUE);
                    }
                }
            }
            
            // CHECKSTYLE:OFF
            // TODO: (VT): No justification.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * Set check box field in form by value of source field.
     * 
     * 
     * @param srcFields String[] source field array
     * @param form Form PDF form
     * @param checkFields String[] check box fields array
     * @param manifestRecord DataRecord manifest record
     */
    public static void setCheckBoxFields(final String[] srcFields, final String[] checkFields,
            final Form form, final DataRecord manifestRecord) {
        try {
            for (int i = 0; i < srcFields.length; i++) {
                if (1 == manifestRecord.getInt(srcFields[i])) {
                    form.setField(checkFields[i], BOXY);
                }
            }
            
            // CHECKSTYLE:OFF
            // TODO: (VT): No justification.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
        
    }
}
