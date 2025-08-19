python = venv/bin/python

init:
	python3 -m venv venv

install:
	$(python) -m pip install -r requirements.txt

run:
	$(python) app.py

health:
	$(python) -c "from runners.health import run_health_check; run_health_check()"

players:
	$(python) -c "from runners.players import run_update_players; run_update_players()"

player-gameweeks:
	$(python) -c "from runners.player_gameweeks import run_player_gameweeks; run_player_gameweeks()"

last-5:
	$(python) -c "from runners.last_5 import run_last_5_points; run_last_5_points()"

reddit-spurs:
	$(python) -c "from runners.reddit_spurs import run_reddit_spurs; run_reddit_spurs()"

update-db-models:
	$(python) -m sqlacodegen ${DATABASE_URL} --outfile models.py

build:
	gcloud builds submit --tag gcr.io/quixotic-geode-234622/baton

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
		--set-secrets=DATABASE_URL=baton-db-url:latest \
		--set-secrets=EMAIL_USER=baton-email-user:latest \
		--set-secrets=EMAIL_PASS=baton-email-pass:latest \
		--set-secrets=TELEGRAM_BOT_TOKEN=telegram-spurs-bot-token:latest \
		--set-secrets=TELEGRAM_CHANNEL_ID=telegram-spurs-channel-id:latest \
		--set-secrets=REDDIT_CLIENT_ID=reddit-client-id:latest \
		--set-secrets=REDDIT_CLIENT_SECRET=reddit-client-secret:latest

build-and-deploy:
	$(MAKE) build
	$(MAKE) deploy


cleanup-images:
	gcloud container images list-tags gcr.io/quixotic-geode-234622/baton --format='get(digest)' | while read digest; do \
		gcloud container images delete gcr.io/quixotic-geode-234622/baton@$$digest --quiet; \
	done 

cleanup-builds:
	gsutil ls gs://quixotic-geode-234622_cloudbuild/source/ | while read file; do \
		gsutil rm "$$file"; \
	done

cleanup-revisions:
	@latest_rev=$$(gcloud run services describe baton --region=us-central1 --format='get(status.latestCreatedRevisionName)'); \
	gcloud run revisions list --service baton --region us-central1 --format="get(metadata.name)" --filter="metadata.name!=$$latest_rev" | while read revision; do \
		gcloud run revisions delete $$revision --region us-central1 --quiet; \
	done


cleanup:
	@echo "Cleaning up Cloud Run revisions..."; \
	$(MAKE) cleanup-revisions; \
	echo "Cleaning up container images..."; \
	$(MAKE) cleanup-images; \
	echo "Cleaning up Cloud Build files..."; \
	$(MAKE) cleanup-builds

lint:
	$(python) -m flake8 .

format:
	$(python) -m black .

format-check:
	$(python) -m black . --check

lint-and-format: format lint


