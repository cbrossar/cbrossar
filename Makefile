# Run lint and format routines
format:
	npm run lint && npx prettier . --write

make run:
	npm run dev