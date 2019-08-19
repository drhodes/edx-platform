
build: ## build
	echo build

test: FORCE ## test
	jasmine spec/*.spec.js

clean: ## clean all the things
	echo implement clean makefile rule

work-emacs: ## open all files in editor
	emacs -nw *.js *.html spec/*.js

format-js:
	echo "find a good js formatter"

add: clean ## add files to the git repo
	git add -A :/

commit: ## git commit -a
	git commit -a


# http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk \
	'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

FORCE:

