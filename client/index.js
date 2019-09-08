'use strict'

const url = 'http://localhost:3000'

// Check if all document ready
$(document).ready(function () {
  console.log('web app ready!')
  currentPage()

  // Login using GitHub OAuth
  $('#github-button').on('click', function () {
    // Initialize with your OAuth.io app public key
    OAuth.initialize('gZeK0rjdjMpH70JACRM_kaKLUIc')
    // Use popup for OAuth
    OAuth.popup('github').then(github => {
      console.log(github)
      // Retrieves user data from oauth provider
      console.log(github.me())
    })
  })

  // Login using Google OAuth

  // Link from login form to register form
  $('#register-button').click(function () {
    console.log('test register')
    event.preventDefault()
    showRegister()
  })

  // Link from register form to login form
  $('#login-button').click(function () {
    event.preventDefault()
    showLogin()
  })

  // Submit register form button
  $('#register-button2').click(function () {
    event.preventDefault()
    register()
  })

  // Submit login form button
  $('#login-button2').click(function () {
    event.preventDefault()
    login()
  })

  // Click logout button
  $('#logout-nav').click(function () {
    console.log('logout button clicked')
    event.preventDefault()
    logout()
  })

  // Create to-do button
  $('#createTodoButton').click(function () {
    event.preventDefault()
    showCreate()
  })

  // Submit values to server to create new todo when submit button is clicked
  $('#saveCreateModal').click(function () {
    event.preventDefault()
    createTodo()
  })

  // Delete to-do button -> show deleteModal
  $(document).on('click', '#deleteTodoButton', function () {
    event.preventDefault()
    const todoId = $(this).data('id')
    $('#yesDeleteModal').val(todoId)
  })
})

// Select the current page, by default show login form page
function currentPage () {
  if (localStorage.getItem('token')) {
    if (localStorage.currentPage === 'viewTodo') {
      showTodo()
    } else if (localStorage.currentPage === 'archive') {
      showArchive()
    } else if (localStorage.currentPage === 'create') {
      showCreate()
    } else {
      showTodo()
    }
  } else {
    if (localStorage.currentPage === 'login') {
      showLogin()
    } else if (localStorage.currentPage === 'register') {
      showRegister()
    } else {
      showLogin()
    }
  }
}

// Show login form
function showLogin () {
  localStorage.setItem('currentPage', 'login')
  $('#register-form').hide()
  $('#dashboard').hide()
  $('#createModal').hide()
  $('#content-nav').empty()
  $('#content-nav').append(`
    <li class="nav-item">
      <a class="nav-link" href="#" id="login-nav" onclick="showLogin()">Login</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#" id="register-nav" onclick="showRegister()">Register</a>
    </li>`
  )
  $('#login-email').val('')
  $('#login-password').val('')
  $('#login-form').show()
}

// Show register form
function showRegister () {
  localStorage.setItem('currentPage', 'register')
  $('#login-form').hide()
  $('#dashboard').hide()
  $('#createModal').hide()
  $('#deleteModal').hide()
  $('#content-nav').empty()
  $('#content-nav').append(`
    <li class="nav-item">
      <a class="nav-link" href="#" id="login-nav" onclick="showLogin()">Login</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#" id="register-nav" onclick="showRegister()">Register</a>
    </li>`
  )
  $('#register-name').val('')
  $('#register-email').val('')
  $('#register-password').val('')
  $('#register-form').show()
}

// Register a new user
function register () {
  $.ajax({
    url: `${url}/users/register`,
    method: 'POST',
    data: {
      name: $('#register-name').val(),
      email: $('#register-email').val(),
      password: $('#register-password').val()
    }
  })
    .done(function (response) {
      console.log('New user successfully created')
      showLogin()
    })
    .fail(function (jqXHR, status) {
      console.log(status)
    })
}

// Login to the server
function login () {
  $.ajax({
    url: `${url}/users/login`,
    method: 'POST',
    data: {
      email: $('#login-email').val(),
      password: $('#login-password').val()
    }
  })
    .done(function (response) {
      localStorage.setItem('token', response.token)
      console.log('User successfully signed in')
      currentPage()
    })
    .fail(function (jqXHR, textStatus) {
      console.log(status)
    })
}

