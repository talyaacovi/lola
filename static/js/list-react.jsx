"use strict";


// window.location.href
// need to do this in non-janky way:

// let url = window.location.pathname;
// let url_username = url.split('/')[2];
// let url_listname = url.split('/')[4];


let username = document.getElementById('username').getAttribute('value');
let lst_id = document.getElementById('list_id').value;
let lst_name = document.getElementById('list_name').textContent;

ReactDOM.render(
    <ListItemContainer listId={ lst_id } username={ username } lstName={ lst_name }/>,
    document.getElementById("root")
);


