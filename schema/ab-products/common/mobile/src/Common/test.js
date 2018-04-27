var Harness = Siesta.Harness.Browser.SenchaTouch;

Harness.configure({
	title : 'Mobile App Common Tests',

	preload : [ '../touch/resources/css/sencha-touch.css',
			'../touch/sencha-touch-all.js',
			'/archibus/dwr/interface/MobileSyncService.js',
			'/archibus/dwr/interface/SecurityService.js',
			'/archibus/dwr/interface/MobileSecurityService.js',
			'/archibus/dwr/interface/SmartClientConfigService.js',
			'/archibus/dwr/interface/AdminService.js',
			'/archibus/dwr/interface/workflow.js', '/archibus/dwr/engine.js',
			'../Common/resources/language/lang_en.js',
			'../Common/resources/language/lang_fr.js',
			'../Common/test/util/Database.js', '../Common/device-api.js'

	],

	loaderPath : {
		'Common' : '../Common',
		'Maintenance' : '../Maintenance/app',
		'AssetAndEquipmentSurvey' : '../AssetAndEquipmentSurvey/app'
	},

	disableCaching : true,

	autoCheckGlobals : false
});

Harness.start('test/010_sanity.t.js', {
	group : 'Configuration File Manager',
	items : [ 'test/configuration/01_configuration.t.js',
			'test/configuration/02_configuration.t.js',
			'test/configuration/03_configuration.t.js' ]
}, {
	group : 'Service',
	items : [ 'test/service/01_conversion_utils.js',
			'test/service/02_service_get_user.t.js',
			'test/service/03_service_ismemberofgroup.t.js',
            'test/service/04_workflow_tojson.t.js',
            'test/service/05_service_getuser_session.t.js',
            'test/service/06_workflow_maintenance.t.js']
}, {
	group : 'Proxy',
	items : [ 'test/proxy/01_sqlite.t.js', 'test/proxy/02_changetable.t.js',
			'test/proxy/03_filter.t.js' ]
}, {
	group : 'sync',
	items : [ 'test/sync/01_workrequest.t.js',
			'test/sync/02_workrequest_date.t.js',
			'test/sync/03_date_time.t.js',
            'test/sync/04_retrieverecords.t.js',
            'test/sync/05_date_checkin.t.js']
}, {
	group : 'TableDef',
	items : [ 'test/tabledef/01_tabledef.t.js'
	// 'tests/tabledef/02_tabledef.t.js'
	]
}, {
	group : 'Localization',
	items : [ 'test/localization/01_localization.t.js',
			'test/localization/02_localization_componentlocalizer.t.js' ]
}, {
	group : 'Custom Type Tests',
	items : [ 'test/customtypes/01_customtype_int.t.js',
			'test/customtypes/02_customtype_date.t.js',
			'test/customtypes/03_customtype_time.t.js',
			'test/customtypes/04_customtype_timestamp.t.js',
			'test/customtypes/05_customtype_sync.t.js',
			'test/customtypes/06_customtype_model.t.js',
			'test/customtypes/07_customtype_controls.t.js' ]
}, {
	group : 'Security Tests',
	items : [ 'test/security/01_security.t.js' ]
}, {
	group : 'Data Stores Tests',
	items : [ 'test/stores/01_schemaupdaterstore_tabledef.t.js',
			'test/stores/02_schemaupdaterstore_tabledef.t.js',
			'test/stores/03_schemaupdaterstore_modelfields.t.js',
			'test/stores/04_syncstore_document.t.js',
			'test/stores/05_syncstore_doc_transfer.t.js',
			'test/stores/06_syncstore_doc_transfer.t.js' ]
}, {
	group : 'Navigation',
	items : [ 'test/navigation/01_navigationbar.t.js' ]
},

{
	group : 'Views',
	items : [ 'test/views/02_generate_form_fields.t.js' ]
}

);
