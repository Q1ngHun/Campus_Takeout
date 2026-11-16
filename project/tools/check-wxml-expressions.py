import glob
import re

for path in glob.glob(r"D:\Ai_WeiXin\miniprogram\**\*.wxml", recursive=True):
    text = open(path, encoding="utf-8").read()
    matches = re.findall(r"\{\{[^}]*(?:indexOf|Math\.|Object\.|\.map\(|\.filter\(|\.find\(|[A-Za-z]+\()[^}]*\}\}", text)
    if matches:
        print(path)
        for match in matches:
            print("  ", match)
