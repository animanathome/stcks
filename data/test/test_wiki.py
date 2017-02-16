import wikipedia
print wikipedia.search("Microsoft")

page = wikipedia.page("Microsoft")
print page.title
print dir(page)

print page.summary
print page.categories
print page.coordinates
print page.section
print page.sections
print page.references