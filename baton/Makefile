init:
	python3 -m venv venv && \
	source venv/bin/activate && \
	pip install -r requirements.txt

run:
	python fpl.py

update-db-models:
	sqlacodegen ${DATABASE_URL} --outfile models.py

