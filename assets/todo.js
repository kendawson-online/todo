//--------------------------
// To Do List 
// version 1.1.0-beta 
//-------------------------- 

// variables
var i;
var myItems;
var date = new Date();
var lastTap = 0;                // tap timer:
var timeDelay = 300;            // used to detect double-taps on touch screens
var key = 'todo';               // default key name for local storage
var locale = 'en-US';           // default language-country code
var listname = 'To Do List';    // default list name

// page elements
const heading = document.getElementById('heading')
const list = document.getElementById('myList');
const input = document.getElementById('myInput');
const errmsg = document.getElementById('errmsg');
const fileInput = document.getElementById('backupFile');
const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
const successModal = new bootstrap.Modal(document.getElementById('successModal'));

// empty list message
var elm = `<h4 class="text-center mt-5">There are no list items to display</h4>
<div class="text-center">(You can add some using the form above)</div>
<div class="text-center mt-4">
  <button class="btn btn-lg btn-secondary shadow" onclick="loadSampleData()">Or, Load Sample Data</button>
</div>
`;

// enables URL parameters (see below for usage)
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

// display the list
// accepts 1 optional argument: config object
// which contains: "key", "locale", and "listname" values
function showList(cobj=null) {
  // if a config object is passed, use those values instead of defaults
  if (cobj) {
    if (cobj.key) { key = cobj.key; }
    if (cobj.locale) { locale = cobj.locale; }
    if (cobj.listname) { 
      document.title = cobj.listname; 
      heading && (heading.innerText = cobj.listname);
    } else {
      // set title and heading to default
      document.title = listname;
      heading.innerText = listname;
    }
  } else {
      // if there's no config object, set title and heading to default
      document.title = listname;
      heading.innerText = listname;
  }
  // retrieve list data from local storage
  const getData = localStorage.getItem(key);
  // if we have data, 
  if (getData) {  
    // parse it
    myItems = JSON.parse(getData);
    // check if the array has data
    if (Array.isArray(myItems) && myItems.length) {
      // count the number of items
      let num = myItems.length;
      // create a var to store list items
      var html = '';
      // populate with actual data (from local storage)
      for (i = 0; i < num; i++) {
        html += `
        <li class="${myItems[i].status === 'completed' ? 'checked ' : ''}list-group-item" data-id="${myItems[i].id}" title="Drag and drop to change list order">      
          <div class="container-fluid m-0 p-0">
              <div class="d-flex flex-row align-items-center">
                  <div class="p-1 flex-grow-1">${myItems[i].text}</div>
                  <div class="p-2 d-none d-md-flex date" title="Date Created">${showFriendlyDate(myItems[i].created)}</div>
                  <div class="p-1 d-none d-sm-flex justify-content-center align-items-center">
                    <div class="d-flex flex-row justify-content-center align-items-center actbtn">
                    <div class="me-1"><button class="btn btn-success rounded" style="padding: 2px 4px 2px 4px;" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editItem('${myItems[i].id}')" title="Edit"><i class="bi bi-pencil-square"></i></button></div>
                    <div class="me-1"><button class="btn btn-danger rounded" style="padding: 2px 4px 2px 4px;" onclick="removeItem('${myItems[i].id}')" title="Delete"><i class="bi bi-x-circle-fill"></i></button></div>
                  </div>
                </div>
              </div>
              <div class="container-fluid d-sm-none text-center my-2">
                <button class="btn btn-sm btn-success text-nowrap me-2 px-2" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editItem('${myItems[i].id}')" title="Edit"><i class="bi bi-pencil-square"></i> Edit</button>
                <button class="btn btn-sm btn-danger text-nowrap px-2" onclick="removeItem('${myItems[i].id}')" title="Delete"><i class="bi bi-x-circle-fill"></i> Delete</button>
              </div>
          </div>
        </li>\n`;
      }
      // update the UI
      list.innerHTML = html;
    }
    // array is empty, show empty list message
    else {
      errmsg.innerHTML = elm;
    }
  }
  // no data? show empty list message
  else {
      errmsg.innerHTML = elm;
  }
  // focus the input field
  input.focus();
  // build node list after all list items are displayed
  const listItems = document.querySelectorAll('li');
  // allow user to press Enter instead of clicking the button
  input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("addBtn").click();
    }
  });
  // if a user checks a list item, toggle the 'checked' class
  listItems.forEach(item => {
    item.addEventListener('dblclick', function() {
      this.classList.toggle('checked');
      toggleStatus(this.dataset.id);
    });
    item.addEventListener('touchend', function() {
      var currentTime = new Date().getTime();
      var tapLength = currentTime - lastTap;
      if (tapLength < timeDelay) {
        // double tap detected!
        this.preventDefault();
        this.classList.toggle('checked');
        toggleStatus(this.dataset.id);
      }
      lastTap = currentTime;
    }); 
  });
  // load Sortable library (for drag and drop functionality)
  var el = list;
  var sortable = Sortable.create(el, {
    // show dashed border while dragging
    ghostClass: 'bordered-item',
    // set opacity to 50% while dragging
    onStart: function (evt) {
      evt.item.style.opacity = '0.5';
    },
    // after drag is done, reset opacity and reorder items in local storage
    onEnd: function (evt) {
      evt.item.style.opacity = '1';
      reorderItems();
    }
  });
}

