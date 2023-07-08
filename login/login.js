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
        const token=await axios.post('http://localhost:3000/user/login',login_cred);
        localStorage.setItem('token',token.data.id);
        localStorage.setItem('name',token.data.name);
        localStorage.setItem('group','-1'); //for loading particular page
        window.location="../chat/chat.html"
        
    }
    catch(err){
        console.log(err);
    }
})

login_form.reset();