"use strict";


// ListItemContainer is the parent component which attaches to the 'root' div
// and renders the ListItem and Search components.

class ListItemContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {listItems: [], searchItems: [], inputValue: '', editMode: false, listName: ''};
        // this.fetchListItems = this.fetchListItems.bind(this);
        // this.fetchListItemsAjax = this.fetchListItemsAjax.bind(this);
        this.checkLength = this.checkLength.bind(this);
    }

    // componentWillMount() {
    //     // this.fetchListItems();
    //     // this.fetchListItemsAjax();
    //     this.setState({listItems: this.props.listItems, listName: this.props.listName});

    // }

    // // GET LIST ITEMS USING AJAX

    // fetchListItemsAjax() {
    //     $.get('/list-items-react.json?lst_id=' + this.props.listId, (data) => {
    //         console.log(data);
    //         this.setState({listItems: data.restaurants});
    //         this.checkLength(data.restaurants);
    //     });


    // }

        componentWillReceiveProps(nextProps) {
            if (nextProps.listid !== this.props.listid) {
                this.setState({editMode: false});
            }

            // this.setState({listName: nextProps.listName});

            // console.log(this.state.listName);
        }



    // GET LIST ITEMS USING FETCH (doesn't work)

    // fetchListItems() {
    //     console.log('in fetch list items');

    //     fetch('/list-items-react.json?lst_id=' + this.props.listId, {cache: 'no-cache'})
    //     .then(() => console.log('in second promise'))
    //     .then((response) => response.json())
    //     .then((data) => this.setState({listItems: data.restaurants}))
    //     .catch(console.log.bind(console));
    // }


    // METHOD TO ADD A NEW RESTAURANT TO THE DB AND TO THE LIST

    addListItem(newRestaurant) {

        let payload = new FormData();
        payload.append('lst_id', this.props.listid);
        payload.append('yelp_id', newRestaurant);

        // FETCH IS A PROMISE!!!!

        fetch('/add-restaurant-react.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json()) // resolve is what promise says its going to return
        .then((data) => {
                                        if (data) {
                                            let currItems = this.state.listItems;
                                            currItems.push(data);
                                            this.setState({listItems: currItems});
                                        }
                                        else {
                                            alert('This restaurant already exists on this list!');
                                        }
                                        fetch('/instagram-react?yelp_id=' + newRestaurant)
                                        .then((results) => console.log('done with IG'));
        });

        this.setState({searchItems: []});
        this.setState({inputValue: ''});

    }

    // CHECK LENGTH OF LIST TO DETERMINE IF IT HAS REACHED LIMIT OF 20

    checkLength() {

        if (this.state.listItems.length < 20) {
            return true;
        }

        else {
            return false;
        }
    }

    // METHOD TO FETCH SEARCH ITEMS FROM YELP

    fetchSearchItems(evt) {
        evt.preventDefault();
        fetch(`/search-results-react.json?term=${this.state.inputValue}&username=${this.props.username}`)
        .then((response) => response.json())
        .then((data) => this.setState({searchItems: data.rests})
            );
    }

    updateInputValue(evt) {
        this.setState({inputValue: evt.target.value});
    }

    // METHOD TO TOGGLE EDIT MODE, WHICH HIDES AND DISPLAYS LIST EDIT CONTROLS

    toggleEditMode() {
        this.setState(prevState => ({editMode: !prevState.editMode}));
    }

    deleteList(evt) {
        var action = confirm('Are you sure you want to delete your list?');

        if (!action) {
            evt.preventDefault();
        }
    }

    // METHOD TO REMOVE AN ITEM FROM A LIST

    removeItem(evt) {

        let itemId = evt.target.getAttribute('item-id');
        let payload = new FormData();

        payload.append('item_id', itemId);
        payload.append('lst_id', this.props.listId);

        fetch('/delete-restaurant-react.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
            this.setState({listItems: data.restaurants});
        });
    }

    // RENDER METHOD

    render() {

        // RENDER HEADING OF PAGE
        console.log('rendering list item container again');

        let header =
                <div>
                    <h1 id='list_name'>{data['list_name']}</h1>
                    <input readOnly hidden id='list_id' name='list_id' value={data['list_id']}></input>
                    <input readOnly hidden id='username' name='username' value={data['username']}></input>
                </div>

        // CREATING LIST ITEM COMPONENTS
        // let listItems = [];
        // for (let i = 0; i < this.state.listItems.length; i++) {

        //     let item = this.state.listItems[i];

        //     listItems.push(<ListItem yelpid={item.yelp_id} itemid={item.item_id}
        //         rest={item.rest_name} category={item.yelp_category}
        //         url={item.yelp_url} image={item.image} key={item.yelp_id}/>);

        //     if (this.state.editMode) {
        //         listItems.push(<button className='del-btn' onClick={this.removeItem.bind(this)} item-id={item.item_id} key={i}>Remove Restaurant</button>);
        //     }
        // }

        let listItems = [];
        for (let i = 0; i < this.props.listItems.length; i++) {

            let item = this.props.listItems[i];

            listItems.push(<ListItem yelpid={item.yelp_id} itemid={item.item_id}
                rest={item.rest_name} category={item.yelp_category}
                url={item.yelp_url} image={item.image} key={item.yelp_id}/>);

            if (this.state.editMode) {
                listItems.push(<button className='del-btn' onClick={this.removeItem.bind(this)} item-id={item.item_id} key={i}>Remove Restaurant</button>);
            }
        }


        let searchControls;

        let searchItems = [];

        // CREATING SEARCH ITEM COMPONENTS

        for (let item of this.state.searchItems) {
            searchItems.push(<SearchItem yelpid={item.id} addRestaurantHandler={this.addListItem.bind(this)}
                rest={item.name} address={item.location} key={item.id}/>);
        }

        // DISPLAY SEARCH CONTROLS IF EDIT MODE ENABLED AND LIST LENGTH < 20

        if (this.state.editMode && this.checkLength(this.state.listItems)) {
            searchControls =
                    <div>
                        <div id='search-restaurants'>
                            <h2>Search for a restaurant you love in San Francisco!</h2>
                            <form onSubmit={this.fetchSearchItems.bind(this)}>
                                <input name='term' value={this.state.inputValue} onChange={this.updateInputValue.bind(this)}></input>
                                <button>Search</button>
                            </form>
                        </div>
                        <div id='results-div'>
                            {searchItems}
                        </div>
                    </div>

        }

        let buttonText;
        let listControls;

        if (this.state.editMode) {
            buttonText = 'Save List';
        }

        else {
            buttonText = 'Edit List';
        }

        // DISPLAY DELETE LIST BUTTON IF USER VIEWING OWN PAGE AND IT IS NOT
        // THEIR FAVORITES LIST

        let deleteControl;

        // if (this.state.editMode && this.state.listName != 'favorites') {
        if (this.state.editMode && this.props.listName != 'favorites') {
            deleteControl =
                    <div>
                        <div id='del-list'>
                            <form action='/delete-list' method='POST' onSubmit={this.deleteList.bind(this)}>
                                <input type='hidden' name='list_id' value={this.props.listId}></input>
                                <button>Delete List</button>
                            </form>
                        </div>
                    </div>
        }

        // DISPLAY LIST CONTROLS IF USER IS VIEWING THEIR OWN PAGE

        if (viewingOwnPage) {
            listControls =
                    <div>
                        <div id='edit-list'>
                            <button onClick={this.toggleEditMode.bind(this)}>{ buttonText }</button>
                        </div>
                        {deleteControl}
                        {searchControls}
                    </div>
        }

        // DISPLAY SEND LIST BUTTON

        let sendList =
                <div id='email-list'>
                    <button id='email-list' data-toggle='modal' data-target='#emailModal'>Send List</button>
                </div>

        return (<div>
                    {header}
                    {sendList}
                    {listControls}
                    <div id='list-items'>
                        {listItems}
                    </div>
                </div>);
    }
}

class ListItem extends React.Component {
    render() {
        return (<div data-yelp-id={ this.props.yelpid } data-item-id={ this.props.itemid }>
                    <h3>{ this.props.rest }</h3>
                    <p>{ this.props.category }</p>
                    <a href={ this.props.url }>Yelp</a>
                    <div className='yelp-img'>
                        <img src={ this.props.image }/>
                    </div>
                </div>
            );
    }
}

class SearchItem extends React.Component {
    buttonClickHandler() {
        this.props.addRestaurantHandler(this.props.yelpid);
    }
    render() {
        return (<div data-yelp-id={ this.props.yelpid }>
                    <p>{ this.props.rest }</p>
                    <p>{ this.props.address }</p>
                    <button onClick={this.buttonClickHandler.bind(this)} data-yelp-id={ this.props.yelpid } className='add-btn'>Add Restaurant</button>
                </div>
            );
    }

}