// Login to server using Google Account (OAuth)
function onSignIn (googleUser) {
  const profile = googleUser.getBasicProfile()
  const id_token = googleUser.getAuthResponse().id_token
  $.ajax({
    url: 'http://localhost:3000/users/logingoogle',
    method: 'POST',
    data: {
      id_token: id_token
    }
  })
    .done(function (response) {
      console.log(response)
      localStorage.setItem('token', response.token)
      console.log('User successfully signed in')
      currentPage()
    })
    .fail(err => {
      console.log(err)
    })
}

function logout () {
  const auth2 = gapi.auth2.getAuthInstance()
  auth2.signOut().then(function () {
    console.log('User signed out successfuly.')
  })
  localStorage.removeItem('token')
  showLogin()
}

// Show to-do list
function showTodo () {
  localStorage.setItem('currentPage', 'viewTodo')
  $('#login-form').hide()
  $('#register-form').hide()
  $('#createModal').hide()
  $('#deleteModal').hide()
  $('#content-nav').empty().append(`
    <li class="nav-item">
      <a class="nav-link" href="#" id="create-nav" onclick="showCreate()">Create to-do</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#" id="view-nav" onclick="showTodo()">View to-do</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="#" id="archive-nav" onclick="showArchive()">Archive</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="#" id="logout-nav" onclick="logout()">Logout</a>
    </li>`
  )
  $('#dashboard').show()
  readTodo()
  $('#createNew').show()
  $('#todo-list').show()

  // $('#archiveTodo').hide()
  // $('#createTodo').hide()
}

function readTodo (id, tag, find) {
  $.ajax({
    url: `${url}/todos?status=false`,
    method: 'GET',
    headers: {
      token: localStorage.getItem('token')
    }
  })
    .done(function (response) {
      console.log('Reading To-Do.')
      $('#createNew').show()
      $('#todo-header').empty()
      $('#todo-list').empty()

      $('#todo-header').append(
        `
        <tr>
            <th style="width: 20%">To-do activity</th>
            <th style="width: 25%">Description</th>
            <th style="width: 20%">Due date</th>
            <th style="width: 10%">Urgent</th>
            <th style="width: 25%">Actions</th>
        </tr>
        `
      )

      response.forEach((value, index) => {
        const date = new Date(value.dueDate).toISOString().slice(0, 10)
        $('#todo-list').append(
          `
          <tr>
              <td>${value.title}</td> 
              <td>${value.description}</td> 
              <td>${date}</td>
              <td>${(value.urgency === false) ? 'No' : 'Yes'}</td>
              <td>
                  <button type="button" class="btn btn-success btn-block" onclick="doneTodo('${value._id}', 1)"
                      id="doneTodoButton"><i class="fas fa-thumbs-up"></i> Done</button>
                  <button type="button" class="btn btn-warning btn-block" data-toggle="modal"
                      data-target="#editModal"><i class="fas fa-edit"></i> Edit</button>
                  <button type="button" class="btn btn-danger btn-block" data-toggle="modal"
                      data-target="#deleteModal" id="deleteTodoButton" onclick="showDelete('${value._id}')"><i class="fas fa-trash-alt"></i>
                      Delete</button>
              </td>
          </tr>
          `
        )
      })

      if (response.length === 0) {
        $('#readTodo3').html('<p>Your To-Do is empty</p>')
      }
    })
    .fail(function (jqXHR, status) {
      console.log(status)
    })
}

// Create a new to-do when create to-do button clicked
function createTodo () {
  $.ajax({
    url: `${url}/todos`,
    method: 'POST',
    headers: {
      token: localStorage.getItem('token')
    },
    data: {
      title: $('#titleCreateModal').val(),
      description: $('#descriptionCreateModal').val(),
      dueDate: $('#dueDateCreateModal').val(),
      urgency: $('#urgencyCreateModal').is(':checked')
    }
  })
    .done(function (response) {
      console.log('New to-do successfully created.')
      console.log(response)
      readTodo()
    })
    .fail(function (jqXHR, status) {
      console.log(status)
    })
}

// Show create model when create new to-do button is clicked
function showCreate () {
  localStorage.setItem('currentPage', 'create')
  $('#login-form').hide()
  $('#register-form').hide()
  $('#deleteModal').hide()
  $('#createNew').show()

  $('#titleCreateModal').val('')
  $('#descriptionCreateModal').val('')
  $('#dueDateCreateModal').val('')
  $('#urgencyCreateModal').val('')
  $('#createModal').show()
}

