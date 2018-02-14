"use strict";


// let currentlistitems = $.get....
// let username = document.getElementById('username').getAttribute('value');
let lst_id = document.getElementById('list_id').value;

ReactDOM.render(
    <ListItemContainer listId={ lst_id } />,
    document.getElementById("root")
);