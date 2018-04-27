
import java.io.*;
import java.math.*;
import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.restriction.*;
import com.archibus.eventhandler.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

public class BasicRuleTemplate_fieldFormula extends BasicRuleBase {

public void handle() {
// BEGIN RULE
new FieldFormula()
    .setOwner("rm")
    .setAssigned("rmpct")
    .calculate("rmpct.cost", "rmpct.area_chargable * rm.cost_sqft");
// END RULE
}

}