function deleteTodo (id) {
  $.ajax({
    url: `${url}/todos/${id}`,
    method: 'DELETE',
    headers: {
      token: localStorage.getItem('token')
    }
  })
    .done(function (response) {
      console.log(`Todo with id ${id} successfully deleted`)
      readTodo()
    })
    .fail(function (jqXHR, status) {
      console.log(status)
    })
}

// Show delete modal when create new to-do button is clicked
function showDelete (id) {
  $('#login-form').hide()
  $('#register-form').hide()
  $('#createModal').hide()
  $('#deleteModal').show()
  $('#deleteModalFooter').empty().append(`
    <button type="button" class="btn btn-success" id="yesDeleteModal" onclick="deleteTodo('${id}')" data-dismiss="modal">Yes</button>
    <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>`
  )
}

// Set status to-do to "done"
function doneTodo (id, value) {
  console.log('Cek doneTodo ke click ga >>>>')
  $.ajax({
    url: `${url}/todos/${id}`,
    method: 'PATCH',
    data: {
      status: value
    },
    headers: {
      token: localStorage.getItem('token')
    }
  })
    .done(function (response) {
      console.log(`Todo with id ${id} is completed`)
      if (value === 0) {
        // readArchive()
      } else if (value === 1) {
        readTodo()
      }
    })
    .fail(function (jqXHR, status) {
      console.log(jqXHR)
    })
}

// Show archive page for todos that already finished
function showArchive () {
  localStorage.setItem('currentPage', 'archive')
  $('#login-form').hide()
  $('#register-form').hide()
  $('#createModal').hide()
  $('#deleteModal').hide()
  $('#createNew').hide()
  $('#content-nav').empty().append(`
    <li class="nav-item">
      <a class="nav-link" href="#" id="create-nav" onclick="showCreate()">Create to-do</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#" id="view-nav" onclick="showTodo()">View to-do</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="#" id="archive-nav" onclick="showArchive()">Archive</a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="#" id="logout-nav" onclick="logout()">Logout</a>
    </li>`
  )
  $('#dashboard').show()
  readArchive()
  $('#todo-list').show()
}

// Read todos that have already been done, show it to the table in archive
function readArchive () {
  $.ajax({
    url: `${url}/todos?status=true`,
    method: 'GET',
    headers: {
      token: localStorage.getItem('token')
    }
  })
    .done(function (response) {
      console.log('Reading archive.')
      $('#createTodoButton').hide()
      $('#todo-header').empty()
      $('#todo-list').empty()

      $('#todo-header').append(
        `
        <tr>
            <th style="width: 20%">To-do activity</th>
            <th style="width: 20%">Description</th>
            <th style="width: 20%">Due date</th>
            <th style="width: 20%">Completed date</th>
            <th style="width: 20%">Actions</th>
        </tr>
        `
      )

      response.forEach((value, index) => {
        const dueDate = new Date(value.dueDate).toISOString().slice(0, 10)
        const completedDate = new Date(value.updatedAt).toISOString().slice(0, 10)
        $('#todo-list').append(
          `
        <tr>
            <td>${value.title}</td> 
            <td>${value.description}</td> 
            <td>${dueDate}</td>
            <td>${completedDate}</td>
            <td>
                <button type="button" class="btn btn-warning btn-block" onclick="doneTodo('${value._id}', 1)"
                    id="doneTodoButton"><i class="fas fa-thumbs-up"></i> Undone</button>
                <button type="button" class="btn btn-danger btn-block" data-toggle="modal"
                    data-target="#deleteModal" id="deleteTodoButton" onclick="showDelete('${value._id}')"><i class="fas fa-trash-alt"></i>
                    Delete</button>
            </td>
        </tr>
        `
        )
      })

      if (response.length === 0) {
        $('#archiveList').html('<p>Your archive is empty</p>')
      }
    })
    .fail(function (jqXHR, status) {
      console.log(status)
    })
}

// Edit todo information
function editTodo (id) {
  $.ajax({
    url: `${url}/todos/${id}`,
    method: 'PATCH',
    data: {
      title: $(`#editTitle${id}`).val(),
      description: $(`#editDescription${id}`).val(),
      dueDate: $(`#editDueDate${id}`).val(),
      urgency: $(`#editUrgency${id}`).val()
    },
    headers: {
      token: localStorage.getItem('token')
    }
  })
    .done(function (response) {
      console.log(`Todo with id ${id} updated.`)
      readTodo(id)
    })
    .fail(function (jqXHR, textStatus) {
      console.log(jqXHR)
    })
}