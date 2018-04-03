<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<xsl:stylesheet 
	version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:ckl="http://checklists.nist.gov/xccdf/1.1" 
	xmlns:oval="http://oval.mitre.org/XMLSchema/oval-definitions-5" 
	xmlns:windows="http://oval.mitre.org/XMLSchema/oval-definitions-5#windows" 
	xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xmlns="http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions"
>
	<xsl:output method="xml" indent="yes"/>
	<xsl:param name="x"/>
	<xsl:param name="o"/>
	
	<xsl:variable name="xccdf" select="document($x)/ckl:Benchmark"/>
	<xsl:variable name="oval" select="document($o)/oval:oval_definitions"/>
	
	<xsl:template match="/">

		<policyDefinitions 
			revision="1.0" 
			schemaVersion="1.0" 
		>
			<xsl:call-template name="policy-namespaces"></xsl:call-template>
			<xsl:call-template name="resources"></xsl:call-template>
			<xsl:call-template name="categories"></xsl:call-template>
			<xsl:call-template name="policies"></xsl:call-template>
		</policyDefinitions>
	</xsl:template>
		
		
	<xsl:template name="policy-namespaces">
		<policyNamespaces>
			<target prefix="iaWork" namespace="IAWork.STIG.GPO.KFZL3C6BQ5"></target>
			<using prefix="windows" namespace="Microsoft.Policies.Windows"></using>
		</policyNamespaces>
	</xsl:template>
		
	<xsl:template name="resources">
		<resources minRequiredRevision="1.0"></resources>
	</xsl:template>
	
	<xsl:template name="categories">
		<categories>
			<category name="InformationAssurance" displayName="$(string.CatInfoAssurance)" />
			<category displayName="$(string.CatInfoAssuranceStig)">
				<xsl:attribute name="name">
					<xsl:value-of select="translate($xccdf/ckl:title, translate( $xccdf/ckl:title, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ''), '')" />
				</xsl:attribute> 
				<parentCategory ref="InformationAssurance"></parentCategory>
			</category>
		</categories>
	</xsl:template>
		
	<xsl:template name="policies">
		<policies iaTest="">
			<xsl:for-each select="$xccdf/ckl:Group">
				<xsl:call-template name="policy">
					<xsl:with-param name="policy-info" select="." />
				</xsl:call-template>
			</xsl:for-each>
		</policies>
	</xsl:template>
		
	<xsl:template name="policy">
		<xsl:param name="policy-info"/>
		
		<xsl:variable name="check-name" select="$policy-info/ckl:Rule/ckl:check/ckl:check-content-ref/@name" />
		<xsl:variable name="oval-test-ref" select="$oval/oval:definitions/oval:definition[@id=$check-name]/oval:criteria/oval:criterion/@test_ref" />
		<xsl:variable name="oval-object-ref" select="$oval/oval:tests/*[@id=$oval-test-ref]/windows:object/@object_ref" />
		<xsl:variable name="object-type" select="local-name($oval/oval:objects/*[@id=$oval-object-ref])" />
		<xsl:variable name="policy-name"><xsl:value-of select="translate($policy-info/@id,'-','')"/>_<xsl:value-of select="translate($policy-info/ckl:Rule/@id,'-','')" /></xsl:variable>
		<xsl:variable name="xccdf-val-ref" select="$policy-info/ckl:Rule/ckl:check/ckl:check-export/@value-id" />
		
		<xsl:if test="./ckl:Rule/ckl:check/ckl:check-export and $oval/oval:objects/*[@id=$oval-object-ref]/windows:key">
		
		<policy>
			<xsl:attribute name="presentation">$(presentation.<xsl:value-of select="$policy-name" />)</xsl:attribute>
			<xsl:attribute name="key"><xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:key" /></xsl:attribute>
			<xsl:attribute name="explainText">$(string.<xsl:value-of select="$policy-name" />_explain)</xsl:attribute>
			<xsl:attribute name="name"><xsl:value-of select="$policy-name" /></xsl:attribute>
			<xsl:attribute name="class">
				<xsl:choose>
					<xsl:when test="$oval/oval:objects/*[@id=$oval-object-ref]/windows:hive='HKEY_LOCAL_MACHINE'">Machine</xsl:when>
					<xsl:otherwise>User</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>
			<xsl:attribute name="displayName">$(string.<xsl:value-of select="$policy-name" />_display)</xsl:attribute>
			
			<parentCategory>
				<xsl:attribute name="ref"><xsl:value-of select="translate($xccdf/ckl:title, translate( $xccdf/ckl:title, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ''), '')"/></xsl:attribute>
			</parentCategory>
			<supportedOn ref="windows:SUPPORTED_Win2k" />
			<elements>
				<enum>
					<xsl:attribute name="id"><xsl:value-of select="$policy-name" />_enum</xsl:attribute>
					<xsl:attribute name="valueName"><xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:name" /></xsl:attribute>
					<xsl:attribute name="required">true</xsl:attribute>
					
					<xsl:for-each select="$xccdf/ckl:Value[@id=$xccdf-val-ref]/ckl:value[./@selector]">
						<item>
							<xsl:attribute name="displayName">$(string.<xsl:value-of select="$policy-name" />_Item_<xsl:value-of select="position()-1" />)</xsl:attribute>
							<value>
								<xsl:choose>
									<xsl:when test="number(./text()) = ./text()">
										<decimal>
											<xsl:attribute name="value">
												<xsl:value-of select="./text()" />
											</xsl:attribute>
										</decimal>
									</xsl:when>
									<xsl:otherwise>
										<string><xsl:value-of select="./text()" /></string>
									</xsl:otherwise>
								</xsl:choose>
							</value>
						</item>
					</xsl:for-each>
				</enum>
			</elements>
		</policy>
		</xsl:if>
	</xsl:template>
	
	
</xsl:stylesheet>