import os

root = r"D:\Ai_WeiXin\miniprogram\assets\icons"
os.makedirs(root, exist_ok=True)

icons = {
    "home": '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5.5h5V20"/>',
    "order": '<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    "user": '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.4 3.3-5.2 7-5.2s6.2 1.8 7 5.2"/>',
    "search": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4 4"/>',
    "pin": '<path d="M19 10.2c0 4.8-7 10.3-7 10.3S5 15 5 10.2a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
    "bell": '<path d="M18 9.5a6 6 0 0 0-12 0c0 6-2 6.5-2 6.5h16s-2-.5-2-6.5Z"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0"/>',
    "arrow": '<path d="M5 12h13M14 7l5 5-5 5"/>',
    "chevron-left": '<path d="m14.5 5-7 7 7 7"/>',
    "chevron-right": '<path d="m9.5 5 7 7-7 7"/>',
    "chevron-down": '<path d="m5 9 7 7 7-7"/>',
    "clock": '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    "star": '<path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.3l-5.5 2.9 1.1-6.2L3 9.6l6.3-.9L12 3Z" fill="#18211A" stroke="none"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "minus": '<path d="M5 12h14"/>',
    "close": '<path d="m6 6 12 12M18 6 6 18"/>',
    "check": '<path d="m4.5 12.5 5 5 10-11"/>',
    "coupon": '<path d="M3.5 7.5h17v3a2 2 0 0 0 0 3v3h-17v-3a2 2 0 0 0 0-3v-3Z"/><path d="M9 7.5v9" stroke-dasharray="2.5 2.5"/>',
    "address": '<path d="M4 10.5 12 4l8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M9.5 20v-6h5v6"/>',
    "heart": '<path d="M20.2 5.8a5 5 0 0 0-7.1 0L12 6.9l-1.1-1.1a5 5 0 1 0-7.1 7.1L12 21l8.2-8.1a5 5 0 0 0 0-7.1Z"/>',
    "headset": '<path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1"/><path d="M4.5 12.5h2A1.5 1.5 0 0 1 8 14v4a1.5 1.5 0 0 1-1.5 1.5h-2Z"/><path d="M19.5 12.5h-2A1.5 1.5 0 0 0 16 14v4a1.5 1.5 0 0 0 1.5 1.5h2Z"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    "shield": '<path d="M12 2.8 20 6v5.4c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3.2Z"/><path d="m8.5 11.8 2.3 2.4 4.8-5"/>',
    "wallet": '<path d="M4 6.5h14a2 2 0 0 1 2 2V19H6a2 2 0 0 1-2-2V6.5Z"/><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H17v2.5"/><circle cx="16.5" cy="13.5" r="1.2" fill="#18211A" stroke="none"/>',
    "spark": '<path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
    "bag": '<path d="M4.5 8h15l-1 12.5h-13L4.5 8Z"/><path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9"/>',
    "scan": '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/><path d="M7.5 12h9"/>',
    "edit": '<path d="m4 20 4.3-1 10.9-10.9a2.4 2.4 0 0 0-3.4-3.4L5 15.7 4 20Z"/><path d="m13.8 6.2 4 4"/>',
    "trash": '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l.9 13h9.2l.9-13M10 10.5v6M14 10.5v6"/>',
    "refresh": '<path d="M20 11a8 8 0 0 0-14.5-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14.5 4L20 15"/><path d="M20 20v-5h-5"/>',
    "phone": '<path d="M7 3.5h3l1.2 4-2 1.5a13 13 0 0 0 5.8 5.8l1.5-2 4 1.2v3a2.5 2.5 0 0 1-2.7 2.5C10.6 18.7 5.3 13.4 4.5 6.2A2.5 2.5 0 0 1 7 3.5Z"/>',
    "message": '<path d="M4 5.5h16v11H9l-5 4v-15Z"/><path d="M8 9.5h8M8 12.5h5"/>',
    "share": '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/>',
    "scooter": '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h6M16.5 14.5 14 6h-3M13 6h3l2 8.5"/><path d="M4.5 11h5"/>',
    "leaf": '<path d="M20 4C12 4 5 8 5 15c0 2 1 4 3 4 7 0 12-6 12-15Z"/><path d="M4 21c2-6 6-9 12-12"/>',
    "flame": '<path d="M12 21c4.5 0 7-3 7-7 0-4-3-7-5-11-1 3-3 4-3 7-1-1-2-2-2-4-2 2-4 5-4 8 0 4 2.5 7 7 7Z"/><path d="M9.5 16c0 2 1.2 3 2.5 3s2.5-1 2.5-3c0-1.5-1-2.5-2-4-.5 1.2-3 2-3 4Z"/>',
}

category_icons = {
    "all": '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    "meal": '<path d="M3.5 11.5h17c0 5-3.8 8.5-8.5 8.5s-8.5-3.5-8.5-8.5Z"/><path d="M8 8c0-2 1-4 3-5M13 8c0-1.5.7-3 2-4M20 3.5 15 9"/>',
    "drink": '<path d="M6 7.5h12L16.5 21h-9L6 7.5Z"/><path d="M14.8 7.5 17 3M5 7.5h14M9 12h5M9.5 16h4"/>',
    "night": '<path d="m5 19 11-11M13 5l6 6M4 14l6 6M15.5 4.5 20 9"/><circle cx="7" cy="17" r="2.2"/><circle cx="17" cy="7" r="2.2"/>',
    "fruit": '<path d="M12 8c-4-3-8 0-7 5 1 4 4 7 7 7s6-3 7-7c1-5-3-8-7-5Z"/><path d="M12 8c0-2 1-4 3-5"/><path d="M14 3c1.5.3 2.5 1.3 3 3-2 .5-3-.5-3-3Z"/>',
    "errand": '<path d="M4.5 8h15l-1 12.5h-13L4.5 8Z"/><path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9"/><path d="m16 3 .8 2.2L19 6l-2.2.8L16 9l-.8-2.2L13 6l2.2-.8L16 3Z"/>',
    "light": '<path d="M20 4C12 4 5 8 5 15c0 2 1 4 3 4 7 0 12-6 12-15Z"/><path d="M4 21c2-6 6-9 12-12"/>',
    "dessert": '<path d="M5 12h14v7.5H5V12Z"/><path d="M4 12c0-3 2-5 4-5 1-3 7-3 8 0 2 0 4 2 4 5H4Z"/><path d="M12 7V4M9 17.5h6"/>',
}

def svg(body, size=24, stroke="#18211A", width=1.8):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}" fill="none" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round">{body}</svg>'

for name, body in icons.items():
    with open(os.path.join(root, f"{name}.svg"), "w", encoding="utf-8") as f:
        f.write(svg(body))
    with open(os.path.join(root, f"{name}-white.svg"), "w", encoding="utf-8") as f:
        f.write(svg(body, stroke="#F7FFE8"))

for name, body in category_icons.items():
    with open(os.path.join(root, f"cat-{name}.svg"), "w", encoding="utf-8") as f:
        f.write(svg(body, stroke="#18211A", width=1.7))
    with open(os.path.join(root, f"cat-{name}-white.svg"), "w", encoding="utf-8") as f:
        f.write(svg(body, stroke="#F7FFE8", width=1.7))

print(f"generated {len(icons) * 2 + len(category_icons) * 2} icons")
