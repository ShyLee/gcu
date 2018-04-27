/**
 * @author Jiangtao Guo
 */
var abRecurringPatternCtrl = View.createController('abRecurringPatternCtrl',{
	
	// RecurringPattern object
	pattern : null,
	
	openerView: null,
	
	/**
	 * set recurring pattern from xml value
	 */
	setRecurringPattern: function(value, isDisable){
		this.pattern = new  RecurringPattern(value);
		this.pattern.show();
		if(isDisable){
			this.pattern.enable(false);
		}
	},
	
	/**
	 * get xml recurring pattern value from interface
	 */
	getRecurringPattern: function(){
		return this.pattern.getXmlPattern();
	},
	
	/**
	 * get value of End After xxx Occurrences from interface
	 */
	getVal_EndAfterOccurrences: function(){
		var total = this.pattern.getFieldTotal()
		if(total==''){
			total = 0;
		}else{
			total = parseInt(total);
		}
		return total;
	}
});

RecurringPattern = Base.extend({
    type: '', // recurring type. possible values are once|day|week|month|year
    value1: '', // the first value of the selected type
    value2: '', // the second value of the selected type
    value3: '', // the third value of the selected type
    total: '', // the total value of the selected type
    xmlPattern: '', // the encode xml recurring pattern
    constructor: function(xmlPattern){
        this.xmlPattern = xmlPattern;
        if(this.xmlPattern){
        	this.decode();
        }
        
        this.addEventListener();
    },
    
    // add event listener to the interface elements
    addEventListener: function(){
    	var elements = ["day_value1", "week_value2"
                        , "month_type1_value1","month_type2_value1","month_type2_value2","month_value3"
                        , "year_value1","year_value2","year_value3"
                        ,"total"];
    	for(var i=0;i<elements.length;i++){
    		Ext.get(elements[i]).addListener('blur', this.valid, this);
    	}
    	
    	Ext.get("month_type_1").addListener('click', this.onClickMonthTypeCheckBox, this);
    	Ext.get("month_type_2").addListener('click', this.onClickMonthTypeCheckBox, this);
    	Ext.get("year").addListener('click', this.valid, this);
    },
    
    // show recurring pattern in the control interface
    show: function(){
    	 this.clear();
	     this.setTypeField();
	     onSelectRecurringType();
	     this.setValuesByType();
    	
    },
    
    // get recurring pattern from the control interface
    getXmlPattern: function(){
    	this.type = this.getType();
    	this.value1 = this.getFieldValue1();
    	this.value2 = this.getFieldValue2();
    	this.value3 = this.getFieldValue3();
    	this.total = this.getFieldTotal();
    	this.valid();
    	this.encode();
    	
    	return this.xmlPattern;
    	
    },
    
    // decode the xml pattern
    decode: function(){
        var xmlDocument = parseXml(this.xmlPattern, null, true);
        var nodes = selectNodes(xmlDocument, null, '//recurring');
        if (nodes.length > 0) {
            this.type = nodes[0].getAttribute('type');
            this.value1 = nodes[0].getAttribute('value1');
            this.value2 = nodes[0].getAttribute('value2');
            this.value3 = nodes[0].getAttribute('value3');
            this.total = nodes[0].getAttribute('total');
        }
    },
    
    // encode to xml pattern
    encode: function(){
    	if(this.type=='none'){
    		this.xmlPattern = '';
    	}else{
    		this.xmlPattern = '<recurring type="' + this.type + '" value1="' + this.value1 + '"'
            + ' value2="' + this.value2 + '"'
            + ' value3="' + this.value3 + '"'
            + ' total="' + this.total + '"'
            + '/>';
    	}
    },
    
    // set type radio
    setTypeField: function(){
    	var radioButtons = document.getElementsByName('type_option');
	     for (var i = 0; i < radioButtons.length; i++) {
	    	if (radioButtons[i].value == this.type) {
	    		radioButtons[i].checked = true;
	    		break;
	        }
	     }
    },
    
    // set type radio
    setValuesByType: function(){
    	$('total').value = this.total;
    	switch (this.type){
    		case 'day':
    			$('day_value1').value = this.value1;
  			break;
			case 'week':
				$('week_value2').value = this.value2;
				var weekOption = this.value1.split(',');
				for(var i=0;i<weekOption.length;i++){
					$('weekly_'+i).checked = weekOption[i]=='1'?true:false;
				}
  			break;
  			case 'month':
  				$('month_value3').value = this.value3;
  				if(this.value2 =='' && this.value1==''){
  					$('month_type_1').checked = 0;
  					$('month_type_2').checked = 0;
  				}	
  				else if(!this.value2){
  					$('month_type_1').checked = 1;
  					$('month_type_2').checked = 0;
  					$('month_type1_value1').value = this.value1;
  				}else{
  					$('month_type_2').checked = 1;
  					$('month_type_1').checked = 0;
  					$('month_type2_value1').value = this.value1;
  					$('month_type2_value2').value = this.value2;
  				}
  			break;
  			case 'year':
  				$('year_value1').value = this.value1;
  				$('year_value2').value = this.value2;
  				$('year_value3').value = this.value3;
  			break;
			default:
  			;
    	}
    },
    
    
    // get type from the control interface
    getType: function(){
    	return getSelectedRadioButton("type_option");
    	
    },
    
    // get value1 from the control interface
    getFieldValue1: function(){
    	var value1 = '';
    	var type = getSelectedRadioButton("type_option");
    	
        if (type == 'day') {
            value1 = $('day_value1').value;
        }
        
        if (type == 'week') {
            value1 = ((document.getElementById("weekly_0").checked) ? '1' : '0') + ',' +
            ((document.getElementById("weekly_1").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_2").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_3").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_4").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_5").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_6").checked) ? '1' : '0')
        }
        
        if (type == 'month') {
        	var monthType = getSelectedRadioButton("month_type");
        	if(monthType=='1'){
        		value1 = $('month_type1_value1').value;
        	}else{
        		value1 = $('month_type2_value1').value;
        	}
            
        }
        
        if (type == 'year') {
            value1 = $('year_value1').value;
        }
        
        return value1;
    },
    
    // get type from the control interface
    getFieldValue2: function(){
    	var value2 = '';
    	var type = getSelectedRadioButton("type_option");
        
        if (type == 'week') {
            value2 = $('week_value2').value;
        }
        
        if (type == 'month') {
        	var monthType = getSelectedRadioButton("month_type");
        	if(monthType=='2'){
        		value2 = $('month_type2_value2').value;
        	}
        }
        
        if (type == 'year') {
            value2 = $('year_value2').value;
        }
        
        return value2;
    },
    
    // get type from the control interface
    getFieldValue3: function(){
    	var value3 = '';
    	var type = getSelectedRadioButton("type_option");
        
        if (type == 'month') {
        	value3 = $('month_value3').value;
        }
        
        if (type == 'year') {
            value3 = $('year_value3').value;
        }
        
        return value3;
    	
    },
    
    // get type from the control interface
    getFieldTotal: function(){
    	return  $('total').value;
    	
    },
    
    // clear all interface values
    clear: function(){
    	 this.enable(true);
    	 var radioButtons = document.getElementsByName('type_option');
    	 radioButtons[0].checked = true;
	     for (var i = 1; i < radioButtons.length; i++) {
	    	radioButtons[i].checked = false;
	     }
	     
	     var monthRadio = document.getElementsByName('month_type');
	     for (var i = 0; i < monthRadio.length; i++) {
	    	 monthRadio[i].checked = false;
	     }
	     
	     enabledDay(false);
         enabledWeek(false);
         enabledMonth(false);
         enabledYear(false);
         enableField(["total"],false);
         
         //clear fields values
         clearFieldsValue([ "weekly_0","weekly_1","weekly_2","weekly_3","weekly_4","weekly_5","weekly_6"
                            , "month_type1_value1","month_type2_value1","month_type2_value2","month_value3"
                            , "year_value1","year_value2","year_value3"
                            ,"total"]);
         
         //set default values
         $('day_value1').value = '1';
         
         //KB3035716  - all the "Every XXX" edit boxes should have a default value of 1 on view load
         $('week_value2').value = '1';
         $('month_value3').value = '1';
         $('year_value3').value = '1';
         
    },
    
    // enable or disable all interface values
    enable: function(isEnable){
    	 var radioButtons = document.getElementsByName('type_option');
	     for (var i = 0; i < radioButtons.length; i++) {
	    	radioButtons[i].disabled = !isEnable;
	     }
	     var radioButtons = document.getElementsByName('month_type');
	     for (var i = 0; i < radioButtons.length; i++) {
	    	radioButtons[i].disabled = !isEnable;
	     }
         enableField(["day_value1", "week_value2","weekly_0","weekly_1","weekly_2","weekly_3","weekly_4","weekly_5","weekly_6"
                      , "month_type1_value1","month_type2_value1","month_type2_value2","month_value3"
                      , "year_value1","year_value2","year_value3"
                      ,"total"],isEnable);
         
         if(isEnable){
        	 onSelectRecurringType();
         }
    },
    
    // validate the recurring pattern
    valid: function(event){
    	this.type = this.getType();
    	this.value1 = this.getFieldValue1();
    	this.value2 = this.getFieldValue2();
    	this.value3 = this.getFieldValue3();
    	this.total = this.getFieldTotal();
        
      if (this.total!='') {  // KB 3034744, allow total to be blank
    	  if(!this.isPositiveInteger(this.total)){
    		  this.total = 1;
    	  }
    	}
    	
        if (this.type == 'day') {
        	if(!this.isPositiveInteger(this.value1)){
        		this.value1 = 1;
        	}
        }
        
        if (this.type == 'week') {
        	if(!this.isPositiveInteger(this.value2)){
        		this.value2 = 1;
        	}
        	
        	//KB3034923 - do not automatically checks the "Monday" option when click interface
        	//if(!valueExistsNotEmpty(event) && this.value1.indexOf('1')==-1){
        	//	this.value1 = '1,0,0,0,0,0,0';
        	//}
        }
        
        if (this.type == 'month') {
        	if(!this.isPositiveInteger(this.value3)){
        		this.value3 = 1;
        	}
        	
        	var monthType = getSelectedRadioButton("month_type");
        	if(monthType=='1'){
        		if(!this.isPositiveInteger(this.value1)){
            		this.value1 = 1;
            	}else if(this.value1>31){
            		this.value1 = 31;
            	}
        	}else if(monthType=='2'){
        		if(this.value1==''){
        			this.value1 = '1st'
        		}
        		if(this.value2==''){
        			this.value2 = 'mon'
        		}
        	}else{
        		this.value1 = '';
        	    this.value2 = '';
        	}
        }
        
        if (this.type == 'year') {
        	if(!this.isPositiveInteger(this.value3)){
        		this.value3 = 1;
        	}
        	
        	//if(this.value2==''){
    		//	this.value2 = 'jan'
    		//}
        	
        	if(this.value2!=''){
        		if(!this.isPositiveInteger(this.value1)){
            		this.value1 = 1;
            	}else if(this.value1>29 && this.value2=='feb'){
            		this.value1 = 29;
            	}else if(this.value1>30 && (this.value2=='apr'||this.value2=='jun'||this.value2=='sep'||this.value2=='nov')){
            		this.value1 = 30;
            	}else if(this.value1>31){
            		this.value1 = 31;
            	} 
        	}
        }
        
        this.setValuesByType();
    },
    
    isPositiveInteger: function(value){
    	var bReturned = false; 
    	var objRegExp  = /^[0-9]*[1-9][0-9]*$/;
		if(value!='' && objRegExp.test(value)){
			bReturned = true;
		}
		return bReturned;
    },
    
    onClickMonthTypeCheckBox: function(event){
    	//KB3035716 - fix issue : select Monthly, then select "Day x of month" checkbox.  You then cannot select the other checkbox.
    	if(valueExistsNotEmpty(event)){
    		if(event.target.checked){
    			if(event.target.id == 'month_type_1'){
    				$('month_type_2').checked = false;
    				if(!$('month_type1_value1').value){
    					$('month_type1_value1').value = 1;
    				}
    			}else{
    				$('month_type_1').checked = false;
    				if(!$('month_type2_value1').value){
    					$('month_type2_value1').value = '1st';
    				}
    				
    				if(!$('month_type2_value2').value){
    					$('month_type2_value2').value = 'mon';
    				}
    			}
    		}
    	}
    }
});


