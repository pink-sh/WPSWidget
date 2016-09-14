String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
function generateUUID(){
	var d = new Date().getTime();
	if(window.performance && typeof window.performance.now === "function"){
		d += performance.now(); //use high-precision timer if available
	}
	var uuid = 'xxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return 'uuid' + uuid;
}

function BlueBridgeWPSClient(options) {
	this.right = undefined;
	this.init = function() {
		if (options == undefined) {
			alert("The Bluebridge WPS javascript client can not be loaded without options");
			return;
		}
		this.wps_uri = options.wps_uri != undefined ? options.wps_uri : "http://dataminer1-d-d4s.d4science.org/wps/WebProcessingService";
		this.wps_username = options.wps_username != undefined ? options.wps_username : null;
		this.wps_token = options.wps_token != undefined ? options.wps_token : null;
		this.experiment_identifier = options.experiment_identifier != undefined ? options.experiment_identifier : null;
		this.opencpu_url = options.opencpu_url != undefined ? options.opencpu_url : "//access.d4science.org/ocpu/library/WPSClient/R";
		this.container = options.container != undefined ? options.container : null;
		this.style = options.style != undefined ? options.style : "horizontal";

		this.exclude = options.exclude != undefined ? options.exclude : [];
		this.include = options.include != undefined ? options.include : [];

		this.expands = options.expands != undefined ? options.expands : false;

		var emptyT = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

		var error = false;
		var errorMessage = "";
		if (this.wps_username == null) {
			errorMessage += "wps_username ";
			error = true;
		}
		if (this.wps_token == null) {
			errorMessage += "wps_token ";
			error = true;
		}
		if (this.experiment_identifier == null) {
			errorMessage += "experiment_identifier ";
			error = true;
		}
		if (this.container == null) {
			errorMessage += "container ";
			error = true;
		}
		if (error) {
			errorMessage += " option(s) cannot be unset";
			alert(errorMessage);
			return;
		}

		try {
			ocpu.seturl(this.opencpu_url);
		} catch(err) {
			alert(err);
		} finally {
			if (this.container.charAt(0) != '#') {
				this.container = '#' + this.container;
			}

			if (window.experiment == undefined) {
				window.experiment = {};
			}
			window.experiment[this.container] = {};

			var c = $(this.container);
			c.attr("style", "width: 100%;");
			c.empty();
			var containerDiv = $("<div>").attr("class", "bb_exp_container");
			var rightStyle = "bb_right_exp";
			var leftStyle = "bb_left_exp";
			if (this.style.toLowerCase() == 'vertical') {
				rightStyle = "bb_right_exp_vert";
				leftStyle = "bb_left_exp_vert";
			}
			var left = $("<div>").attr("class", leftStyle);
			left.append($("<div>").attr("id", "bb_widg_container_form").attr("class", "bb_widg_container_form"));
			left.append($("<div>").attr("id", "bb_widg_res_out").attr("class", "bb_widg_res_out"));
			this.right = $("<div>").attr("id", "bb_right_exp").attr("class", rightStyle);
			containerDiv.append(left);
			containerDiv.append(this.right);
			c.append(containerDiv);			

			var that = this;
			
			var req = ocpu.rpc("getProcessInputDescription",{
					wps_uri : that.wps_uri, 
					username : that.wps_username, 
					token : that.wps_token,
					process_id : that.experiment_identifier,
					fail : function(session) { //This is using a mocked version of OpenCPU JS Library
						$("#bb_widg_res_out").html('Error retrieving data from OpenCpu');
					}
			}, function(data){
				/*var table = $("<table>");*/
				
				function createChangeCallBack(identifier, that) {
					return function() {
						that.changeInput(this,identifier);
					}
				}
				var divInputStyle = "bb_input_parameters_div";
				if (that.style.toLowerCase() == 'vertical') {
					divInputStyle = "bb_input_parameters_div_vert";
				}

				for (var i = 0; i < data.length; i++) {
					var divInput = $("<div>").attr("class", divInputStyle);

					window.experiment[that.container][data[i].Identifier] = data[i].DefaultValue;
					var identifier = data[i].Identifier;
					var description = data[i].Description;

					var label = $("<div>").attr("class", "bb_wid_attr_label").append($("<label>").html(identifier));

					var paramInput;

					if (data[i].AllowedValues.length > 1) {
						paramInput = $("<select>").attr('name', data[i].Identifier).attr('id', identifier).attr("class", "form-control").attr("style", "margin-bottom: 10px; margin-left: 5px;").change(createChangeCallBack(identifier, that));
						for (var j =0; j < data[i].AllowedValues.length; j++) {
							paramInput.append($("<option>").attr('value', data[i].AllowedValues[j]).text(data[i].AllowedValues[j]));
						}
					} else {
						paramInput = $("<input>").attr('type', 'text').attr('name', identifier).attr('id', identifier).attr("class", "form-control").attr("style", "margin-bottom: 10px; margin-left: 5px;").change(createChangeCallBack(identifier, that)).val(data[i].DefaultValue);
					}

					var qMark = $("<div>").attr("class", "tooltip2").html("?&nbsp;&nbsp;&nbsp;&nbsp;").append($("<div>").attr("class", "tooltiptext2").html(description));

					var divInputTop = $("<div>").attr("class", "bb_input_top_side");
					var divInputBottom = $("<div>").attr("class", "bb_input_bottom_side");

					divInputTop.append(label);
					divInputTop.append($("<div>").attr("class", "bb_wid_attr_input").append(paramInput));
					divInputBottom.append($("<div>").attr("class", "bb_input_desc").html(description));

					divInput.append(divInputTop);
					divInput.append(divInputBottom);


					$(that.container).find("#bb_widg_container_form").append(divInput);
				}
				var showChar = 150;  // How many characters are shown by default
    			var ellipsestext = "...";
    			var moretext = "Show more >";
    			var lesstext = "Show less";
				$('.bb_input_desc').each(function() {
					var content = $(this).html();
 
					if(content.length > showChar) {
 
						var c = content.substr(0, showChar);
						var h = content.substr(showChar, content.length - showChar);
	 
						var html = c + '<span class="bb_moreellipses">' + ellipsestext+ '&nbsp;</span><span class="bb_morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="bb_morelink">' + moretext + '</a></span>';
	 
						$(this).html(html);
					}
 
				});
				$(".bb_morelink").click(function(){
					if($(this).hasClass("bb_less")) {
						$(this).removeClass("bb_less");
						$(this).html(moretext);
					} else {
						$(this).addClass("bb_less");
						$(this).html(lesstext);
					}
					$(this).parent().prev().toggle();
					$(this).prev().toggle();
					return false;
				});

				var runExperimentButton = $("<button>").html("Run Experiment").attr("class", "btn btn-primary bb_run_experiment_button");
				runExperimentButton.bind( "click", function() {that.runExperiment()});
				var buttonDiv = $("<div>").attr("class", divInputStyle).append(runExperimentButton);
				$(that.container).find("#bb_widg_container_form").append(buttonDiv);
				
			});
		}
	};

	this.changeInput = function(input, identifier) {
		for (var k in window.experiment[this.container]) {
			if (k==identifier) {
				if (input.value.trim() == "") {
					window.experiment[this.container][identifier] = undefined;	
				} else {
					window.experiment[this.container][identifier] = input.value;
				}
			}
		}
	};

	this.getFileType = function(file, getMime) {
		if (getMime == undefined) { getMime = false; }
		var mime = undefined;
		var parseType = "uint8array";
		if (file.name.endsWith(".jpg") || file.name.endsWith(".JPG") || file.name.endsWith(".jpeg") || file.name.endsWith(".JPEG")) {
			mime = "image/jpg";
		} else if (file.name.endsWith(".html") || file.name.endsWith(".HTML") || file.name.endsWith(".htm") || file.name.endsWith(".HTM")) {
			mime = "text/html";
		} else if (file.name.endsWith(".png") || file.name.endsWith(".PNG")) {
			mime = "image/png";
		} else if (file.name.endsWith(".pdf") || file.name.endsWith(".PDF")) {
			mime = "application/pdf";
			//containerUuid = generateUUID();
		} else if (file.name.endsWith(".txt") || file.name.endsWith(".TXT")) {
			mime = "text/plain";
			parseType = "string";
		} else if (file.name.endsWith(".csv") || file.name.endsWith(".CSV")) {
			mime = "text/csv";
			parseType = "string";
		}
		if (getMime) {
			return mime;
		} else {
			return parseType;
		}
	}

	this.filterFileList = function(fileList) {
		for (var i = 0; i < this.include.length; i++) {
			var fToInclude = this.include[i].toLowerCase();
			var idxToRemove = [];
			for (var j = 0; j < fileList.length; j++) {
				var tFile = fileList[j].name.split("/")[fileList[j].name.split("/").length - 1].toLowerCase();
				if (fToInclude.trim() != tFile.trim()) {
					idxToRemove.push(j);
				}
			}
			for (j = idxToRemove.length - 1; j >= 0; j--) {
				fileList.splice(idxToRemove[j], 1);
			}
		}
		if (this.include.length == 0) {
			for (var i = 0; i < this.exclude.length; i++) {
				var fToExclude = this.exclude[i].toLowerCase();
				for (var j = 0; j < fileList.length; j++) {
					var tFile = fileList[j].name.split("/")[fileList[j].name.split("/").length - 1].toLowerCase();
					if (fToExclude.trim() == tFile.trim()) {
						fileList.splice(j, 1);
						break;
					}
				}
			}
		}
		return fileList;
	}

	this.runExperiment = function() {
		var results = $(this.container).find("#bb_widg_res_out");
		$(this.container).find("#bb_right_exp").empty();
		results.empty();
		results.append($("<img>").attr("src", "http://vps282167.ovh.net/BlueBridgeWPSClient/img/wait_progress.gif"));
		var c = $(this.container);
		var that = this;
		var values = [];
		var keys = [];
		for (var k in window.experiment[this.container]) {
			if (window.experiment[this.container][k] != undefined) {
				keys.push(k);
				values.push(window.experiment[this.container][k]);
			}
		}
		console.debug("sending for: " + this.container);
		console.debug(keys);
		console.debug(values);
		var req = ocpu.rpc("getOutput",{
				wps_uri : this.wps_uri, 
				username : this.wps_username, 
				token : this.wps_token,
				process_id : this.experiment_identifier,
				keys : keys,
				values : values,
				fail : function(session, value) { //This is using a mocked version of OpenCPU JS Library
					results.empty();
					if (value != undefined) {
						results.html(value);
					} else {
						results.html('Error running experiment from OpenCpu');
					}
				}
		}, function(data){
			results.empty();
			var out = [];
			for (var i = 0; i < data.length; i++) {
				out.push( $("<div>").attr('class', 'experimentOutHeader').html());
				for (var j = 0; j < data[i].length; j++) {
					if (that.ValidURL(data[i][j])) {
						if (that.expands) {
							var zip = new JSZip();
							JSZipUtils.getBinaryContent(data[i][j], function(err, dt) {
								if(err) {
									throw err; // or handle err
								}
								var urlCreator = window.URL || window.webkitURL;
								JSZip.loadAsync(dt).then(function(zip) {
									var fList = [];
									for (var zipEntry in zip.files) {
										fList.push(zip.file(zipEntry));
									}
									var fileList = [];
									var promises = fList.map(function(obj) {
										return new Promise(function(resolve, reject) {
											var zipEntry = obj;
											obj.async(that.getFileType(zipEntry)).then(function (data) {
												var o = {'data' : data, 'name' : zipEntry.name, 'uuid' : generateUUID()};
												o.mime = that.getFileType(zipEntry, true);
												if (zipEntry.name.endsWith(".pdf") || zipEntry.name.endsWith(".PDF")) {
													o.containerUuid = generateUUID();
												}
												fileList.push(o);
												resolve();
											});
										})
									});
									Promise.all(promises).then(function() {
										var ul = $("<ul>").attr("class", "nav nav-tabs");
										var tabContents = $("<div>").attr("class", "tab-content").attr("style", "height: 100vh; width: 100%;");
										var pdfDivList = [];
										var filteredFileList = that.filterFileList(fileList);
										for (var i = 0; i < filteredFileList.length; i++) {
											var f = filteredFileList[i];
											var li = $("<li>");
											var a = $("<a>").attr("data-toggle", "tab").attr("role", "tab").attr("href", "#" + f.uuid).html(f.name.split("/")[f.name.split("/").length - 1]);
											ul.append(li.append(a));

											var iDiv = $("<div>").attr("id", f.uuid).attr("class", "tab-pane fade bb-wid-tab-pane-extra");
											if (f.mime == "image/jpg" || f.mime == "image/png") {
												var blob = new Blob( [ f.data ], { type: f.mime } );
												var imageUrl = urlCreator.createObjectURL( blob );
												var image = $("<img>").attr("src", imageUrl);
												iDiv.append(image);
											}
											else if (f.mime == "application/pdf") {
												var pdfDiv = $("<div>").attr("id", f.containerUuid).attr("style", "height: 100vh; width: 100%;");
												iDiv.append(pdfDiv);
											}
											else if (f.mime == "text/html") {
												var blob = new Blob( [ f.data ], { type: f.mime } );
												var htmlUrl = urlCreator.createObjectURL( blob );
												var iFrame = $("<iframe>").attr("src", htmlUrl).attr("style", "height: 100vh; width: 100%;");
												iDiv.append(iFrame);
											}
											else if (f.mime == "text/plain") {
												iDiv.html(f.data);
											}
											else if (f.mime == "text/csv") {
												var csvData = Papa.parse(f.data);
												var table = $("<table>").attr("class", "bb_csv_tbl");
												for (var ii = 0; ii < csvData.data.length; ii++) {
													var tr = $("<tr>");
													for (var jj = 0; jj < csvData.data[ii].length; jj++) {
														var tdClass = "bb_wid_td_row";
														if (ii == 0) {
															tdClass = "bb_wid_td_row_header";
														}
														var td = $("<td>").attr("class", tdClass).html(csvData.data[ii][jj]);
														tr.append(td);
													}
													table.append(tr);
												}
												iDiv.append(table);
											}
											tabContents.append(iDiv);
										}
										$(that.container).find("#bb_right_exp").append(ul).append(tabContents);
										//Appending PDFs
										setTimeout(function() {
											for (var i = 0; i < fileList.length; i++) {
												var f = fileList[i];
												if (f.mime == "application/pdf") {
													var pdfObject = f;
													var blob = new Blob( [ f.data ], { type: "application/pdf" } );
													var pdfUrl = urlCreator.createObjectURL( blob );
													var a = $("<a>").attr("href", pdfUrl).attr("download", pdfObject.name).attr("style", "margin-left: 20px; line-height: 4;").html("Download PDF File");
													$("#" + pdfObject.containerUuid).append(a);
													if(PDFObject.supportsPDFs){
														PDFObject.embed(pdfUrl, "#" + pdfObject.containerUuid);
													}
												}
											}
										}, 1000);
										
									});
								});
							});
						}
						var anchor = $('<a>').attr('href', data[i][j]).attr('target', '_blank').html("Download Computed Results");
						out.push($("<div>").append(anchor));
					} 
				}
			}
			for (var i = 0; i < out.length; i++) {
				results.append(out[i]);
			}
		});
	};

	this.ValidURL = function (str) {
		if (str.startsWith('http')) {
			var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
			return regexp.test(str);
		}
		return false;
	};

}