Ext.define('Campus.util.Ui', {

    requires: 'Common.util.UserProfile',
    singleton: true,

    // TODO: Cache plan type results since they will not change
    // unless we download validating data
    getPlanTypeButtons: function () {
        var planTypeStore = Ext.getStore('planTypes'),
            planTypeButtons = [];

        if (!planTypeStore.isLoaded()) {
            throw new Error('The Plan Type data is not loaded.');
        }

        planTypeStore.each(function (record){

            var planType = record.get('plan_type'),
                title = record.get('title'),
                isActive = record.get('active'),
                planTypeData = {};

            if (isActive === 1) {
                planTypeData.text = title;
                planTypeData.actionId = planType;
                planTypeData.record = record;

                if (planType.indexOf('SURVEY') !== -1) {
                    planTypeData.action = 'surveyButtonTapped';
                }
                planTypeButtons.push(planTypeData);
            }
        }, this);

        return planTypeButtons;
    }

});