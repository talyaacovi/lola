"use strict";


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



class UserPageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userLists: [], isListOpen: false, openListId: null, newListName: '', newListStatus: 'draft'};
        this.fetchUserListsAjax = this.fetchUserListsAjax.bind(this);
    }

    componentWillMount() {
        this.fetchUserListsAjax();

    }

    // GET USER LISTS USING AJAX

    fetchUserListsAjax() {
        $.get('/get-lists.json?username=' + this.props.username, (data) => {
            console.log(data);
            this.setState({userLists: data.userLists});
            // createUserLists(data.userLists);
        }
    );
    }

    updateInputValue(evt) {
        this.setState({newListName: evt.target.value});
    }

    createNewList(evt) {
        evt.preventDefault();

        let listName = this.state.newListName;
        let listStatus = this.state.newListStatus;

        let payload = new FormData();

        payload.append('list_name', listName);
        payload.append('status', listStatus);

        fetch('/add-list-react.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
                                        console.log('in create new list promise');
                                        if (data) {
                                            let currLists = this.state.userLists;
                                            currLists.push(data);
                                            this.setState({useLists: currLists});
                                            this.setState({newListName: ''});
                                        }
                                        else {
                                            alert('You already have a list with that name!');
                                        }
        });
    }


    // RENDER METHOD

    render() {

        let mainDiv = [];

        for (let i = 0; i < this.state.userLists.length; i++) {
                // let lst = this.state.userLists[i];
                let myDiv =
                    (<div key={i}>
                        <a data-list-id={this.state.userLists[i].list_id}>{this.state.userLists[i].name}</a>
                    </div>);
                mainDiv.push(myDiv);
            }

        // RENDER HEADING OF PAGE
        let cityUrl = '/cities/' + this.props.state.toUpperCase() + '/' + this.props.city.toLowerCase();
        let header =
                <div>
                    <p id='msg-para'></p>
                    <h1>{this.props.username}, a local of <a href={cityUrl}>{this.props.city}</a>.</h1>
                </div>


        let createListControls;

        // DISPLAY LIST CONTROLS IF USER IS VIEWING THEIR OWN PAGE

        if (viewingOwnPage) {
            createListControls =
                    <div>
                        <div id='create-list'>
                            <h3>Create a list</h3>
                            <form onSubmit={this.createNewList.bind(this)}>
                                <label>Name</label>
                                <input name='list-name' value={this.state.newListName} onChange={this.updateInputValue.bind(this)} required></input>
                                <button>Create List</button>
                            </form>
                        </div>
                    </div>
        }


        return (<div>
                    {header}
                    <div>
                        {createListControls}
                        <h3>Lists</h3>
                        {mainDiv}
                    </div>
                </div>);
    }
}


ReactDOM.render(
    <UserPageContainer listId={data['list_id']} username={data['username']} lstName={data['list_name']} city={data['city']} state={data['state']}/>,
    document.getElementById("root")
);



