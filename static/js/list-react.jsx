"use strict";


// window.location.href
// window.location.pathname
let username = document.getElementById('username').getAttribute('value');
let lst_id = document.getElementById('list_id').value;

ReactDOM.render(
    <ListItemContainer listId={ lst_id } username={ username }/>,
    document.getElementById("root")
);