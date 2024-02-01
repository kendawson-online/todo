# To Do List 
Version 1.1.0-beta 

A simple To Do List created with HTML/Javascript/CSS based on the To Do List example from W3Schools:

https://www.w3schools.com/howto/howto_js_todolist.asp

Online Demo: 

https://kendawson.online/list/

## Main Features

* Saves To Do List items in local storage in JSON format
* Export / Import feature allows users to backup their data to a JSON file
* Basic app (using CDN libraries) is under 100 KB.
* Local version of app (including libraries) is under 1.75 MB
* Uses Bootstrap 5.3.2 for styling
* Uses Bootstrap Icons
* Uses SortableJS for drag-and-drop funcionality
* Mobile-friendly (works on small screens)
* Dates can be displayed in localized format (locale)
* URL parameters (e.g. /?foo=bar) are supported (but not currently used)
* List name and local storage key name can be customized
* Built-in sample data so you can test the app immediately

## Customizable via 'config object'

Usage:

```
  <script>
    // create a config object
    const conf = {
      "key": "my_todo",                 // key name used in local storage
      "locale": "en-US",                // two letter language-country code (for local date formatting)
      "listname": "Personal To Do List" // name of the list
    };
    // call the showList() function
    showList(conf);
  </script>
```

If no config object is passed, the app will default to these values:
* Key = 'todo'
* Locale = 'en-US'
* List Name = 'To Do List'

And, you can invoke the list like this: 

```
<script>
showList();
</script>
```
## CDN Libraries vs Local Copies

The main app (index.html) defaults to libraries loaded from CDN links. These include: Bootstrap 5.3.2, Bootstrap Icons 1.11.3, and SortableJS v1.15.2.

Also included is a version (index-local.html) which uses local copies of these libraries. 

If you are only using the app online, and you assume your users will be connected to the Internet, you can remove these files & directories:

* index-local.html
* lib/

If you would like people to be able to use the app offline (not connected to the Internet) you can rename 'index.html' to something like 'index.old'. Then, rename the 'index-local.html' file to be 'index.html'. This will use local copies of the libraries located within the 'lib' folder. 

Feel free to use this app however you want in your own projects.


