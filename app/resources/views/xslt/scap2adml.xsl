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

		<policyDefinitionResources 
			xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
			revision="1.0" 
			schemaVersion="1.0" 
			xmlns="http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions"
		>
			<displayName><xsl:value-of select="$xccdf/ckl:title"/></displayName>
			<description><xsl:value-of select="translate($xccdf/ckl:title, translate( $xccdf/ckl:title, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ''), '')"/></description>
			<resources>
				<xsl:call-template name="string-table"></xsl:call-template>
				<xsl:call-template name="presentation-table"></xsl:call-template>
			</resources>
		</policyDefinitionResources>
		
	</xsl:template>
		
		
	<xsl:template name="string-table">
		<stringTable>
		    <string id="CatInfoAssurance">Cyber Security Tool Suite v3</string>
			<string id="CatInfoAssuranceStig"><xsl:value-of select="$xccdf/ckl:title"/></string>
			
			<xsl:for-each select="$xccdf/ckl:Group">
			
			
				<xsl:variable name="check-name" select="./ckl:Rule/ckl:check/ckl:check-content-ref/@name" />
				<xsl:variable name="oval-test-ref" select="$oval/oval:definitions/oval:definition[@id=$check-name]/oval:criteria/oval:criterion/@test_ref" />
				<xsl:variable name="oval-object-ref" select="$oval/oval:tests/*[@id=$oval-test-ref]/windows:object/@object_ref" />
				<xsl:variable name="object-type" select="local-name($oval/oval:objects/*[@id=$oval-object-ref])" />
				<xsl:variable name="xccdf-val-ref" select="./ckl:Rule/ckl:check/ckl:check-export/@value-id" />
				<xsl:variable name="sel-val" select="$xccdf/ckl:Value[@id=$xccdf-val-ref]/ckl:value[1]" />
				
				<xsl:variable name="policy-name"><xsl:value-of select="translate(./@id,'-','')"/>_<xsl:value-of select="translate(./ckl:Rule/@id,'-','')" /></xsl:variable>
			
				<xsl:if test="./ckl:Rule/ckl:check/ckl:check-export and $oval/oval:objects/*[@id=$oval-object-ref]/windows:key">
			
				<string>
					<xsl:attribute name="id"><xsl:value-of select="$policy-name" />_explain</xsl:attribute>
<xsl:value-of select="./ckl:Rule/@id"/> - <xsl:value-of select="./@id"/> - 
<xsl:value-of select="translate(substring( substring-before(./ckl:Rule/ckl:description,'&lt;/VulnDiscussion'), 17 ),'&#x22;&#xa;','')"/>
<xsl:if test="$oval/oval:objects/*[@id=$oval-object-ref]/windows:hive">
Hive: <xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:hive" />
Key: <xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:key" />
Name: <xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:name" /> 

*** Recommended Value: <xsl:value-of select="$sel-val"/> ***
</xsl:if>
				</string>
				
				<string>
					<xsl:attribute name="id"><xsl:value-of select="$policy-name" />_display</xsl:attribute>
<xsl:value-of select="./ckl:Rule/@id"/> - <xsl:value-of select="./@id"/> - <xsl:value-of select="./ckl:title"/>
				</string>
				
				
				<xsl:for-each select="$xccdf/ckl:Value[@id=$xccdf-val-ref]/ckl:value[./@selector]">
					<xsl:choose>
						<xsl:when test="./text() = $sel-val">
							<string>
								<xsl:attribute name="id"><xsl:value-of select="$policy-name" />_Item_<xsl:value-of select="position()-1" /></xsl:attribute>
								*** <xsl:value-of select="./@selector" /> (<xsl:value-of select="./text()" />) ***
							</string>
						</xsl:when>
						<xsl:when test="./text() != $sel-val">
							<string>
								<xsl:attribute name="id"><xsl:value-of select="$policy-name" />_Item_<xsl:value-of select="position()-1" /></xsl:attribute>
								<xsl:value-of select="./@selector" /> (<xsl:value-of select="./text()" />)
							</string>
						</xsl:when>
					</xsl:choose>
					</xsl:for-each>
			</xsl:if>
			</xsl:for-each>
		</stringTable>
	</xsl:template>
	
	<xsl:template name="presentation-table">
		<presentationTable>
		<xsl:for-each select="$xccdf/ckl:Group">
			<xsl:variable name="check-name" select="./ckl:Rule/ckl:check/ckl:check-content-ref/@name" />
			<xsl:variable name="oval-test-ref" select="$oval/oval:definitions/oval:definition[@id=$check-name]/oval:criteria/oval:criterion/@test_ref" />
			<xsl:variable name="oval-object-ref" select="$oval/oval:tests/*[@id=$oval-test-ref]/windows:object/@object_ref" />
			<xsl:variable name="object-type" select="local-name($oval/oval:objects/*[@id=$oval-object-ref])" />
			<xsl:variable name="xccdf-val-ref" select="./ckl:Rule/ckl:check/ckl:check-export/@value-id" />
			<xsl:variable name="sel-val" select="$xccdf/ckl:Value[@id=$xccdf-val-ref]/ckl:value[1]" />
			
				<xsl:variable name="policy-name"><xsl:value-of select="translate(./@id,'-','')"/>_<xsl:value-of select="translate(./ckl:Rule/@id,'-','')" /></xsl:variable>
				
			<presentation>
				<xsl:attribute name="id"><xsl:value-of select="$policy-name" /></xsl:attribute>
				<dropdownList>
					<xsl:attribute name="refId"><xsl:value-of select="$policy-name" />_enum</xsl:attribute>
					<xsl:value-of select="./ckl:title" />
				</dropdownList>
			</presentation>
		</xsl:for-each>
		</presentationTable>
	</xsl:template>
</xsl:stylesheet>