/**
 * Returns value of the selected radio button.
 * 
 * @param {name}
 *            Name attribute of the radio button HTML elements.
 */
function getSelectedRadioButton(name){
    var radioButtons = document.getElementsByName(name);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}


/**
 * onclick event handler for radio recurring_type.
 */
function onSelectRecurringType(){
    var type = getSelectedRadioButton("type_option");
    if (type == "none") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth(false);
        enabledYear(false);
        enableField(["total"],false);
    }
    if (type == "once") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth(false);
        enabledYear(false);
        enableField(["total"],false);
    }
    if (type == "day") {
        enabledDay(true);
        enabledWeek(false);
        enabledMonth(false);
        enabledYear(false);
        enableField(["total"],true);
    }
    if (type == "week") {
        enabledDay(false);
        enabledWeek(true);
        enabledMonth(false);
        enabledYear(false);
        enableField(["total"],true);
    }
    if (type == "month") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth(true);
        enabledYear(false);
        enableField(["total"],true);
    }
    if (type == "year") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth(false);
        enabledYear(true);
        enableField(["total"],true);
    }
    
    //add note
    addNote();
    
    //display area by type
    displayAreaBytype(type);
}

/**
 * enable or disable the radio 'day'.
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enabledDay(isEnabled){
    enableField(["day_value1"],isEnabled);
}

/**
 * enable or disable the radio 'week'.
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enabledWeek(isEnabled){
    enableField(["week_value2","weekly_0","weekly_1","weekly_2","weekly_3","weekly_4","weekly_5","weekly_6"],isEnabled);
}

/**
 * enable or disable the radio 'month'
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enabledMonth(isEnabled){
    enableField(["month_type1_value1","month_type2_value1","month_type2_value2","month_value3"],isEnabled);
}

/**
 * enable or disable the radio 'year'.
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enabledYear(isEnabled){
    enableField(["year_value1","year_value2","year_value3"],isEnabled);
}

/**
 * enable or disable field element
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enableField(fields, isEnabled){
	for(var i=0;i<fields.length;i++){
		var field = $(fields[i]);
		field.disabled = !isEnabled;
	}
}

/**
 * clear field value or checks
 * 
 */
function clearFieldsValue(fields){
	for(var i=0;i<fields.length;i++){
		var field = $(fields[i]);
		field.value = '';
		field.checked = false;
	}
}

/**
 * add note to the control
 * 
 */
function addNote(){
	var note = '';
	
	var type = getSelectedRadioButton("type_option");
    if (type == "day"||type == "week"||type == "month") {
    	note = getMessage('note1');
    }else if (type == "year") {
    	note = getMessage('note2');
    }
    
	Ext.get('control_note').update(note);
}

/**
 * diaplay area by recurring type
 * 
 */
function displayAreaBytype(type){
	//hide all area first
	Ext.get('div_once').setDisplayed(false);
	Ext.get('div_day').setDisplayed(false);
	Ext.get('div_week').setDisplayed(false);
	Ext.get('div_month').setDisplayed(false);
	Ext.get('div_year').setDisplayed(false);
	
	//display given area only
	var area = Ext.get('div_'+type);
	if(area){
		area.setDisplayed(true);
	}
}
