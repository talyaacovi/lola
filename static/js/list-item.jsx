"use strict";


class ListItemContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {listItems: [], searchItems: []};
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

    // fetchSearchItems() {
    //     /route in flask to query yelp API for that search term
    // }

    // .on(submit 'search button') call fetchListItems

    render() {
        let listItems = [];

        for (let item of this.state.listItems) {
            listItems.push(<ListItem yelpid={item.yelp_id} itemid={item.item_id}
                rest={item.rest_name} category={item.yelp_category}
                url={item.yelp_url} image={item.image} key={item.item_id}/>);
        }

        return (<div id='list-items'>
                    {listItems}
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

}