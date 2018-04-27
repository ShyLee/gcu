/**
 * 
 */
package com.archibus.app.solution.common.security.providers.dao;

import junit.framework.TestCase;

import com.archibus.app.solution.common.security.providers.dao.PasswordPatternValidatorImpl;
import com.archibus.utility.ExceptionBase;

/**
 * @author Valery
 * 
 */
public class PasswordPatternValidatorImplTest extends TestCase {

    PasswordPatternValidatorImpl passwordPatternValidator = new PasswordPatternValidatorImpl();

    /**
     * Test method for
     * {@link com.archibus.app.solution.common.security.providers.dao.PasswordPatternValidatorImpl#validate(java.lang.String)}.
     */
    public final void testValidateLength() {
        passwordPatternValidator.setMinimumLength(8);
        passwordPatternValidator.setMustIncludePunctuation(false);
        passwordPatternValidator.setMustIncludeNumbers(false);
        try {
            passwordPatternValidator.validate("1");
            fail("Exception expected");
        } catch (ExceptionBase e) {
        }

        passwordPatternValidator.validate("12345678");
        passwordPatternValidator.validate("1234567890");
    }

    public final void testValidateNumbers() {
        passwordPatternValidator.setMinimumLength(0);
        passwordPatternValidator.setMustIncludeNumbers(true);
        passwordPatternValidator.setMustIncludePunctuation(false);
        try {
            passwordPatternValidator.validate("abcdef");
            fail("Exception expected");
        } catch (ExceptionBase e) {
        }

        passwordPatternValidator.validate("abcdef1");
    }

    public final void testValidatePunctuation() {
        passwordPatternValidator.setMinimumLength(0);
        passwordPatternValidator.setMustIncludeNumbers(false);
        passwordPatternValidator.setMustIncludePunctuation(true);
        try {
            passwordPatternValidator.validate("abcdef");
            fail("Exception expected");
        } catch (ExceptionBase e) {
        }

        passwordPatternValidator.validate("abcdef1,");

    }
}
