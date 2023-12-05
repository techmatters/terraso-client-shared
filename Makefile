lint:
	npm run lint-js && npm run check-ts

setup-git-hooks:
	@cp scripts/pre-commit.sample .git/hooks/pre-commit
	@cp scripts/commit-msg.sample .git/hooks/commit-msg
	@echo "git hooks installed"

pre-commit: lint
