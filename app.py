 #!/usr/bin/python
 # -*- coding: utf-8 -*-

from flask import Flask, render_template, url_for, request
from PyPDF2 import PdfReader, PdfWriter
from calendar import monthrange
import logging
import json
import io
import requests
import datetime
import pytz
import pypdfium2
import traceback

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

if __name__ != '__main__':
	gunicorn_logger = logging.getLogger('gunicorn.error')
	app.logger.handlers = gunicorn_logger.handlers
	app.logger.setLevel(gunicorn_logger.level)

@app.route("/")
def index():
	return render_template('index.html')

@app.route("/request_all", methods=['POST', 'GET'])
def handleRequestAll():
	try:
		if request.method == "POST":
			data = request.get_json()
			
			# Fill pdf, and fill output with pdf bytes
			reader = PdfReader("PURCHASE_INVOICE_EMAIL_TEMPLATE.pdf")
			writer = PdfWriter()
			page = reader.pages[0]
			fields = reader.get_fields().keys()
			writer.add_page(page)

			field_values = [""] * 13
			field_values[0] = "0 " + data["reference"]
			field_values[1] = "1 " + data["first_name"]
			field_values[2] = "2 " + data["house_number_street_name"]
			field_values[3] = "3 " + data["email"]
			field_values[4] = "4 " + data["phone_number"]
			field_values[5] = "5 " + data["post_code"]
			field_values[6] = "6 " + data["last_name"]
			field_values[7] = "7 " + data["date"]
			field_values[8] = "8 " + data["account_number"]
			field_values[9] = "9 " + data["account_name"]
			field_values[10] = "10 " + data["bank_name"]
			field_values[11] = "11 " + data["sort_code"]
			field_values[12] = "12 " + data["scrap_msg"]			

			output_fields = {				
				"pdf": "",
				"image": ""
			}
			
			num = 0
			for field in fields:	
				writer.update_page_form_field_values(
					writer.pages[0], {field: field_values[num]}
				)
				num = num + 1

			bytes_to_send = io.BytesIO()
			writer.write(bytes_to_send)
			bytes_to_send.seek(0)			
			output_fields["pdf"] = list(bytes_to_send.read())
			
			bytes_to_send.seek(0)
			pdf = pypdfium2.PdfDocument(bytes_to_send)
			page = pdf.get_page(0)
			pil_image = page.render_topil(scale=3)
			img_byte_arr = io.BytesIO()
			pil_image.save(img_byte_arr, format='JPEG', quality=100, subsampling=0)
			img_byte_arr.seek(0)	
			page.close()
			output_fields["image"] = list(img_byte_arr.read())			
			
			output = {
				"error_msg": "",
				"success_msg": "OK",
				"data": output_fields
			}
			return json.dumps(output)                        
			
	except Exception as e:
		output = {
			"error_msg": "Python exception happened: " + traceback.format_exc(),
			"success_msg": ""
		}
		return json.dumps(output)
	output = {
		"error_msg": "Wrong request method!",
		"success_msg": ""
	}
	return json.dumps(output)
	
if __name__ == "__main__":
	app.run(debug=True)