// create new list item
function addItem() {
  // get the text input
  var inputValue = input.value;
  // if form is blank, show an error
  if (inputValue === '') {
    alert("You didn't type anything!");
    input.focus();
    return false;
  } else {
    // otherwise, write value to local storage
    saveData(inputValue);
    // and reload the page
    location.reload();
  }
}

// save item to local storage
function saveData(val) {
  // try to get saved data
  var sd = localStorage.getItem(key);
  // we have data in local storage
  if (sd) {
    // parse it
    var dataArr = JSON.parse(sd);
    // if we have a valid array,
    if (Array.isArray(dataArr) && dataArr.length) {
        // get last id used
        const lastID = dataArr.length > 1 ? dataArr[dataArr.length - 1].id : dataArr[0].id;
        // create new object containing input value
        const newdata = {
          "id": lastID + 1,
          "text": val,
          "created": date.toISOString(),
          "updated": date.toISOString(),
          "status": "active"
        };
        // push new object to list array
        dataArr.push(newdata);
        // and write to local storage
        localStorage.setItem(key, JSON.stringify(dataArr));
    }
    // array is empty
    else { 
      createFirstItem(val);
    }
  }
  // no data in local storage
  else {
    createFirstItem(val);
  }
}

// remove item (both from DOM and local storage)
function removeItem(id) {
  if (confirm("Are you sure?") == true) {
    // retrieve existing data
    const dataArr = localStorage.getItem(key);
    // if we have data,
    if (dataArr) {
        // parse it
        let pdArr = JSON.parse(dataArr);
        // convert id string to an integer
        const intId = parseInt(id, 10);
        // compare id to ids in the array and remove the item
        pdArr = pdArr.filter(item => item.id !== intId);
        // write data back to local storage
        localStorage.setItem(key, JSON.stringify(pdArr));
        // remove li element from DOM
        const liToRemove = document.querySelector(`li[data-id="${intId}"]`);
        if (liToRemove) {
            liToRemove.remove();
        } 
        // and reload the page
        location.reload();       
    }
  } 
  else {
    return false;
  }
}

// edit the text of existing list items
function editItem(id) {
  // convert the id to an integer
  const intId = parseInt(id, 10);
  // retrieve array from local storage
  let todoList = JSON.parse(localStorage.getItem(key));
  // check if todoList is not null and is an array
  if (Array.isArray(todoList) && todoList.length > 0) {
    // find the item by id
    let selectedItem = todoList.find(item => item.id === intId);
    // if we have an item,
    if (selectedItem) {
      // populate modal with text from local storage
      document.getElementById('message-text').value = selectedItem.text;
      // add event listener to save button
      document.getElementById('saveBtn').addEventListener('click', function() {
        // grab textarea value
        const newText = document.getElementById('message-text').value;
        // we have new text (if it's not equal to stored value)
        if (selectedItem.text !== newText) {
            // update stored text
            selectedItem.text = newText;
            // change 'updated' date
            selectedItem.updated = date.toISOString();
            // and save to local storage
            localStorage.setItem(key, JSON.stringify(todoList));
            // then reload the page
            location.reload();
        } 
        // text has not changed
        else {
            // close the modal
            var myModal = new bootstrap.Modal(document.getElementById('editModal'));
            myModal.hide();
        }
      }, { once: true }); // <== this prevents multiple event listeners 
    } 
  } 
}

