package com.archibus.eventhandler.waste;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.pdflivecycle.PdfFormExportJob;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.FileUtil;
import com.aspose.pdf.kit.*;

/**
 * Waste Management Manifest PDF form class.
 * 
 * 
 * @author ASC-BJ
 */
public class WasteManifestPdf {
    
    /**
     * Indicates manifest.
     * 
     */
    private static final String MANIFEST = "manifest";
    
    /**
     * Indicates tempmanifestPage1.
     * 
     */
    private static final String TEMPMANIFEST_PAGE1_PDF = "waste_manifest_page1.pdf";
    
    /**
     * Indicates the code size.
     * 
     */
    private static final int CODE_SIZE = 6;
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEMP_PDF_FILE1 = "tempPDFFile1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEMP_PDF_FILE2 = "tempPDFFile2";
    
    /**
     * Indicates p2.
     * 
     */
    private static final String PAGE2 = "p2";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_DIS_PART = "teams_dis_part";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_DIS_RESIDUE = "teams_dis_residue";
    
    /**
     * Indicates abWasteRptFacilityDs.
     * 
     */
    private static final String AB_WASTE_RPT_FACILITY_DS = "abWasteRptFacilityDs";
    
    /**
     * Indicates the pdf.
     * 
     */
    private static final String PDF = ".pdf";
    
    /**
     * Indicates '.'.
     * 
     */
    private static final String STRING_1 = "'";
    
    /**
     * Indicates the record size.
     * 
     */
    private static final int FIRST_PAGE_WASTE_SIZE = 4;
    
    /**
     * Indicates the view name.
     * 
     */
    private static final String VIEW_NAME = "ab-waste-rpt-manifests.axvw";
    
    /**
     * DataSource of regulated_code.
     * 
     */
    private final DataSource codeDS = DataSourceFactory.createDataSourceForFields(
        "waste_profile_reg_codes", new String[] { "waste_profile", "regulated_code" });
    
    /**
     * DataSource of abWasteRptMainfestsDs.
     * 
     */
    private final DataSource manifestDs = DataSourceFactory.loadDataSourceFromFile(VIEW_NAME,
        "abWasteRptMainfestsDs");
    
    /**
     * DataSource of abWasteRptGeneratorDs.
     * 
     */
    private final DataSource genDs = DataSourceFactory.loadDataSourceFromFile(VIEW_NAME,
        "abWasteRptGeneratorDs");
    
    /**
     * DataSource of abWasteRptOutDs.
     * 
     */
    private final DataSource watesOutDs = DataSourceFactory.loadDataSourceFromFile(VIEW_NAME,
        "abWasteRptOutDs");
    
    /**
     * DataSource of AB_WASTE_RPT_FACILITY_DS.
     * 
     */
    private final DataSource facDs = DataSourceFactory.loadDataSourceFromFile(VIEW_NAME,
        AB_WASTE_RPT_FACILITY_DS);
    
    /**
     * Indicates the field name .
     * 
     */
    private final String manifestNumber;
    
    /**
     * Indicates the field name .
     * 
     */
    private boolean blank;
    
    /**
     * Indicates the field name .
     * 
     */
    private boolean both;
    
    /**
     * Constructor of Class.
     * 
     * @param manifestNumber manifest number
     * 
     */
    
    public WasteManifestPdf(final String manifestNumber) {
        this.manifestNumber = manifestNumber;
        this.blank = false;
        this.both = false;
    }
    
    /**
     * get blank.
     * 
     * @return boolean
     */
    public boolean isBlank() {
        return this.blank;
    }
    
    /**
     * set blank.
     * 
     * @param blank boolean
     */
    public void setBlank(final boolean blank) {
        this.blank = blank;
    }
    
    /**
     * get both.
     * 
     * @return boolean
     */
    public boolean isBoth() {
        return this.both;
    }
    
    /**
     * set both.
     * 
     * @param both boolean
     */
    public void setBoth(final boolean both) {
        this.both = both;
    }
    
    /**
     * Getter for the codeDS property.
     * 
     * @see codeDS
     * @return the codeDS property.
     */
    public DataSource getCodeDS() {
        return this.codeDS;
    }
    
    /**
     * Getter for the manifestDs property.
     * 
     * @see manifestDs
     * @return the manifestDs property.
     */
    public DataSource getManifestDs() {
        return this.manifestDs;
    }
    
    /**
     * Getter for the genDs property.
     * 
     * @see genDs
     * @return the genDs property.
     */
    public DataSource getGenDs() {
        return this.genDs;
    }
    
