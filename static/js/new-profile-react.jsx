"use strict";


class ProfilePageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userLists: [], isListOpen: this.props.isListOpen, openListName: '', openListId: null, listItems: []};
        this.handleClick = this.handleClick.bind(this);
        this.fetchUserLists = this.fetchUserLists.bind(this);
        this.fetchListItems = this.fetchListItems.bind(this);
        this.updateListItems = this.updateListItems.bind(this);
    }

    componentWillMount() {
        if (this.state.isListOpen) {
            this.fetchListItems(this.props.listname, this.props.listid);
        }
        this.fetchUserLists(this.props.username);
    }

    fetchUserLists(username) {
        fetch('/get-lists.json?username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({ userLists: data.userLists, isListOpen: true, openListName: this.props.listname, openListId: this.props.listid});
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


    // before rendering, check if listname exists and if so, set state for isListOpen to true, fetch list ID using username and list name
    render() {
        let openList;
        if (this.state.isListOpen === true) {
            openList = <List username={this.props.username} city={this.props.city} onUpdate={this.updateListItems} listid={this.state.openListId} listname={this.state.openListName} listitems={this.state.listItems}/>
        }

        return (
            <div>
                <User username={this.props.username} state={this.props.state} city={this.props.city}/>
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
        // this.checkLength = this.checkLength.bind(this);
        this.removeItem = this.removeItem.bind(this);
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

        let sendList =
                <div id='email-list'>
                    <button className='btn btn-default' id='email-list' data-toggle='modal' data-target='#emailModal'>Send List</button>
                </div>

        return (
                <div>
                    <h1>{this.props.listname}</h1>
                    {listControls}
                    {sendList}
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
        this.state = { editMode: false, profileImage: '' };
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
if (data['listname'] !== 'None') {
    isListOpen = true;
}

else {
    isListOpen = false;
}




ReactDOM.render(
    <ProfilePageContainer listid={ data['list_id'] } isListOpen={isListOpen} username={ data['username'] } listname={ data['listname'] } city={ data['city'] } state={ data['state'] }/>,
    document.getElementById('root')
);
