"use strict";


class UserPageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userLists: [], isListOpen: false, openListName: '', openListId: null, newListName: '', newListStatus: 'draft', listItems: []};
        this.fetchUserListsAjax = this.fetchUserListsAjax.bind(this);
        this.fetchListItemsAjax = this.fetchListItemsAjax.bind(this);
    }

    componentWillMount() {
        this.fetchUserListsAjax();
    }

    // GET USER LISTS USING AJAX

    fetchUserListsAjax() {
        $.get('/get-lists.json?username=' + this.props.username, (data) => {
            this.setState({userLists: data.userLists});
            if (this.props.list_id > 0) {
                this.setState({isListOpen: true, openListId: this.props.list_id});
                this.fetchListItemsAjax(this.props.list_id, this.props.listname);
            }
        }
    );
    }

    fetchListItemsAjax(listid, listname) {
        $.get('/list-items-react.json?lst_id=' + listid, (data) => {
            this.setState({listItems: data.restaurants, isListOpen: true, openListId: listid, openListName: listname});
            history.pushState(null, null, `/users/react/${this.props.username}/${this.state.openListName.toLowerCase()}`);
        });


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
                    mainDiv.push(<li key={i}><ListLink listid={this.state.userLists[i].list_id} listname={this.state.userLists[i].name} displayListHandler={this.fetchListItemsAjax.bind(this)}/></li>);
            }


        // RENDER HEADING OF PAGE

        let header =
                <div>
                    <User username={this.props.username} city={this.props.city} state={this.props.state}/>
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


        let openListItems


        if (this.state.isListOpen) {
            openListItems =
                <div>
                    <List listItems={this.state.listItems} listName={this.state.openListName} username={this.props.username} listid={this.state.openListId}/>
                </div>
        }

        return (<div>
                    {header}
                    <div>
                        {createListControls}
                        <h3>Lists</h3>
                        <ul className='list-unstyled'>
                            {mainDiv}
                        </ul>
                    </div>
                    <div>
                        {openListItems}
                    </div>
                </div>);
    }
}

class ListLink extends React.Component {
    buttonClickHandler() {
        this.props.displayListHandler(this.props.listid, this.props.listname);
    }
    render() {
        return (<div>
                    <a onClick={this.buttonClickHandler.bind(this)} data-list-id={this.props.listid}>{this.props.listname}</a>
                </div>
            );
    }
}


ReactDOM.render(
    <UserPageContainer list_id={data['list_id']} username={data['username']} listname={data['listname']} city={data['city']} state={data['state']}/>,
    document.getElementById("root")
);



