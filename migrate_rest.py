import os
import re

SOURCE_DIR = r'C:\Users\Naveent Kumar\Downloads\Talent\ScholarTrack_Admin_Extracted\src\routes'
DEST_DIR = r'C:\Users\Naveent Kumar\Downloads\Talent\frontend\src\app\(dashboard)\admin'

mappings = {
    'admin.live-updates.tsx': r'live-updates\page.tsx',
    'admin.scholarships.index.tsx': r'scholarships\page.tsx',
    'admin.scholarships.new.tsx': r'scholarships\new\page.tsx',
    'admin.scholarships.$id.tsx': r'scholarships\[id]\page.tsx',
    'admin.index.tsx': r'page.tsx'
}

for src_name, dest_suffix in mappings.items():
    src_path = os.path.join(SOURCE_DIR, src_name)
    dest_path = os.path.join(DEST_DIR, dest_suffix)
    
    if not os.path.exists(src_path):
        print(f'Missing {src_path}')
        continue
        
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove @tanstack/react-router import
    content = re.sub(r'import\s+\{.*createFileRoute.*\}\s+from\s+[\'"]@tanstack/react-router[\'"];?\n?', '', content)
    
    # Extract the component name from the createFileRoute config
    match = re.search(r'export\s+const\s+Route\s*=\s*createFileRoute\([^)]+\)\(\s*\{\s*component:\s*([A-Za-z0-9_]+)', content)
    component_name = match.group(1) if match else 'Page'
    
    # Remove the Route definition
    content = re.sub(r'export\s+const\s+Route\s*=\s*createFileRoute\([^)]+\)\(\s*\{.*?\}\s*\);?\n?', '', content, flags=re.DOTALL)
    
    # Replace the component function declaration
    content = re.sub(rf'function\s+{component_name}\s*\(', f'export default function {component_name}(', content)
    content = re.sub(rf'const\s+{component_name}\s*=\s*\(', f'export default function {component_name}(', content)
    
    # react-router-dom to next/navigation
    content = content.replace('from "react-router-dom"', 'from "next/navigation"')
    content = content.replace('useNavigate', 'useRouter')
    
    # Link fix for Next.js
    content = re.sub(r'import\s+\{([^}]*)Link([^}]*)\}\s+from\s+[\'"]@tanstack/react-router[\'"];?\n?', r'import Link from "next/link";\n', content)
    if '<Link' in content and 'import Link from' not in content:
        content = 'import Link from "next/link";\n' + content
    content = re.sub(r'(<Link[^>]+)to=', r'\1href=', content)
    
    # Route.useParams() fix for dynamic routes
    if 'Route.useParams()' in content:
        content = content.replace('Route.useParams()', 'params')
        content = re.sub(rf'export default function {component_name}\(\)', f'export default function {component_name}({{ params }}: {{ params: {{ id: string }} }})', content)
        
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f'Migrated {src_name} -> {dest_path}')
