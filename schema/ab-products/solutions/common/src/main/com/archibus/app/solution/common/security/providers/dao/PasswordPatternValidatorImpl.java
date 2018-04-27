/**
 * 
 */
package com.archibus.app.solution.common.security.providers.dao;

import com.archibus.utility.ExceptionBase;
import com.archibus.utility.regexp.*;

/**
 * Check if new password conforms to the specified password pattern policy.
 * 
 * @author Valery Tydykov
 * 
 * @see PasswordChangerImpl
 */
public class PasswordPatternValidatorImpl implements PasswordPatternValidator {
    private int minimumLength = 8;
    
    private boolean mustIncludeNumbers = true;
    
    private boolean mustIncludePunctuation = true;
    
    /**
     * @return the minimumLength
     */
    public int getMinimumLength() {
        return this.minimumLength;
    }
    
    /**
     * @return the mustIncludeNumbers
     */
    public boolean isMustIncludeNumbers() {
        return this.mustIncludeNumbers;
    }
    
    /**
     * @return the mustIncludePunctuation
     */
    public boolean isMustIncludePunctuation() {
        return this.mustIncludePunctuation;
    }
    
    /**
     * @param minimumLength the minimumLength to set
     */
    public void setMinimumLength(final int minimumLength) {
        this.minimumLength = minimumLength;
    }
    
    /**
     * @param mustIncludeNumbers the mustIncludeNumbers to set
     */
    public void setMustIncludeNumbers(final boolean mustIncludeNumbers) {
        this.mustIncludeNumbers = mustIncludeNumbers;
    }
    
    /**
     * @param mustIncludePunctuation the mustIncludePunctuation to set
     */
    public void setMustIncludePunctuation(final boolean mustIncludePunctuation) {
        this.mustIncludePunctuation = mustIncludePunctuation;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.archibus.app.solution.common.security.providers.dao.PasswordPatternValidator#validate
     * (java.lang.String)
     */
    public void validate(final String password) throws ExceptionBase {
        if (this.getMinimumLength() > password.length()) {
            // @translatable
            // TODO message parameterize
            final String message = "Password must have minimum length: {0}";
            throw new ExceptionBase(message, new Object[] { Integer.valueOf(getMinimumLength()) },
                true);
        }
        
        if (this.isMustIncludeNumbers()) {
            REProgram reProgram = null;
            try {
                reProgram = new RECompiler().compile("[0-9]+");
            } catch (final RESyntaxException e) {
                // error in RE pattern
                throw new ExceptionBase(null, e);
            }
            
            final RE re = new RE(reProgram);
            if (!re.match(password)) {
                // @translatable
                final String message = "Password must include numbers";
                throw new ExceptionBase(message);
            }
        }
        
        if (this.isMustIncludePunctuation()) {
            REProgram reProgram = null;
            try {
                reProgram = new RECompiler().compile("[:punct:]+");
            } catch (final RESyntaxException e) {
                // error in RE pattern
                e.printStackTrace();
            }
            
            final RE re = new RE(reProgram);
            if (!re.match(password)) {
                // @translatable
                final String message = "Password must include punctuation";
                throw new ExceptionBase(message);
            }
        }
    }
}
