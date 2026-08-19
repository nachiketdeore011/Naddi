import base64, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
with open(sys.argv[1]) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'): continue
        path, b64 = line.split('|', 1)
        os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
        with open(path, 'wb') as out:
            out.write(base64.b64decode(b64))
        print(f'OK {path}')
