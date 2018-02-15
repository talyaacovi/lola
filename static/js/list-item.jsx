"use strict";


// how to add elements to the page, specifically messages like 'this item
// already exists' or 'this item was deleted'

class ListItemContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {listItems: [], searchItems: [], inputValue: '', editMode: false};
        // this.fetchListItems = this.fetchListItems.bind(this);
        this.fetchListItemsAjax = this.fetchListItemsAjax.bind(this);
        this.checkLength = this.checkLength.bind(this);
    }

    componentWillMount() {
        // this.fetchListItems();
        this.fetchListItemsAjax();

    }

    // GET LIST ITEMS USING FETCH

    // fetchListItems() {
    //     fetch('/list-items-react.json?lst_id=' + this.props.listId)
    //     .then((response) => response.json())
    //     .then((data) => this.setState({listItems: data.restaurants})
    //         );
    // }

    // GET LIST ITEMS USING AJAX

    fetchListItemsAjax() {
        $.get('/list-items-react.json?lst_id=' + this.props.listId, (data) => {
            this.setState({listItems: data.restaurants});
            this.checkLength(data.restaurants);
        });


    }


    addListItem(newRestaurant) {

        let payload = new FormData();
        payload.append('lst_id', this.props.listId);
        payload.append('yelp_id', newRestaurant);

        fetch('/add-restaurant-react.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
            if (data) {
                let currItems = this.state.listItems;
                currItems.push(data);
                this.setState({listItems: currItems});
            }
            else {
                alert('This restaurant already exists on this list!');
                }
            });

        this.setState({searchItems: []});
        this.setState({inputValue: ''});
    }

    checkLength() {

        if (this.state.listItems.length < 20) {
            return true;
        }

        else {
            return false;
        }
    }


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

    toggleEditMode() {
        this.setState(prevState => ({editMode: !prevState.editMode}));
    }

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

    render() {
        let listItems = [];
        for (let i = 0; i < this.state.listItems.length; i++) {

            let item = this.state.listItems[i];

            listItems.push(<ListItem yelpid={item.yelp_id} itemid={item.item_id}
                rest={item.rest_name} category={item.yelp_category}
                url={item.yelp_url} image={item.image} key={item.item_id}/>);

            if (this.state.editMode) {
                listItems.push(<button className='del-btn' onClick={this.removeItem.bind(this)} item-id={item.item_id} key={i}>Remove Restaurant</button>);
            }
        }

        let searchItems = [];

        for (let item of this.state.searchItems) {
            searchItems.push(<SearchItem yelpid={item.id} addRestaurantHandler={this.addListItem.bind(this)}
                rest={item.name} address={item.location} key={item.id}/>);
        }

        let buttonText;
        let listControls;
        let searchControls;

        if (this.state.editMode) {
            buttonText = 'Save List';
        }

        else {
            buttonText = 'Edit List';
        }

        if (this.checkLength(this.state.listItems)) {
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

        if (viewingOwnPage) {
            listControls =
                    <div>
                        <div id='edit-list'>
                            <button onClick={this.toggleEditMode.bind(this)}>{ buttonText }</button>
                        </div>
                    </div>
        }

        return (<div>
                    {listControls}
                    {searchControls}
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