    /**
     * Getter for the watesOutDs property.
     * 
     * @see watesOutDs
     * @return the watesOutDs property.
     */
    public DataSource getWatesOutDs() {
        return this.watesOutDs;
    }
    
    /**
     * Getter for the facDs property.
     * 
     * @see facDs
     * @return the facDs property.
     */
    public DataSource getFacDs() {
        return this.facDs;
    }
    
    /**
     * generate manifest pdf form.
     * 
     * 
     * @return JobResult job result
     */
    public JobResult generateSingleManifestPdf() {
        
        // get records from datasource
        // KB 3033456 add the status restriction so that duplicated records are not showed in case
        // the manifest is assigned to both the Generated and Disposed waste records
        final List<DataRecord> wasteOutRecords =
                this.watesOutDs.getRecords("waste_out.manifest_number='" + this.manifestNumber
                        + "' AND waste_out.status='D'");
        final DataRecord manifestRecord =
                this.manifestDs.getRecord("waste_manifests.manifest_number='" + this.manifestNumber
                        + STRING_1);
        // get page number
        int page = 1;
        if (wasteOutRecords.size() > FIRST_PAGE_WASTE_SIZE) {
            page =
                    page + (wasteOutRecords.size() - FIRST_PAGE_WASTE_SIZE)
                            / WasteManifestPdfConstant.CONT_PAGE_WASTE_SIZE + 1;
        }
        // load pdf kit license
        PdfFormExportJob.loadPdfKitLibraryLicense();
        final String concatTempFilePath =
                getOutFilePath("tempmanifest" + this.manifestNumber + PDF);
        // get form
        final Form form = getForm(wasteOutRecords, concatTempFilePath, page);
        checkHaz(wasteOutRecords);
        
        // set value to pdf
        WasteManifestPdfFormWriter.fillPdf(this, wasteOutRecords, manifestRecord, form, page);
        
        try {
            form.allFlatten();
            // TODO: (VT): Should close() call be in a finally block? -KB3038953
            form.close();
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
        
        // TODO: (VT): Should deleteFile() call be in a finally block? -KB3038953
        // delete the template file
        FileUtil.deleteFile(concatTempFilePath);
        return new JobResult("", MANIFEST + this.manifestNumber + PDF,
            PdfFormExportJob.getPdfOutputFileContextPathAndName(MANIFEST + this.manifestNumber
                    + PDF));
        
    }
    
    /**
     * get template file path.
     * 
     * 
     * @param tempFileName String template file name
     * @return String template file path
     */
    private static String getTemplateFilePath(final String tempFileName) {
        return ContextStore.get().getWebAppPath()
                + "/schema/ab-products/common/resources/pdf-forms/" + tempFileName;
    }
    
    /**
     * get out file path.
     * 
     * 
     * @param outFileName String out file name
     * @return String out file path
     */
    private String getOutFilePath(final String outFileName) {
        return ContextStore.get().getWebAppPath() + "/schema/per-site/pdf-forms/"
                + ContextStore.get().getUser().getName().toLowerCase() + "/" + outFileName;
    }
    
    /**
     * get form.
     * 
     * @param wasteOutRecords List<DataRecord>
     * @param concatTempFilePath String
     * @param page int
     * @return Form
     * 
     */
    private Form getForm(final List<DataRecord> wasteOutRecords, final String concatTempFilePath,
            final int page) {
        Form form = null;
        FormEditor editor = null;
        final PdfFileEditor pdfEditor = new PdfFileEditor();
        final String outFilefolderPath = getOutFilePath("");
        final String outFilePath = getOutFilePath(MANIFEST + this.manifestNumber + PDF);
        FileUtil.createFoldersIfNot(outFilefolderPath);
        try {
            if (wasteOutRecords.size() <= FIRST_PAGE_WASTE_SIZE) {
                // only one page
                editor =
                        new FormEditor(getTemplateFilePath(TEMPMANIFEST_PAGE1_PDF),
                            concatTempFilePath);
                // TODO: (VT): Should close() call be in a finally block? -KB3038953
                editor.close();
                form = new Form(concatTempFilePath, outFilePath);
            } else {
                // mutiple page
                final String tempPDFFilePath1 =
                        getOutFilePath(TEMP_PDF_FILE1 + this.manifestNumber + PDF);
                final String tempPDFFilePath2 =
                        getOutFilePath(TEMP_PDF_FILE2 + this.manifestNumber + PDF);
                editor =
                        new FormEditor(getTemplateFilePath(TEMPMANIFEST_PAGE1_PDF),
                            tempPDFFilePath1);
                // TODO: (VT): Should close() call be in a finally block? -KB3038953
                editor.close();
                // add page to pdf
                for (int i = 0; i < page - 1; i++) {
                    
                    if (i != 0) {
                        editor = new FormEditor(concatTempFilePath, tempPDFFilePath1);
                        editor.close();
                    }
                    // rename the fields name before cancat the template
                    editor =
                            new FormEditor(getTemplateFilePath("waste_manifest_con_sheet.pdf"),
                                tempPDFFilePath2);
                    editor.renameField(WasteManifestPdfConstant.CURRENT_PAGE + PAGE2,
                        WasteManifestPdfConstant.CURRENT_PAGE + WasteManifestPdfConstant.P2_STR
                                + (i + 2));
                    editor.renameField(WasteManifestPdfConstant.TOTAL_PAGES + PAGE2,
                        WasteManifestPdfConstant.TOTAL_PAGES + WasteManifestPdfConstant.P2_STR
                                + (i + 2));
                    for (int num = 1; num <= WasteManifestPdfConstant.CONT_PAGE_WASTE_SIZE; num++) {
                        for (final String pdfName : WasteManifestPdfConstant.OUT_PDF_NAMES) {
                            editor.renameField(pdfName + num + PAGE2, pdfName + num
                                    + WasteManifestPdfConstant.P2_STR + (i + 2));
                        }
                        editor.renameField(WasteManifestPdfConstant.TEAMS_DIS_FULL,
                            WasteManifestPdfConstant.TEAMS_DIS_FULL
                                    + WasteManifestPdfConstant.P2_STR + (i + 2));
                        editor.renameField(TEAMS_DIS_PART, TEAMS_DIS_PART
                                + WasteManifestPdfConstant.P2_STR + (i + 2));
                        editor.renameField(WasteManifestPdfConstant.TEAMS_DIS_TYPE,
                            WasteManifestPdfConstant.TEAMS_DIS_TYPE
                                    + WasteManifestPdfConstant.P2_STR + (i + 2));
                        editor.renameField(WasteManifestPdfConstant.TEAMS_DIS_QTY,
                            WasteManifestPdfConstant.TEAMS_DIS_QTY
                                    + WasteManifestPdfConstant.P2_STR + (i + 2));
                        editor.renameField(TEAMS_DIS_RESIDUE, TEAMS_DIS_RESIDUE
                                + WasteManifestPdfConstant.P2_STR + (i + 2));
                        editor.renameField(WasteManifestPdfConstant.A9A + num + PAGE2,
                            WasteManifestPdfConstant.A9A + num + WasteManifestPdfConstant.P2_STR
                                    + (i + 2));
                        for (int code = 1; code <= CODE_SIZE; code++) {
                            editor.renameField(WasteManifestPdfConstant.TEAMS_HAZ_CODE + num + code
                                    + PAGE2, WasteManifestPdfConstant.TEAMS_HAZ_CODE + num + code
                                    + WasteManifestPdfConstant.P2_STR + (i + 2));
                        }
                    }
                    // TODO: (VT): Should close() call be in a finally block? -KB3038953
                    editor.close();
                    
                    // concat the pdf templates
                    pdfEditor.append(tempPDFFilePath1, tempPDFFilePath2, 1, 1, concatTempFilePath);
                    
                }
                
                // TODO: (VT): Should deleteFile() call be in a finally block? -KB3038953
                // delete the template file
                FileUtil.deleteFile(tempPDFFilePath1);
                FileUtil.deleteFile(tempPDFFilePath2);
                // create final page pdf form using the concat template
                form = new Form(concatTempFilePath, outFilePath);
            }
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
        return form;
    }
    
    /**
     * check Haz.
     * 
     * @param wasteOutRecords List<DataRecord>
     */
    private void checkHaz(final List<DataRecord> wasteOutRecords) {
        final Set<String> set = new HashSet<String>();
        for (int i = 0; i < wasteOutRecords.size(); i++) {
            final DataRecord out = wasteOutRecords.get(i);
            final String haz = out.getString(WasteManifestPdfConstant.WASTE_TYPE);
            set.add(haz);
        }
        if (set.size() > 1) {
            this.setBoth(set.contains(WasteManifestPdfConstant.HAZ));
        }
    }
    
}
