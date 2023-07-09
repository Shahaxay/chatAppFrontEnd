
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
const serch_member_div=document.getElementById('serch_member');
const search_form=document.getElementById('search_form');
const search_cat=document.getElementById('search_category');
const searched_user=document.getElementById('searched_user');
const view_group_member=document.getElementById('view_group_member');

//groupMemberList
const group_member_div=document.getElementById('group_member_div');
const group_member_list_dest=document.getElementById('group_member_list_dest');

//eachGroupMemberAction
const each_group_member_div=document.getElementById('each_group_member_div');
const group_member_action_dest=document.getElementById('group_member_action_dest');

//search
const searched_member_div=document.getElementById('searched_member_div');
const searched_member_dest=document.getElementById('searched_member_dest');

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
                if(err.response.status==409){
                    alert('you are already in group');
                }
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
        if(group!=-1){
            const result = await axios.post('http://localhost:3000/send-message/' + group, msg_obj, { headers: { token: localStorage.getItem('token') } });
            addMessage('You', compose_msg.value);
        }else{
            alert('This is only made for getting invitation purpose');
        }
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
    serch_member_div.style.display='none';
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
    serch_member_div.style.display='grid';
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

//this also check for is current user admin of respective group
async function getGroupMessage(navigateTo) {
    try {
        const chats = await axios.get('http://localhost:3000/user/group/' + navigateTo, { headers: { token: localStorage.getItem('token') } });
        chat_dest.innerHTML = "";
        chats.data.messages.forEach(chat => {
            console.log(chat);
            addMessage(chat.name, chat.message);
        })
        localStorage.setItem('isAdmin',chats.data.isAdmin);
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
    serch_member_div.style.display='none';
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

//admin power
//search and add by admin
search_form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    //restricting the action on the basis of user and admin
    if(localStorage.getItem('isAdmin')=='false'){
        alert("only group admin can perform this action");
        return;
    }
    const serchedObj={
        toSearch:searched_user.value,
        column:search_cat.value,
        groupId:localStorage.getItem('group')
    }
    console.log(serchedObj);
    try{
        const result=await axios.post('http://localhost:3000/user/search-user',serchedObj,{headers:{token:localStorage.getItem('token')}});
        if(result.data.length==0){
            alert('no such users');
        }else{
            searched_member_div.style.display='grid';
            searched_member_dest.innerHTML="";
            result.data.forEach(user=>{
                showFoundUsers(user);
            })
        }
        //found//not found//not allowed
    }
    catch(err){
        console.log(err);
    }
    //find->admin->search user->add member
})

function showFoundUsers(user){
    const li=document.createElement('li');
    if(user.isMember){
        li.innerHTML=`${user.name} <span>~group member</span>`;
    }else{
        li.innerHTML=`${user.name} <button onclick="addMember('${user.id}')">add</button>`;
    }
    li.id=user.id;
    searched_member_dest.appendChild(li);
}
async function addMember(id){
    console.log("inside fn");
    //add remove-div alert
    const obj={
        groupId:localStorage.getItem('group'),
        userId:id
    }
    try{
        const result=await axios.post('http://localhost:3000/admin/add-member',obj,{headers:{token:localStorage.getItem('token')}});
        alert('added into group');
        searched_member_div.style.display='none';
    }
    catch(err){
        console.log(err);
    }
}

view_group_member.addEventListener('click',async(e)=>{
    // frontend for listing all the group members
    // group_member_div.style.display='grid';
    try{
        const groupId=localStorage.getItem('group');
        const groupMembers=await axios.get('http://localhost:3000/group/get-group-members/'+groupId,{headers:{token:localStorage.getItem('token')}});
        //expected name id isadmin groupname totalMember
        group_member_list_dest.innerHTML=`<h1 class="center">${groupMembers.data.groupName}</h1><p class="center">Group: ${groupMembers.data.totalMembers} participants</p><br><hr></ht>`;
        groupMembers.data.groupUsers.forEach(member=>{
            createMemberElement(member);
        })
    }
    catch(err){
        console.log(err);
    }

})

