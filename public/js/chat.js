
let socket = io();

const groupListItem = document.querySelector('#group-list');
const messageListItem = document.querySelector('#message-list');
const messageGroupId = document.querySelector('#message-group-id');
const adminSection = document.querySelector('#adminsection');
const usersList = document.querySelector('#users-list');

// if the user is admin? features of the admin.
async function adminFeatures(groupId) {
  usersList.innerHTML = '';
  try {
    const Members = await axios.post('group-members', { groupId: groupId }, {
      headers: { 'Content-Type': 'application/json' }
    })
    Members.data.forEach(member => {
      const li = document.createElement('li');
      li.textContent = member.name;

      const makeAdminBtn = document.createElement('button');
      makeAdminBtn.textContent = 'Make Group Admin';
      makeAdminBtn.classList.add('makeAdmin');
      makeAdminBtn.addEventListener('click', () => {
        axios.post('makeGroupAdmin', { groupId: groupId, memberId: member.id }, {
          headers: { 'Content-Type': 'application/json' }
        })
        .then(result => { if(result){ alert('Member is now Admin') } else { alert('Internal Server Error') } });
      })

      const removeUserBtn = document.createElement('button');
      removeUserBtn.textContent = 'Remove User';
      removeUserBtn.classList.add('removeUser');
      removeUserBtn.addEventListener('click', () => {
        axios.post('removeUserFromGroup', { groupId: groupId, memberId: member.id }, {
          headers: { 'Content-Type': 'application/json' }
        })
        .then(result => { if(result){ alert('Member Removed')} else { alert('Internal Server Error')} });
      })

      li.appendChild(makeAdminBtn);
      li.appendChild(removeUserBtn);
      usersList.appendChild(li);
    })
  } catch(err) {
    console.log(err);
  }
}

// check if user is admin of the group or not.
async function adminDisplay() {
  const groupId = document.querySelector('#message-group-id').value;
  try {
    const isAdmin = await axios.post('isAdmin', { groupId: groupId, }, {
      headers: { 'Content-Type': 'application/json' }
    })
    if(isAdmin.data.isAdmin) { 
      adminSection.style.display = 'block';
      adminFeatures(groupId);
    } else { adminSection.style.display = 'none' }
  } catch(err) {
    console.log(err);
  }
}

// add user to group
document.querySelector('#add-userToGroup').addEventListener('click', (e) => {
  e.preventDefault();
  const groupId = document.querySelector('#message-group-id').value;
  if(!groupId) { return alert('Select a Group to Add User') }
  const newUserId = prompt('Enter the User ID');
  if(!newUserId) { return alert('User ID cannot be null') }
  axios.post('addusertogroup', { groupId: groupId, newUserId: newUserId }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(result => {
    alert(result.data.message);
  })
  .catch(error => {
    alert(error.response.data.message);
  });
})

// sending the message 
const sendMessageForm = document.querySelector('#message-form')
sendMessageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const group_id = document.querySelector('#message-group-id').value;
  const message = document.querySelector('#message-input');
  if(message.value) {
    socket.emit('chat-message', message.value, group_id);
    message.value = '';
  }
  // .then(result => {
  //   document.querySelector('#message-input').value = '';
  //   const li = document.createElement('li');
  //   li.textContent = message;
  //   messageListItem.appendChild(li);
  // });
})

socket.on('chat-message', (msg)=> {
  document.querySelector('#message-input').value = '';
    const li = document.createElement('li');
    li.textContent = msg;
    messageListItem.appendChild(li);
})

function showMessagesOnScreen(messages, groupId) {
  messageListItem.innerHTML = '';
  messages.forEach(element => {
    const liItem = document.createElement('li');
    liItem.textContent = element.message;
    messageListItem.appendChild(liItem);
  })
  messageGroupId.value = groupId;
}

function showGroupsOnScreen() {
  axios.post('groups', {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(groups => {
    groupListItem.innerHTML = '';
    groups.data.forEach(group => {
      let listItem = document.createElement('li');
      listItem.textContent = group.name;
      listItem.classList.add('list-group-btn')
      listItem.addEventListener('click', () => {
        let groupId = group.id;
        axios.post('messages', { groupId: groupId }, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(result => { 
          showMessagesOnScreen(result.data.messages, groupId)
          adminDisplay(); 
          socket.emit('join-group', document.querySelector('#message-group-id').value);
        })
        .catch(error => console.log(error));
      })
      groupListItem.appendChild(listItem);
    });
  })
  .catch(error => console.log(error));
}

document.addEventListener('DOMContentLoaded', () => {
  showGroupsOnScreen();
})



const createGroupBtn = document.querySelector('#create-group-btn');
createGroupBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const groupName = prompt("Enter the group Name.");
  if(!groupName) { alert('Group Name should be Null!' ); return  }
  axios.post('creategroup', { group_name: groupName }, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(messageCreated => {
    if(messageCreated.data.groupCreated) {
      showGroupsOnScreen();
    }
  })
  .catch(error => console.log(error));
})