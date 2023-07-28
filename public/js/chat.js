
let socket = io();

const groupListItem = document.querySelector('#group-list');
const messageListItem = document.querySelector('#message-list');
const messageGroupId = document.querySelector('#message-group-id');
const adminSection = document.querySelector('#adminsection');
const usersList = document.querySelector('#users-list');


function showPopUpMessage(content, success) {
  const modalMessage = document.querySelector('#modalMessage');
  modalMessage.innerHTML = ' ';

  const createAndAppendElement = (tagName, classNames = []) => {
    const element = document.createElement(tagName);
    element.classList.add(...classNames);
    return element;
  };

  const modalbackground = createAndAppendElement('div', ['modal-background']);
  const modalContent = createAndAppendElement('div', ['modal-content']);

  const message = createAndAppendElement('article', ['message', success ? 'is-primary' : 'is-warning']);

  const messageHeader = createAndAppendElement('div', ['message-header']);
  const p = document.createElement('p');
  p.textContent = success ? 'Success' : 'Error';
  const button = createAndAppendElement('button', ['delete']);
  button.setAttribute('id', 'modalCloseButton');
  button.addEventListener('click', () => {
    modalMessage.classList.remove('is-active');
  });

  messageHeader.appendChild(p);
  messageHeader.appendChild(button);

  const messageBody = createAndAppendElement('div', ['message-body']);
  messageBody.innerText = content;

  message.appendChild(messageHeader);
  message.appendChild(messageBody);

  modalContent.appendChild(message);

  modalMessage.appendChild(modalbackground);
  modalMessage.appendChild(modalContent);

  modalMessage.classList.add('is-active');
}


// checking if the file is URL or not
function isURL(str) {
  // Regular expression pattern for URL validation
  const urlPattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;
  
  return urlPattern.test(str);
}

// fileuploadsection
// const fileInput = document.querySelector('#file-input');
// const uploadButton = document.querySelector('#upload-file');

// uploadButton.addEventListener('click', () => {
//   fileInput.click();
// })

// fileInput.addEventListener('change', () => {
//   const file = fileInput.files[0];
//   const formData = new FormData();
//   formData.append('file', file);
//   console.log(formData);
//   axios.post('/image-upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   })
//   .then(response => {
//     if(response.data.fileURL){
//       const group_id = document.querySelector('#message-group-id').value;
//       if(group_id) {
//         socket.emit('chat-message', response.data.fileURL, group_id);
//       }
//     }
//   })
//   .catch(error => console.log(error));
// })


// if the user is admin? features of the admin.

async function adminFeatures(groupId) {
  usersList.innerHTML = '';

  try {
    const response = await axios.post('group-members', { groupId }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const handleAdminClick = async (memberId) => {
      try {
        const response = await axios.post('makeGroupAdmin', { groupId, memberId }, {
          headers: { 'Content-Type': 'application/json' }
        });
        const messageText = response.data ? 'Member is now Admin' : 'Internal Server Error. Try Later.';
        showPopUpMessage(messageText, response.data);
      } catch (error) {
        showPopUpMessage('Internal Server Error. Try Later.', false);
      }
    };

    const handleRemoveClick = async (memberId) => {
      try {
        const result = await axios.post('removeUserFromGroup', { groupId, memberId }, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (result) {
          alert('Member Removed');
        } else {
          alert('Internal Server Error');
        }
      } catch (error) {
        alert('Internal Server Error');
      }
    };

    response.data.forEach(member => {
      const userDiv = document.createElement('div');
      userDiv.classList.add('column', 'is-full', 'has-background-light');

      const userName = document.createElement('h1');
      userName.classList.add('title', 'is-5');
      userName.innerText = member.name;

      const makeAdminBtn = document.createElement('button');
      makeAdminBtn.textContent = 'Make Group Admin';
      makeAdminBtn.classList.add('button', 'is-small');
      makeAdminBtn.addEventListener('click', () => handleAdminClick(member.id));

      const removeUserBtn = document.createElement('button');
      removeUserBtn.textContent = 'Remove User';
      removeUserBtn.classList.add('button', 'is-small');
      removeUserBtn.addEventListener('click', () => handleRemoveClick(member.id));

      userDiv.appendChild(userName);
      userDiv.appendChild(makeAdminBtn);
      userDiv.appendChild(removeUserBtn);
      usersList.appendChild(userDiv);
    });
  } catch (error) {
    console.log(error);
  }
}

// check if user is admin of the group or not.
async function adminDisplay() {
  const groupId = document.querySelector('#message-group-id').value;

  try {
    const { data: { isAdmin } } = await axios.post('isAdmin', { groupId }, {
      headers: { 'Content-Type': 'application/json' }
    });

    adminSection.style.display = isAdmin ? 'block' : 'none';

    if (isAdmin) {
      adminFeatures(groupId);
    }
  } catch (error) {
    console.log(error);
  }
}


// Add user to group
document.querySelector('#add-userToGroup').addEventListener('click', (clickEvent) => {
  clickEvent.preventDefault();

  const groupId = document.querySelector('#message-group-id').value;
  if (!groupId) {
    return showPopUpMessage('Select a Group to Add User', false);
  }

  const newUserId = prompt('Enter the User ID');
  if (!newUserId) {
    return showPopUpMessage('User ID cannot be null', false);
  }

  const addUserToGroup = async (groupId, newUserId) => {
    try {
      const result = await axios.post('addusertogroup', { groupId, newUserId }, {
        headers: { 'Content-Type': 'application/json' }
      });
      showPopUpMessage(result.data.message, true);
    } catch (error) {
      showPopUpMessage(error.response.data.message, false);
    }
  };

  addUserToGroup(groupId, newUserId);
});


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
  if(msg) {
    if(isURL(msg)) {
      const li = document.createElement('li');
      let link = document.createElement('a');
      link.href = msg;
      link.textContent = 'File Sent';
      li.appendChild(link);
      messageListItem.appendChild(li);
    } else {
      const li = document.createElement('li');
      li.classList.add('groupName');
      li.textContent = msg;
      messageListItem.appendChild(li);
    }
  }
})

function showMessagesOnScreen(messages, groupId) {
  messageListItem.innerHTML = '';
  messages.forEach(element => {
    if(isURL(element.message)) {
      const li = document.createElement('li');
      let link = document.createElement('a');
      link.href = element.message;
      link.textContent = 'File Sent';
      li.appendChild(link);
      messageListItem.appendChild(li);
    } else {
      const liItem = document.createElement('li');
      liItem.textContent = element.message;
      liItem.classList.add('groupName')
      messageListItem.appendChild(liItem);
    }
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
      let listButton = document.createElement('button');
      listButton.textContent = group.name;
      listButton.classList.add('button', 'is-light', 'groupName');
      listItem.appendChild(listButton);
      listItem.addEventListener('click', () => {
        let groupId = group.id;
        axios.post('messages', { groupId: groupId }, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(result => { 
          document.querySelector('#groupNameDisplay').innerText = group.name;
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