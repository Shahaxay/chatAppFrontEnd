const chat_dest=document.getElementById('chat_dest');
const compose_msg=document.getElementById('compose_msg');
const send_msg_form=document.getElementById('send_msg_form');
function addMessage(id,msg){
    const tr=document.createElement('tr');
    const td=document.createElement('td');
    td.appendChild(document.createTextNode(msg));
    tr.appendChild(td);
    chat_dest.appendChild(tr);
    if(id==='yours_id'){
        console.log("enter");
        tr.style.backgroundColor="#dabce5";
    }
}

send_msg_form.addEventListener('submit',(e)=>{
    e.preventDefault();
    addMessage('yours_id',compose_msg.value);
    send_msg_form.reset();
})
