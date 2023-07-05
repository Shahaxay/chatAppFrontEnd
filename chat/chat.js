const chat_dest=document.getElementById('chat_dest');
const compose_msg=document.getElementById('compose_msg');
const send_msg_form=document.getElementById('send_msg_form');
function addMessage(id,msg){
    const tr=document.createElement('tr');
    const td=document.createElement('td');
    td.appendChild(document.createTextNode(id+" : "+msg));
    tr.appendChild(td);
    chat_dest.appendChild(tr);
    if(id==='yours_id'){
        console.log("enter");
        tr.style.backgroundColor="#dabce5";
    }
}

send_msg_form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const msg_obj={
        message:compose_msg.value
    }
    try{
        const result=await axios.post('http://localhost:3000/send-message',msg_obj,{headers:{token:localStorage.getItem('token')}});
        addMessage('yours_id',compose_msg.value);
        send_msg_form.reset();
    }
    catch(err){
        console.log(err);
    }
})
