lint:
	npm run lint-js && npm run check-ts

format:
	npm run format-js

setup-git-hooks:
	@cp scripts/commit-msg.sample .git/hooks/commit-msg
	@echo "git hooks installed"
