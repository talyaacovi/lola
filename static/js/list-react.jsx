"use strict";

// instructions for creating a List component
class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {searchItems: [], inputValue: '', editMode: false};
        this.removeItem = this.removeItem.bind(this);
    }

    // reset edit mode to false if rendering new list
    componentWillReceiveProps(nextProps) {
        if (nextProps.listid !== this.props.listid) {
            this.setState({editMode: false});
        }
    }

    // method to toggle edit mode of list
    toggleEditMode() {
        this.setState(prevState => ({editMode: !prevState.editMode}));

    }

    // method to remove item from list on page and in database
    removeItem(item) {
        let payload = new FormData();

        payload.append('item_id', item);
        payload.append('lst_id', this.props.listid);

        fetch('/delete-restaurant.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
            this.props.onUpdate(data.restaurants);
        });
    }

    // method to keep track of search query as user is typing
    updateInputValue(evt) {
        this.setState({inputValue: evt.target.value});
    }

    // method to fetch search results after user has submitted query
    fetchSearchItems(evt) {
        evt.preventDefault();
        fetch('/search-results.json?term=' + this.state.inputValue + '&username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({searchItems: data.rests})
        });
    }

    // method to add a new restaurant to the list and database
    addRestaurant(newRestaurant) {
        let payload = new FormData();
        payload.append('lst_id', this.props.listid);
        payload.append('yelp_id', newRestaurant);


        fetch('/add-restaurant.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json())
        .then((data) => {
                                        if (data) {
                                            let currItems = this.props.listitems;
                                            currItems.push(data);
                                            this.props.onUpdate(currItems);
                                            $('#restaurant-alert').show();
                                            $('.tsitsi').empty().append(data.rest_name + ' has been added to your list.');

                                        }
                                        else {
                                            alert('This restaurant already exists on this list!');
                                        }
                                        fetch('/instagram-photos?yelp_id=' + newRestaurant)
        });

        this.setState({searchItems: [], inputValue: ''});
    }

    // method to handle deleting a list, calling function from
    // ProfilePageContainer component
    deleteListHandler(evt) {
        var action = confirm('Are you sure you want to delete your list?');

        if (!action) {
            evt.preventDefault();
        }
        else {
            let listid = evt.target.getAttribute('listid');
            this.props.onDelete(listid);
        }
    }

    render() {

        // if edit mode is true and it is not a 'Favorites' page, display the
        // delete button
        let deleteControl;

        if (this.state.editMode === true && this.props.listname != 'Favorites') {
            deleteControl =
                        <div id='del-list'>
                                <button onClick={this.deleteListHandler.bind(this)}
                                    listid={this.props.listid}
                                    className='btn btn-default'>
                                    Delete List
                                </button>
                        </div>
        }

        // if edit mode is true, display search controls and update button text
        // to Save List, otherwise display button text Edit List
        let buttonText;
        let searchControls;
        let searchMsg;

        if (this.state.editMode === true && this.props.listitems.length < 20) {
            buttonText = 'Save List';
            searchControls =
                    <div>
                        <div id='search-restaurants col-xs-4'>
                            <h2>Search:</h2>
                            <form className='form-group' onSubmit={this.fetchSearchItems.bind(this)}>
                                <input className='form-control profile-form'
                                    name='term'
                                    value={this.state.inputValue}
                                    onChange={this.updateInputValue.bind(this)}>
                                </input>
                                {/*<button className='btn btn-default'>Search</button>*/}
                            </form>
                        </div>
                        <div id='results-div'>
                            {this.state.searchItems.map( (item, i) => {
                                return <SearchItem onClick={this.addRestaurant.bind(this)}
                                            yelpid={item.id}
                                            key={'rest_' + i}
                                            rest={item.name}
                                            address={item.location}/>
                            })}
                        </div>
                    </div>
        }

        else if (this.state.editMode === true && this.props.listitems.length >= 20) {
            buttonText = 'Save List';
            searchMsg = <div>
                                <p><em>You have reached the maximum of 20 restaurants per list.</em></p>
                            </div>
        }
        else {
            buttonText = 'Edit List';
        }

        // if user is viewing their own page, display the list editing controls
        let listControls;

        if (viewingOwnPage) {
             listControls =
                        <div id='edit-list'>
                            <button className='btn btn-default'
                                onClick={this.toggleEditMode.bind(this)}>
                                { buttonText }
                            </button>
                        </div>
        }

        // display Send List button
        let sendList =
                <div id='email-list'>
                    <button className='btn btn-default'
                        data-toggle='modal'
                        data-target='#emailModal'>
                        Send List
                    </button>
                </div>

        return (
                <div>
                    <div className='col-xs-12 col-lg-5 list-items'>
                        <h2 id='list_name'>{this.props.listname}</h2>
                        {sendList}
                        {listControls}
                        {deleteControl}
                        {searchMsg}
                        <div id='list-items'>
                            {this.props.listitems.map( (rest, i) => {
                                return <ListItem onClick={this.removeItem}
                                            editing={this.state.editMode}
                                            key={'rest_' + i}
                                            yelpid={rest.yelp_id}
                                            itemid={rest.item_id}
                                            rest={rest.rest_name}
                                            category={rest.yelp_category}
                                            url={rest.yelp_url}
                                            rest_url={'/restaurants/' + rest.yelp_id}
                                            image={rest.image} />
                            })}
                        </div>
                    </div>
                    <div className='col-xs-12 col-lg-3 search-items'>
                        {searchControls}
                    </div>
                </div>
            )
    }
}
