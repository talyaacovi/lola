"use strict";


class ListItemContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {listItems: [], searchItems: [], inputValue: ''};
        this.fetchListItems = this.fetchListItems.bind(this);
    }

    componentWillMount() {
        this.fetchListItems();
    }

    fetchListItems() {
        fetch('/list-items-react.json?lst_id=' + this.props.listId)
        .then((response) => response.json())
        .then((data) => this.setState({listItems: data.restaurants})
            );
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
                alert('this restaurant already exists on this list!');
                }
            });
    }




// fetch('/add-restaurant-react.json', {
//     method: 'POST',
//     headers: {'Content-Type': 'application/json'},
//     body: {
//         'lst_id': this.props.listId,
//         'yelp_id': newRestaurant
//     }
// });





    fetchSearchItems(evt) {
        evt.preventDefault();
        fetch(`/search-results-react.json?term=${this.state.inputValue}&username=${this.props.username}`)
        .then((response) => response.json())
        .then((data) => this.setState({searchItems: data.rests})
            );
    }

    updateInputValue(evt) {
        // debugger;
        this.setState({inputValue: evt.target.value});
    }

    render() {
        let listItems = [];

        for (let item of this.state.listItems) {
            listItems.push(<ListItem yelpid={item.yelp_id} itemid={item.item_id}
                rest={item.rest_name} category={item.yelp_category}
                url={item.yelp_url} image={item.image} key={item.item_id}/>);
        }

        let searchItems = [];

        for (let item of this.state.searchItems) {
            searchItems.push(<SearchItem yelpid={item.id} addRestaurantHandler={this.addListItem.bind(this)}
                rest={item.name} address={item.location} key={item.id}/>);
        }
// change button onClick to form onSubmit!
        return (<div>
                    <div id='list-header'>

                    </div>
                    <div id='search-restaurants'>
                        <h2>Search for a restaurant you love in San Francisco!</h2>
                        <form onSubmit={this.fetchSearchItems.bind(this)}>
                            <input value={this.state.inputValue} onChange={this.updateInputValue.bind(this)}></input>
                            <button>Search</button>
                        </form>
                    </div>
                    <div id='results-div'>
                        {searchItems}
                    </div>
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