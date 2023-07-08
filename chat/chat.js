
const chat_dest = document.getElementById('chat_dest');
const compose_msg = document.getElementById('compose_msg');
const send_msg_form = document.getElementById('send_msg_form');
const group_list_dest = document.getElementById('group_list_dest');
const create_group_btn = document.getElementById('create_group');
const invite_friends_btn = document.getElementById('invite_friends');
const display_group_btn = document.getElementById('display_group');
const send_invitation_form = document.getElementById('send_invitation_form');
const user_list_dest = document.getElementById('user_list_dest');
const send_invitation_div = document.getElementById('send_invitation_div');
const inbox_btn = document.getElementById('inbox_btn');
// const invites_btn=document.getElementById('invites');

//global variable for groupname
var group = -1;

//adding message on the screen
function addMessage(name, msg) {
    let username = localStorage.getItem('name');
    if (name === username) name = 'You';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    if (group != -1) {
        td.appendChild(document.createTextNode(name + " : " + msg));
    } else {
        const a = document.createElement('a');
        a.textContent = msg;
        a.href = "#";
        a.onclick = async (e) => {
            try {
                const result = await axios.get(msg, { headers: { token: localStorage.getItem('token') } });
                alert('now you are the member of the group');
            }
            catch (err) {
                console.log(err);
            }
        }
        td.append(document.createTextNode(name + ': '), a);
    }
    tr.appendChild(td);
    chat_dest.appendChild(tr);
    if (name === 'You') {
        tr.style.backgroundColor = "#dabce5";
    }
}

//sending message to the server
send_msg_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg_obj = {
        message: compose_msg.value
    }
    try {
        const result = await axios.post('http://localhost:3000/send-message/' + group, msg_obj, { headers: { token: localStorage.getItem('token') } });
        addMessage('You', compose_msg.value);
        send_msg_form.reset();
    }
    catch (err) {
        console.log(err);
    }
})

//fetching all the message from the server
async function fetchAllMessages() {
    chat_dest.innerHTML = '';
    let message_array = localStorage.getItem('message_array');
    // console.log(message_array.length);
    let last_msg_id = 0;
    if (message_array) {
        message_array = JSON.parse(message_array);
        let last_index = message_array.length - 1;
        if (message_array.length > 0) {
            console.log("this");
            last_msg_id = message_array[last_index].id;
        }
    }
    console.log(last_msg_id);
    try {
        const messages = await axios.get(`http://localhost:3000/get-messages/${group}?lastMessageId=${last_msg_id}`, { headers: { token: localStorage.getItem('token') } });
        // console.log(messages);
        let newMergedArray;
        if (message_array) {
            newMergedArray = message_array.concat(messages.data);
        } else {
            newMergedArray = messages.data;
        }
        newMergedArray.forEach(message => {
            addMessage(message.name, message.message);
        });
        //storing 10 recent message in the localStorage //for previous msg use older button
        if (newMergedArray.length > 10) {
            newMergedArray = newMergedArray.slice(newMergedArray.length - 10);
        }
        localStorage.setItem('message_array', JSON.stringify(newMergedArray));
    }
    catch (err) {
        console.log(err);
    }
}

//on reload
window.addEventListener('DOMContentLoaded', async () => {
    if (localStorage.getItem('group')) {
        group = localStorage.getItem('group');
    }
    if (group != -1) {
        getGroupMessage(group);
    } else {
        getInboxMessage();
    }
})

//setting time interval for fetching all the message
// setInterval(fetchAllMessages,1000);


//creating chat group:
create_group_btn.addEventListener('click', async () => {
    const name = prompt("Enter Name of the group");
    if (name) {
        let create_group_obj = {
            name: name
        }
        try {
            const result = await axios.post('http://localhost:3000/user/create-group', create_group_obj, { headers: { token: localStorage.getItem('token') } });
            alert(name + " group created successfully");
            //can be listed under groups
            displayGroupName(result.data)
        }
        catch (err) {
            console.log(err);
        }
    }
})

//displaying all available groups
display_group_btn.addEventListener('click', async () => {
    try {
        const groups = await axios.get('http://localhost:3000/user/get-groups', { headers: { token: localStorage.getItem('token') } });
        if (groups.data.length == 0) {
            alert('no group found');
        }
        group_list_dest.innerHTML = "";
        for (let group of groups.data) {
            displayGroupName(group);
        }
    }
    catch (err) {
        console.log(err);
    }
})

function displayGroupName(group) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(group.name));
    li.id = group.id; //encrypted id
    group_list_dest.appendChild(li);
}

//navigating to the chats of particuler group chat
group_list_dest.addEventListener('click', async(e)=>{
    group = e.target.id;
    localStorage.setItem('group', group);
    const navigateTo = e.target.id;
    const siblings = Array.from(e.target.parentNode.children);
    siblings.forEach(child => {
        child.style.backgroundColor = 'white';
    })
    e.target.style.backgroundColor = "#efefef";
    getGroupMessage(navigateTo);
});

async function getGroupMessage(navigateTo) {
    try {
        const chats = await axios.get('http://localhost:3000/user/group/' + navigateTo, { headers: { token: localStorage.getItem('token') } });
        chat_dest.innerHTML = "";
        chats.data.forEach(chat => {
            console.log(chat);
            addMessage(chat.name, chat.message);
        })
    }
    catch (err) {
        console.log(err);
    }
    
}

//send current group's invitation link
invite_friends_btn.addEventListener('click', async () => {
    if (group == -1) {
        alert('select group first');
        return;
    }
    //make the list visible
    send_invitation_div.style.display = "grid";
    try {
        const userList = await axios.get('http://localhost:3000/user/get-users', { headers: { token: localStorage.getItem('token') } });
        //do smthng with user
        user_list_dest.innerHTML = "";
        userList.data.forEach(user => {
            if (user) {
                displayUserInInviation(user);
            }
        })

    }
    catch (err) {
        console.log(err);
    }
})

function displayUserInInviation(user) { //name,id
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'users[]';
    input.value = user.id;
    input.id = user.id;
    const label = document.createElement('label');
    label.setAttribute('for', user.id);
    // label.appendChild(input);
    label.append(input, document.createTextNode(user.name));
    user_list_dest.append(label), document.createElement('br');
}

//send invitation to several user
send_invitation_form.addEventListener('submit', async (e) => {
    try {
        e.preventDefault();
        send_invitation_div.style.display = "none";
        const form = e.target;
        let userList = Array.from(form.querySelectorAll('input[name="users[]"]'));
        userList = userList.filter(checkbox => checkbox.checked).map(checkbox => checkbox.id);
        // console.log(userList);
        const result = await axios.post('http://localhost:3000/user/send-invitation', { users: userList, name: localStorage.getItem('name'), groupId: group }, { headers: { token: localStorage.getItem('token') } });//protect default group name
        alert("invitation sent");
    }
    catch (err) {
        console.log(err);
    }
});

//inbox
inbox_btn.addEventListener('click', () => {
    group = -1;
    localStorage.setItem('group', group);
    getInboxMessage();
})

async function getInboxMessage() {
    try {
        const messages = await axios.get('http://localhost:3000/message/get-inbox-message', { headers: { token: localStorage.getItem('token') } });
        chat_dest.innerHTML = '';
        messages.data.forEach(message => {
            addMessage(message.sender, message.message);
        })
    }
    catch (err) {
        console.log(err);
    }
}


