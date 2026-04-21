#!/usr/bin/env python3
"""
Fix the quiz and assessment result pages to properly include Amazon product
recommendations as escaped JS within string concatenation.
"""

SERVER = 'src/server/index.mjs'

with open(SERVER, 'r') as f:
    content = f.read()

# ─── FIX 1: Quiz showResult product recommendations ───
# The broken code starts at the line with textContent = r.text that's NOT properly terminated
# We need to replace the broken block with properly escaped string concatenation

broken_quiz_block = """'  document.getElementById("resultText").textContent = r.text;
      // Show Amazon product recommendations
      if (r.products && r.products.length > 0) {
        var prodHtml = '<div style="margin-top:32px;text-align:left;"><h3 style="font-size:18px;color:var(--accent);margin-bottom:16px;">Recommended Products</h3>';
        r.products.forEach(function(p) {
          prodHtml += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:8px;background:rgba(124,77,255,0.06);border-radius:8px;border:1px solid rgba(124,77,255,0.15);"><span style="font-size:20px;">\\ud83c\\udf44</span><div><a href=\\"https://www.amazon.com/dp/' + p.asin + '?tag=spankyspinola-20\\" target=\\"_blank\\" rel=\\"nofollow sponsored\\" style=\\"color:var(--accent);text-decoration:none;font-weight:600;\\">' + p.name + '</a><span style=\\"font-size:11px;color:var(--text-dim);margin-left:8px;\\">(paid link)</span></div></div>';
        });
        prodHtml += '</div>';
        document.getElementById("resultText").insertAdjacentHTML("afterend", prodHtml);
      }\\n' +"""

fixed_quiz_block = """'  document.getElementById("resultText").textContent = r.text;\\n' +
      '  if (r.products && r.products.length > 0) {\\n' +
      '    var prodHtml = \\'<div style="margin-top:32px;text-align:left;"><h3 style="font-size:18px;color:var(--accent);margin-bottom:16px;">Recommended Products</h3>\\';\\n' +
      '    r.products.forEach(function(p) {\\n' +
      '      prodHtml += \\'<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:8px;background:rgba(124,77,255,0.06);border-radius:8px;border:1px solid rgba(124,77,255,0.15);"><span style="font-size:20px;">\\\\ud83c\\\\udf44</span><div><a href="https://www.amazon.com/dp/\\' + p.asin + \\'?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored" style="color:var(--accent);text-decoration:none;font-weight:600;">\\' + p.name + \\'</a><span style="font-size:11px;color:var(--text-dim);margin-left:8px;">(paid link)</span></div></div>\\';\\n' +
      '    });\\n' +
      '    prodHtml += \\'</div>\\';\\n' +
      '    document.getElementById("resultText").insertAdjacentHTML("afterend", prodHtml);\\n' +
      '  }\\n' +"""

if broken_quiz_block in content:
    content = content.replace(broken_quiz_block, fixed_quiz_block)
    print("Fixed quiz product recommendations block")
else:
    print("WARNING: Could not find broken quiz block - trying alternative approach")
    # Try a more targeted fix
    # The issue is that line 2533 has an unterminated string
    old_line = "'  document.getElementById(\"resultText\").textContent = r.text;\n"
    # Find it and check if the next line is the broken comment
    idx = content.find(old_line)
    if idx >= 0:
        # Find the end of the broken block (the line ending with }\n' +)
        block_end = content.find("}\\n' +", idx)
        if block_end > 0:
            block_end = block_end + len("}\\n' +")
            broken = content[idx:block_end]
            print(f"Found broken block ({len(broken)} chars)")
            content = content[:idx] + fixed_quiz_block.lstrip("'") + content[block_end:]
            print("Replaced with fixed block")

# ─── FIX 2: Assessment result - check if it was also broken ───
# The assessment version should have been the second occurrence but the script
# only replaced the first. Check if assessment is still clean.
assess_check = "'  document.getElementById(\"resultText\").textContent = r.text;\\n' +\n      '  var breakdown"
if assess_check in content:
    print("Assessment result rendering is clean (was not broken)")
    
    # But we still need to add product recs to assessments
    # Insert product rec code before the breakdown section
    old_assess = "'  document.getElementById(\"resultText\").textContent = r.text;\\n' +\n      '  var breakdown"
    new_assess = """'  document.getElementById("resultText").textContent = r.text;\\n' +
      '  if (r.products && r.products.length > 0) {\\n' +
      '    var prodHtml = \\'<div style="margin-top:32px;text-align:left;"><h3 style="font-size:18px;color:var(--accent);margin-bottom:16px;">Recommended Products</h3>\\';\\n' +
      '    r.products.forEach(function(p) {\\n' +
      '      prodHtml += \\'<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:8px;background:rgba(124,77,255,0.06);border-radius:8px;border:1px solid rgba(124,77,255,0.15);"><span style="font-size:20px;">\\\\ud83c\\\\udf44</span><div><a href="https://www.amazon.com/dp/\\' + p.asin + \\'?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored" style="color:var(--accent);text-decoration:none;font-weight:600;">\\' + p.name + \\'</a><span style="font-size:11px;color:var(--text-dim);margin-left:8px;">(paid link)</span></div></div>\\';\\n' +
      '    });\\n' +
      '    prodHtml += \\'</div>\\';\\n' +
      '    document.getElementById("resultText").insertAdjacentHTML("afterend", prodHtml);\\n' +
      '  }\\n' +
      '  var disclaimer = \\'<div style="margin-top:24px;padding:16px 20px;background:rgba(255,107,107,0.08);border-left:3px solid #ff6b6b;border-radius:8px;font-size:13px;line-height:1.7;color:var(--text-dim);"><strong style="color:#ff6b6b;">Important Disclaimer:</strong> This assessment is for educational and informational purposes only. It is not medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any supplement or considering psychedelic use. You assume all responsibility for your own health decisions.</div>\\';\\n' +
      '  document.getElementById("scoreBreakdown").insertAdjacentHTML("afterend", disclaimer);\\n' +
      '  var breakdown"""
    content = content.replace(old_assess, new_assess)
    print("Added product recs and disclaimer to assessment results")
else:
    print("Assessment result rendering may also be broken - checking...")
    # Check for the broken pattern
    print('Assessment may need manual fix')

with open(SERVER, 'w') as f:
    f.write(content)

print("Done! Server file patched.")
