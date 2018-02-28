"use strict";

// available data from Jinja when this page loads:
  // let data = {'username': '{{ user_dict.get("username") }}',
  //             'city': '{{ user_dict.get("city") }}',
  //             'state': '{{ user_dict.get("state") }}',
  //             'listname': '{{ user_dict.get("listname") }}',
  //             'list_id': '{{ user_dict.get("list_id") }}'};


class ProfilePageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userLists: [], isListOpen: false, openListName: '', openListId: null, listItems: []};
        this.handleClick = this.handleClick.bind(this);
        this.fetchUserLists = this.fetchUserLists.bind(this);
    }

    componentDidMount() {
        if (this.props.listname !== 'None') {
            this.setState({ isListOpen: true , openListName: this.props.listname, openListId: this.props.listid});
        }
        this.fetchUserLists(this.props.username);
    }

    fetchUserLists(username) {
        fetch('/get-lists.json?username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({ userLists: data.userLists} )
        });
    }

    handleClick(listname, listid) {
        history.pushState(null, null, `/users/react-new/${this.props.username}/${listname.toLowerCase()}`);
        fetch('/list-items-react.json?lst_id=' + listid)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            this.setState({listItems: data.restaurants, isListOpen: true, openListId: listid, openListName: listname});
        });
    }


    // before rendering, check if listname exists and if so, set state for isListOpen to true, fetch list ID using username and list name
    render() {
        console.log('rendering profile page container!');
        let openList;
        if (this.state.isListOpen === true) {
            openList = <List listname={this.state.openListName} listitems={this.state.listItems}/>
        }

        return (
            <div>
                <h1>{this.props.username}, a local of {this.props.city} and this is their {this.state.openListName} list!</h1>
                <User userlists={this.state.userLists} username={this.props.username} onClick={this.handleClick}/>
                {openList}
            </div>
            )
    };

}


class ListItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<div>
                    {this.props.name}
                </div>
            );
    }
}


class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {searchItems: [], inputValue: '', editMode: false, listName: ''};
        // this.checkLength = this.checkLength.bind(this);
    }

    render() {
        return (
                <div>
                    <h1>{this.props.listname}</h1>
                    {this.props.listitems.map( (rest) => {
                        return <ListItem key={rest.item_id} name={rest.rest_name}/>
                    })}
                </div>
            )
    }
}

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editMode: false };
    }

    render() {
        return (
            <div>
                {this.props.userlists.map( (list) => {
                    return <ListLink key={list.list_id} onClick={this.props.onClick} listid={list.list_id} listname={list.name} />
                })}
            </div>
        )
    }

}


class ListLink extends React.Component {
    buttonClickHandler(evt) {
        this.props.onClick(this.props.listname, this.props.listid);
    }
    render() {
        return (<div>
                    <a onClick={this.buttonClickHandler.bind(this)} data-list-id={this.props.listid}>{this.props.listname}</a>
                </div>
            );
    }
}



ReactDOM.render(
    <ProfilePageContainer listid={ data['list_id'] } username={ data['username'] } listname={ data['listname'] } city={ data['city'] } state={ data['state'] }/>,
    document.getElementById('root')
);
