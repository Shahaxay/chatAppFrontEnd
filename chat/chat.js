const chat_dest=document.getElementById('chat_dest');
const compose_msg=document.getElementById('compose_msg');
const send_msg_form=document.getElementById('send_msg_form');

//adding message on the screen
function addMessage(name,msg){
    let username=localStorage.getItem('name');
    if(name===username) name='You';
    const tr=document.createElement('tr');
    const td=document.createElement('td');
    td.appendChild(document.createTextNode(name+" : "+msg));
    tr.appendChild(td);
    chat_dest.appendChild(tr);
    if(name==='You'){
        tr.style.backgroundColor="#dabce5";
    }
}

//sending message to the server
send_msg_form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const msg_obj={
        message:compose_msg.value
    }
    try{
        const result=await axios.post('http://localhost:3000/send-message',msg_obj,{headers:{token:localStorage.getItem('token')}});
        addMessage('You',compose_msg.value);
        send_msg_form.reset();
    }
    catch(err){
        console.log(err);
    }
})

//fetching all the message from the server
async function fetchAllMessages(){
    chat_dest.innerHTML='';
    let message_array=localStorage.getItem('message_array');
    // console.log(message_array.length);
    let last_msg_id=0;
    if(message_array){
        message_array=JSON.parse(message_array);
        let last_index=message_array.length-1;
        if(message_array.length>0){
            last_msg_id=message_array[last_index].id;
        }
    }
    console.log(last_msg_id);
    try{
        const messages=await axios.get(`http://localhost:3000/get-messages?lastMessageId=${last_msg_id}`,{headers:{token:localStorage.getItem('token')}});
        // console.log(messages);
        let newMergedArray;
        if(message_array){
            newMergedArray=message_array.concat(messages.data);
        }else{
            newMergedArray=messages.data;
        }
        newMergedArray.forEach(message=>{
            addMessage(message.name,message.message);
        });
        //storing 10 recent message in the localStorage //for previous msg use older button
        if(newMergedArray.length>10){
            newMergedArray=newMergedArray.slice(newMergedArray.length-10);
        }  
        localStorage.setItem('message_array',JSON.stringify(newMergedArray));
    }
    catch(err){
        console.log(err);
    }
}

//on reload
// window.addEventListener('DOMContentLoaded',fetchAllMessages)

//setting time interval for fetching all the message
setInterval(fetchAllMessages,1000);


