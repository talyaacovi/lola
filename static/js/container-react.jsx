"use strict";

// instructions for creating a ProfilePageContainer component
class ProfilePageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userLists: [],
                      isListOpen: this.props.isListOpen,
                      openListName: openListName,
                      openListId: openListId,
                      listItems: [],
                      createList: false,
                      newListName: '',
                      newListStatus: 'draft'};
        this.handleClick = this.handleClick.bind(this);
        this.fetchUserLists = this.fetchUserLists.bind(this);
        this.fetchListItems = this.fetchListItems.bind(this);
        this.updateListItems = this.updateListItems.bind(this);
        this.displayCreate = this.displayCreate.bind(this);
        this.deleteList = this.deleteList.bind(this);
    }

    // check if a specific list is being requested before component mounts and
    // fetch list items if true.
    // also fetch all the user's lists before the component mounts.
    componentWillMount() {
        if (this.state.isListOpen) {
            this.fetchListItems(this.props.listname, this.props.listid);
        }
        this.fetchUserLists(this.props.username);
    }

    // method to fetch the lists belonging to a specific user
    fetchUserLists() {
        fetch('/get-lists.json?username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({ userLists: data.userLists});
        });
    }

    // when a user clicks on a list, close that list if it is already open,
    // otherwise fetch the list items and update URL with open list name
    handleClick(listname, listid) {
        if (this.state.isListOpen === true && this.state.openListName === listname) {
            this.setState({ isListOpen: false, openListName: '' })
        }
        else {
            history.pushState(null, null, `/users/${this.props.username}/${listname.toLowerCase()}`);
            this.fetchListItems(listname, listid);
            this.setState({isListOpen: true, openListId: listid, openListName: listname});
        }
    }

    // method to fetch the list items belonging to a specific list
    fetchListItems(listname, listid) {
        fetch('/list-items.json?lst_id=' + listid)
        .then((response) => response.json())
        .then((data) => {
            this.setState({listItems: data.restaurants});
        });
    }

    // method to update the list items for the currently displayed list
    updateListItems(restaurants) {
        this.setState({listItems: restaurants});
    }

    // method to update the displayed lists when user adds or deletes one
    updateUserLists() {
        this.setState({ userLists: data.userLists} );
    }

    // method to display form when 'create new list' button is clicked
    displayCreate() {
        this.setState({ createList: true });
    }

    // method to keep track of new list name as user is typing
    updateInputValue(evt) {
        this.setState({newListName: evt.target.value});
    }

    // method to delete a list from the page and database
    deleteList(list) {
            let payload = new FormData();
            payload.append('list_id', list);

            fetch('/delete-list.json', {
                method: 'POST',
                body: payload,
                credentials: 'same-origin'
            }).then((response) => response.json())
            .then((data) => {
                $('#restaurant-alert').show().append(data);
                history.pushState(null, null, `/users/${this.props.username}`);
                this.fetchUserLists();
                this.setState({isListOpen: false, openListId: null, openListName: ''});
            });
    }

    // method to add a list to the page and database
    createNewList(evt) {
        evt.preventDefault();

        let listName = this.state.newListName;
        let listStatus = this.state.newListStatus;

        let payload = new FormData();

        payload.append('list_name', listName);
        payload.append('status', listStatus);

        fetch('/add-list.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
                        if (data) {
                            let currLists = this.state.userLists;
                            currLists.push(data);
                            this.setState({isListOpen: true, listItems: [], userLists: currLists, newListName: '', openListName: data.name, openListId: data.list_id, createList: false});
                            history.pushState(null, null, `/users/${this.props.username}/${data.name.toLowerCase()}`);
                        }
                        else {
                            alert('You already have a list with that name!');
                        }
        });
    }

    render() {

        // if a list is open, instantiate a List component with the list items
        let openList;

        if (this.state.isListOpen === true) {
            openList = <List onDelete={this.deleteList} username={this.props.username} city={this.props.city} onUpdate={this.updateListItems} listid={this.state.openListId} listname={this.state.openListName} listitems={this.state.listItems}/>
        }

        // if a user is viewing their own page, show the Create New List button
        let createButton;

        if (viewingOwnPage && this.state.createList === false) {
            createButton =
                        <div className='create-list'>
                                <button onClick={this.displayCreate} className='btn btn-default'>Create New List</button>
                        </div>
        }

        // if a user clicks on Create New List button, display form
        let createListControls;

        if (this.state.createList === true) {
            createListControls =
                        <div id='create-list'>
                            <form className='form-group' onSubmit={this.createNewList.bind(this)}>
                                <label>Name</label>
                                <input className='form-control profile-form' name='list-name' value={this.state.newListName} onChange={this.updateInputValue.bind(this)} required></input>
                                <button className='btn btn-default create-btn'>Submit</button>
                            </form>
                        </div>
        }

        let cityUrl = '/cities/' + this.props.state.toUpperCase() + '/' + this.props.city.toLowerCase();

        // return instantiates User component, ListLink components, and other
        // elements defined in render() method
        return (
            <div>
                <div className='row'>
                    <div className='col-xs-12 col-lg-12'>
                        <h1 style={{ display: 'inline' }} data-username={this.props.username}>{this.props.username}, a local of <a href={cityUrl}><span className='profile-city'>{this.props.city}</span></a>.</h1>
                        <User onNewList={this.updateUserLists} username={this.props.username} state={this.props.state} city={this.props.city}/>
                        {/*<div className='lists'>*/}
                    </div>
                </div>
                <div className='row col-xs-12 col-lg-4'>
                        <h2>Lists</h2>
                            {this.state.userLists.map( (list) => {
                                return <ListLink key={list.list_id} onClick={this.handleClick} listid={list.list_id} listname={list.name} />
                            })}
                        {createButton}
                        {createListControls}
                </div>
                {openList}
            </div>
            )
    };
}


// check if a list is open and pass in as props when instantiating the
// ProfilePageContainer component
let isListOpen;
let openListName;
let openListId;

if (data['listname'] !== 'None') {
    isListOpen = true;
    openListName = data['listname'];
    openListId = data['list_id'];
}

else {
    isListOpen = false;
}

// check ProfilePageContainer prop types
ProfilePageContainer.propTypes = {
    listid: PropTypes.string,
    isListOpen: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    listname: PropTypes.string,
    state: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired
};

// instantiate ProfilePageContainer component and render to DOM
ReactDOM.render(
    <ProfilePageContainer listid={ data['list_id'] } isListOpen={isListOpen} username={ data['username'] } listname={ data['listname'] } city={ data['city'] } state={ data['state'] }/>,
    document.getElementById('root')
);
