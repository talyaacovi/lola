"use strict";


// TO MOVE LISTS TO USER PAGE
// ListItemContainer component becomes List component
// create UserPageContainer component that will mount to root div of user profile page
        // states:
        //     isListOpen -- false
        //     openListId -- none, null
        // componentWillMount -- fetchLists for userID (with list_id data attribute)
        // render -- user name, create list if viewing own page, {lists}
        //         -- if isListOpen: also mount on render the <List component with listId = this.state.openListId>

        // onClick of list, change state to isListOpen = true and get listId, setState.openListId = listId



class UserPageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userLists: [], isListOpen: false, openListId: null};
        this.fetchUserListsAjax = this.fetchUserListsAjax.bind(this);
    }

    componentWillMount() {
        this.fetchUserListsAjax();

    }

    // GET USER LISTS USING AJAX

    fetchUserListsAjax() {
        $.get('/get-lists.json?username=' + this.props.username, (data) => {
            console.log(data);
            this.setState({userLists: data.userLists});
            // createUserLists(data.userLists);
        }
    );
    }


    // RENDER METHOD

    render() {

        let mainDiv = [];

        for (let i = 0; i < this.state.userLists.length; i++) {
                // let lst = this.state.userLists[i];
                let myDiv =
                    (<div key={i}>
                        <h2 data-list-id={this.state.userLists[i].list_id}>{this.state.userLists[i].name}</h2>
                    </div>);
                mainDiv.push(myDiv);
            }

        // RENDER HEADING OF PAGE
        let header =
                <div>
                    <h1>This is my page! Lists!</h1>
                </div>


        let createListControls;

        // DISPLAY LIST CONTROLS IF USER IS VIEWING THEIR OWN PAGE

        if (viewingOwnPage) {
            createListControls =
                    <div>
                        <div id='create-list'>
                            <button>Create a list</button>
                        </div>
                    </div>
        }


        return (<div>
                    {header}
                    <div id='lists'>
                        {mainDiv}
                    </div>
                </div>);
    }
}


ReactDOM.render(
    <UserPageContainer listId={data['list_id']} username={data['username']} lstName={data['list_name']}/>,
    document.getElementById("root")
);



