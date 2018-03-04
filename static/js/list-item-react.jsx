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
            delButton = <div><button className='del-btn btn btn-default' onClick={this.deleteItemHandler} item-id={this.props.itemid}>Remove</button></div>;
        }
        return (<div data-yelp-id={ this.props.yelpid } data-item-id={ this.props.itemid }>
                    <div className='yelp-img' style={{ verticalAlign: 'text-top' }}>
                        <img src={ this.props.image }/>

                    </div>
                    <div className='yelp-info'>
                        <p><a href={ this.props.rest_url }>{ this.props.rest }</a> - <span style={{ fontSize: 10 }}>{ this.props.category }</span></p>
                    </div>
                    {delButton}
                </div>
            );
    }
}