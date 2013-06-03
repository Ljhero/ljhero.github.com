# Create new post

# date
D = $(shell date +%Y-%m-%d)
# name
N ?= new
# file
NEW_POST = $(D)-$(N).md
TEMPLATE = post.md

$(NEW_POST):
	cp $(TEMPLATE) $(NEW_POST)
	mvim $(NEW_POST)
