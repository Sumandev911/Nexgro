import fs from 'fs';
import path from 'path';

const dir = './stitch_exports';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const injectedScript = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar and Standalone CTA logic
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(btn => {
      const text = btn.textContent.toLowerCase().split(' ').filter(x => x).join(' ');
      if (
        text.includes('get free audit') || 
        text.includes('get audit') || 
        text.includes('book free discovery call') || 
        text.includes('start your project')
      ) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const form = document.getElementById('audit-form');
          if (form) {
            form.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.open('https://wa.me/916363690485?text=' + encodeURIComponent("Hi Nexgro! 👋 I'm interested in growing my brand. Can we talk?"), '_blank');
          }
        });
      }
    });

    // 2. Form submission logic
    const auditForm = document.getElementById('audit-form');
    if (auditForm) {
      const newForm = auditForm.cloneNode(true);
      auditForm.parentNode.replaceChild(newForm, auditForm);
      
      newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        newForm.querySelectorAll('.error-msg').forEach(el => el.remove());
        
        const inputs = [
          { id: 'form-name', name: 'Name' },
          { id: 'form-brand', name: 'Brand' },
          { id: 'form-email', name: 'Email' },
          { id: 'form-whatsapp', name: 'WhatsApp' },
          { id: 'form-service', name: 'Service Needed', isSelect: true }
        ];
        
        const formData = {};

        inputs.forEach(field => {
          const el = newForm.querySelector('#' + field.id);
          if (el) {
             const val = el.value.trim();
             if (field.isSelect && el.options) {
                formData[field.name] = val ? el.options[el.selectedIndex].text : val;
             } else {
                formData[field.name] = val;
             }
             
             if (!val) {
               isValid = false;
               const errorEl = document.createElement('span');
               errorEl.className = 'error-msg text-red-500 text-xs mt-1 absolute bottom-[-20px]';
               errorEl.style.color = '#ef4444';
               errorEl.style.fontSize = '12px';
               errorEl.textContent = 'This field is required.';
               
               if (el.parentElement) {
                  el.parentElement.style.position = 'relative'; 
                  el.parentElement.appendChild(errorEl);
               }
             }
          }
        });

        const textarea = newForm.querySelector('textarea');
        let messageVal = textarea ? textarea.value.trim() : '';

        if (isValid) {
          const message = \`Hi Nexgro! 👋
New Audit Request:
Name: \${formData['Name']}
Brand: \${formData['Brand']}
Email: \${formData['Email']}
WhatsApp: \${formData['WhatsApp']}
Service Needed: \${formData['Service Needed']}
Message: \${messageVal}
Looking forward to connecting!\`;
          
          const encodedMessage = encodeURIComponent(message);
          const whatsappUrl = \`https://wa.me/916363690485?text=\${encodedMessage}\`;
          window.open(whatsappUrl, '_blank');
        }
      });
    }
  });
</script>
`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const marker = '// Form Handling';
  if (content.includes(marker)) {
    content = content.split(marker)[0] + '\\n</script>\\n</body>';
  }
  
  if (!content.includes('1. Navbar and Standalone CTA logic')) {
     const injection = injectedScript + '\\n</body>';
     if (content.includes('</body>')) {
        content = content.replace('</body>', injection);
     } else if (content.includes('</BODY>')) {
        content = content.replace('</BODY>', injection);
     }
     
     content = content.replace(/required=""/g, '');
     content = content.replace(/required/g, '');
     
     fs.writeFileSync(filePath, content);
     console.log('✅ Applied changes to ' + file);
  } else {
     console.log('⚡ Already applied to ' + file + ', skipping.');
  }
});

console.log('✅ All CTA buttons have been successfully updated.');
