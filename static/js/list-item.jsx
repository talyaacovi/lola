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
        fetch('/list-items-react.json?lst_id=' + this.props.listId) // have to add the list id onto the URL somehow...
        .then((response) => response.json())
        .then((data) => this.setState({listItems: data.restaurants})
            );
    }

    addListItem(newRestaurant) {
        alert(newRestaurant);
        // save new restaraunt to DB
        // add new restaurant to local state
        // ^ steps will trigger a render call which updates the UI
    }

    fetchSearchItems() {
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
            searchItems.push(<SearchItem yelpid={item.id} addRestaurantHandler={this.addListItem}
                rest={item.name} address={item.location} key={item.id}/>);
        }

        return (<div>
                    <div id='search-restaurants'>
                        <h2>Search for a restaurant you love in San Francisco!</h2>
                        <input value={this.state.inputValue} onChange={this.updateInputValue.bind(this)}></input>
                        <button onClick={this.fetchSearchItems.bind(this)}>Search</button>
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
        alert('in button click handler!');
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