// reoroder items in local storage when user drags and drops list items
function reorderItems() {
  const liElements = Array.from(document.querySelectorAll('li'));
  const data = JSON.parse(localStorage.getItem(key));
  const newData = [];
  liElements.forEach((li) => {
    const id = parseInt(li.getAttribute('data-id'));
    const item = data.find((obj) => obj.id === id);
    newData.push(item);
  });
  localStorage.setItem(key, JSON.stringify(newData));
}

// create first item (if array is empty)
function createFirstItem(val) {
  // create a new empty array
  let item = [];
  // create a new object containing the input value
  const newdata = {
    "id": 1,
    "text": val,
    "created": date.toISOString(),
    "updated": date.toISOString(),
    "status": "active"
  };
  // push object to the new array
  item.push(newdata);
  // and write to local storage
  localStorage.setItem(key, JSON.stringify(item));  
}

// toggle status of item
function toggleStatus(id) {
  // Retrieve array from local storage
  let todoList = JSON.parse(localStorage.getItem(key));
  // Find the item with the corresponding ID
  let item = todoList.find(item => item.id === parseInt(id));
  // Toggle the status between "active" and "completed"
  item.status = item.status === 'active' ? 'completed' : 'active';
  // Update array in localstorage
  localStorage.setItem(key, JSON.stringify(todoList));
}

// format ISO dates to local format
function showFriendlyDate(d) {
    var dobj = new Date(d);
    var fd = dobj.toLocaleDateString(locale);
    return fd;
}

// backup data from local storage
function backupListData() {
  // try to get the data
  const data = localStorage.getItem(key);
  if (data) {
    const jsonData = JSON.stringify(JSON.parse(data), null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    // get the current date in the specified locale format
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Intl.DateTimeFormat(locale, options).format(date);
    // replace invalid file name characters in the date
    const validDate = formattedDate.replace(/\//g, '-');
    // construct the file name with the key and the formatted date
    const fileName = `${key}-${validDate}.json`;
    // create a link and trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // revoke the object URL
    URL.revokeObjectURL(url);
    // show the success modal screen
    successModal.show();
  } else {
    // show the error modal screen
    errorModal.show();  
    console.error(`No data found for the key: ${key}`);
  }
}

// restore data - save uploaded JSON file to local storage
function importListData() {
  const file = fileInput.files[0];
  if (file) {
    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const fileData = e.target.result;
          localStorage.setItem(key, fileData);
          location.reload();
        } catch (error) {
          // show an error modal
          errorModal.show();
          console.error('Error saving file to local storage: ', error);
          return false;
        }
      }
      reader.readAsText(file);
    } else {
      // show an error modal
      errorModal.show();
      console.error('Invalid file type! Please upload a valid .json backup file.');
      return false;
    }
  } else {
    // show an error modal
    errorModal.show();
    console.error('No file was selected.');
    return false;
  }
}

// load sample data
function loadSampleData() {
    let item = 
    [
        {
            "id": 1,
            "text": "Type a new item and click the 'Add Item' button",
            "created": "2024-02-01T17:45:54.485Z",
            "updated": "2024-02-01T17:45:54.485Z",
            "status": "active"
        },
        {
            "id": 2,
            "text": "Drag and drop items to reorder the list",
            "created": "2024-02-01T17:45:54.485Z",
            "updated": "2024-02-01T17:45:54.485Z",
            "status": "active"
        },
        {
            "id": 3,
            "text": "Double click (or tap) an item to mark as 'completed'",
            "created": "2024-02-01T17:45:54.485Z",
            "updated": "2024-02-01T17:45:54.485Z",
            "status": "active"
        },
        {
            "id": 4,
            "text": "Double click (or tap) completed items to change status",
            "created": "2024-02-01T17:45:54.485Z",
            "updated": "2024-02-01T17:45:54.485Z",
            "status": "completed"
        },
        {
            "id": 5,
            "text": "Click the 'Edit' icon to modify the text of the item",
            "created": "2024-02-01T17:45:54.485Z",
            "updated": "2024-02-01T17:45:54.485Z",
            "status": "active"
        },
        {
            "id": 6,
            "text": "To delete an item click the 'Delete' icon",
            "created": "2024-02-01T17:45:54.485Z",
            "updated": "2024-02-01T17:45:54.485Z",
            "status": "completed"
        }        
    ];
    // save sample data to local storage
    localStorage.setItem(key, JSON.stringify(item));
    // and reload the page
    location.reload();
}

// how to use URL parameters: (e.g. index.html?foo=bar)
if (params.foo) {
  console.log('The URL parameter foo = ' + params.foo);
}