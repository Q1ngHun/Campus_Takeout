import os
import re
import json
import tinycss2
from html.parser import HTMLParser

ROOT = r"D:\Ai_WeiXin\miniprogram"
VOID = {"image", "input", "import", "include", "switch", "icon", "progress", "slider", "checkbox", "radio", "camera", "live-player", "live-pusher", "audio", "video", "canvas", "map", "textarea", "br"}
# textarea is not void but may be used as an opening/closing pair here.

class WxmlParser(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=False)
        self.path = path
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append((tag, self.getpos()))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f"unexpected </{tag}> at {self.getpos()}")
            return
        expected, pos = self.stack.pop()
        if expected != tag:
            self.errors.append(f"mismatch: expected </{expected}> (opened {pos}), got </{tag}> at {self.getpos()}")

def all_files(ext):
    result = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        for name in filenames:
            if name.endswith(ext):
                result.append(os.path.join(dirpath, name))
    return result

wxml_errors = 0
for path in all_files(".wxml"):
    parser = WxmlParser(path)
    with open(path, encoding="utf-8") as f:
        parser.feed(f.read())
    if parser.stack:
        parser.errors.append(f"unclosed tags: {[tag for tag, pos in parser.stack]}")
    if parser.errors:
        wxml_errors += 1
        print("WXML", path)
        for error in parser.errors:
            print("  ", error)
print("wxml errors:", wxml_errors)

css_errors = 0
for path in all_files(".wxss"):
    with open(path, encoding="utf-8") as f:
        rules = tinycss2.parse_stylesheet(f.read(), skip_comments=True, skip_whitespace=True)
    for rule in rules:
        if rule.type == "error":
            css_errors += 1
            print("CSS", path, rule.message, "line", rule.source_line)

print("css errors:", css_errors)

refs = set()
for path in all_files(".wxml") + all_files(".js"):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    for match in re.findall(r"/assets/(?:images|icons)/[A-Za-z0-9_\-]+\.(?:jpg|jpeg|png|svg|webp)", text):
        refs.add(match)

missing = []
for ref in sorted(refs):
    full = os.path.join(ROOT, ref.lstrip("/").replace("/", os.sep))
    if not os.path.exists(full):
        missing.append(ref)
print("static asset refs:", len(refs), "missing:", missing)

with open(os.path.join(ROOT, "app.json"), encoding="utf-8") as f:
    app = json.load(f)
for page in app["pages"]:
    base = os.path.join(ROOT, page.replace("/", os.sep))
    for ext in (".js", ".json", ".wxml", ".wxss"):
        if not os.path.exists(base + ext):
            print("MISSING PAGE FILE", base + ext)

print("page entries:", len(app["pages"]))
