package com.archibus.app.common;

import java.io.*;
import java.sql.*;
import java.text.Format;
import java.util.*;
import java.util.Date;

import javax.jcache.CacheAccess;
import javax.servlet.ServletContext;
import javax.servlet.http.*;

import org.dom4j.*;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.*;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.context.*;
import org.springframework.core.io.Resource;
import org.xml.sax.EntityResolver;

import com.archibus.app.common.space.dao.IRoomDao;
import com.archibus.app.common.space.domain.Room;
import com.archibus.app.sysadmin.event.data.CallbackFlag;
import com.archibus.config.*;
import com.archibus.config.Project.Immutable;
import com.archibus.context.*;
import com.archibus.context.Context;
import com.archibus.controller.*;
import com.archibus.core.event.data.IDataEventListener;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.*;
import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.WorkflowRuleImpl.ScheduleProperties;
import com.archibus.model.config.*;
import com.archibus.model.config.Currency;
import com.archibus.model.licensing.*;
import com.archibus.model.licensing.processor.CheckViewRenderingRequest;
import com.archibus.model.view.datasource.AbstractRestrictionDef;
import com.archibus.schema.*;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.security.UserAccount;
import com.archibus.utility.*;
import com.archibus.utility.Xml.Mutable;
import com.archibus.view.tablegroup.Visitor;

/**
 * Methods for creating mock objects for unit tests in applications.
 * <p>
 * 
 * @author Valery Tydykov
 * 
 *         <p>
 *         Suppress PMD warning "DefaultPackage" in this class.
 *         <p>
 *         Justification: the methods here should have package-level visibility.
 */
@SuppressWarnings({ "PMD.DefaultPackage" })
final public class MockUtilities {
    public static final String TABLE_NAME1 = "tableName1";
    
    public static final String TABLE_NAME2 = "tableName2";
    
    public static final String TEST_BEAN_NAME = "TestBeanName";
    
    /**
     * Constant: user name: "TestUserName".
     */
    public static final String TEST_USER_NAME = "TestUserName";
    
    /**
     * Non-instantiable.
     */
    private MockUtilities() {
    }
    
    public static IActivityParameterManager createMockActivityManager(
            final CallbackFlag callbackFlag, final Map<String, String> parametersKeyValue) {
        return new IActivityParameterManager() {
            
            public ActivityParameter addParameter(final String activityId,
                    final String parameterId, final String value, final String description) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void clear() {
                // TODO Auto-generated method stub
                
            }
            
            public Map<String, ActivityParameter> getAllParameters() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getParameterValue(final String key) {
                final String result = parametersKeyValue.get(key);
                
                return result;
            }
            
            public void updateParameter(final String activityId, final String parameterId,
                    final String value, final String description) {
                if (callbackFlag != null) {
                    // verify that this method was called
                    callbackFlag.called = true;
                }
            }
        };
    }
    
