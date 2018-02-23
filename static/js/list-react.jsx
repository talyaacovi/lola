"use strict";


// window.location.href
// need to do this in non-janky way:

// let url = window.location.pathname;
// let url_username = url.split('/')[2];
// let url_listname = url.split('/')[4];


// let username = document.getElementById('username').getAttribute('value');
// let lst_id = document.getElementById('list_id').value;
// let lst_name = document.getElementById('list_name').textContent;

ReactDOM.render(
    <ListItemContainer listId={data['list_id']} username={data['username']} lstName={data['list_name']}/>,
    document.getElementById("root")
);




// TO MOVE LISTS TO USER PAGE
// ListItemContainer component becomes List component
// create UserPageContainer component that will mount to root div of user profile page
        // states:
        //     isListOpen -- false
        //     openListId -- none, null
        // componentWillMount -- fetchLists for userID (with list_id data attribute)
        // render -- user name, create list if viewing own page, {lists}
        //         -- if isListOpen: also mount on render the <List component with listId = this.state.openListId>

        // onClick of list, change state to isListOpen = true and get listId, setState.openListId = listId

