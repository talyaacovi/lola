"use strict";

class ProfilePageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userLists: [], isListOpen: this.props.isListOpen, openListName: openListName, openListId: openListId, listItems: [], createList: false, newListName: '', newListStatus: 'draft'};
        this.handleClick = this.handleClick.bind(this);
        this.fetchUserLists = this.fetchUserLists.bind(this);
        this.fetchListItems = this.fetchListItems.bind(this);
        this.updateListItems = this.updateListItems.bind(this);
        this.displayCreate = this.displayCreate.bind(this);
        this.deleteList = this.deleteList.bind(this);
    }

    componentWillMount() {
        if (this.state.isListOpen) {
            this.fetchListItems(this.props.listname, this.props.listid);
        }
        this.fetchUserLists(this.props.username);
    }

    fetchUserLists() {
        fetch('/get-lists.json?username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({ userLists: data.userLists});
        });
    }

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

    fetchListItems(listname, listid) {
        fetch('/list-items.json?lst_id=' + listid)
        .then((response) => response.json())
        .then((data) => {
            this.setState({listItems: data.restaurants});
        });
    }

    updateListItems(restaurants) {
        this.setState({listItems: restaurants});
    }

    updateUserLists() {
        this.setState({ userLists: data.userLists} );
    }

    displayCreate() {
        this.setState({ createList: true });
    }

    updateInputValue(evt) {
        this.setState({newListName: evt.target.value});
    }

    deleteList(list) {
            let payload = new FormData();
            payload.append('list_id', list);

            fetch('/delete-list.json', {
                method: 'POST',
                body: payload,
                credentials: 'same-origin'
            }).then((response) => response.json())
            .then((data) => {
                document.getElementById('msg-para').innerHTML = data;
                history.pushState(null, null, `/users/${this.props.username}`);
                this.fetchUserLists();
                this.setState({isListOpen: false, openListId: null, openListName: ''});
            });
    }

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
        let openList;
        if (this.state.isListOpen === true) {
            openList = <List onDelete={this.deleteList} username={this.props.username} city={this.props.city} onUpdate={this.updateListItems} listid={this.state.openListId} listname={this.state.openListName} listitems={this.state.listItems}/>
        }

        let createListControls;

        if (this.state.createList === true) {
            createListControls =
                        <div id='create-list'>
                            <form className='form-group' onSubmit={this.createNewList.bind(this)}>
                                <label>Name</label>
                                <input className='form-control profile-form' name='list-name' value={this.state.newListName} onChange={this.updateInputValue.bind(this)} required></input>
                                <button className='btn btn-default'>Submit</button>
                            </form>
                        </div>
        }
        let createButton;

        if (viewingOwnPage && this.state.createList === false) {
            createButton =
                        <div>
                                <button onClick={this.displayCreate} className='btn btn-default'>Create New List</button>
                        </div>
        }

        return (
            <div>
                <User onNewList={this.updateUserLists} username={this.props.username} state={this.props.state} city={this.props.city}/>
                <h2>Lists</h2>
                {createButton}
                {createListControls}
                {this.state.userLists.map( (list) => {
                    return <ListLink key={list.list_id} onClick={this.handleClick} listid={list.list_id} listname={list.name} />
                })}
                {openList}
            </div>
            )
    };
}

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

ProfilePageContainer.propTypes = {
    listid: PropTypes.string,
    isListOpen: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    listname: PropTypes.string,
    state: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired
};


ReactDOM.render(
    <ProfilePageContainer listid={ data['list_id'] } isListOpen={isListOpen} username={ data['username'] } listname={ data['listname'] } city={ data['city'] } state={ data['state'] }/>,
    document.getElementById('root')
);