async function createMemberElement(member){
    //format user 
    const li=document.createElement('li');
    li.id=member.id;
    let textNode=document.createTextNode(member.name);
    li.setAttribute('isAdmin',member.isAdmin);
    li.appendChild(textNode);
    if(member.isAdmin){
        const span=document.createElement('span');
        span.textContent=' ~Admin';
        li.appendChild(span);
    }else{
        li.addEventListener('click',async(e)=>{
            //popup respective info to delete member or make him admin
            //if not admin
            let name=e.target.firstChild.textContent;
            let id=e.target.id;
            let isAdmin=e.target.getAttribute('isadmin'); //custom attribute
            console.log(name,id,isAdmin);
            //check current user is admin or not
            try{
                // const admin=await axios.post(`http://localhost:3000/user/is-admin`,{groupId:localStorage.getItem('group')},{headers:{token:localStorage.getItem('token')}});
                if(localStorage.getItem('isAdmin')=='true'){
                    displayUserAction(name,id,e);
                    
                }else{
                    console.log("you are not admin");
                    alert('later phone number can be added here');
                    
                }
            }
            catch(err){
                console.log(err);
            }
    
        })
    }
    group_member_list_dest.appendChild(li); 
}

function displayUserAction(name,id,e){
    group_member_action_dest.innerHTML="";
    const li1=document.createElement('li');
    // li1.id=id;
    li1.textContent=`make ${name} admin`;
    const li2=document.createElement('li');
    // li2.id=id;
    li2.textContent=`remove ${name}`;
    li1.addEventListener('click',async()=>{
        try{
            const obj={userId:id,groupId:localStorage.getItem('group')};
            console.log(obj);
            const makeAdminResult=await axios.post('http://localhost:3000/group/make-admin',{userId:id,groupId:localStorage.getItem('group')},{headers:{token:localStorage.getItem('token')}});
            //update status of span
            let span=document.createElement('span');
            span.textContent='~Admin';
            e.target.appendChild(span);
            alert(`now ${name} is also an admin`);
            each_group_member_div.style.display='none';
        }
        catch(err){
            console.log(err);
        }
    })
    li2.addEventListener('click',async()=>{
        try{
            const removeMemberResult=await axios.post('http://localhost:3000/group/remove-member',{userId:id,groupId:localStorage.getItem('group')},{headers:{token:localStorage.getItem('token')}});
            //remove user from list
            alert(`${name} is removed from group`);
            each_group_member_div.style.display='none';
            e.target.remove();
        }
        catch(err){
            console.log(err);
        }
    })
    group_member_action_dest.append(li1,li2);
    
    
}

//hiding showing the dialog box
window.addEventListener('click',async(e)=>{
    // console.log(e.target.nodeName);
    // console.log(e.target.id);
    if(e.target.id=='group_member_action_dest'||e.target.parentNode.id=='group_member_action_dest'||e.target.parentNode.id=='group_member_list_dest'||e.target.parentNode.parentNode.id=='group_member_list_dest'){
        if(e.target.nodeName!=='SPAN'&& e.target.getAttribute('isadmin')!='true'){
            each_group_member_div.style.display='grid';
            group_member_div.style.display='grid';
        }
    }else if(e.target.id=='group_member_list_dest'||e.target.id=='view_group_member'|| e.target.id=='each_group_member_div'){
        each_group_member_div.style.display='none';
        group_member_action_dest.innerHTML="";
        group_member_div.style.display='grid';
    }else{
        each_group_member_div.style.display='none';
        group_member_action_dest.innerHTML="";
        group_member_div.style.display='none';
    }
    //hiding search dialog box
    if(e.target.id=='searched_member_div'){
        searched_member_div.style.display='none';
    }
    if(e.target.id=='send_invitation_div'){
        // send_invitation_form.innerHTML="";
        send_invitation_div.style.display='none';
    }
})

//trying to remove the box after clicking the outside of that dialog box




