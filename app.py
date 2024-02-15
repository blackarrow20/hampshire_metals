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
			
			button_id = data["button_id"]
			if (button_id != "generate_ams" and button_id != "generate_all"):
				raise Exception("Unknown button_id")				
			currency = data["currency"]
			rate = data["rate"]
			total_foreign = data["total_foreign"]
			foreign_tax = data["foreign_tax"]
			transaction_date = data["transaction_date"]
			tax_period = data["tax_period"]
			expenses = data["expenses"]
			ams_num_of_page = data["ams_num_of_page"]
			ams_num_of_pages = data["ams_num_of_pages"]
			ams_name_and_surname = data["ams_name_and_surname"]
			ams_address = data["ams_address"]
			ams_jmbg = data["ams_jmbg"]
			ams_payer_name = data["ams_payer_name"]
			ams_payer_address = data["ams_payer_address"]
			ams_payer_country = data["ams_payer_country"]
			slip_transaction_date = data["slip_transaction_date"]
			slip_name_address_phone = data["slip_name_address_phone"]
			slip_jmbg = data["slip_jmbg"]
			slip_canton = data["slip_canton"]
			slip_payment_place = data["slip_payment_place"]
			slip_user_account_num = data["slip_user_account_num"]
			slip_fbih_health_account_num = data["slip_fbih_health_account_num"]
			slip_canton_health_account_num = data["slip_canton_health_account_num"]
			slip_canton_budget_account_num = data["slip_canton_budget_account_num"]
			slip_municipality = data["slip_municipality"]
			
			# Now transform some of the fields, and define new variables that we will need
			rate = float(rate)
			total_foreign = float(total_foreign)
			foreign_tax = float(foreign_tax)
			expenses = float(expenses)
			
			transaction_date = datetime.datetime.strptime(transaction_date, '%d.%m.%Y')
			transaction_day = str(transaction_date.day).zfill(2)
			transaction_month = str(transaction_date.month).zfill(2)
			transaction_year = str(transaction_date.year % 100).zfill(2)

			tax_period = datetime.datetime.strptime("01." + tax_period, '%d.%m.%Y')
			tax_period_start_day = str(tax_period.day).zfill(2)
			tax_period_end_day = str(monthrange(tax_period.year, tax_period.month)[1]).zfill(2)
			tax_period_month = str(tax_period.month).zfill(2)
			tax_period_year = str(tax_period.year % 100).zfill(2)
			
			slip_transaction_date = datetime.datetime.strptime(slip_transaction_date, '%d.%m.%Y')
			slip_transaction_day = str(slip_transaction_date.day).zfill(2)
			slip_transaction_month = str(slip_transaction_date.month).zfill(2)
			slip_transaction_year = str(slip_transaction_date.year % 100).zfill(2)
			
			# Now we do calculations
			total_BAM = total_foreign * rate
			total_BAM_minus_percent = total_BAM * (1 - expenses)
			total_health = total_BAM_minus_percent * 0.04
			health_fbih = total_health * 0.1020
			health_canton = total_health - health_fbih
			ground_for_tax = total_BAM_minus_percent - total_health
			tax = ground_for_tax * 0.1
			foreign_tax_BAM = foreign_tax * rate
			if (foreign_tax_BAM >= tax):
				total_tax = 0
			else:
				total_tax = tax - foreign_tax_BAM
			total_costs = total_tax + total_health
			earned = total_BAM - total_costs
			
			zone_sa = pytz.timezone('Europe/Sarajevo')
			now = datetime.datetime.now(zone_sa)
			generation_datetime = now.strftime("%d.%m.%Y %H:%M:%S")
			
			output_fields = {
				"generation_datetime": generation_datetime,
				"health_fbih": "%(health_fbih).2f KM" % {
					'health_fbih': health_fbih
				},
				"health_canton": "%(health_canton).2f KM" % {
					'health_canton': health_canton
				},
				"total_tax": "%(total_tax).2f KM" % {
					'total_tax': total_tax
				},
				
				"total_BAM": "%(total_BAM).2f KM" % {
					'total_BAM': total_BAM
				},
				"total_costs": "%(total_costs).2f KM" % {
					'total_costs': total_costs
				},
				"earned": "%(earned).2f KM" % {
					'earned': earned
				},
				
				"ams_pdf": "",
				"ams_image": "",
				"slip_fbih_health_pdf": "",
				"slip_fbih_health_image": "",
				"slip_canton_health_pdf": "",
				"slip_canton_health_image": "",
				"slip_canton_budget_pdf": "",
				"slip_canton_budget_image": ""
			}
			
			# Fill ams pdf, and fill output with its data
			reader = PdfReader("AMS prazan.pdf")
			writer = PdfWriter()
			page = reader.pages[0]
			fields = reader.get_fields().keys()
			writer.add_page(page)

			field_values = [""] * 49
			field_values[0] = ams_num_of_page # Redni broj stranice
			field_values[1] = ams_num_of_pages # Ukupno stranica
			field_values[2] = ams_name_and_surname # Ime i prezime
			field_values[3] = ams_jmbg # JMBG
			field_values[4] = ams_address # Adresa
			field_values[5] = transaction_day # Dan iz datuma transakcije
			field_values[6] = transaction_month # Mjesec iz datuma transakcije
			field_values[7] = transaction_year # Godina iz datuma transakcije
			field_values[8] = tax_period_month # Za period | Mjesec
			field_values[9] = tax_period_year # Za period | Godina
			field_values[10] = ams_payer_name # Naziv firme
			field_values[11] = ams_payer_address # Adresa firme
			field_values[12] = ams_payer_country # Država firme
			field_values[13] = "%(total_foreign).2f %(currency)s -%(expenses).0f%% => %(total_BAM_minus_percent).2f BAM" % {
				'total_foreign': total_foreign, 
				'currency': currency,
				'expenses': expenses * 100,
				'total_BAM_minus_percent': total_BAM_minus_percent
			} # Iznos dohotka
			field_values[14] = "%(total_health).2f KM" % {
				'total_health': total_health
			} # Zdravstveno osiguranje na teret osiguranika
			field_values[15] = "%(ground_for_tax).2f KM" % {
				'ground_for_tax': ground_for_tax
			} # Osnovica za porez
			field_values[16] = "%(tax).2f KM" % {
				'tax': tax
			} # Iznos poreza
			field_values[17] = "%(foreign_tax_BAM).2f KM" % {
				'foreign_tax_BAM': foreign_tax_BAM
			} # Iznos poreznog kredita plaćen u inostranstvu
			field_values[18] = "%(total_tax).2f KM" % {
				'total_tax': total_tax
			} # Razlika poreza za uplatu

			num = 0
			for field in fields:	
				writer.update_page_form_field_values(
					writer.pages[0], {field: field_values[num]}
				)
				num = num + 1

			bytes_to_send = io.BytesIO()
			writer.write(bytes_to_send)
			bytes_to_send.seek(0)			
			output_fields["ams_pdf"] = list(bytes_to_send.read())
			
			bytes_to_send.seek(0)
			pdf = pypdfium2.PdfDocument(bytes_to_send)
			page = pdf.get_page(0)
			pil_image = page.render_topil(scale=3)
			img_byte_arr = io.BytesIO()
			pil_image.save(img_byte_arr, format='JPEG', quality=100, subsampling=0)
			img_byte_arr.seek(0)	
			page.close()
			output_fields["ams_image"] = list(img_byte_arr.read())
    		
			if (button_id == "generate_all"):				
				# Fill 3 slip pdfs, and fill output with their data
				# Fill slip "Uplatnica - zdravstveni zavod FBiH.pdf", and fill output with its data
				reader = PdfReader("Prazna uplatnica.pdf")
				writer = PdfWriter()
				page = reader.pages[0]
				fields = reader.get_fields().keys()
				writer.add_page(page)

				field_values = [""] * 96
				field_values[0] = slip_name_address_phone # Uplatio je (ime, adresa, i telefon)
				field_values[1] = "Doprinos za zdravstvo od uplate iz inostranstva" # Svrha doznake
				field_values[2] = "Zavod zdravstvenog osiguranja i reosiguranja FBiH" # Primatelj
				field_values[3] = slip_payment_place # Mjesto uplate
				
				field_values[4] = slip_transaction_day[0] # Datum uplate
				field_values[5] = slip_transaction_day[1]
				field_values[6] = slip_transaction_month[0]
				field_values[7] = slip_transaction_month[1]
				field_values[8] = slip_transaction_year[0]
				field_values[9] = slip_transaction_year[1]
				
				num = 10
				num2 = 0
				while num<=25:
					if num2 > len(slip_user_account_num) - 1:
						break
					field_values[num] = slip_user_account_num[num2] # Račun pošiljatelja
					num = num + 1
					num2 = num2 + 1
					
				num = 26
				num2 = 0
				while num<=41:
					if num2 > len(slip_fbih_health_account_num) - 1:
						break
					field_values[num] = slip_fbih_health_account_num[num2] # Račun primatelja
					num = num + 1
					num2 = num2 + 1
					
				field_values[42] = "%(health_fbih).2f KM" % {
					'health_fbih': health_fbih
				} # Iznos za uplatiti u KM
				
				num = 44
				num2 = 0
				while num<=56:
					if num2 > len(slip_jmbg) - 1:
						break
					field_values[num] = slip_jmbg[num2] # Broj poreznog obveznika
					num = num + 1
					num2 = num2 + 1
				field_values[57] = '0' # Vrsta uplate
				
				type_of_income = "712116"
				num = 58
				num2 = 0
				while num<=63:
					if num2 > len(type_of_income) - 1:
						break
					field_values[num] = type_of_income[num2] # Vrsta prihoda
					num = num + 1
					num2 = num2 + 1
					
				field_values[64] = tax_period_start_day[0]
				field_values[65] = tax_period_start_day[1]
				field_values[66] = tax_period_month[0]
				field_values[67] = tax_period_month[1]
				field_values[68] = tax_period_year[0]
				field_values[69] = tax_period_year[1]
				
				field_values[70] = tax_period_end_day[0]
				field_values[71] = tax_period_end_day[1]
				field_values[72] = tax_period_month[0]
				field_values[73] = tax_period_month[1]
				field_values[74] = tax_period_year[0]
				field_values[75] = tax_period_year[1]
				
				num = 76
				num2 = 0
				while num<=78:
					if num2 > len(slip_municipality) - 1:
						break
					field_values[num] = slip_municipality[num2] # Općina
					num = num + 1
					num2 = num2 + 1
				
				budget_organization = "0000000"
				num = 89
				num2 = 0
				while num<=95:
					if num2 > len(budget_organization) - 1:
						break
					field_values[num] = budget_organization[num2] # Budžetska organizacija
					num = num + 1
					num2 = num2 + 1
				
				reference_number = "00000000" + tax_period_month
				num = 79
				num2 = 0
				while num<=88:
					if num2 > len(reference_number) - 1:
						break
					field_values[num] = reference_number[num2] # Poziv na broj
					num = num + 1
					num2 = num2 + 1
				
				num = 0
				for field in fields:	
					writer.update_page_form_field_values(
						writer.pages[0], {field: field_values[num]}
					)
					num = num + 1

				bytes_to_send = io.BytesIO()
				writer.write(bytes_to_send)
				bytes_to_send.seek(0)			
				output_fields["slip_fbih_health_pdf"] = list(bytes_to_send.read())
				
				bytes_to_send.seek(0)
				pdf = pypdfium2.PdfDocument(bytes_to_send)
				page = pdf.get_page(0)
				pil_image = page.render_topil(scale=1)
				img_byte_arr = io.BytesIO()
				pil_image.save(img_byte_arr, format='JPEG', quality=85, subsampling=0)
				img_byte_arr.seek(0)	
				page.close()
				output_fields["slip_fbih_health_image"] = list(img_byte_arr.read())
				
				# Fill slip "Uplatnica - zdravstveni zavod kantona.pdf", and fill output with its data
				# ------------------------------------------------------------------------------------
				reader = PdfReader("Prazna uplatnica.pdf")
				writer = PdfWriter()
				page = reader.pages[0]
				fields = reader.get_fields().keys()
				writer.add_page(page)

				field_values = [""] * 96
				field_values[0] = slip_name_address_phone # Uplatio je (ime, adresa, i telefon)
				field_values[1] = "Doprinos za zdravstvo od uplate iz inostranstva" # Svrha doznake
				field_values[2] = "Zavod zdravstvenog osiguranja i reosiguranja " + slip_canton  # Primatelj
				field_values[3] = slip_payment_place # Mjesto uplate
				
				field_values[4] = slip_transaction_day[0] # Datum uplate
				field_values[5] = slip_transaction_day[1]
				field_values[6] = slip_transaction_month[0]
				field_values[7] = slip_transaction_month[1]
				field_values[8] = slip_transaction_year[0]
				field_values[9] = slip_transaction_year[1]
				
				num = 10
				num2 = 0
				while num<=25:
					if num2 > len(slip_user_account_num) - 1:
						break
					field_values[num] = slip_user_account_num[num2] # Račun pošiljatelja
					num = num + 1
					num2 = num2 + 1
					
				num = 26
				num2 = 0
				while num<=41:
					if num2 > len(slip_canton_health_account_num) - 1:
						break
					field_values[num] = slip_canton_health_account_num[num2] # Račun primatelja
					num = num + 1
					num2 = num2 + 1
					
				field_values[42] = "%(health_canton).2f KM" % {
					'health_canton': health_canton
				} # Iznos za uplatiti u KM
				
				num = 44
				num2 = 0
				while num<=56:
					if num2 > len(slip_jmbg) - 1:
						break
					field_values[num] = slip_jmbg[num2] # Broj poreznog obveznika
					num = num + 1
					num2 = num2 + 1
				field_values[57] = '0' # Vrsta uplate
				
				type_of_income = "712116"
				num = 58
				num2 = 0
				while num<=63:
					if num2 > len(type_of_income) - 1:
						break
					field_values[num] = type_of_income[num2] # Vrsta prihoda
					num = num + 1
					num2 = num2 + 1
					
				field_values[64] = tax_period_start_day[0]
				field_values[65] = tax_period_start_day[1]
				field_values[66] = tax_period_month[0]
				field_values[67] = tax_period_month[1]
				field_values[68] = tax_period_year[0]
				field_values[69] = tax_period_year[1]
				
				field_values[70] = tax_period_end_day[0]
				field_values[71] = tax_period_end_day[1]
				field_values[72] = tax_period_month[0]
				field_values[73] = tax_period_month[1]
				field_values[74] = tax_period_year[0]
				field_values[75] = tax_period_year[1]
				
				num = 76
				num2 = 0
				while num<=78:
					if num2 > len(slip_municipality) - 1:
						break
					field_values[num] = slip_municipality[num2] # Općina
					num = num + 1
					num2 = num2 + 1
				
				budget_organization = "0000000"
				num = 89
				num2 = 0
				while num<=95:
					if num2 > len(budget_organization) - 1:
						break
					field_values[num] = budget_organization[num2] # Budžetska organizacija
					num = num + 1
					num2 = num2 + 1
				
				reference_number = "00000000" + tax_period_month
				num = 79
				num2 = 0
				while num<=88:
					if num2 > len(reference_number) - 1:
						break
					field_values[num] = reference_number[num2] # Poziv na broj
					num = num + 1
					num2 = num2 + 1
				
				num = 0
				for field in fields:	
					writer.update_page_form_field_values(
						writer.pages[0], {field: field_values[num]}
					)
					num = num + 1

				bytes_to_send = io.BytesIO()
				writer.write(bytes_to_send)
				bytes_to_send.seek(0)			
				output_fields["slip_canton_health_pdf"] = list(bytes_to_send.read())
				
				bytes_to_send.seek(0)
				pdf = pypdfium2.PdfDocument(bytes_to_send)
				page = pdf.get_page(0)
				pil_image = page.render_topil(scale=1)
				img_byte_arr = io.BytesIO()
				pil_image.save(img_byte_arr, format='JPEG', quality=85, subsampling=0)
				img_byte_arr.seek(0)	
				page.close()
				output_fields["slip_canton_health_image"] = list(img_byte_arr.read())
				
				# Fill slip "Uplatnica - budžet kantona.pdf", and fill output with its data
				# -------------------------------------------------------------------------
				reader = PdfReader("Prazna uplatnica.pdf")
				writer = PdfWriter()
				page = reader.pages[0]
				fields = reader.get_fields().keys()
				writer.add_page(page)

				field_values = [""] * 96
				field_values[0] = slip_name_address_phone # Uplatio je (ime, adresa, i telefon)
				field_values[1] = "Porez na dohodak od uplate iz inostranstva" # Svrha doznake
				field_values[2] = "Budžet " + slip_canton  # Primatelj
				field_values[3] = slip_payment_place # Mjesto uplate
				
				field_values[4] = slip_transaction_day[0] # Datum uplate
				field_values[5] = slip_transaction_day[1]
				field_values[6] = slip_transaction_month[0]
				field_values[7] = slip_transaction_month[1]
				field_values[8] = slip_transaction_year[0]
				field_values[9] = slip_transaction_year[1]
				
				num = 10
				num2 = 0
				while num<=25:
					if num2 > len(slip_user_account_num) - 1:
						break
					field_values[num] = slip_user_account_num[num2] # Račun pošiljatelja
					num = num + 1
					num2 = num2 + 1
					
				num = 26
				num2 = 0
				while num<=41:
					if num2 > len(slip_canton_budget_account_num) - 1:
						break
					field_values[num] = slip_canton_budget_account_num[num2] # Račun primatelja
					num = num + 1
					num2 = num2 + 1
					
				field_values[42] = "%(total_tax).2f KM" % {
					'total_tax': total_tax
				} # Iznos za uplatiti u KM
				
				num = 44
				num2 = 0
				while num<=56:
					if num2 > len(slip_jmbg) - 1:
						break
					field_values[num] = slip_jmbg[num2] # Broj poreznog obveznika
					num = num + 1
					num2 = num2 + 1
				field_values[57] = '0' # Vrsta uplate
				
				type_of_income = "716116"
				num = 58
				num2 = 0
				while num<=63:
					if num2 > len(type_of_income) - 1:
						break
					field_values[num] = type_of_income[num2] # Vrsta prihoda
					num = num + 1
					num2 = num2 + 1
					
				field_values[64] = tax_period_start_day[0]
				field_values[65] = tax_period_start_day[1]
				field_values[66] = tax_period_month[0]
				field_values[67] = tax_period_month[1]
				field_values[68] = tax_period_year[0]
				field_values[69] = tax_period_year[1]
				
				field_values[70] = tax_period_end_day[0]
				field_values[71] = tax_period_end_day[1]
				field_values[72] = tax_period_month[0]
				field_values[73] = tax_period_month[1]
				field_values[74] = tax_period_year[0]
				field_values[75] = tax_period_year[1]
				
				num = 76
				num2 = 0
				while num<=78:
					if num2 > len(slip_municipality) - 1:
						break
					field_values[num] = slip_municipality[num2] # Općina
					num = num + 1
					num2 = num2 + 1
				
				budget_organization = "0000000"
				num = 89
				num2 = 0
				while num<=95:
					if num2 > len(budget_organization) - 1:
						break
					field_values[num] = budget_organization[num2] # Budžetska organizacija
					num = num + 1
					num2 = num2 + 1
				
				reference_number = "00000000" + tax_period_month
				num = 79
				num2 = 0
				while num<=88:
					if num2 > len(reference_number) - 1:
						break
					field_values[num] = reference_number[num2] # Poziv na broj
					num = num + 1
					num2 = num2 + 1
				
				num = 0
				for field in fields:	
					writer.update_page_form_field_values(
						writer.pages[0], {field: field_values[num]}
					)
					num = num + 1

				bytes_to_send = io.BytesIO()
				writer.write(bytes_to_send)
				bytes_to_send.seek(0)			
				output_fields["slip_canton_budget_pdf"] = list(bytes_to_send.read())
				
				bytes_to_send.seek(0)
				pdf = pypdfium2.PdfDocument(bytes_to_send)
				page = pdf.get_page(0)
				pil_image = page.render_topil(scale=1)
				img_byte_arr = io.BytesIO()
				pil_image.save(img_byte_arr, format='JPEG', quality=85, subsampling=0)
				img_byte_arr.seek(0)	
				page.close()
				output_fields["slip_canton_budget_image"] = list(img_byte_arr.read())
				
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