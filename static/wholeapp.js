var current_version = "1";

var new_ams_template = {
	"ams_template_name": "Naziv šablona",
	"ams_num_of_page": "1",
	"ams_num_of_pages": "1",
	"ams_name_and_surname": "",
	"ams_address": "",
	"ams_jmbg": "",
	"ams_payer_name": "",
	"ams_payer_address": "",
	"ams_payer_country": ""
};

var new_slip_template = {
	"slip_template_name": "Naziv šablona",
	"slip_name_address_phone": "",
	"slip_jmbg": "",
	"slip_canton": "ZDK",
	"slip_payment_place": "",
	"slip_user_account_num": "",
	"slip_fbih_health_account_num": "",
	"slip_canton_health_account_num": "",
	"slip_canton_budget_account_num": "",
	"slip_municipality": ""
};

var new_default_ams_template = {
	"new": "1",
	"fields": new_ams_template
};

var new_default_slip_template = {
	"new": "1",
	"fields": new_slip_template
};

function save(filename, data) {
    const blob = new Blob([data], {type: 'application/octetstream'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}

function getAllCurrentData(button_id) {
	var data_to_send = {
		"button_id": button_id,
		"currency": $("#currency").val(),
		"rate": $("#rate").val(),
		"total_foreign": $("#total_foreign").val(),
		"foreign_tax": $("#foreign_tax").val(),
		"transaction_date": $("#transaction_date").val(),
		"tax_period": $("#tax_period").val(),
		"expenses": $("#expenses").val(),
		"ams_num_of_page": $("#ams_num_of_page").val(),
		"ams_num_of_pages": $("#ams_num_of_pages").val(),
		"ams_name_and_surname": $("#ams_name_and_surname").val(),
		"ams_address": $("#ams_address").val(),
		"ams_jmbg": $("#ams_jmbg").val(),
		"ams_payer_name": $("#ams_payer_name").val(),
		"ams_payer_address": $("#ams_payer_address").val(),
		"ams_payer_country": $("#ams_payer_country").val(),
		"slip_transaction_date": $("#slip_transaction_date").val(),
		"slip_name_address_phone": $("#slip_name_address_phone").val(),
		"slip_jmbg": $("#slip_jmbg").val(),
		"slip_canton": $("#slip_canton").val(),
		"slip_payment_place": $("#slip_payment_place").val(),
		"slip_user_account_num": $("#slip_user_account_num").val(),
		"slip_fbih_health_account_num": $("#slip_fbih_health_account_num").val(),
		"slip_canton_health_account_num": $("#slip_canton_health_account_num").val(),
		"slip_canton_budget_account_num": $("#slip_canton_budget_account_num").val(),
		"slip_municipality": $("#slip_municipality").val()
	};
	return data_to_send;
}

function emptyDetailedInfo() {
	$("#generation_datetime").html("/");
	$("#health_fbih").html("/");
	$("#health_canton").html("/");
	$("#total_tax").html("/");
	
        $("#total_BAM").html("/");
	$("#total_costs").html("/");
	$("#earned").html("/");
	
	$("#ams_download_link").html("");
	$("#ams_download_link_image").html("");
	$("#slip_fbih_health_download_link").html("");
	$("#slip_fbih_health_download_link_image").html("");
	$("#slip_canton_health_download_link").html("");
	$("#slip_canton_health_download_link_image").html("");
	$("#slip_canton_budget_download_link").html("");
	$("#slip_canton_budget_download_link_image").html("");
}

function createDownloadLink(variable_name, text, file_name, target_id, raw_data) {
	window[variable_name] = new Uint8Array(raw_data);
	var download_btn_html = '<input type="button" class="download_btn" ';
	download_btn_html += 'value="' + text + '" onclick="save(\'' + file_name + '\', ' + variable_name + ');">';
	$("#"+target_id).html(download_btn_html);
}

function fillDetailedInfoAMSOnly(data) {
	$("#generation_datetime").html("<b>"+data["generation_datetime"]+"</b>");
	$("#health_fbih").html("<b>"+data["health_fbih"]+"</b>");
	$("#health_canton").html("<b>"+data["health_canton"]+"</b>");
	$("#total_tax").html("<b>"+data["total_tax"]+"</b>");
	
        $("#total_BAM").html("<b>"+data["total_BAM"]+"</b>");
	$("#total_costs").html("<b>"+data["total_costs"]+"</b>");
	$("#earned").html("<b>"+data["earned"]+"</b>");
	
	createDownloadLink("ams_pdf_data", "Download PDF", "AMS - 1035 obrazac.pdf", "ams_download_link", data["ams_pdf"]);
	createDownloadLink("ams_image_data", "Download JPEG", "AMS - 1035 obrazac.jpg", "ams_download_link_image", data["ams_image"]);
}

function fillDetailedInfoAll(data) {
	$("#generation_datetime").html("<b>"+data["generation_datetime"]+"</b>");
	$("#health_fbih").html("<b>"+data["health_fbih"]+"</b>");
	$("#health_canton").html("<b>"+data["health_canton"]+"</b>");
	$("#total_tax").html("<b>"+data["total_tax"]+"</b>");
	
        $("#total_BAM").html("<b>"+data["total_BAM"]+"</b>");
	$("#total_costs").html("<b>"+data["total_costs"]+"</b>");
	$("#earned").html("<b>"+data["earned"]+"</b>");
	
	createDownloadLink("ams_pdf_data", "Download PDF", "AMS - 1035 obrazac.pdf", "ams_download_link", data["ams_pdf"]);
	createDownloadLink("ams_image_data", "Download JPEG", "AMS - 1035 obrazac.jpg", "ams_download_link_image", data["ams_image"]);
	createDownloadLink("slip_fbih_health_pdf_data", "Download PDF", "Uplatnica - zdravstveni zavod FBiH.pdf", "slip_fbih_health_download_link", data["slip_fbih_health_pdf"]);
	createDownloadLink("slip_fbih_health_image_data", "Download JPEG", "Uplatnica - zdravstveni zavod FBiH.jpg", "slip_fbih_health_download_link_image", data["slip_fbih_health_image"]);
	createDownloadLink("slip_canton_health_pdf_data", "Download PDF", "Uplatnica - zdravstveni zavod kantona.pdf", "slip_canton_health_download_link", data["slip_canton_health_pdf"]);
	createDownloadLink("slip_canton_health_image_data", "Download JPEG", "Uplatnica - zdravstveni zavod kantona.jpg", "slip_canton_health_download_link_image", data["slip_canton_health_image"]);
	createDownloadLink("slip_canton_budget_pdf_data", "Download PDF", "Uplatnica - budžet kantona.pdf", "slip_canton_budget_download_link", data["slip_canton_budget_pdf"]);
	createDownloadLink("slip_canton_budget_image_data", "Download JPEG", "Uplatnica - budžet kantona.jpg", "slip_canton_budget_download_link_image", data["slip_canton_budget_image"]);
}

function requestAll(btn_element) {
	$(btn_element).prop('disabled', true);
	var button_id = btn_element.id;
	var data_to_send = getAllCurrentData(button_id);	
	emptyDetailedInfo();
	jQuery.ajax({
		type: "POST",
		url: "/request_all",
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify(data_to_send),
		timeout: 0,
		success: function (response) {
			if (!response.hasOwnProperty("error_msg") || !response.hasOwnProperty("success_msg")) {
				alert("Unrecognised ajax response. Please check console output for details.");
				console.log("Unrecognised ajax response");
				console.log(response);
				$(btn_element).prop('disabled', false);
				return;
			}
			if (response["error_msg"].length > 0) {
				alert("Error message detected in response from ajax request. "+response["error_msg"]);
				console.log("Error message detected in response from ajax request.");
				console.log(response);
				$(btn_element).prop('disabled', false);
				return;
			} else if (response["success_msg"].length > 0) {
				if (button_id == "generate_ams") {
					fillDetailedInfoAMSOnly(response["data"]);
				} else if (button_id == "generate_all") {
					fillDetailedInfoAll(response["data"]);
				}
				$(btn_element).prop('disabled', false);
				jumpTo('detailed_info');							
				return;
			} else {
				alert("Unrecognised ajax response. Please check console output for details.");
				console.log("Unrecognised ajax response");
				console.log(response);
				$(btn_element).prop('disabled', false);
				return;
			}
		},
		error: function (response) {
			alert("Ajax error. Please check console output for details.");
			console.log("Ajax error");
			console.log(response);
			$(btn_element).prop('disabled', false);
		}
    });
}

function isNumeric(str) {
	if (typeof str != "string") return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function checkForFloat(element, fieldname, defaultValue) {
	if (!isNumeric(element.value)) {
		alert("Pogrešan unos polja \"" + fieldname + "\". Molimo unesite realan broj.");
		element.value = defaultValue;
		return false;
	}
	return true;
}

function setXeLink() {
	var currency = $("#currency").val();
	var xe_link = "https://www.xe.com/currencycharts/?from="+currency+"&to=BAM";
	$("#xe_link").attr("href", xe_link);
	$("#xe_link").html(xe_link);	
}

function getFormattedDate(date) {
	var year = date.getFullYear();
	var month = (1 + date.getMonth()).toString();
	month = month.length > 1 ? month : '0' + month;
	var day = date.getDate().toString();
	day = day.length > 1 ? day : '0' + day;  
	return day + '.' + month + '.' + year;
}

function getFormattedDateNoDay(date) {
	var year = date.getFullYear();
	var month = (1 + date.getMonth()).toString();
	month = month.length > 1 ? month : '0' + month; 
	return month + '.' + year;
}

function isValidDateString(dateStr) {
	const regex = /^\d{2}\.\d{2}\.\d{4}$/;
	if (dateStr.match(regex) === null) {
		return false;
	}
	const [day, month, year] = dateStr.split('.');
	// Format Date string as `yyyy-mm-dd`
	const isoFormattedStr = `${year}-${month}-${day}`;
	const date = new Date(isoFormattedStr);
	const timestamp = date.getTime();
	if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
		return false;
	}
	return date.toISOString().startsWith(isoFormattedStr);
}

function checkForTransactionDate(element, fieldname) {
	var date_string = element.value;
	if (!isValidDateString(date_string)) {
		alert("Pogrešan unos polja \"" + fieldname + "\". Molimo unesite validan datum u odgovarajućem formatu.");
		var date = new Date();
		element.value = getFormattedDate(date);
		return false;
	}
	return true;
}

function checkForDateTaxPeriod(element, fieldname) {
	var date_string = "01."+element.value;
	if (!isValidDateString(date_string)) {
		alert("Pogrešan unos polja \"" + fieldname + "\". Molimo unesite validan datum u odgovarajućem formatu.");
		var date = new Date();
		element.value = getFormattedDateNoDay(date);
		return false;
	}
	return true;
}

function transformToAllowedLetters(str) {
	var new_str = "";
	for (var i = 0; i < str.length; i++) {
		var ch = str[i];
		if (
			(ch>='a' && ch<='z') ||
			(ch>='A' && ch<='Z') ||
			(ch>='0' && ch<='9') ||
			(ch == '_' || ch == '-' || ch == '\'' || ch == '"' || ch == ' ') ||
			ch == 'Š' || ch == 'š' || 
			ch == 'Č' || ch == 'č' || 
			ch == 'Ć' || ch == 'ć' || 
			ch == 'Ž' || ch == 'ž' ||
			ch == 'Đ' || ch == 'đ'
		) {
			new_str += ch;
		} else {
			new_str += '_';
		}
	}
	return new_str;
}

function checkForTemplateName(element, fieldname, defaultValue) {
	var templateName = element.value;
	if (templateName.length==0) {
		alert("Pogrešan unos polja \"" + fieldname + "\". Polje ne smije ostati prazno.");
		element.value = defaultValue;
		return false;
	}
	var new_str = transformToAllowedLetters(templateName);
	if (new_str != templateName) {
		alert("Polje \"" + fieldname + "\" je sadržavalo nedozvoljene znakove, zamijenjeni su znakom '_'.");
		element.value = new_str;
		return false;
	}
	return true;
}

// Template must exist, if it does not exist it will fill fields as if we chose "Novi šablon"
function selectAndFillAmsTemplate(ams_templates_keys, fields, is_new_template) {
	var templateIndex = is_new_template ? -1 : ams_templates_keys.indexOf(fields["ams_template_name"]);
	$("#ams_template").val(templateIndex);
	$("#ams_template_name").val(fields["ams_template_name"]);
	$("#ams_num_of_page").val(fields["ams_num_of_page"]);
	$("#ams_num_of_pages").val(fields["ams_num_of_pages"]);
	$("#ams_name_and_surname").val(fields["ams_name_and_surname"]);
	$("#ams_address").val(fields["ams_address"]);
	$("#ams_jmbg").val(fields["ams_jmbg"]);
	$("#ams_payer_name").val(fields["ams_payer_name"]);
	$("#ams_payer_address").val(fields["ams_payer_address"]);
	$("#ams_payer_country").val(fields["ams_payer_country"]);
}

// Template must exist, if it does not exist it will fill fields as if we chose "Novi šablon"
function selectAndFillSlipTemplate(slip_templates_keys, fields, is_new_template) {
	var templateIndex = is_new_template ? -1 : slip_templates_keys.indexOf(fields["slip_template_name"]);
	$("#slip_template").val(templateIndex);
	$("#slip_template_name").val(fields["slip_template_name"]);
	$("#slip_name_address_phone").val(fields["slip_name_address_phone"]);
	$("#slip_jmbg").val(fields["slip_jmbg"]);
	$("#slip_canton").val(fields["slip_canton"]);
	$("#slip_payment_place").val(fields["slip_payment_place"]);
	$("#slip_user_account_num").val(fields["slip_user_account_num"]);
	$("#slip_fbih_health_account_num").val(fields["slip_fbih_health_account_num"]);
	$("#slip_canton_health_account_num").val(fields["slip_canton_health_account_num"]);
	$("#slip_canton_budget_account_num").val(fields["slip_canton_budget_account_num"]);
	$("#slip_municipality").val(fields["slip_municipality"]);
}

function fillAmsUserTemplatesOptions(ams_templates_keys) {
	var new_user_templates = "";
	for (var i = 0; i < ams_templates_keys.length; i++) {
		new_user_templates += "<option value=\""+i.toString()+"\">"+ams_templates_keys[i]+"</option>\n";
	}
	$("#ams_user_templates").html(new_user_templates);
}

function fillSlipUserTemplatesOptions(slip_templates_keys) {
	var new_user_templates = "";
	for (var i = 0; i < slip_templates_keys.length; i++) {
		new_user_templates += "<option value=\""+i.toString()+"\">"+slip_templates_keys[i]+"</option>\n";
	}
	$("#slip_user_templates").html(new_user_templates);
}

function clearStorageForDifferentVersion() {
	var version = JSON.parse(localStorage.getItem("version"));
	if (version == null || version != current_version) {
		localStorage.clear();
		localStorage.setItem("version", current_version);		
	}
}

function getAmsTemplates() {
	var ams_templates = JSON.parse(localStorage.getItem("ams_templates"));
	if (ams_templates == null) {
		ams_templates = {};
	}
	return ams_templates;
}

function getSlipTemplates() {
	var slip_templates = JSON.parse(localStorage.getItem("slip_templates"));
	if (slip_templates == null) {
		slip_templates = {};
	}
	return slip_templates;
}

function getValidDefaultAmsTemplate(ams_templates_keys) {
	var default_ams_template = JSON.parse(localStorage.getItem("default_ams_template"));	
	if (default_ams_template == null || !(
			default_ams_template["new"] == "1" || 
			(default_ams_template["new"] == "0" && ams_templates_keys.includes(default_ams_template["fields"]["ams_template_name"]))
	)) {
		default_ams_template = new_default_ams_template;
		localStorage.setItem("default_ams_template", JSON.stringify(new_default_ams_template));		
	}
	return default_ams_template;
}

function getValidDefaultSlipTemplate(slip_templates_keys) {
	var default_slip_template = JSON.parse(localStorage.getItem("default_slip_template"));	
	if (default_slip_template == null || !(
			default_slip_template["new"] == "1" || 
			(default_slip_template["new"] == "0" && slip_templates_keys.includes(default_slip_template["fields"]["slip_template_name"]))
	)) {
		default_slip_template = new_default_slip_template;
		localStorage.setItem("default_slip_template", JSON.stringify(new_default_slip_template));		
	}
	return default_slip_template;
}

function onloadFunction() {
	var date = new Date();
	$("#transaction_date").val(getFormattedDate(date));
	$("#tax_period").val(getFormattedDateNoDay(date));
	$("#slip_transaction_date").val(getFormattedDate(date));
	
	clearStorageForDifferentVersion();
	
	var ams_templates = getAmsTemplates();
	var ams_templates_keys = Object.keys(ams_templates).sort(); // Could be empty array
	fillAmsUserTemplatesOptions(ams_templates_keys);
	
	var default_ams_template = getValidDefaultAmsTemplate(ams_templates_keys);
	var is_new_ams_template = default_ams_template["new"] == "1" ? true : false;
	selectAndFillAmsTemplate(ams_templates_keys, default_ams_template["fields"], is_new_ams_template);
	
	var slip_templates = getSlipTemplates();
	var slip_templates_keys = Object.keys(slip_templates).sort(); // Could be empty array
	fillSlipUserTemplatesOptions(slip_templates_keys);
	
	var default_slip_template = getValidDefaultSlipTemplate(slip_templates_keys);
	var is_new_slip_template = default_slip_template["new"] == "1" ? true : false;
	selectAndFillSlipTemplate(slip_templates_keys, default_slip_template["fields"], is_new_slip_template);
}

function getCurrentAmsTemplateFields() {
	fields = {};
	fields["ams_template_name"] = $("#ams_template_name").val();
	fields["ams_num_of_page"] = $("#ams_num_of_page").val();
	fields["ams_num_of_pages"] = $("#ams_num_of_pages").val();
	fields["ams_name_and_surname"] = $("#ams_name_and_surname").val();
	fields["ams_address"] = $("#ams_address").val();
	fields["ams_jmbg"] = $("#ams_jmbg").val();
	fields["ams_payer_name"] = $("#ams_payer_name").val();
	fields["ams_payer_address"] = $("#ams_payer_address").val();
	fields["ams_payer_country"] = $("#ams_payer_country").val();
	return fields;
}

function getCurrentSlipTemplateFields() {
	fields = {};
	fields["slip_template_name"] = $("#slip_template_name").val();
	fields["slip_name_address_phone"] = $("#slip_name_address_phone").val();
	fields["slip_jmbg"] = $("#slip_jmbg").val();
	fields["slip_canton"] = $("#slip_canton").val();
	fields["slip_payment_place"] = $("#slip_payment_place").val();
	fields["slip_user_account_num"] = $("#slip_user_account_num").val();
	fields["slip_fbih_health_account_num"] = $("#slip_fbih_health_account_num").val();
	fields["slip_canton_health_account_num"] = $("#slip_canton_health_account_num").val();
	fields["slip_canton_budget_account_num"] = $("#slip_canton_budget_account_num").val();
	fields["slip_municipality"] = $("#slip_municipality").val();
	return fields;
}

function saveAmsTemplate() {
	var ams_templates = getAmsTemplates();
	var ams_templates_keys = Object.keys(ams_templates).sort(); // Could be empty array
	var current_template_fields = getCurrentAmsTemplateFields();
	var current_template_name = current_template_fields["ams_template_name"];
	var new_ams_templates = {};
	// Remove current_template_name from ams_templates if it exists
	for (var i=0; i<ams_templates_keys.length; i++) {
		if (ams_templates_keys[i] != current_template_name) {
			new_ams_templates[ams_templates_keys[i]] = ams_templates[ams_templates_keys[i]];
		}
	}
	ams_templates = new_ams_templates;	
	// It is removed now
	ams_templates[current_template_name] = current_template_fields;
	ams_templates_keys = Object.keys(ams_templates).sort();
	localStorage.setItem("ams_templates", JSON.stringify(ams_templates));
	fillAmsUserTemplatesOptions(ams_templates_keys);
	var templateIndex = ams_templates_keys.indexOf(current_template_name);
	$("#ams_template").val(templateIndex);
	default_ams_template = {
		"new": "0",
		"fields": current_template_fields
	};
	localStorage.setItem("default_ams_template", JSON.stringify(default_ams_template));
}

function saveSlipTemplate() {
	var slip_templates = getSlipTemplates();
	var slip_templates_keys = Object.keys(slip_templates).sort(); // Could be empty array
	var current_template_fields = getCurrentSlipTemplateFields();
	var current_template_name = current_template_fields["slip_template_name"];
	var new_slip_templates = {};
	// Remove current_template_name from slip_templates if it exists
	for (var i=0; i<slip_templates_keys.length; i++) {
		if (slip_templates_keys[i] != current_template_name) {
			new_slip_templates[slip_templates_keys[i]] = slip_templates[slip_templates_keys[i]];
		}
	}
	slip_templates = new_slip_templates;	
	// It is removed now
	slip_templates[current_template_name] = current_template_fields;
	slip_templates_keys = Object.keys(slip_templates).sort();
	localStorage.setItem("slip_templates", JSON.stringify(slip_templates));
	fillSlipUserTemplatesOptions(slip_templates_keys);
	var templateIndex = slip_templates_keys.indexOf(current_template_name);
	$("#slip_template").val(templateIndex);
	default_slip_template = {
		"new": "0",
		"fields": current_template_fields
	};
	localStorage.setItem("default_slip_template", JSON.stringify(default_slip_template));
}

function removeAmsTemplate() {
	var ams_templates = getAmsTemplates();
	var ams_templates_keys = Object.keys(ams_templates).sort(); // Could be empty array
	var current_template_fields = getCurrentAmsTemplateFields();
	var current_template_name = current_template_fields["ams_template_name"];
	var new_ams_templates = {};
	// Remove current_template_name from ams_templates if it exists
	for (var i=0; i<ams_templates_keys.length; i++) {
		if (ams_templates_keys[i] != current_template_name) {
			new_ams_templates[ams_templates_keys[i]] = ams_templates[ams_templates_keys[i]];
		}
	}
	ams_templates = new_ams_templates;
	ams_templates_keys = Object.keys(ams_templates).sort();
	localStorage.setItem("ams_templates", JSON.stringify(ams_templates));
	fillAmsUserTemplatesOptions(ams_templates_keys);
	default_ams_template = new_default_ams_template;
	localStorage.setItem("default_ams_template", JSON.stringify(new_default_ams_template));
	selectAndFillAmsTemplate(ams_templates_keys, default_ams_template["fields"], true);
}

function removeSlipTemplate() {
	var slip_templates = getSlipTemplates();
	var slip_templates_keys = Object.keys(slip_templates).sort(); // Could be empty array
	var current_template_fields = getCurrentSlipTemplateFields();
	var current_template_name = current_template_fields["slip_template_name"];
	var new_slip_templates = {};
	// Remove current_template_name from slip_templates if it exists
	for (var i=0; i<slip_templates_keys.length; i++) {
		if (slip_templates_keys[i] != current_template_name) {
			new_slip_templates[slip_templates_keys[i]] = slip_templates[slip_templates_keys[i]];
		}
	}
	slip_templates = new_slip_templates;
	slip_templates_keys = Object.keys(slip_templates).sort();
	localStorage.setItem("slip_templates", JSON.stringify(slip_templates));
	fillSlipUserTemplatesOptions(slip_templates_keys);
	default_slip_template = new_default_slip_template;
	localStorage.setItem("default_slip_template", JSON.stringify(new_default_slip_template));
	selectAndFillSlipTemplate(slip_templates_keys, default_slip_template["fields"], true);
}

function selectAmsTemplate(element) {
	var selectedAmsTemplateIndex = element.value;
	var selectedAmsTemplateName = $(element).find("option:selected").html();
	var ams_templates = getAmsTemplates();
	var ams_templates_keys = Object.keys(ams_templates).sort(); // Could be empty array
	fillAmsUserTemplatesOptions(ams_templates_keys);
	if (selectedAmsTemplateIndex == "-1") {
		default_ams_template = new_default_ams_template;
		localStorage.setItem("default_ams_template", JSON.stringify(new_default_ams_template));
		selectAndFillAmsTemplate(ams_templates_keys, default_ams_template["fields"], true);
	} else {
		if (ams_templates_keys.includes(selectedAmsTemplateName)) {
			default_ams_template = {
				"new": "0",
				"fields": ams_templates[selectedAmsTemplateName]
			};
			localStorage.setItem("default_ams_template", JSON.stringify(default_ams_template));
			selectAndFillAmsTemplate(ams_templates_keys, default_ams_template["fields"], false);
		} else {
			default_ams_template = new_default_ams_template;
			localStorage.setItem("default_ams_template", JSON.stringify(new_default_ams_template));
			selectAndFillAmsTemplate(ams_templates_keys, default_ams_template["fields"], true);
			alert("Odabrani šablon nije pronađen, mora da ste ga obrisali u drugom prozoru. " +
				"Lista šablona je unaprijeđena, slobodno nastavite koristiti aplikaciju.");
		}
	}
}

function selectSlipTemplate(element) {
	var selectedSlipTemplateIndex = element.value;
	var selectedSlipTemplateName = $(element).find("option:selected").html();
	var slip_templates = getSlipTemplates();
	var slip_templates_keys = Object.keys(slip_templates).sort(); // Could be empty array
	fillSlipUserTemplatesOptions(slip_templates_keys);
	if (selectedSlipTemplateIndex == "-1") {
		default_slip_template = new_default_slip_template;
		localStorage.setItem("default_slip_template", JSON.stringify(new_default_slip_template));
		selectAndFillSlipTemplate(slip_templates_keys, default_slip_template["fields"], true);
	} else {
		if (slip_templates_keys.includes(selectedSlipTemplateName)) {
			default_slip_template = {
				"new": "0",
				"fields": slip_templates[selectedSlipTemplateName]
			};
			localStorage.setItem("default_slip_template", JSON.stringify(default_slip_template));
			selectAndFillSlipTemplate(slip_templates_keys, default_slip_template["fields"], false);
		} else {
			default_slip_template = new_default_slip_template;
			localStorage.setItem("default_slip_template", JSON.stringify(new_default_slip_template));
			selectAndFillSlipTemplate(slip_templates_keys, default_slip_template["fields"], true);
			alert("Odabrani šablon nije pronađen, mora da ste ga obrisali u drugom prozoru. " +
				"Lista šablona je unaprijeđena, slobodno nastavite koristiti aplikaciju.");
		}
	}
}

function jumpTo(anchor_id){
	$('html, body').animate({
        scrollTop: $("#"+anchor_id).offset().top
    }, 500);
}

function exportTemplates() {
    var rows_keys = new Array();
    var rows_vals = new Array();
    var i = 0;
    for (var k in localStorage) {
       rows_vals[i] = localStorage.getItem(k);
       rows_keys[i] = k;
       i++;
    }
    var txtContent = JSON.stringify(new Array(rows_vals, rows_keys));
    save("freelancerforms.onrender.šabloni.txt", txtContent);
}

function importTemplates(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = readerEvent => {
        var txtContent = readerEvent.target.result;
        var parsedArray = JSON.parse(txtContent);
        var rows_vals = parsedArray[0];
        var rows_keys = parsedArray[1];
        for (var i in rows_keys) {
            localStorage.setItem(rows_keys[i], rows_vals[i]);
        }
        window.location.reload();        
    }     
}