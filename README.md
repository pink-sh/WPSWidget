##BlueBridge WPS Widget

This is a widget that lets embed in any webpage one or more experiments in the BlueBridge e-infrastructure.
The widget will render all the inputs and draw all the results of the experiment.

##Installation

To use the widget you have to load jQuery and Bootstrap, either javascript and css.

```
<head>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>
```

Once you are sure that bot jQuery and Bootstrap are included in the page you can include the widget's files

```
<link rel="stylesheet" href="css/wpsclient.css">
<script src="js/wpsclient.min.js"></script>
<script src="js/wpsclient_tools.min.js"></script>
```

##Usage

In order yo use the client you have to have an empty div in your page where the widget will render all the experiment.
In the page load event you have to init the widget, here an example:

```
<script>
var wps = new BlueBridgeWPSClient({
	'wps_username' : '##YOUR_WPS_USERNAME##', 
	'wps_token' : '##YOUR_WPS_TOKEN##',
	'experiment_identifier' : 'org.gcube.dataanalysis.wps.statisticalmanager.synchserver.mappedclasses.transducerers.CCAMLR_EXPORTER_TOOL',
	'container' : 'experiment',
	'expands' : true,
	'style' : "horizontal"
}).init();
</script>
<body>
	<div id="experiment"></div>
</body>
```

##Parameters

Here below an explanation of all available parameters:

**wps_username *(mandatory)*:**
Your WPS username.

**wps_token *(mandatory)*:**
Your WPS token.

**experiment_identifier *(mandatory)*:**
Is the ID of the experiment available in the WPS.

**container *(mandatory)*:**
Is the ID of the div where you want the widget to be attached to.

**expands *(optional)*:**
boolean value true|false (default is false), if set to true it will explode the contents of the resulting ZIP files rendering the contents. The rendering is available for PDF, PNG, JPEG, HTML, CSV and TXT files. Note that in the case the user's browser has not a PDF viewer the widget will fallback and will show a link where the user can download the PDF.

**style *(optional)*:**
horizontal|vertical (default horizontal), sets the style for the rendering of the widget.

**include *(optional)*:**
if expands is set to true you can use this option to pass an array of file names to be included in the rendering. For example if the zip file has 10 files but you want to show just 3 of those you can tell the widget which files to show.

**exclude *(optional)*:**
It is like the *include* option but here you define the files to be exluded. This option is skipped if the *include* option is set.
