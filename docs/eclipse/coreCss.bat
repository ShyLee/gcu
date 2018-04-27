@REM Creates core CSS files for all color schemes from LESS files.
@REM Run this script from the root folder of the ARCHIBUS Web Central application.

@SET JAVA_HOME=C:\eclipse-archibus\jdk
@SET NODE_HOME=C:\eclipse-archibus\node

CALL %NODE_HOME%/lessc.cmd -x schema/ab-core/less/ab-core-slate.less schema/ab-core/css/ab-core-slate.css
CALL %NODE_HOME%/lessc.cmd -x schema/ab-core/less/ab-core-impact.less schema/ab-core/css/ab-core-impact.css
CALL %NODE_HOME%/lessc.cmd -x schema/ab-core/less/ab-core-slate-small.less schema/ab-core/css/ab-core-slate-small.css
CALL %NODE_HOME%/lessc.cmd -x schema/ab-core/less/ab-core-vibrant.less schema/ab-core/css/ab-core-vibrant.css
CALL %NODE_HOME%/lessc.cmd -x schema/ab-core/less/ab-view-default.less schema/ab-core/css/ab-view-default.css
CALL %NODE_HOME%/lessc.cmd -x schema/ab-core/less/ab-view-console.less schema/ab-core/css/ab-view-console.css
CALL %NODE_HOME%/lessc.cmd -x schema/ab-core/less/ab-view-form.less schema/ab-core/css/ab-view-form.css
CALL %NODE_HOME%/lessc.cmd -x schema/ab-core/less/ab-view-dashboard.less schema/ab-core/css/ab-view-dashboard.css
