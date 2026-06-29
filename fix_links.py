import os
import re

DIR = r'C:\Users\Naveent Kumar\Downloads\Talent\frontend\src\app\(dashboard)\admin'

for root, _, files in os.walk(DIR):
    for f in files:
        if not f.endswith('.tsx'):
            continue
        path = os.path.join(root, f)
        
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        modified = False
        
        # Check if Link is used but not imported
        if '<Link' in content and 'import Link from' not in content:
            # Need to insert import at top
            content = 'import Link from "next/link";\n' + content
            modified = True
            
        # Replace to="..." with href="..."
        if re.search(r'<Link[^>]+to=', content):
            content = re.sub(r'(<Link[^>]+)to=', r'\1href=', content)
            modified = True
            
        if modified:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f'Fixed Links in {path}')
