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
            history.pushState(null, null, `/users/react-new/${this.props.username}/${listname.toLowerCase()}`);
            this.fetchListItems(listname, listid);
            this.setState({isListOpen: true, openListId: listid, openListName: listname});
        }
    }

    fetchListItems(listname, listid) {
        fetch('/list-items-react.json?lst_id=' + listid)
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

            fetch('/delete-list', {
                method: 'POST',
                body: payload,
                credentials: 'same-origin'
            }).then((response) => response.json())
            .then((data) => {
                console.log(data);
                document.getElementById('msg-para').innerHTML = data;
                history.pushState(null, null, `/users/react-new/${this.props.username}`);
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
                                            this.setState({userLists: currLists});
                                            this.setState({newListName: ''});
                                        }
                                        else {
                                            alert('You already have a list with that name!');
                                        }
        });
    }


    // before rendering, check if listname exists and if so, set state for isListOpen to true, fetch list ID using username and list name
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
                                <input className='form-control' name='list-name' value={this.state.newListName} onChange={this.updateInputValue.bind(this)} required></input>
                                <button onClick={this.displayCreate} className='btn btn-default'>Submit</button>
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





class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {searchItems: [], inputValue: '', editMode: false};
        this.removeItem = this.removeItem.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.listid !== this.props.listid) {
            this.setState({editMode: false});
        }
    }



    toggleEditMode() {
        this.setState(prevState => ({editMode: !prevState.editMode}));

    }

    removeItem(item) {
        let payload = new FormData();

        payload.append('item_id', item);
        payload.append('lst_id', this.props.listid);

        fetch('/delete-restaurant-react.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
            this.props.onUpdate(data.restaurants);
        });
    }

    updateInputValue(evt) {
        this.setState({inputValue: evt.target.value});
        console.log(this.state.inputValue);
    }

    fetchSearchItems(evt) {
        evt.preventDefault();
        fetch('/search-results-react.json?term=' + this.state.inputValue + '&username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({searchItems: data.rests})
        });
    }



    addRestaurant(newRestaurant) {

        let payload = new FormData();
        payload.append('lst_id', this.props.listid);
        payload.append('yelp_id', newRestaurant);


        fetch('/add-restaurant-react.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json()) // resolve is what promise says its going to return
        .then((data) => {
                                        if (data) {
                                            console.log(data);
                                            let currItems = this.props.listitems;
                                            currItems.push(data);
                                            this.props.onUpdate(currItems);

                                        }
                                        else {
                                            alert('This restaurant already exists on this list!');
                                        }
                                        fetch('/instagram-react?yelp_id=' + newRestaurant)
        });

        this.setState({searchItems: [], inputValue: ''});
    }

    deleteListHandler(evt) {
        var action = confirm('Are you sure you want to delete your list?');

        if (!action) {
            evt.preventDefault();
        }
        else {
            console.log(evt.target);
            let listid = evt.target.getAttribute('listid');
            this.props.onDelete(listid);
        }
    }

    render() {

        let listControls;
        let buttonText;
        let searchControls;




        if (this.state.editMode === true) {
            buttonText = 'Save List';
            searchControls =
                    <div>
                        <div id='search-restaurants'>
                            <h3>Search for a restaurant you love in {this.props.city}!</h3>
                            <form className='form-group' onSubmit={this.fetchSearchItems.bind(this)}>
                                <input className='form-control' name='term' value={this.state.inputValue} onChange={this.updateInputValue.bind(this)}></input>
                                <button className='btn btn-default'>Search</button>
                            </form>
                        </div>
                        <div id='results-div'>
                            {this.state.searchItems.map( (item, i) => {
                                return <SearchItem onClick={this.addRestaurant.bind(this)} yelpid={item.id} key={'rest_' + i} rest={item.name} address={item.location}/>
                            })}
                        </div>
                    </div>
        }
        else {
            buttonText = 'Edit List';
        }



        if (viewingOwnPage) {
             listControls =
                        <div id='edit-list'>
                            <button className='btn btn-default' onClick={this.toggleEditMode.bind(this)}>{ buttonText }</button>
                        </div>
        }


        let deleteControl;

        // if (this.state.editMode && this.state.listName != 'favorites') {
        if (this.state.editMode === true && this.props.listname != 'Favorites') {
            deleteControl =
                        <div id='del-list'>
                                <button onClick={this.deleteListHandler.bind(this)} listid={this.props.listid} className='btn btn-default'>Delete List</button>
                        </div>
        }


        let sendList =
                <div id='email-list'>
                    <button className='btn btn-default' data-toggle='modal' data-target='#emailModal'>Send List</button>
                </div>

        return (
                <div>
                    <h2>{this.props.listname}</h2>
                    {sendList}
                    {listControls}
                    {deleteControl}
                    {searchControls}
                    {this.props.listitems.map( (rest, i) => {
                        return <ListItem onClick={this.removeItem} editing={this.state.editMode} key={'rest_' + i} yelpid={rest.yelp_id} itemid={rest.item_id}
                        rest={rest.rest_name} category={rest.yelp_category} url={rest.yelp_url} rest_url={'/restaurants/' + rest.yelp_id} image={rest.image} />
                    })}
                </div>
            )
    }
}

