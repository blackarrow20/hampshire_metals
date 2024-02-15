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
                        output_fields["pdf"] = "pdfBytes"
			output_fields["image"] = "imageBytes"
				
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