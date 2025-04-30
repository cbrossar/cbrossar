python = venv/bin/python

init:
	python3 -m venv venv

install:
	$(python) -m pip install -r requirements.txt

player-gameweeks:
	$(python) player_gameweeks.py

last-5:
	$(python) last_5.py

update-db-models:
	$(python) -m sqlacodegen ${DATABASE_URL} --outfile models.py

