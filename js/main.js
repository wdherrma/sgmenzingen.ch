// Smooth-scroll (Bootstrap handles scrollspy via data attributes)
(() => {
  // Client-side form validation
  const forms=document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form=>{
    form.addEventListener('submit',e=>{
      if(!form.checkValidity()){ e.preventDefault(); e.stopPropagation(); }
      form.classList.add('was-validated');
    },false);
  });

  // Auto-collapse nav on link click (mobile)
  const navMenu=document.getElementById('navMenu');
  if(navMenu){
    navMenu.querySelectorAll('.nav-link').forEach(a=>{
      a.addEventListener('click', ()=> {
        const bsCollapse = bootstrap.Collapse.getInstance(navMenu);
        if(bsCollapse) bsCollapse.hide();
      });
    });
  }
})();
