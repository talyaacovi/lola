"use strict";

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
                        <a href={ this.props.url } target='_blank'>Yelp</a>

                    </div>
                    <div>
                        {delButton}
                    </div>

                </div>
            );
    }
}