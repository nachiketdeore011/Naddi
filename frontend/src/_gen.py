import base64, os

def w(path, b64):
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'wb') as f:
        f.write(base64.b64decode(b64))
    print(f'OK {path}')

# We read b64 content from a sibling file
with open('_b64.txt') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        path, b64 = line.split('|', 1)
        w(path, b64)
print('All done')
