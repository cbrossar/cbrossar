init:
	python3 -m venv venv && \
	source venv/bin/activate && \
	pip install -r requirements.txt

fpl:
	python fpl.py

last-5:
	python last_5.py

update-db-models:
	sqlacodegen ${DATABASE_URL} --outfile models.py

