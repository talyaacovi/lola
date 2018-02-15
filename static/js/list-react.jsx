"use strict";


// window.location.href
// let url = window.location.pathname
// let url_username = url.split('/')[2]
// let url_listname = url.split('/')[4]


let username = document.getElementById('username').getAttribute('value');
let lst_id = document.getElementById('list_id').value;

ReactDOM.render(
    <ListItemContainer listId={ lst_id } username={ username }/>,
    document.getElementById("root")
);


