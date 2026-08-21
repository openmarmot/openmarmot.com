# openmarmot.com

Static website, plus a few small JS utility pages.

The homepage is generated from `links.txt`. Edit that file, then run:

```
python3 generate.py
```

That writes `website/index.html`.

`links.txt` format:

```
# comments start with #

[Section name]
https://example.com | description of the link
./local-page.html | a page on this site
```
