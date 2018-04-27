/**
 * Encapsulates the current user profile properties.
 * 
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.util.UserProfile', {
    alternateClassName : [ 'UserProfile' ],
    requires: ['Common.Session',
               'Common.service.MobileSecurityServiceAdapter'],


	singleton : true,

	getUserProfile : function() {
		var me = this, store = Ext.getStore('userProfileStore');

		// Check if the store is loaded. Load it if it is not
		if (store && store.isLoaded()) {
			return me.loadUserProfile(store);
		} else {
			throw new Error('The User Profile information is not available.' +
                     'Please Sync to retrieve the User Profile data.');
		}
	},

	loadUserProfile : function(store) {
		var userName = ConfigFileManager.username, userProfileObject = {
			em_id : '',
			cf_id : '',
			phone : '',
			site_id : '',
			bl_id : '',
			fl_id : ''
		}, record = store.findRecord('user_name', userName);

		if (userName === '') {
			return userProfileObject;
		}

		if (!Ext.isEmpty(record)) {
			userProfileObject.em_id = record.get('em_id');
			userProfileObject.cf_id = record.get('cf_id');
			userProfileObject.bl_id = record.get('bl_id');
			userProfileObject.fl_id = record.get('fl_id');
			userProfileObject.site_id = record.get('site_id');
			userProfileObject.phone = record.get('phone');
		}

		return userProfileObject;
	},

    isUserMemberOfGroup: function (groupName) {
        var session = Ext.create('Common.Session'),
            userIsInGroup = false;

        session.doInSession(function() {
            userIsInGroup = Common.service.MobileSecurityServiceAdapter.isUserMemberOfGroup(groupName);
        });

        return userIsInGroup;
    }
});