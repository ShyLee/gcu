View.createController('ascUsmsSelectFixedRpt', {

    wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
    xmlName: "",
    parameters:{},
	
    
    afterViewLoad: function(){
       if (this.view.parameters['parameters']){
	   	 this.parameters = this.view.parameters['parameters'];
	   }
		this.xmlName = this.view.parameters['xmlName'];
		//由于学校房产统计列表、查看构筑物信息报表过长,word格式的无法正常显示，隐藏docx的radio
		if (this.xmlName=='asc-bj-rpt-sch-rm-gg' || this.xmlName=='asc-bj-rpt-sch-gzw-gg') {
			var radios = document.getElementsByName("lock");
			radios[2].parentNode.style.display="none";
			jQuery("input[name='lock']").eq(2).removeAttr("checked");
			jQuery("input[name='lock']").eq(1).attr("checked","checked");
			jQuery("input[name='lock']").eq(1).click();
		}
    },
    
    rplmBuildingForm_onGenerate: function(){
        var txlspdf = getSelectedRadioButton("lock");
        try {
            var result = Workflow.callMethod(this.wfrId, this.xmlName, txlspdf, this.parameters);
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
                var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
                window.open(url);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        View.closeThisDialog();
    }
    
});

/**
 * Returns value of the selected radio button.
 * @param {name} Name attribute of the radio button HTML elements.
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