    public static ApplicationContext createMockApplicationContext(final CallbackFlag callbackFlag) {
        final ApplicationContext applicationContext = new ApplicationContext() {
            
            public boolean containsBean(final String arg0) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean containsBeanDefinition(final String arg0) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean containsLocalBean(final String arg0) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public String[] getAliases(final String arg0) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public AutowireCapableBeanFactory getAutowireCapableBeanFactory()
                    throws IllegalStateException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object getBean(final String arg0) throws BeansException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object getBean(final String beanName, final Class clazz) throws BeansException {
                if (beanName.equals(MockUtilities.TEST_BEAN_NAME)
                        && clazz.equals(IDataEventListener.class)) {
                    
                    return new IDataEventListener() {
                        public void onApplicationEvent(final ApplicationEvent arg0) {
                            // verification: this method should be called
                            callbackFlag.called = true;
                        }
                    };
                } else {
                    throw new NoSuchBeanDefinitionException(beanName);
                }
            }
            
            public Object getBean(final String arg0, final Object[] arg1) throws BeansException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public int getBeanDefinitionCount() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public String[] getBeanDefinitionNames() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String[] getBeanNamesForType(final Class arg0) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String[] getBeanNamesForType(final Class arg0, final boolean arg1,
                    final boolean arg2) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getBeansOfType(final Class arg0) throws BeansException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getBeansOfType(final Class arg0, final boolean arg1, final boolean arg2)
                    throws BeansException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public ClassLoader getClassLoader() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getDisplayName() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getId() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getMessage(final MessageSourceResolvable arg0, final Locale arg1)
                    throws NoSuchMessageException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getMessage(final String arg0, final Object[] arg1, final Locale arg2)
                    throws NoSuchMessageException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getMessage(final String arg0, final Object[] arg1, final String arg2,
                    final Locale arg3) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public ApplicationContext getParent() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public BeanFactory getParentBeanFactory() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Resource getResource(final String arg0) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Resource[] getResources(final String arg0) throws IOException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public long getStartupDate() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public Class getType(final String arg0) throws NoSuchBeanDefinitionException {
                // TODO Auto-generated method stub
                return null;
            }
            
            public boolean isPrototype(final String arg0) throws NoSuchBeanDefinitionException {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isSingleton(final String arg0) throws NoSuchBeanDefinitionException {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isTypeMatch(final String arg0, final Class arg1)
                    throws NoSuchBeanDefinitionException {
                // TODO Auto-generated method stub
                return false;
            }
            
            public void publishEvent(final ApplicationEvent arg0) {
                // TODO Auto-generated method stub
                
            }
        };
        return applicationContext;
    }
    
    public static ConfigManager.Immutable createMockConfigManager() {
        final ConfigManager.Immutable configManager = new ConfigManager.Immutable() {
            public boolean accept(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean acceptForContextListeners(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            @Override
            public Object clone() {
                // TODO Auto-generated method stub
                try {
                    return super.clone();
                } catch (final CloneNotSupportedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                
                return null;
            }
            
            public Element createAction(final String type, final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name, final String context,
                    final String className, final String xpath, final String type,
                    final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createTarget(final Element action, final String name,
                    final String context, final String className, final String xpath)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Enumeration enumContexts() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object findCachedOrCreate(final ClassCreatorParameters parameters)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final Class cls)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final String key) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Database.Immutable findDatabase(final String name) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String findFile(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Project.Immutable findFirstActiveProject() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Project.Immutable findProject() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Project.Immutable findProject(final String projectId) {
                com.archibus.config.Project.Immutable project = null;
                if ("ExistingProjectId".equals(projectId)) {
                    project = createMockProject(null);
                }
                
                return project;
            }
            
            public ConfigManager.Immutable findRootContext() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.UserSession.Immutable findUserSession() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.utility.Xml.Immutable findXmlCached(final String fileName)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void generateActionTarget(final Element action) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Element generateActionWithTarget(final String type, final String state)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<com.archibus.config.Project.Immutable> getActiveProjects() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getAttribute(final String xpathAttribute) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CacheAccessImpl getCacheAccess() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CacheAccess getCacheManager() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CheckViewRenderingRequest getCheckViewRenderingRequest() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Iterator getChildren() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable getContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Vector getContextListeners() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map<String, String> getCultureInfos() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document getDocument() {
                return new Document() {
                    public void accept(final org.dom4j.Visitor arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void add(final Comment arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void add(final Element arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void add(final Node arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void add(final ProcessingInstruction arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public Document addComment(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document addDocType(final String arg0, final String arg1,
                            final String arg2) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element addElement(final QName arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element addElement(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element addElement(final String arg0, final String arg1) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document addProcessingInstruction(final String arg0, final Map arg1) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document addProcessingInstruction(final String arg0, final String arg1) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void appendContent(final Branch arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public String asXML() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Node asXPathResult(final Element arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void clearContent() {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    @Override
                    public Object clone() {
                        // TODO Auto-generated method stub
                        try {
                            return super.clone();
                        } catch (final CloneNotSupportedException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                        }
                        
                        return null;
                    }
                    
                    public List content() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public XPath createXPath(final String arg0) throws InvalidXPathException {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Node detach() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element elementByID(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public DocumentType getDocType() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document getDocument() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public EntityResolver getEntityResolver() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getName() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public short getNodeType() {
                        // TODO Auto-generated method stub
                        return 0;
                    }
                    
                    public String getNodeTypeName() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element getParent() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getPath() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getPath(final Element arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element getRootElement() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getStringValue() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getText() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getUniquePath() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getUniquePath(final Element arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public boolean hasContent() {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public int indexOf(final Node arg0) {
                        // TODO Auto-generated method stub
                        return 0;
                    }
                    
                    public boolean isReadOnly() {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean matches(final String arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public Node node(final int arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public int nodeCount() {
                        // TODO Auto-generated method stub
                        return 0;
                    }
                    
                    public Iterator nodeIterator() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void normalize() {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public Number numberValueOf(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public ProcessingInstruction processingInstruction(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List processingInstructions() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List processingInstructions(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public boolean remove(final Comment arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean remove(final Element arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean remove(final Node arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean remove(final ProcessingInstruction arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean removeProcessingInstruction(final String arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public List selectNodes(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List selectNodes(final String arg0, final String arg1) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List selectNodes(final String arg0, final String arg1, final boolean arg2) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Object selectObject(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Node selectSingleNode(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void setContent(final List arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setDocType(final DocumentType arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setDocument(final Document arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setEntityResolver(final EntityResolver arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setName(final String arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setParent(final Element arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setProcessingInstructions(final List arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setRootElement(final Element arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setText(final String arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public boolean supportsParent() {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public String valueOf(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void write(final Writer arg0) throws IOException {
                        // TODO Auto-generated method stub
                        
                    }
                };
            }
            
            public Hashtable getFileCategories() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getFilePath() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getFindFilesCached() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getKey() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public LicenseManager getLicenseManager() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Locale getLocale() throws ExceptionBase {
                return Locale.getDefault();
            }
            
            public HashMap getLocales() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public LocalizedStringsImpl getLocalizedStrings() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getName() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getParameters() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public ArrayList getProjects() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getWebAppPath() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element getXmlOfFileCategory(final String extension) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public boolean isDebug() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom,
                    final boolean inheritMarked) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public String loadLocalizedString(final String key1, final String key2,
                    final String key3, final Locale locale, final boolean translatablePrefix) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void logObject(final String operation) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onAction(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document onActionRoute(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void onRequest(final Mutable requestXml, final Mutable responseXml)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onSelectValue(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void save() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void saveAs(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public String serialize() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void translate(final String fileName, final Element element)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
        };
        return configManager;
    }
    
    public static Context createMockContext(final boolean createUserSession,
            final boolean createDbConnection) {
        final Context context = new Context();
        context.setConfigManager(MockUtilities.createMockConfigManager());
        
        if (createUserSession) {
            context.setUserSession(MockUtilities.createMockUserSession());
        }
        
        if (createDbConnection) {
            context.setDbConnection(MockUtilities.createMockDbConnection());
        }
        
        return context;
    }
    
    public static com.archibus.config.Database.Immutable createMockDatabase() {
        return new Database.Immutable() {
            public boolean accept(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean acceptForContextListeners(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            @Override
            public Object clone() {
                // TODO Auto-generated method stub
                try {
                    return super.clone();
                } catch (final CloneNotSupportedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                
                return null;
            }
            
            public Element createAction(final String type, final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name, final String context,
                    final String className, final String xpath, final String type,
                    final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createTarget(final Element action, final String name,
                    final String context, final String className, final String xpath)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Enumeration enumContexts() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object findCachedOrCreate(final ClassCreatorParameters parameters)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final Class cls)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final String key) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Database.Immutable findDatabase(final String name) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String findFile(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Immutable findProject() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ConfigManager.Immutable findRootContext()
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.UserSession.Immutable findUserSession() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.utility.Xml.Immutable findXmlCached(final String fileName)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void generateActionTarget(final Element action) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Element generateActionWithTarget(final String type, final String state)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getAttribute(final String xpathAttribute) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CacheAccessImpl getCacheAccess() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Iterator getChildren() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ConfigJdbc.Immutable getConfigJDBC() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable getContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Vector getContextListeners() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public DbConnectionDataSource getDataSource() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.schema.DbServer.Immutable getDBServer() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document getDocument() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getFileCategories() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getFilePath() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getFindFilesCached() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getKey() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Locale getLocale() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getName() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getParameters() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.db.PooledDbDriver.Immutable getPool() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element getXmlOfFileCategory(final String extension) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom,
                    final boolean inheritMarked) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void logObject(final String operation) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onAction(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document onActionRoute(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void onRequest(final Mutable requestXml, final Mutable responseXml)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onSelectValue(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void save() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void saveAs(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public String serialize() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void translate(final String fileName, final Element element)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
        };
    }
    
    public static DbConnection.ThreadSafe createMockDbConnection() {
        final DbConnection.ThreadSafe dbConnection = new DbConnection.ThreadSafe() {
            
            public void clear() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void commit() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void connect(final String connectFormat, final String url, final String userId,
                    final String password, final int transactionIsolationLevel)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void disconnect() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public ResultSet execute(final String sql, final int rows) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public int executeUpdate(final String sql) throws ExceptionBase {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public int executeUpdate(final String sql, final Vector parameters)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public boolean getAutoCommit() throws ExceptionBase {
                // TODO Auto-generated method stub
                return false;
            }
            
            public Connection getConnection() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getDatabaseMetaData() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getDescription() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public boolean isValid() {
                return true;
            }
            
            public void rollback() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void setAutoCommit(final boolean b) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
        };
        return dbConnection;
    }
    
    public static HttpSession createMockHttpSession() {
        return new HttpSession() {
            
            public Object getAttribute(final String arg0) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Enumeration getAttributeNames() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public long getCreationTime() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public String getId() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public long getLastAccessedTime() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public int getMaxInactiveInterval() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public ServletContext getServletContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public HttpSessionContext getSessionContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object getValue(final String arg0) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String[] getValueNames() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void invalidate() {
                // TODO Auto-generated method stub
                
            }
            
            public boolean isNew() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public void putValue(final String arg0, final Object arg1) {
                // TODO Auto-generated method stub
                
            }
            
            public void removeAttribute(final String arg0) {
                // TODO Auto-generated method stub
                
            }
            
            public void removeValue(final String arg0) {
                // TODO Auto-generated method stub
                
            }
            
            public void setAttribute(final String arg0, final Object arg1) {
                // TODO Auto-generated method stub
                
            }
            
            public void setMaxInactiveInterval(final int arg0) {
                // TODO Auto-generated method stub
                
            }
        };
    }
    
    public static Project.Immutable createMockProject(
            final IActivityParameterManager activityParameterManager) {
        final Project.Immutable project = new Project.Immutable() {
            
            public boolean accept(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean acceptForContextListeners(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public void clearCachedTableDefs() {
                // TODO Auto-generated method stub
                
            }
            
            @Override
            public Object clone() {
                // TODO Auto-generated method stub
                try {
                    return super.clone();
                } catch (final CloneNotSupportedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                
                return null;
            }
            
            public Element createAction(final String type, final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name, final String context,
                    final String className, final String xpath, final String type,
                    final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.jobmanager.WorkflowRulesContainer.ThreadSafe createMockWorkflowRulesContainer() {
                return new WorkflowRulesContainer.ThreadSafe() {
                    public boolean accept(final Visitor visitor) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean acceptForContextListeners(final Visitor visitor) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public void addWorkflowRule(
                            final com.archibus.jobmanager.WorkflowRule.Immutable workflowRule) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void checkPermission(
                            final com.archibus.jobmanager.WorkflowRule.Immutable workflowRule,
                            final com.archibus.config.ContextCacheable.Immutable context,
                            final String methodName) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    @Override
                    public Object clone() {
                        // TODO Auto-generated method stub
                        try {
                            return super.clone();
                        } catch (final CloneNotSupportedException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                        }
                        
                        return null;
                    }
                    
                    public Element createAction(final String type, final String state)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element createActionWithTarget(final String name) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element createActionWithTarget(final String name, final String context,
                            final String className, final String xpath, final String type,
                            final String state) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Object createEventHandler(final String name) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element createTarget(final Element action, final String name,
                            final String context, final String className, final String xpath)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void destroy() {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public Enumeration enumContexts() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Object findCachedOrCreate(final ClassCreatorParameters parameters)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public com.archibus.config.ContextCacheable.Immutable findContext(
                            final Class cls) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public com.archibus.config.ContextCacheable.Immutable findContext(
                            final String key) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public com.archibus.config.Database.Immutable findDatabase(final String name) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String findFile(final String filePath) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Immutable findProject() throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public com.archibus.config.ConfigManager.Immutable findRootContext()
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public com.archibus.config.UserSession.Immutable findUserSession()
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public com.archibus.utility.Xml.Immutable findXmlCached(final String fileName)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void generateActionTarget(final Element action) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public Element generateActionWithTarget(final String type, final String state)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getAttribute(final String xpathAttribute) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public CacheAccessImpl getCacheAccess() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Iterator getChildren() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public com.archibus.config.ContextCacheable.Immutable getContext() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Vector getContextListeners() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document getDocument() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List getExecutingRules() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Hashtable getFileCategories() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getFilePath() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Map getFindFilesCached() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getKey() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Locale getLocale() throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getName() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Hashtable getParameters() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public com.archibus.jobmanager.WorkflowRule.Immutable getWorkflowRule(
                            final String ruleId) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Map<String, com.archibus.jobmanager.WorkflowRule.Immutable> getWorkflowRules() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List getWorkflowRules(final String activityId) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List<com.archibus.jobmanager.WorkflowRule.Immutable> getWorkflowRulesOfType(
                            final WorkflowRuleType type, final boolean activeOnly) {
                        final ArrayList<com.archibus.jobmanager.WorkflowRule.Immutable> workflowRules =
                                new ArrayList<com.archibus.jobmanager.WorkflowRule.Immutable>();
                        final WorkflowRule.Immutable workflowRule = new WorkflowRule.Immutable() {
                            @Override
                            public Object clone() {
                                // TODO Auto-generated method stub
                                try {
                                    return super.clone();
                                } catch (final CloneNotSupportedException e) {
                                    // TODO Auto-generated catch block
                                    e.printStackTrace();
                                }
                                
                                return null;
                            }
                            
                            public Object createEventHandler() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public EventHandler createEventHandlerAdapterForMethod(
                                    final String methodName) {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public String getActivityId() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public List getEventHandlers() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public List getInputGroups() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public List getInputParameters() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public String getKey() {
                                return TEST_BEAN_NAME;
                            }
                            
                            public String getRuleId() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public ScheduleProperties getScheduleProperties() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public String getSecurityGroup() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public WorkflowRuleType getType() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                            
                            public boolean isActive() {
                                // TODO Auto-generated method stub
                                return false;
                            }
                            
                            public boolean isAnyMethod() {
                                // TODO Auto-generated method stub
                                return false;
                            }
                            
                            public boolean isDataEvent() {
                                // TODO Auto-generated method stub
                                return false;
                            }
                            
                            public boolean isMessage() {
                                // TODO Auto-generated method stub
                                return false;
                            }
                            
                            public boolean isNotification() {
                                // TODO Auto-generated method stub
                                return false;
                            }
                            
                            public boolean isScheduled() {
                                // TODO Auto-generated method stub
                                return false;
                            }
                            
                            public boolean isValid() {
                                // TODO Auto-generated method stub
                                return false;
                            }
                            
                            public List verifyEventHandlers() {
                                // TODO Auto-generated method stub
                                return null;
                            }
                        };
                        
                        workflowRules.add(workflowRule);
                        return workflowRules;
                    }
                    
                    public Element getXmlOfFileCategory(final String extension)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void load(final ContextImpl newObject, final Element inheritFrom)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void load(final ContextImpl newObject, final Element inheritFrom,
                            final boolean inheritMarked) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void logObject(final String operation) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public Document onAction(final Message message) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document onActionRoute(final Message message) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void onRequest(final Mutable requestXml, final Mutable responseXml)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public Document onSelectValue(final Message message) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void prepareRuleContext(
                            final com.archibus.config.ContextCacheable.Immutable contextParent,
                            final com.archibus.jobmanager.WorkflowRule.Immutable workflowRule,
                            final EventHandlerContext context, final Document doc)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void runRule(
                            final com.archibus.config.ContextCacheable.Immutable contextParent,
                            final com.archibus.jobmanager.WorkflowRule.Immutable workflowRule,
                            final EventHandlerContext context, final boolean asyncMode)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void runRule(
                            final com.archibus.config.ContextCacheable.Immutable contextParent,
                            final String ruleKey, final EventHandlerContext context)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public String runRule(
                            final com.archibus.jobmanager.WorkflowRule.Immutable workflowRule,
                            final EventHandlerContext context, final boolean asyncMode)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String runRule(
                            final com.archibus.jobmanager.WorkflowRule.Immutable contextParent,
                            final String ruleKey, final EventHandlerContext context)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String runRule(final String ruleKey, final EventHandlerContext context,
                            final boolean asyncMode) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void save() throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void saveAs(final String filePath) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void scheduleRule(
                            final com.archibus.jobmanager.WorkflowRule.Immutable workflowRule,
                            final com.archibus.config.ContextCacheable.Immutable context)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public String serialize() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void startScheduler() {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void stopRule(
                            final com.archibus.config.ContextCacheable.Immutable context,
                            final String ruleExecutionKey) throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void translate(final String fileName, final Element element)
                            throws ExceptionBase {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void updateActiveRulesForActivities(
                            final Map<String, Activity> activities,
                            final Map<String, Domain> domains) {
                        // TODO Auto-generated method stub
                        
                    }
                };
            }
            
            public Element createTarget(final Element action, final String name,
                    final String context, final String className, final String xpath)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Enumeration enumContexts() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object findCachedOrCreate(final ClassCreatorParameters parameters)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final Class cls)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final String key) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Database.Immutable findDatabase(final String name) {
                return createMockDatabase();
            }
            
            public String findFile(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Immutable findProject() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ConfigManager.Immutable findRootContext()
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.security.UserAccount.Immutable findUserAccount(final String id)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.security.UserRole.Immutable findUserRole(final String name)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.UserSession.Immutable findUserSession() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.utility.Xml.Immutable findXmlCached(final String fileName)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void generateActionTarget(final Element action) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Element generateActionWithTarget(final String type, final String state)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map<String, Activity> getActivities() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public IActivityParameterManager getActivityParameterManager() throws ExceptionBase {
                IActivityParameterManager result = null;
                if (activityParameterManager != null) {
                    result = activityParameterManager;
                } else {
                    result = createMockActivityManager(null, null);
                }
                
                return result;
            }
            
            public String getAttribute(final String xpathAttribute) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public BaseUnits getBaseUnits() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Currency getBudgetCurrency() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CacheAccessImpl getCacheAccess() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Iterator getChildren() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable getContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Vector getContextListeners() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Currencies getCurrencies() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CurrencyConversions getCurrencyConversions() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public DatabaseEngineType getDatabaseEngineType() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getDatabaseFile() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<IDataEventListener> getDataEventListeners() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document getDocument() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map<String, Domain> getDomains() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getDrawingsFolder() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getDrawingsFolderForSmartClient() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getEnterpriseGraphicsFolder() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getEnterpriseGraphicsFolderForSmartClient() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public FileAccessProvider getFileAccessProviderForDrawings() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public FileAccessProvider getFileAccessProviderForEnterpriseGraphics() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getFileCategories() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getFilePath() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getFindFilesCached() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getGraphicsFolder() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getKey() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public ApplicationContext getLastChildContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Locale getLocale() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getLogoFile() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getName() {
                return "ExistingProjectId";
            }
            
            public Hashtable getParameters() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public ProjectType getProjectType() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getTitle() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getTranslatableFieldsByName() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Units getUnits() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<com.archibus.config.UserSession.Immutable> getUserSessions()
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.jobmanager.WorkflowRulesContainer.ThreadSafe getWorkflowRules() {
                return createMockWorkflowRulesContainer();
            }
            
            public Element getXmlOfFileCategory(final String extension) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public boolean isCascadeChanges() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isConvertAreasAndLengthsToUserUnits() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isOpen() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isUseDocumentManagementForDrawings() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isVatAndMultiCurrencyEnabled() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom,
                    final boolean inheritMarked) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public com.archibus.config.UserSession.Immutable loadCoreUserSession()
                    throws ExceptionBase {
                return createMockUserSession();
            }
            
            public com.archibus.db.CachedArrayList.Immutable loadSecurityGroups(final Locale locale)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public ThreadSafe loadTableDef(final String tableName) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.db.CachedArrayList.Immutable loadTables(final Locale locale)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.security.UserAccount.Immutable loadUserAccount(final String name,
                    final String sessionId, final boolean isCoreAccount) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.UserSession.Immutable loadUserSession(
                    final String sessionId, final String userName, final String parentKey) {
                return createMockUserSession();
            }
            
            public com.archibus.jobmanager.WorkflowRulesContainer.ThreadSafe loadWorkflowRules()
                    throws ExceptionBase {
                return this.createMockWorkflowRulesContainer();
            }
            
            public com.archibus.jobmanager.WorkflowRulesContainer.ThreadSafe loadWorkflowRules(
                    final boolean handleExceptions) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.jobmanager.WorkflowRulesContainer.ThreadSafe loadWorkflowRules(
                    final Element workflowRules) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void logObject(final String operation) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onAction(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document onActionRoute(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void onRequest(final Mutable requestXml, final Mutable responseXml)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onSelectValue(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.jobmanager.WorkflowRulesContainer.ThreadSafe reloadWorkflowRules()
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void save() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void saveAs(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public String serialize() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void translate(final String fileName, final Element element)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
        };
        return project;
    }
    
    public static IRoomDao createMockRoomDao() {
        final IRoomDao roomDao = new IRoomDao() {
            
            public Room convertRecordToObject(final DataRecord record) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void delete(final Room bean) {
                // TODO Auto-generated method stub
            }
            
            public List<Room> find(final AbstractRestrictionDef restriction) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Room get(final Object id) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Room getByPrimaryKey(final Room room) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Room save(final Room bean) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void update(final Room bean) {
                // TODO Auto-generated method stub
            }
            
            public void update(final Room bean, final Room oldBean) {
                // TODO Auto-generated method stub
            }
        };
        return roomDao;
    }
    
    public static com.archibus.security.UserAccount.Immutable createMockUserAccount() {
        return new UserAccount.Immutable() {
            public boolean accept(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean acceptForContextListeners(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            @Override
            public Object clone() {
                // TODO Auto-generated method stub
                try {
                    return super.clone();
                } catch (final CloneNotSupportedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                
                return null;
            }
            
            public Element createAction(final String type, final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name, final String context,
                    final String className, final String xpath, final String type,
                    final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createTarget(final Element action, final String name,
                    final String context, final String className, final String xpath)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Enumeration enumContexts() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object findCachedOrCreate(final ClassCreatorParameters parameters)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final Class cls)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final String key) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Database.Immutable findDatabase(final String name) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String findFile(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Immutable findProject() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ConfigManager.Immutable findRootContext()
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.UserSession.Immutable findUserSession() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.utility.Xml.Immutable findXmlCached(final String fileName)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void generateActionTarget(final Element action) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Element generateActionWithTarget(final String type, final String state)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<ActivityLicense> getActivityLicenses() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getAttribute(final String xpathAttribute) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public BimLicenseType getBimLicenseType() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CacheAccessImpl getCacheAccess() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Iterator getChildren() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getColorScheme() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable getContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Vector getContextListeners() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Date getDatePasswordChanged() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Units getDisplayUnits() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document getDocument() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getFileCategories() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getFilePath() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getFindFilesCached() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.utility.ListWrapper.Immutable<String> getGroups() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getKey() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public LicenseLevel getLicenseLevel() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Locale getLocale() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getName() {
                return "MockUserAccount";
            }
            
            public int getNumberFailedLoginAttempts() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public Hashtable getParameters() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getPassword() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.security.UserRole.Immutable getRole() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getSqlPassword() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getSqlUsername() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<ActivityLicense> getTemporaryActivityLicenses() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public User getUser() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Currency getUserCurrency() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element getXmlOfFileCategory(final String extension) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public boolean isDemoUser() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isMemberOfExecuteSystemAdminActionsGroup() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isMemberOfGroup(final String group) {
                boolean isMemberOfGroup = false;
                if ("MatchingSecurityGroup".equals(group)) {
                    isMemberOfGroup = true;
                }
                
                return isMemberOfGroup;
            }
            
            public boolean isNamed() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isPasswordNeverExpires() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isUseHierSecurity() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom,
                    final boolean inheritMarked) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void logObject(final String operation) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onAction(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document onActionRoute(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void onRequest(final Mutable requestXml, final Mutable responseXml)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onSelectValue(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void save() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void saveAs(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public String serialize() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void translate(final String fileName, final Element element)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public boolean isMobileEnabled() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public String getMobileDeviceId() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void checkIfEnabledForMobileAccess() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public boolean isEnabledForMobileAccess() {
                // TODO Auto-generated method stub
                return false;
            }
        };
    }
    
    public static UserSession.Immutable createMockUserSession() {
        final UserSession.Immutable userSession = new UserSession.Immutable() {
            public boolean accept(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean acceptForContextListeners(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            @Override
            public Object clone() {
                // TODO Auto-generated method stub
                try {
                    return super.clone();
                } catch (final CloneNotSupportedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                
                return null;
            }
            
            public Element createAction(final String type, final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name, final String context,
                    final String className, final String xpath, final String type,
                    final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createTarget(final Element action, final String name,
                    final String context, final String className, final String xpath)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Enumeration enumContexts() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object findCachedOrCreate(final ClassCreatorParameters parameters)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final Class cls)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final String key) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Database.Immutable findDatabase(final String name) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String findFile(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Project.Immutable findProject() throws ExceptionBase {
                return createMockProject(null);
            }
            
            public com.archibus.config.ConfigManager.Immutable findRootContext()
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public UserSession.Immutable findUserSession() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.utility.Xml.Immutable findXmlCached(final String fileName)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void generateActionTarget(final Element action) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Element generateActionWithTarget(final String type, final String state)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public UnitsProperties getAreaUnits() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getAttribute(final String xpathAttribute) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CacheAccessImpl getCacheAccess() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Iterator getChildren() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable getContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Vector getContextListeners() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Controller.ThreadSafe getController() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document getDocument() {
                return new Document() {
                    public void accept(final org.dom4j.Visitor arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void add(final Comment arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void add(final Element arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void add(final Node arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void add(final ProcessingInstruction arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public Document addComment(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document addDocType(final String arg0, final String arg1,
                            final String arg2) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element addElement(final QName arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element addElement(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element addElement(final String arg0, final String arg1) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document addProcessingInstruction(final String arg0, final Map arg1) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document addProcessingInstruction(final String arg0, final String arg1) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void appendContent(final Branch arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public String asXML() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Node asXPathResult(final Element arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void clearContent() {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    @Override
                    public Object clone() {
                        // TODO Auto-generated method stub
                        try {
                            return super.clone();
                        } catch (final CloneNotSupportedException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                        }
                        
                        return null;
                    }
                    
                    public List content() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public XPath createXPath(final String arg0) throws InvalidXPathException {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Node detach() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element elementByID(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public DocumentType getDocType() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Document getDocument() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public EntityResolver getEntityResolver() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getName() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public short getNodeType() {
                        // TODO Auto-generated method stub
                        return 0;
                    }
                    
                    public String getNodeTypeName() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element getParent() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getPath() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getPath(final Element arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Element getRootElement() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getStringValue() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getText() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getUniquePath() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public String getUniquePath(final Element arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public boolean hasContent() {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public int indexOf(final Node arg0) {
                        // TODO Auto-generated method stub
                        return 0;
                    }
                    
                    public boolean isReadOnly() {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean matches(final String arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public Node node(final int arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public int nodeCount() {
                        // TODO Auto-generated method stub
                        return 0;
                    }
                    
                    public Iterator nodeIterator() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void normalize() {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public Number numberValueOf(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public ProcessingInstruction processingInstruction(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List processingInstructions() {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List processingInstructions(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public boolean remove(final Comment arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean remove(final Element arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean remove(final Node arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean remove(final ProcessingInstruction arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public boolean removeProcessingInstruction(final String arg0) {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public List selectNodes(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List selectNodes(final String arg0, final String arg1) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public List selectNodes(final String arg0, final String arg1, final boolean arg2) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Object selectObject(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public Node selectSingleNode(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void setContent(final List arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setDocType(final DocumentType arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setDocument(final Document arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setEntityResolver(final EntityResolver arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setName(final String arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setParent(final Element arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setProcessingInstructions(final List arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setRootElement(final Element arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public void setText(final String arg0) {
                        // TODO Auto-generated method stub
                        
                    }
                    
                    public boolean supportsParent() {
                        // TODO Auto-generated method stub
                        return false;
                    }
                    
                    public String valueOf(final String arg0) {
                        // TODO Auto-generated method stub
                        return null;
                    }
                    
                    public void write(final Writer arg0) throws IOException {
                        // TODO Auto-generated method stub
                        
                    }
                };
            }
            
            public ExceptionBase getException() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getFileCategories() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getFilePath() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getFindFilesCached() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getKey() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public UnitsProperties getLengthUnits() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Locale getLocale() throws ExceptionBase {
                return Locale.getDefault();
            }
            
            public String getName() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getParameters() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.security.UserAccount.Immutable getUserAccount() {
                return createMockUserAccount();
            }
            
            public UserSessionDto getUserSessionDto() {
                return new UserSessionDto();
            }
            
            public Element getXmlOfFileCategory(final String extension) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public boolean isCheckedoutBimLicense() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom,
                    final boolean inheritMarked) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void logObject(final String operation) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onAction(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document onActionRoute(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void onRequest(final Mutable requestXml, final Mutable responseXml)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onSelectValue(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void save() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void saveAs(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public String serialize() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void translate(final String fileName, final Element element)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
        };
        return userSession;
    }
    
    public static ViewField.Immutable createMockViewField(final String fullName,
            final boolean documentField, final boolean memoField) {
        final ArchibusFieldDefBase.Immutable fieldDef = new ArchibusFieldDefBase.Immutable() {
            
            public int compareTo(final Object o2) {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public Object convertDefaultValue(final String defaultValue) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String formatFieldValue(final Object fieldValue, final Format format,
                    final boolean localizedFormat, final Locale locale) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String formatSqlFieldValue(final Object fieldValue,
                    final boolean enforceFieldType) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String fullName() {
                return fullName;
            }
            
            public Map getAllMultiLineHeadings() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public boolean getAllowNull() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public ArchibusFieldType getArchibusFieldType() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public int getAssetTextIndex() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public int getDecimals() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public Object getDefaultValue() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public int getDisplaySizeHeading() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public int getDisplaySizeNoHeading() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public String getEditGroup() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getFieldName(final Locale locale) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Vector getForeignFields() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getForeignTable() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getFormatAsString() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public int getFormatEnum() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public Formatting getFormatting() {
                Formatting result = Formatting.AnyChar;
                if (memoField) {
                    result = Formatting.Memo;
                }
                
                return result;
            }
            
            public FieldJavaTypeBaseImpl getJavaType() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Vector getMultiLineHeadings(final Locale locale) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getName() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public NumericFormat getNumericFormat() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public int getPrimaryKeyIndex() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public String getReferenceTable() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getReviewGroup() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getSingleLineHeading() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public int getSize() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public Format getSqlFormat() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getSqlFunction() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public int getSqlType() {
                // TODO Auto-generated method stub
                return 0;
            }
            
            public String getTableName() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getTranslatableFieldNames() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Immutable getXml() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public boolean isAutoNumber() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isBlob() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isCalculated() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isCharType() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isCurrency() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isDateTimeType() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isDocument() {
                return documentField;
            }
            
            public boolean isDrawingDriven() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isForeignKey() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isHighlightPattern() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean IsNumType() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isPrimaryKey() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isQuestionnaire() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isReadOnly() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean isValidateData() {
                // TODO Auto-generated method stub
                return false;
            }
            
            public String multiLineHeadingsToString(final Locale locale) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object parseFieldValue(final String fieldValue, final Format format)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object parseSqlFieldValue(final String fieldValue) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Format prepareFormat(
                    final com.archibus.config.ContextCacheable.Immutable context,
                    final boolean localizedFormat) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Format prepareSqlFormat(final com.archibus.config.ConfigJdbc.Immutable configJDBC) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String prepareSqlFunction(
                    final com.archibus.config.ConfigJdbc.Immutable configJDBC) {
                // TODO Auto-generated method stub
                return null;
            }
        };
        
        final ContextCacheable.Immutable parentContext = new ContextCacheable.Immutable() {
            public boolean accept(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            public boolean acceptForContextListeners(final Visitor visitor) {
                // TODO Auto-generated method stub
                return false;
            }
            
            @Override
            public Object clone() {
                // TODO Auto-generated method stub
                try {
                    return super.clone();
                } catch (final CloneNotSupportedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                
                return null;
            }
            
            public Element createAction(final String type, final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createActionWithTarget(final String name, final String context,
                    final String className, final String xpath, final String type,
                    final String state) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element createTarget(final Element action, final String name,
                    final String context, final String className, final String xpath)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Enumeration enumContexts() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Object findCachedOrCreate(final ClassCreatorParameters parameters)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final Class cls)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable findContext(final String key) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Database.Immutable findDatabase(final String name) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String findFile(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.Project.Immutable findProject() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ConfigManager.Immutable findRootContext()
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.UserSession.Immutable findUserSession() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Immutable findXmlCached(final String fileName) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void generateActionTarget(final Element action) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Element generateActionWithTarget(final String type, final String state)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getAttribute(final String xpathAttribute) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public CacheAccessImpl getCacheAccess() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Iterator getChildren() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public com.archibus.config.ContextCacheable.Immutable getContext() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Vector getContextListeners() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document getDocument() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getFileCategories() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getFilePath() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Map getFindFilesCached() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getKey() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Locale getLocale() throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public String getName() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Hashtable getParameters() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Element getXmlOfFileCategory(final String extension) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void load(final ContextImpl newObject, final Element inheritFrom,
                    final boolean inheritMarked) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void logObject(final String operation) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onAction(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public Document onActionRoute(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void onRequest(final Mutable requestXml, final Mutable responseXml)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public Document onSelectValue(final Message message) throws ExceptionBase {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void save() throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public void saveAs(final String filePath) throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
            
            public String serialize() {
                // TODO Auto-generated method stub
                return null;
            }
            
            public void translate(final String fileName, final Element element)
                    throws ExceptionBase {
                // TODO Auto-generated method stub
                
            }
        };
        
        final ViewField.Immutable viewField =
                ViewFieldLoader.getInstance(fieldDef, parentContext, false, false, true, null,
                    false);
        return viewField;
    }
}
