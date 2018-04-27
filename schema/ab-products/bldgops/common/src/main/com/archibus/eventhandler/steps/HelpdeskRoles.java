package com.archibus.eventhandler.steps;

import java.lang.reflect.Method;
import java.util.List;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Helper class to retrieve the employees of a helpdesk identity role.
 * 
 * <p>
 * This helper class is used by the <code>Steps</code> for flexible workflows. It only contains one
 * static helper method to retrieve the list of employees from a helpdesk role. It uses java
 * reflection to call the lookup method. The class and method are retrieved from the
 * <code>helpdesk_roles</code> table.
 * </p>
 * 
 */
public class HelpdeskRoles extends EventHandlerBase {
    
    /**
     * 
     * Get employees from helpdesk role.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get the class and method name from the <code>helpdesk_roles</code> table</li>
     * <li>Get the lookup class</li>
     * <li>Get the lookup method, using name and context as param</li>
     * <li>Create a lookup class instance</li>
     * <li>Invoke the method and return the result as List</li>
     * </ol>
     * </p>
     * 
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param role helpdesk identity role
     * 
     * @return List of employee codes (em.em_id)
     *         </p>
     * @param EventHandlerContext context
     * @param String role
     * @param String field
     * @param int id
     */
    public static List<String> getEmployeesFromHelpdeskRole(final EventHandlerContext context,
            final String role, final String table, final String field, final int id) {
        // get the class and method name from the database
        final Object[] values =
                selectDbValues(context, "helpdesk_roles", new String[] { "class", "method" },
                    "role=" + literal(context, role));
        
        final String lookupClassName = ((String) values[0]).trim();
        final String lookupMethodName = ((String) values[1]).trim();
        
        if (table != null) {
            context.addResponseParameter("tableName", table);
        }
        if (field != null) {
            context.addResponseParameter("fieldName", field);
        }
        context.addResponseParameter(table + "." + field, new Integer(id));
        context.addInputParameter("role", role);
        
        try {
            // get the lookup class
            final Class lookupClass =
                    Thread.currentThread().getContextClassLoader().loadClass(lookupClassName);
            // Class lookupClass = Class.forName(lookup);
            
            final Class contextClass =
                    Thread.currentThread().getContextClassLoader()
                        .loadClass("com.archibus.jobmanager.EventHandlerContext");
            
            // get the lookup method, using name and context as param
            final Method lookupMethod =
                    lookupClass.getDeclaredMethod(lookupMethodName, new Class[] { contextClass });
            // Method setContextMethod = lookupClass.getDeclaredMethod( "setContext", new Class[] {
            // contextClass });
            
            // create a lookup class instance
            final Object object = lookupClass.newInstance();
            
            // setContextMethod.invoke(object, new Object[] {context});
            // invoke the method and get the result
            final Object result = lookupMethod.invoke(object, new Object[] { context });
            
            if (result == null) {
                return null;
            }
            
            return (List<String>) result;
            
        } catch (final ClassNotFoundException e) {
            e.printStackTrace();
        } catch (final NoSuchMethodException e) {
            e.printStackTrace();
        } catch (final InstantiationException e) {
            e.printStackTrace();
        } catch (final Exception e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
}
