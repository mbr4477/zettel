const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const app = express();

app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.get("/api/graph/:dir*", (req, res) => {
  const dir = path.resolve("/" + path.join(req.params.dir, req.params["0"]));
  console.log(dir);
  fs.readdir(dir, { withFileTypes: true })
    .then((files) => {
      const onlyFiles = files.filter(
        (f) => f.isFile() && f.name.endsWith(".md")
      );
      const fullPaths = onlyFiles.map((f) => path.join(dir, f.name));
      return Promise.all(
        fullPaths.map((f) =>
          fs.readFile(f).then((v) => ({ filename: f, contents: v }))
        )
      );
    })
    .then((values) => {
      const text = values.map((v) => v.contents.toString());
      const filenames = values.map((v) => path.resolve(v.filename));
      const titles = text.map((s, i) => {
        try {
          return /# (.+)/g.exec(s)[1];
        } catch {
          console.log(`Unable to extract title from ${values[i].filename}`);
          return "Unknown Title";
        }
      });
      const wikiLinks = text
        .map((s) => [...s.matchAll(/\[\[(.+?)\]\]/g)])
        .flatMap((f, i) =>
          f.map((m) => ({
            source: i,
            target: filenames.indexOf(path.resolve(dir, m[1] + ".md")),
          }))
        )
        .filter((l) => l.source !== -1 && l.target !== -1);
      const nodes = titles.map((v, i) => ({ name: v, path: filenames[i] }));
      res.json({ nodes: nodes, links: wikiLinks });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/graph/:dir*", (req, res) => {
  const dir = req.params.dir + req.params["0"];
  res.render("graph", { dir });
});

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
