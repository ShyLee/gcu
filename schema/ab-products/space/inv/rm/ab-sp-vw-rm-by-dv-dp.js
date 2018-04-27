
View.createController('vwRmbyDvDp', {

    dpPanel_afterRefresh: function(){
        var dpPanel = this.dpPanel;
        if (this.dpPanel.restriction != null) {
            dpPanel.setTitle(getMessage('setTitleForDp') + ' ' + this.dpPanel.restriction['dv.dv_id']);
        }
        else 
            dpPanel.setTitle(getMessage('setTitleForDp'));
    },
    
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        if (this.rmPanel.restriction != null || this.rmPanel.restriction != null) 
            rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + this.rmPanel.restriction['dp.dv_id'] + "-" + this.rmPanel.restriction['dp.dp_id']);
    }
})
