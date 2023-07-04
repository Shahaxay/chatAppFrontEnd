const login_form=document.getElementById('login_form');
const email=document.getElementById('login_form_email');
const password=document.getElementById('login_form_password');

login_form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    let login_cred={
        email:email.value,
        password:password.value
    };
    try{
        await axios.post('http://localhost:3000/user/login',login_cred);
    }
    catch(err){
        console.log(err);
    }
})

login_form.reset();