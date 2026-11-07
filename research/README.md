# Research

Raw recipe research saved by Gemini and Google Drive. These are data, not code, and nothing in the
app reads them.

- `*_recipes_100.json`: 100-recipe lists per protein. They carry no sources, so they are ideas only
  and stay out of the app until the NotebookLM notebook can verify them.
- `*_recipes.json`: the short, sourced lists (about 8 recipes each) that match the Google Sheet.
- `gemini_batch_NN_<theme>.json`: the notebook's verified recipes by protein theme, each with a
  source and page. Files with "(1)" or "(2)" in the name are repeat saves of the same batch.
- `*.gdoc` and `*.gsheet`: Google Drive shortcuts to the matching Docs and the recipe database sheet.

The dishes in the app were written from these by hand. Each batch's review sheet in
`docs/dish-review/` names the source of every dish.

New files Gemini saves land in the Drive folder's root. Move them here, and they are skipped by the
formatter either way.
