import subprocess
import sys

cli = r"D:\wxxcx\微信web开发者工具\cli.bat"
result = subprocess.run([cli] + sys.argv[1:], capture_output=True, text=True, encoding="utf-8", errors="replace")
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
print("EXIT", result.returncode)
print(result.stdout)
print(result.stderr)
