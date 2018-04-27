package com.archibus.app.solution.logiccookbook;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 * Tests HelloWorld example event handler.
 */
public class TestHelloWorld extends DataSourceTestBase {
    
    /**
     * Test for HelloWorld method.
     * 
     * @throws ExceptionBase
     */
    public void testHelloWorld() {
        final HelloWorld handler = new HelloWorld();
        final String message = handler.sayHello();
        assertTrue(message.startsWith("Hello World"));
    }
}
