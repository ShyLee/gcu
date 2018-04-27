View.createController('vwRmbyBlFl', {

    flPanel_afterRefresh: function(){
        var flPanel = this.flPanel;
        if (this.flPanel.restriction != null) {
            flPanel.setTitle(getMessage('setTitleForFl') + ' ' + this.flPanel.restriction['bl.bl_id']);
        }
        else 
            flPanel.setTitle(getMessage('setTitleForFl'));
    },
    
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + this.rmPanel.restriction['fl.bl_id'] + "-" + this.rmPanel.restriction['fl.fl_id']);
    }
})