class ListItem extends React.Component {
    constructor(props) {
        super(props);
        this.deleteItemHandler = this.deleteItemHandler.bind(this);
    }

    deleteItemHandler(evt) {
        let item = evt.target.getAttribute('item-id');
        this.props.onClick(item)
    }


    render() {
        let delButton;
        if (this.props.editing === true) {
            delButton = <button className='del-btn btn btn-default' onClick={this.deleteItemHandler} item-id={this.props.itemid}>Remove Restaurant</button>;
        }
        return (<div data-yelp-id={ this.props.yelpid } data-item-id={ this.props.itemid }>
                    <div className='yelp-img'>
                        <img src={ this.props.image }/>
                    </div>
                    <div className='yelp-info'>
                        <h3><a href={ this.props.rest_url }>{ this.props.rest }</a></h3>

                        <p>{ this.props.category }</p>
                        <a href={ this.props.url }>Yelp</a>

                    </div>
                    <div>
                        {delButton}
                    </div>

                </div>
            );
    }
}

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editMode: false, profileImage: ''};
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.fetchUserProfileImage = this.fetchUserProfileImage.bind(this);
    }

    componentDidMount() {
        this.fetchUserInfo();
        this.fetchUserProfileImage();
    }

    fetchUserInfo() {
        fetch('/user-info-react.json?username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            let userData = {favDish: data.fav_dish, favCity: data.fav_city, favRest: data.fav_rest};
            return userData;
        })
    }

    updateInputValue(evt) {
        this.setState({newListName: evt.target.value});
    }



    fetchUserProfileImage() {
        fetch('/user-profile-image.json?username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({profileImage: '/static/uploads/' + data});
        });
    }


    render() {
        let cityUrl = '/cities/' + this.props.state.toUpperCase() + '/' + this.props.city.toLowerCase();
        let header =
                <div>
                    <p id='msg-para'></p>
                    <h1>{this.props.username}, a local of <a href={cityUrl}>{this.props.city}</a>.</h1>
                    <img className='profile-image' src={this.state.profileImage}/>
                </div>

        return (
            <div>
                { header }
            </div>
        )
    }

}


class ListLink extends React.Component {
    buttonClickHandler(evt) {
        this.props.onClick(this.props.listname, this.props.listid);
    }
    render() {
        return (<div>
                    <a onClick={this.buttonClickHandler.bind(this)} data-list-id={this.props.listid}>{this.props.listname}</a>
                </div>
            );
    }
}


class SearchItem extends React.Component {
    buttonClickHandler(evt) {
        let item = evt.target.getAttribute('data-yelp-id');
        this.props.onClick(item);
    }
    render() {
        return (<div data-yelp-id={ this.props.yelpid }>
                    <p>{ this.props.rest }</p>
                    <p>{ this.props.address }</p>
                    <button className='btn btn-default' onClick={this.buttonClickHandler.bind(this)} data-yelp-id={ this.props.yelpid } className='add-btn'>Add Restaurant</button>
                </div>
            );
    }

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




ReactDOM.render(
    <ProfilePageContainer listid={ data['list_id'] } isListOpen={isListOpen} username={ data['username'] } listname={ data['listname'] } city={ data['city'] } state={ data['state'] }/>,
    document.getElementById('root')
);
