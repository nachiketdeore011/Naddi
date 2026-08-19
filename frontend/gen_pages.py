import os
pages = {}
pages["NadiAnalysis.tsx"] = open(os.path.join(os.path.dirname(__file__), "NadiAnalysis.txt")).read()
for name, content in pages.items():
    with open(os.path.join("frontend/src/pages", name), "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Written {name}")

