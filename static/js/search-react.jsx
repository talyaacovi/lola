"use strict";

// instructions for creating a SearchItem component
class SearchItem extends React.Component {
    buttonClickHandler(evt) {
        let item = evt.target.getAttribute('data-yelp-id');
        this.props.onClick(item);
    }
    render() {
        return (<div data-yelp-id={ this.props.yelpid }>
                    <p>{ this.props.rest }</p>
                    <p>{ this.props.address }</p>
                    <button className='btn btn-default add-btn'
                        onClick={this.buttonClickHandler.bind(this)}
                        data-yelp-id={ this.props.yelpid }>
                        Add
                    </button>
                </div>
            );
    }

}