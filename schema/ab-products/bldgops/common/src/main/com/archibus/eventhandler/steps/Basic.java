package com.archibus.eventhandler.steps;

import java.util.Map;

import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * Basic Step
 */
public class Basic extends StepImpl {
	
	/**
	 * Constructor setting step type
	 *
	 */
	public Basic() {
		super(Constants.BASIC_STEP_TYPE); 
	}

	/**
	 * Constructor setting basic step information.
	 * @param context Workflow rule execution context
	 * @param activity_id Activity id
	 * @param id Primary key value
	 */
	public Basic(EventHandlerContext context, String activity_id, int id) {
		super(context, activity_id, id, Constants.BASIC_STEP_TYPE, Constants.BASIC_STEP);		
	}
	
	/**
	 * Constructor setting basic step information and extra properties.
	 * @param context Workflow rule execution context
	 * @param activity_id Activity id
	 * @param id Primary key value
	 * @param values Map with step {@link com.archibus.eventhandler.steps.StepImpl#setProperties(Map) properties}
	 */
	public Basic(EventHandlerContext context, String activity_id, int id, Map values) {
		super(context, activity_id, id, values);
	}
 
	/**
	 * 
	 *  Basic step ends directly after invoke.
	 *	@return true
	 *
	 */
	public boolean hasEnded() {
		return true;
	}

	/**
	 * 
	 *  Basic step is never in progress
	 *	@return false
	 *
	 */
	public boolean inProgress() {
		return false;
	}

	/**
	 * 
	 * Invoke this step.<br />
	 * This step only creates a record in the database (on a basic status change of a request)
	 * <p>
	 * <b>Pseudo-code:</b>
	 * 		<ol>
	 * 			<li>{@link #setStepEnded(boolean) Set step ended}</li>
	 * 			<li>{@link #logStep() Log step}</li>
	 * 		</ol>
	 * </p>
	 */
	public void invoke() {
		setStepEnded(true); // ended true, action date and time
		logStep(); // save to log table		
	}

	/**
	 * 
	 * Step order: This step is always the first in row
	 * <p>	 
	 *	@return 0
	 * </p>
	 */
	public int getStepOrder() {
		return 0;
	}
}
