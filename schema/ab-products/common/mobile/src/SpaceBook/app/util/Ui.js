Ext.define('SpaceBook.util.Ui', {

    requires: 'Common.util.UserProfile',
    singleton: true,

    // TODO: Cache plan type results since they will not change
    // unless we download validating data
    getPlanTypeButtons: function () {
        var planTypeStore = Ext.getStore('planTypes'),
            planTypeButtons = [],
            userAuthorization = this.getUserAppAuthorization();


        if (!planTypeStore.isLoaded()) {
            throw new Error('The Plan Type data is not loaded.');
        }

        planTypeStore.each(function (record){

            var planType = record.get('plan_type'),
                title = record.get('title'),
                isActive = record.get('active'),
                planTypeData = {},
                includePlanType = true;

            if (isActive === 1) {
                planTypeData.text = title;
                planTypeData.actionId = planType;
                planTypeData.record = record;

                if (planType.indexOf('SURVEY') !== -1) {
                    planTypeData.action = 'surveyButtonTapped';
                    includePlanType = userAuthorization.survey;
                }
                if(includePlanType) {
                    planTypeButtons.push(planTypeData);
                }
            }
        }, this);

        return planTypeButtons;
    },

    /**
     * Retrieve the building record for a given floor
     */
    getBuildingRecord: function(blId, onCompleted, scope) {
        var me = this,
            buildingStore = Ext.getStore('buildingsStore'),
            filter = new Ext.util.Filter({
                property: 'bl_id',
                value: blId
            });

        buildingStore.retrieveAllStoreRecords(filter, function(records) {
            if (typeof onCompleted === 'function') {
                onCompleted.call(scope || me, records);
            }
        }, me);
    },

    /**
     * Retrieves the user group settings
     * @returns {Object}
     */

     getUserAppAuthorization: function() {
         var userGroupStore = Ext.getStore('userGroups'),
             surveyGroup = false,
             surveyPostGroup = false,

             userAuthorization = {
                 survey: false,
                 surveyPost: false
             };

         var surveyGroupRecord = userGroupStore.findRecord('groupName', 'SPAC-SURVEY');
         if(surveyGroupRecord) {
             surveyGroup = surveyGroupRecord.get('isMember');
         }

         var surveyPostGroupRecord = userGroupStore.findRecord('groupName', 'SPAC-SURVEY-POST');
         if(surveyPostGroupRecord) {
            surveyPostGroup = surveyPostGroupRecord.get('isMember');
         }

         userAuthorization.survey = surveyGroup;
         userAuthorization.surveyPost = surveyPostGroup;

         return userAuthorization;
     },

    /**
     * Queries the server for the users SPAC-SURVEY and SPAC-SURVEY-POST
     * group membership.
     */
    applyUserGroups: function() {
        var session = Ext.create('Common.Session'),
            userGroupsStore = Ext.getStore('userGroups'),
            userGroups = [{
                userName: ConfigFileManager.username,
                groupName: 'SPAC-SURVEY',
                isMember: false
            },
            {
                userName: ConfigFileManager.username,
                groupName: 'SPAC-SURVEY-POST',
                isMember: false
            }];

        session.doInSession(function() {
            userGroups[0].isMember = Common.service.MobileSecurityServiceAdapter.isUserMemberOfGroup(userGroups[0].groupName);
            userGroups[1].isMember = Common.service.MobileSecurityServiceAdapter.isUserMemberOfGroup(userGroups[1].groupName);
        });

        userGroupsStore.removeAll();

        Ext.each(userGroups, function(group) {
            var userGroupModel = Ext.create('SpaceBook.model.UserGroup');
            userGroupModel.setData(group);
            userGroupsStore.add(userGroupModel);
        }, this);

        userGroupsStore.sync();
    }
});