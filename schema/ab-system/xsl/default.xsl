<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />

	<!-- top template  -->
	<xsl:template match="/">
		<html lang="EN">
		<title>
			<!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
			<!-- to generate <title /> if there is no title in source XML -->
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->

			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- since it's possible there are a few tgrps in one view, using "//afmTableGroup" instead of "/*/afmTableGroup" -->
			<!-- "//" will test each afmTableGroup -->
			<xsl:if test="//afmTableGroup/@format='editForm'">
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/edit-forms.js"><xsl:value-of select="$whiteSpace"/></script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/calendar.js"><xsl:value-of select="$whiteSpace"/></script>
			</xsl:if>
			<xsl:if test="//afmTableGroup/@format!='editForm'">
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/reports.js"><xsl:value-of select="$whiteSpace"/></script>
			</xsl:if>
			<!-- executeTransaction -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-processing-sql-actions.js"><xsl:value-of select="$whiteSpace"/></script>

			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
			<!-- mdx chart image map ? -->
			<xsl:for-each select="//afmTableGroup/dataSource/data/charts/chart">
				<xsl:copy-of select="map"/>
			</xsl:for-each>
			<xsl:for-each select="//formatting/js">
				<xsl:variable name="customized_js" select="@file"/>
				<xsl:if test="$customized_js">
					<script language="JavaScript" src="{$customized_js}"><xsl:value-of select="$whiteSpace"/></script>
				</xsl:if>
			</xsl:for-each>
			<xsl:for-each select="//style[@type='text/css']">
				<xsl:copy-of select="."/>
			</xsl:for-each>
		</head>

		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
			<!-- calling template logo_title in common.xsl to set up tgrp's title in the top of html page -->
			<!-- handle add new case in edit form -->
			<xsl:variable name="firstTgrpNode" select="/*/afmTableGroup[position()=1]"/>
			<!-- calling template common which is in common.xsl -->
			<!-- this should be in the top of html body  -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
			<xsl:variable name="bShowLogo">
				<xsl:choose>
					<xsl:when test="//afmXmlView/@showLogo"><xsl:value-of select="//afmXmlView/@showLogo"/></xsl:when>
					<xsl:otherwise>true</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<xsl:call-template name="logo_title">
				<xsl:with-param name="title" select="$firstTgrpNode/title"/>
				<xsl:with-param name="type" select="$firstTgrpNode/@type"/>
				<xsl:with-param name="format" select="$firstTgrpNode/@format"/>
				<xsl:with-param name="logoFile" select="//preferences/@logoFile"/>
				<xsl:with-param name="showLogo" select="$bShowLogo"/>
				<xsl:with-param name="logoPath" select="$projectGraphicsFolder"/>
				<xsl:with-param name="hasRowAction" select="$firstTgrpNode/dataSource/data/records/record/afmAction"/>
				<xsl:with-param name="hasRowSelectionAction" select="$firstTgrpNode/rows/selection/afmAction"/>
				<xsl:with-param name="hasAnyRecord" select="$firstTgrpNode/dataSource/data/records/record"/>
				<xsl:with-param name="addNew" select="$firstTgrpNode/@addNew"/>
				<xsl:with-param name="pdfAction" select="$firstTgrpNode/afmAction[@eventName='renderShowPrintablePdf']" /> 
			</xsl:call-template>	
			
			<table cellspacing="0" cellpadding="0" width="100%" valign="top">
				<!-- main section: going through all afmTableGroups to process their data -->
				<!-- don't use <xsl:for-each select="//afmTableGroup"> ("//" should never be used in <xsl:for-each>)-->
				<xsl:for-each select="/*/afmTableGroup">
					<xsl:call-template name="AfmTableGroups">
						<xsl:with-param name="afmTableGroup" select="."/>
						<xsl:with-param name="margin-left" select="0"/>
						<xsl:with-param name="level" select="1"/>
					</xsl:call-template>
				</xsl:for-each>
			</table>
			
		</body>
		</html>
	</xsl:template>

	<!-- template (AfmTableGroups) used in xslt -->
	<xsl:template name="AfmTableGroups">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>
		<!-- checking if there is any afmTableGroup node in xml -->
		<xsl:if test="count($afmTableGroup) &gt; 0">
			<tr valign="top"><td valign="top">
				<!-- using a variable to hold the format of afmTableGroup: form or report (?? changable ??)-->
				<xsl:variable name="format" select="$afmTableGroup/@format"/>	
				<xsl:choose>
					<!-- edit form:(editForm is a keyword in source XML) -->
					<xsl:when test="$format='editForm'">
						<!-- calling template EditForm which is in edit-forms/edit-forms.xsl -->
						<xsl:call-template name="EditForm">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup[1]"/>
							<xsl:with-param name="margin-left" select="$margin-left"/>
						</xsl:call-template>
					</xsl:when>

					<!-- report: table or column -->
					<xsl:otherwise>
						<!-- calling template Report which is in reports/reports.xsl -->
						<xsl:call-template name="Report">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup[1]"/>
							<xsl:with-param name="margin-left" select="$margin-left"/>
							<xsl:with-param name="level" select="$level"/>
							<xsl:with-param name="format" select="$format"/>
						</xsl:call-template>
					</xsl:otherwise>
				</xsl:choose>
				
			</td></tr>

			<!-- recursive processing AfmTableGroups in child level -->
			<xsl:for-each select="$afmTableGroup/afmTableGroup">
				<xsl:call-template name="AfmTableGroups">
					<xsl:with-param name="afmTableGroup" select="."/>
					<xsl:with-param name="margin-left" select="$margin-left+1"/>
					<xsl:with-param name="level" select="$level+1"/>
				</xsl:call-template>
			</xsl:for-each>

			<!-- checking if there is a subFrame node in afmTableGroup -->
			<!-- if there is a subFrame node, implement it in javascript function to refresh all sub-frames-->
			<xsl:if test="count($afmTableGroup/subFrames/*) &gt; 0">
				<xsl:variable name="subFrameNode" select="$afmTableGroup/subFrames/*"/>
				<xsl:call-template name="autoRefreshingSubFrames">
					<xsl:with-param name="subFrameNode" select="$subFrameNode"/>
					<xsl:with-param name="ID" select="generate-id()"/>
				</xsl:call-template>
			</xsl:if>
			
		</xsl:if>
	</xsl:template>
	<!-- refreshing all sub-frames -->
	<xsl:template name="autoRefreshingSubFrames">
		<xsl:param name="subFrameNode"/>
		<xsl:param name="ID"/>
		<xsl:if test="count($subFrameNode)>0">
			<!-- javascript functions used here are in common-edit-report.js -->
			<script language="JavaScript">
				<!--xsl:text>setUpTablesArray('</xsl:text><xsl:value-of select="$ID"/><xsl:text>');</xsl:text-->
				<xsl:for-each select="$subFrameNode">
					<xsl:variable name="FrameName" select="@name"/>
					<xsl:variable name="FrameSource" select="@href"/>
					<!--???? -->
					<xsl:variable name="serialized_string" select="substring-after($FrameSource,'xml=')"/>
					sendingDataFromHiddenForm('','<xsl:value-of select="$serialized_string"/>','<xsl:value-of select="$FrameName"/>','',false,'');
				</xsl:for-each>
			</script>
		</xsl:if>
	</xsl:template>
	
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
	<xsl:include href="locale.xsl" />
	<xsl:include href="inputs-validation.xsl" />
	<xsl:include href="reports/reports.xsl" />
	<xsl:include href="edit-forms/edit-forms.xsl" />
	<xsl:include href="copyright.xsl" />
</xsl:stylesheet>


