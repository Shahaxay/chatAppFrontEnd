const signup_form=document.getElementById('signup_form');
const signup_form_name=document.getElementById('signup_form_name');
const signup_form_email=document.getElementById('signup_form_email');
const signup_form_phone=document.getElementById('signup_form_phone');
const signup_form_password=document.getElementById('signup_form_password');
const signup_form_submit=document.getElementById('signup_form_submit');

const request_body={
    name:signup_form_name.value,
    email:signup_form_email.value,
    phone:signup_form_phone.value,
    password:signup_form_password.value
};



