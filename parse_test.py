import re
with open("setup-termux-desktop") as f:
    text = f.read()

m = re.search(r'function download_and_extract\(\) \{.*?\n\}', text, re.DOTALL)
if m:
    print("FOUND download_and_extract")
else:
    print("NOT FOUND")
