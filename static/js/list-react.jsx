"use strict";

class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {searchItems: [], inputValue: '', editMode: false};
        this.removeItem = this.removeItem.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.listid !== this.props.listid) {
            this.setState({editMode: false});
        }
    }



    toggleEditMode() {
        this.setState(prevState => ({editMode: !prevState.editMode}));

    }

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

    updateInputValue(evt) {
        this.setState({inputValue: evt.target.value});
    }

    fetchSearchItems(evt) {
        evt.preventDefault();
        fetch('/search-results.json?term=' + this.state.inputValue + '&username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({searchItems: data.rests})
        });
    }



    addRestaurant(newRestaurant) {

        let payload = new FormData();
        payload.append('lst_id', this.props.listid);
        payload.append('yelp_id', newRestaurant);


        fetch('/add-restaurant.json', {
            method: 'POST',
            body: payload,
            credentials: 'same-origin'
        })
        .then((response) => response.json()) // resolve is what promise says its going to return
        .then((data) => {
                                        if (data) {
                                            let currItems = this.props.listitems;
                                            currItems.push(data);
                                            this.props.onUpdate(currItems);

                                        }
                                        else {
                                            alert('This restaurant already exists on this list!');
                                        }
                                        fetch('/instagram-photos?yelp_id=' + newRestaurant)
        });

        this.setState({searchItems: [], inputValue: ''});
    }

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

        let listControls;
        let buttonText;
        let searchControls;




        if (this.state.editMode === true) {
            buttonText = 'Save List';
            searchControls =
                    <div>
                        <div id='search-restaurants'>
                            <h3>Search for a restaurant you love in {this.props.city}!</h3>
                            <form className='form-group' onSubmit={this.fetchSearchItems.bind(this)}>
                                <input className='form-control' name='term' value={this.state.inputValue} onChange={this.updateInputValue.bind(this)}></input>
                                <button className='btn btn-default'>Search</button>
                            </form>
                        </div>
                        <div id='results-div'>
                            {this.state.searchItems.map( (item, i) => {
                                return <SearchItem onClick={this.addRestaurant.bind(this)} yelpid={item.id} key={'rest_' + i} rest={item.name} address={item.location}/>
                            })}
                        </div>
                    </div>
        }
        else {
            buttonText = 'Edit List';
        }



        if (viewingOwnPage) {
             listControls =
                        <div id='edit-list'>
                            <button className='btn btn-default' onClick={this.toggleEditMode.bind(this)}>{ buttonText }</button>
                        </div>
        }


        let deleteControl;

        // if (this.state.editMode && this.state.listName != 'favorites') {
        if (this.state.editMode === true && this.props.listname != 'Favorites') {
            deleteControl =
                        <div id='del-list'>
                                <button onClick={this.deleteListHandler.bind(this)} listid={this.props.listid} className='btn btn-default'>Delete List</button>
                        </div>
        }


        let sendList =
                <div id='email-list'>
                    <button className='btn btn-default' data-toggle='modal' data-target='#emailModal'>Send List</button>
                </div>

        return (
                <div>
                    <h2 id='list_name'>{this.props.listname}</h2>
                    {sendList}
                    {listControls}
                    {deleteControl}
                    {searchControls}
                    <div id='list-items'>
                        {this.props.listitems.map( (rest, i) => {
                            return <ListItem onClick={this.removeItem} editing={this.state.editMode} key={'rest_' + i} yelpid={rest.yelp_id} itemid={rest.item_id}
                            rest={rest.rest_name} category={rest.yelp_category} url={rest.yelp_url} rest_url={'/restaurants/' + rest.yelp_id} image={rest.image} />
                        })}
                    </div>
                </div>
            )
    }
}
