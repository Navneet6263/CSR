import os
import re

SOURCE_DIR = r'C:\Users\Naveent Kumar\Downloads\Talent\ScholarTrack_Admin_Extracted\src\routes'
DEST_DIR = r'C:\Users\Naveent Kumar\Downloads\Talent\frontend\src\app\(dashboard)\admin'

mappings = {
    'admin.analytics.geo.tsx': r'analytics\geo\page.tsx',
    'admin.analytics.sla.tsx': r'analytics\sla\page.tsx',
    'admin.operations.bulk.tsx': r'operations\bulk\page.tsx',
    'admin.operations.payments.tsx': r'operations\payments\page.tsx',
    'admin.pipeline.reviewer.index.tsx': r'pipeline\reviewer\page.tsx',
    'admin.pipeline.reviewer.$id.tsx': r'pipeline\reviewer\[id]\page.tsx',
    'admin.pipeline.bgchecker.index.tsx': r'pipeline\bgchecker\page.tsx',
    'admin.pipeline.bgchecker.$id.tsx': r'pipeline\bgchecker\[id]\page.tsx',
    'admin.pipeline.screener.index.tsx': r'pipeline\screener\page.tsx',
    'admin.pipeline.screener.$id.tsx': r'pipeline\screener\[id]\page.tsx',
    'admin.pipeline.csr.index.tsx': r'pipeline\csr\page.tsx'
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
    # Example: export const Route = createFileRoute("/admin/analytics/geo")({\n  component: GeoPage,\n});
    match = re.search(r'export\s+const\s+Route\s*=\s*createFileRoute\([^)]+\)\(\s*\{\s*component:\s*([A-Za-z0-9_]+)', content)
    component_name = match.group(1) if match else 'Page'
    
    # Remove the Route definition
    content = re.sub(r'export\s+const\s+Route\s*=\s*createFileRoute\([^)]+\)\(\s*\{.*?\}\s*\);?\n?', '', content, flags=re.DOTALL)
    
    # Convert 'function ComponentName' to 'export default function ComponentName'
    content = re.sub(rf'function\s+{component_name}\s*\(', f'export default function {component_name}(', content)
    content = re.sub(rf'const\s+{component_name}\s*=\s*\(', f'export default function {component_name}(', content)
    
    content = content.replace('from "react-router-dom"', 'from "next/navigation"')
    content = content.replace('useNavigate', 'useRouter')
    # Link might be imported from lucide-react if the user had it wrong, but probably from react-router-dom
    # Wait, Link might have been imported from @tanstack/react-router!
    content = re.sub(r'import\s+\{([^}]*)Link([^}]*)\}\s+from\s+[\'"]@tanstack/react-router[\'"];?\n?', r'import Link from "next/link";\n', content)
    
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f'Migrated {src_name} -> {dest_path}')
