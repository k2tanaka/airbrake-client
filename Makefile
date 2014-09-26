all:
	@echo "--"

test:
	node_modules/.bin/mocha -r should -R spec --recursive test

.PHONY: all test
