const signup_form=document.getElementById('signup_form');
const signup_form_name=document.getElementById('signup_form_name');
const signup_form_email=document.getElementById('signup_form_email');
const signup_form_phone=document.getElementById('signup_form_phone');
const signup_form_password=document.getElementById('signup_form_password');
const signup_form_submit=document.getElementById('signup_form_submit');


signup_form_submit.addEventListener('click',async (e)=>{
    e.preventDefault();
    const request_body={
        name:signup_form_name.value,
        email:signup_form_email.value,
        phone:signup_form_phone.value,
        password:signup_form_password.value
    };
    try{
        const result=await axios.post('http://localhost:3000/user/signup',request_body,{Credential:"include"});
        alert("Successfuly signed up");
    }
    catch(err){
        if(err.response.status=='409'){
            alert("User already exits,Plese Login")
        }
        console.log(err);
    }
    
})




