if($args.count -gt 2){
	$arglist = new-object System.Xml.Xsl.XsltArgumentList;
	for($i = 2; $i -lt $args.length; $i = $i +  2){
		$arglist.AddParam($args[$i], "", $args[$i+1]);
	}
}else{
	$arglist = $null;
}

$xmlContent = [string](gc $args[0]);
$inputstream = new-object System.IO.MemoryStream;
$xmlvar = new-object System.IO.StreamWriter($inputstream);
$xmlvar.Write( $xmlContent);
$xmlvar.Flush();
$inputstream.position = 0;
$xmlObj = new-object System.Xml.XmlTextReader($inputstream);
$output = New-Object System.IO.MemoryStream;
$xslt = New-Object System.Xml.Xsl.XslCompiledTransform;
$reader = new-object System.IO.StreamReader($output);
$resolver = New-Object System.Xml.XmlUrlResolver;
$xslSettings = New-Object System.Xml.Xsl.XsltSettings($false,$true);
$xslSettings.EnableDocumentFunction = $true;
$xslt.Load($args[1],$xslSettings, $resolver);
$xslt.Transform($xmlObj, $arglist, $output);
$output.position = 0;
$transformed = [string]$reader.ReadToEnd();
$reader.Close();
return $transformed;
