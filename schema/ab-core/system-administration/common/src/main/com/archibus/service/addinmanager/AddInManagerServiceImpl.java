package com.archibus.service.addinmanager;

import java.io.File;

import com.archibus.config.ConfigManager.Immutable;
import com.archibus.config.*;
import com.archibus.context.ContextStore;
import com.archibus.model.licensing.*;
import com.archibus.utility.ExceptionBase;

/**
 * {@link AddInManagerService}
 * 
 * @author Sergey Kuramshin
 */
public class AddInManagerServiceImpl implements AddInManagerService {
    
    /**
     * Predefined third-party password.
     */
    private static final String THIRD_PARTY_PASSWORD = "addm3in";
    
    /** {@inheritDoc} */
    public String writeAddInLicenseFile(String password, String customerName,
            String applicationName, String applicationTitle, int concurrentUsers, String securityKey) {
        
        if (!THIRD_PARTY_PASSWORD.equals(password)) {
            // @translatable
            String error =
                    "Invalid password.  If you are a registered ARCHIBUS Developer Network member, please email your business development contact at ARCHIBUS for the password to this license generator.";
            ExceptionBase exception = new ExceptionBase();
            exception.setPattern(error);
            throw exception;
        }
        
        AddInActivityLicense license =
                new AddInActivityLicense(applicationName, applicationTitle, true, concurrentUsers,
                    customerName, securityKey);
        
        String licensePath = determineLicensePath(license);
        
        AddInActivityLicenseLoader loader = new AddInActivityLicenseLoader();
        loader.save(license, licensePath);
        
        return determineLicenseFilename(license);
    }
    
    /**
     * Returns the path to the add-in license file.
     * 
     * @param license
     * @return
     */
    private String determineLicensePath(AddInActivityLicense license) {
        // determine the add-in license folder path
        // TODO inject configManager using configuration file
        Immutable configManager = ContextStore.get().getConfigManager();
        String addInLicensePath = ConfigManagerLoader.determineAddInLicensePath(configManager);
        
        // generate the license file name
        String licenseFilename = determineLicenseFilename(license);
        
        return addInLicensePath + File.separator + licenseFilename;
    }
    
    /**
     * Returns the add-in license file name.
     * 
     * @param license
     * @return
     */
    private String determineLicenseFilename(AddInActivityLicense license) {
        return (AddInActivityLicenseLoader.FILE_PREFIX + license.getId() + ".bin");
    }
    
    /** {@inheritDoc} */
    public void updateActivityParameter(final String activityId, final String parameterId,
            final String value, final String description) {
        // TODO inject project using configuration file
        com.archibus.context.Context context = ContextStore.get();
        ProjectImpl project = (ProjectImpl) context.getProject();
        
        project.getActivityParameterManager().updateParameter(activityId, parameterId, value,
            description);
    }
}
