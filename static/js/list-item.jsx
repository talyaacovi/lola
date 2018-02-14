"use strict";


class ListItemContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {listItems: []};
        this.fetchListItems = this.fetchListItems.bind(this);
    }

    componentWillMount() {
        console.log('hi i\'m mounting');
        this.fetchListItems();
        console.log('after fetch!');
    }

    fetchListItems() {
        fetch('/list-items-react.json?username=' + this.props.username + '&lst_id=' + this.props.listId) // have to add the list id onto the URL somehow...
        .then((response) => response.json())
        .then((data) => this.setState({listItems: data.restaurants})
            );
        }

    render() {
        console.log('rendering!');
        console.log(this.state.listItems);
        let listItems = [];
        //let myListItemComponents = [<ListItem />, <ListItem />, ...]
        // access this.state.listItems and loop over
        for (let item of this.state.listItems) {
            console.log(item);
            listItems.push(<ListItem yelpid={item.yelp_id} itemid={item.item_id}
                rest={item.rest_name} category={item.yelp_category}
                url={item.yelp_url} image={item.image}/>);
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