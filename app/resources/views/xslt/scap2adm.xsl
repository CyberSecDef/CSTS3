<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ckl="http://checklists.nist.gov/xccdf/1.1" xmlns:oval="http://oval.mitre.org/XMLSchema/oval-definitions-5" xmlns:windows="http://oval.mitre.org/XMLSchema/oval-definitions-5#windows" xmlns="http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions">
	<xsl:output method="text" indent="no"/>
	
	<xsl:param name="x"/>
	<xsl:param name="o"/>
	
	<xsl:variable name="xccdf" select="document($x)/ckl:Benchmark"/>
	<xsl:variable name="oval" select="document($o)/oval:oval_definitions"/>
	
	<xsl:template match="/">
		<xsl:for-each select="$xccdf/ckl:Group">
			<xsl:variable name="check-name" select="./ckl:Rule/ckl:check/ckl:check-content-ref/@name" />
			<xsl:variable name="oval-test-ref" select="$oval/oval:definitions/oval:definition[@id=$check-name]/oval:criteria/oval:criterion/@test_ref" />
			<xsl:variable name="oval-object-ref" select="$oval/oval:tests/*[@id=$oval-test-ref]/windows:object/@object_ref" />
			<xsl:variable name="object-type" select="local-name($oval/oval:objects/*[@id=$oval-object-ref])" />

			<xsl:choose>
				<xsl:when test="$object-type='registry_object'">
				<xsl:call-template name="registry-requirement">
				   <xsl:with-param name="oval-object-ref" select="$oval-object-ref"/>
				</xsl:call-template>
			</xsl:when>
			</xsl:choose>
		</xsl:for-each>

[strings]
<xsl:for-each select="$xccdf/ckl:Group">
<xsl:variable name="check-name" select="./ckl:Rule/ckl:check/ckl:check-content-ref/@name" />
<xsl:variable name="oval-test-ref" select="$oval/oval:definitions/oval:definition[@id=$check-name]/oval:criteria/oval:criterion/@test_ref" />
<xsl:variable name="oval-object-ref" select="$oval/oval:tests/*[@id=$oval-test-ref]/windows:object/@object_ref" />
<xsl:variable name="object-type" select="local-name($oval/oval:objects/*[@id=$oval-object-ref])" />

<xsl:choose>
<xsl:when test="$object-type='registry_object'">
<xsl:call-template name="explain-strings">
<xsl:with-param name="oval-object-ref" select="$oval-object-ref"/>
<xsl:with-param name="oval-test-ref" select="$oval-test-ref"/>
</xsl:call-template>
</xsl:when>
</xsl:choose>
</xsl:for-each>
	</xsl:template>
		
<xsl:template name="explain-strings">
<xsl:param name="oval-object-ref"/>
<xsl:param name="oval-test-ref"/>

<xsl:variable name="explain" select="concat(./ckl:Rule/@id,'_',./@id,'_','EXPLAIN')" />
<xsl:variable name="xccdf-val-ref" select="./ckl:Rule/ckl:check/ckl:check-export/@value-id" />
<xsl:variable name="sel-val" select="$xccdf/ckl:Value[@id=$xccdf-val-ref]/ckl:value[1]" />
<xsl:value-of select="$explain"/>="<xsl:value-of select="./ckl:Rule/@id"/> - <xsl:value-of select="./@id"/> - <xsl:value-of select="translate(substring( substring-before(./ckl:Rule/ckl:description,'&lt;/VulnDiscussion'), 17 ),'&#x22;&#xa;','')"/>\n\n \nHive: <xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:hive" /> \nKey: <xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:key" /> \nName: <xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:name" /> <xsl:choose> <xsl:when test="$sel-val"> \n\n*** Recommended Value: <xsl:value-of select="translate($sel-val,'&#x22;&#xa;','')" /> *** </xsl:when> <xsl:otherwise> \n\n+++ Recommended Value: <xsl:value-of select="translate($oval/oval:states/*[@id =  $oval/oval:tests/*[@id=$oval-test-ref]/windows:state/@state_ref ]/windows:value,'&#x22;&#xa;','')"/>	 </xsl:otherwise> </xsl:choose>"
</xsl:template>	
	
	<xsl:template name="registry-requirement">
		<xsl:param name="oval-object-ref"/>
		<xsl:variable name="explain" select="concat(./ckl:Rule/@id,'_',./@id,'_','EXPLAIN')" />
		<xsl:variable name="xccdf-val-ref" select="./ckl:Rule/ckl:check/ckl:check-export/@value-id" />
		<xsl:variable name="sel-val" select="$xccdf/ckl:Value[@id=$xccdf-val-ref]/ckl:value[1]" />
<xsl:if test="$sel-val">	
CLASS MACHINE
	CATEGORY "<xsl:value-of select="$xccdf/ckl:title" />"
	KEYNAME "<xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:key" />"
	POLICY "<xsl:value-of select="./@id"/> - <xsl:value-of select="./ckl:Rule/@id"/> - <xsl:value-of select="./ckl:Rule/ckl:title"/>"
	PART "<xsl:value-of select="./ckl:Rule/ckl:check/ckl:check-export/@value-id"/>" DROPDOWNLIST REQUIRED
		VALUENAME "<xsl:value-of select="$oval/oval:objects/*[@id=$oval-object-ref]/windows:name" />"
		ITEMLIST
<xsl:choose>
<xsl:when test="./ckl:Rule/ckl:check/ckl:check-export">
	<xsl:for-each select="$xccdf/ckl:Value[@id=$xccdf-val-ref]/ckl:value">
		<xsl:if test="./@selector">
			<xsl:choose>
<xsl:when test="./text() = $sel-val">			NAME "*** <xsl:value-of select="./@selector" /> ***" VALUE <xsl:if test="number(./text()) = ./text()">NUMERIC</xsl:if> "<xsl:value-of select="./text()" />"</xsl:when>
<xsl:when test="./text() != $sel-val">			NAME "<xsl:value-of select="./@selector" />" VALUE <xsl:if test="number(./text()) = ./text()">NUMERIC</xsl:if> "<xsl:value-of select="./text()" />"</xsl:when>
			</xsl:choose>
			<xsl:text>&#xa;</xsl:text>
		</xsl:if>
	</xsl:for-each>
</xsl:when>
</xsl:choose>
		END ITEMLIST
	END PART
EXPLAIN !!<xsl:value-of select="$explain"/>
END POLICY
END CATEGORY
</xsl:if>
	</xsl:template>
</xsl:stylesheet>