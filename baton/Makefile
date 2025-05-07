python = venv/bin/python

init:
	python3 -m venv venv

install:
	$(python) -m pip install -r requirements.txt

run:
	$(python) app.py

health:
	$(python) health.py

player-gameweeks:
	$(python) player_gameweeks.py

last-5:
	$(python) last_5.py

update-db-models:
	$(python) -m sqlacodegen ${DATABASE_URL} --outfile models.py

deploy:
	gcloud run deploy baton \
		--image gcr.io/quixotic-geode-234622/baton \
		--platform managed \
		--region us-central1 \
		--allow-unauthenticated \
		--timeout 300 \
		--memory 512Mi \
		--cpu 1 \
		--min-instances 0 \
		--max-instances 10 \
		--set-secrets=DATABASE_URL=baton-db-url:latest

