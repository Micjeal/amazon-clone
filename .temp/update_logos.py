import os
import glob
import re

logo_svg = '''<svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" /><stop offset="50%" style="stop-color:#FF8E53;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" /></linearGradient></defs><path d="M6 10L8 26C8.2 27.7 9.6 29 11.3 29H20.7C22.4 29 23.8 27.7 24 26L26 10H6Z" fill="url(#bagGradient)" stroke="url(#bagGradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 13V8C11 5.2 13.2 3 16 3C18.8 3 21 5.2 21 8V13" stroke="url(#bagGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="16" r="1.5" fill="#FFF"/><circle cx="20" cy="16" r="1.5" fill="#FFF"/></svg>'''

# Find all HTML files
html_files = glob.glob('**/*.html', recursive=True)

count = 0
for file_path in html_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace various patterns of shopping cart emoji
        # Pattern 1: <a href="/" style="font-size: 3rem;">🛒</a>
        content = re.sub(
            r'<a\s+href="/"\s+style="font-size:\s*3rem;">🛒</a>',
            f'<a href="/" style="font-size: 3rem;">{logo_svg}</a>',
            content
        )
        
        # Pattern 2: <span style="font-size: 3rem;">🛒</span>
        content = re.sub(
            r'<span\s+style="font-size:\s*3rem;">🛒</span>',
            f'<span style="font-size: 3rem;">{logo_svg}</span>',
            content
        )
        
        # Pattern 3: <span style="font-size: 1.25rem;">🛒</span>
        content = re.sub(
            r'<span\s+style="font-size:\s*1\.25rem;">🛒</span>',
            f'<span style="font-size: 1.25rem;">{logo_svg}</span>',
            content
        )
        
        # Pattern 4: <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
        content = re.sub(
            r'<div\s+style="font-size:\s*4rem;\s*margin-bottom:\s*1rem;">🛒</div>',
            f'<div style="font-size: 4rem; margin-bottom: 1rem;">{logo_svg}</div>',
            content
        )
        
        # Pattern 5: <span>🛒</span> (generic)
        content = re.sub(
            r'<span>🛒</span>',
            f'<span>{logo_svg}</span>',
            content
        )
        
        # Pattern 6: <div>🛒 Secure Checkout</div> - keep the text
        content = re.sub(
            r'<div><span>🛒\s+([^<]+)</span></div>',
            f'<div><span>{logo_svg} \\1</span></div>',
            content
        )
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
            count += 1
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print(f"\nTotal files updated: {count}")
