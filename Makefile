# Run lint and format routines
format:
	npm run lint && npx prettier . --write

run:
	npm run dev

build:
	npm run build

test:
	npm run test

seed:
	npm run seed